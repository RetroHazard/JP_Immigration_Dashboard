// public/workers/dataTransform.worker.js
// Web Worker for offloading data transformation from the main thread
// This improves Time to Interactive (TTI) and Total Blocking Time (TBT) metrics
// by keeping the main thread responsive during heavy data processing

// Bureau options with children mapping (for aggregate correction)
// These aggregate bureaus contain statistics for multiple branch offices
const bureauOptionsData = [
  { value: '101720', children: ['101740'] }, // Fukuoka -> Naha
  { value: '101350', children: ['101370'] }, // Nagoya -> Chubu Airport
  { value: '101170', children: ['101210', '101230', '101240'] }, // Shinagawa -> Yokohama, Narita, Haneda
  { value: '101460', children: ['101470', '101490'] }, // Osaka -> Kansai Airport, Kobe
];

// Create fast lookup map for aggregate bureaus
const AGGREGATE_MAPPING = Object.fromEntries(
  bureauOptionsData
    .filter((b) => Array.isArray(b.children) && b.children.length > 0)
    .map((b) => [b.value, b.children])
);

/**
 * Creates a corrected value accessor with memoization for performance.
 * This function deaggregates regional bureau totals by subtracting branch office values.
 *
 * @param {Object} data - Raw e-Stat data structure
 * @returns {Object} Object with getCorrectedValue function
 */
function makeCorrectedAccessor(data) {
  const sd = data.GET_STATS_DATA.STATISTICAL_DATA;

  // Normalize VALUE to array
  const values = Array.isArray(sd.DATA_INF.VALUE)
    ? sd.DATA_INF.VALUE
    : [sd.DATA_INF.VALUE];

  // Determine the coordinate keys present in this cube
  const sample = values[0] ?? {};
  const dimKeys = Object.keys(sample)
    .filter((k) => k.startsWith('@'))
    .filter((k) => k !== '@unit' && k !== '$');

  // Create coordinate key for fast lookups
  const toKey = (coord) =>
    dimKeys.map((k) => String(coord[k] ?? '')).join('|');

  const toNum = (s) =>
    s == null || s === '' ? NaN : Number(s);

  // Build an index of original values for O(1) lookup
  const index = new Map();
  for (const v of values) {
    index.set(toKey(v), toNum(v['$']));
  }

  // Memoize corrected results to avoid redundant calculations
  const memo = new Map();

  /**
   * Gets the corrected value for a coordinate, deaggregating if necessary
   */
  function getCorrectedValue(coord) {
    const key = toKey(coord);
    if (memo.has(key)) return memo.get(key);

    const base = index.get(key);
    if (typeof base !== 'number') {
      memo.set(key, NaN);
      return NaN;
    }

    const bureau = String(coord['@cat03'] ?? '');
    const branches = AGGREGATE_MAPPING[bureau];

    // If not an aggregate bureau, return base value as-is
    if (!branches) {
      memo.set(key, base);
      return base;
    }

    // Calculate subtotal of all branch offices
    let subtotal = 0;
    for (const br of branches) {
      const brKey = dimKeys
        .map((dk) => (dk === '@cat03' ? br : String(coord[dk] ?? '')))
        .join('|');
      const brVal = index.get(brKey);
      if (typeof brVal === 'number' && !Number.isNaN(brVal)) {
        subtotal += brVal;
      }
    }

    // Deaggregate: regional total - branch offices = main office
    const corrected = base - subtotal;
    memo.set(key, corrected);
    return corrected;
  }

  return { getCorrectedValue };
}

/**
 * Normalizes VALUE field to always be an array
 */
function normalizeValues(rawData) {
  const v = rawData?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE;
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/**
 * Transforms raw e-Stat JSON data into internal ImmigrationData format.
 * This is the heavy computation that we offload to the worker thread.
 *
 * @param {Object} rawData - Raw e-Stat API response
 * @returns {Array} Array of ImmigrationData objects
 */
function transformData(rawData) {
  if (!rawData?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE) {
    return [];
  }

  const values = normalizeValues(rawData);
  const { getCorrectedValue } = makeCorrectedAccessor(rawData);

  return values.map((entry) => {
    // Convert time code (e.g., "2024FY08") to "YYYY-MM" format
    const timeCode = entry['@time'] ?? '';
    const month = timeCode.substring(0, 4) + '-' + timeCode.substring(8, 10);

    // Collect all coordinate attributes for correction lookup
    const coord = {};
    Object.keys(entry).forEach((k) => {
      if (typeof k === 'string' && k.startsWith('@') && k !== '@unit') {
        coord[k] = entry[k];
      }
    });

    const corrected = getCorrectedValue(coord);
    const original = parseInt(entry['$'] ?? '0');

    return {
      month,
      bureau: entry['@cat03'],
      type: entry['@cat02'],
      value: Number.isNaN(corrected) ? original : corrected,
      status: entry['@cat01'],
    };
  });
}

// Listen for messages from main thread
self.addEventListener('message', (event) => {
  const { type, data, id } = event.data;

  if (type === 'TRANSFORM_DATA') {
    try {
      const transformedData = transformData(data);
      self.postMessage({
        type: 'TRANSFORM_COMPLETE',
        data: transformedData,
        id,
      });
    } catch (error) {
      self.postMessage({
        type: 'TRANSFORM_ERROR',
        error: error.message,
        id,
      });
    }
  }
});
