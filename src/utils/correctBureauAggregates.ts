// src/utils/correctBureauAggregates.ts
// Non-mutating, O(1) access-time corrections for “管内” bureaus using bureau CODES.
// Works directly on the e-Stat DATA_INF.VALUE entries and never mutates the source.

export type EStatValue = {
  [k: string]: string | undefined; // "@tab", "@cat01", "@cat02", "@cat03", "@time", "$", etc.
  "@cat03": string;                // bureau code
  "@time": string;                 // time code (e.g., 2025000707)
  "$"?: string;                    // numeric value as string
};

type ClassEntry = { "@code": string; "@name": string };
type ClassObj = {
  "@id": string;
  "@name": string;
  CLASS: ClassEntry | ClassEntry[];
};

export type EStatData = {
  GET_STATS_DATA: {
    STATISTICAL_DATA: {
      CLASS_INF: {
        CLASS_OBJ: ClassObj | ClassObj[];
      };
      DATA_INF: {
        VALUE: EStatValue | EStatValue[];
      };
    };
  };
};

// Use code mapping (consistent with bureauOptions values)
const AGGREGATE_CODE_MAPPING: Record<string, string[]> = {
  // 東京管内(101170) minus 成田(101190), 羽田(101200), 横浜(101210)
  "101170": ["101190", "101200", "101210"],
  // 名古屋管内(101350) minus 中部空港(101370)
  "101350": ["101370"],
  // 大阪管内(101460) minus 関西空港(101480), 神戸(101490)
  "101460": ["101480", "101490"],
  // 福岡管内(101720) minus 那覇(101740)
  "101720": ["101740"],
};

export function makeCorrectedAccessor(data: EStatData) {
  const sd = data.GET_STATS_DATA.STATISTICAL_DATA;

  // Normalize VALUE to array
  const values = Array.isArray(sd.DATA_INF.VALUE)
    ? sd.DATA_INF.VALUE
    : [sd.DATA_INF.VALUE];

  // Determine the coordinate keys present in this cube (robust to schema variance)
  const sample = (values[0] ?? {}) as EStatValue;
  const dimKeys = Object.keys(sample)
    .filter((k) => k.startsWith("@"))
    .filter((k) => k !== "@unit" && k !== "$");

  const toKey = (coord: Partial<EStatValue>) =>
    dimKeys.map((k) => String(coord[k as keyof EStatValue] ?? "")).join("|");

  const toNum = (s?: string) =>
    s == null || s === "" ? NaN : Number(s);

  // Build an index of original values for fast lookup
  const index = new Map<string, number>();
  for (const v of values) {
    index.set(toKey(v), toNum(v["$"]));
  }

  // Memoize corrected results
  const memo = new Map<string, number>();

  /**
   * Returns the corrected numeric value for coord:
   *  - For aggregate bureaus in AGGREGATE_CODE_MAPPING, subtracts branch totals
   *    at the same coordinates (only @cat03 differs).
   *  - For others, returns the original value.
   * Returns NaN when base is missing/unparseable, mirroring parseInt behavior.
   */
  function getCorrectedValue(coord: Partial<EStatValue>): number {
    const key = toKey(coord);
    if (memo.has(key)) return memo.get(key)!;

    const base = index.get(key);
    if (typeof base !== "number") {
      memo.set(key, NaN);
      return NaN;
    }

    const bureau = String(coord["@cat03"] ?? "");
    const branches = AGGREGATE_CODE_MAPPING[bureau];

    if (!branches) {
      memo.set(key, base);
      return base;
    }

    let subtotal = 0;
    for (const br of branches) {
      const brKey = dimKeys
        .map((dk) => (dk === "@cat03" ? br : String(coord[dk as keyof EStatValue] ?? "")))
        .join("|");
      const brVal = index.get(brKey);
      if (typeof brVal === "number" && !Number.isNaN(brVal)) {
        subtotal += brVal;
      }
    }

    const corrected = base - subtotal;
    memo.set(key, corrected);
    return corrected;
  }

  return {
    getCorrectedValue,
    isAggregateBureauCode: (code: string) => code in AGGREGATE_CODE_MAPPING,
    getBranchCodes: (code: string) => AGGREGATE_CODE_MAPPING[code] ?? [],
    dimKeys,
  };
}
