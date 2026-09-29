/**
 * Every e-Stat table this project publishes, in one place.
 *
 * The single source of truth for the pipeline: the fetch script, the watcher,
 * the build transform and both workflows read it and never name a dataset
 * directly, so adding a table here needs no change under `.github/`.
 *
 * Plain data with no imports, so bare `node` can load it: the watcher's
 * check-updates job runs without `npm ci`. Per-dataset code (fixture writer,
 * transform, packer, verifier) is keyed by `id` in the handler table in
 * scripts/transform-data.mts.
 *
 * Lives under scripts/ so it is inside deploy.yaml's `paths:` filter
 * (`scripts/**`): registering a dataset redeploys the site.
 *
 * @typedef {object} Dataset
 * @property {string} id           Stable key. Names the handler in transform-data.mts
 *                                 and the entry in the watcher's baseline file, and
 *                                 forms the ESTAT_RAW_<ID> path override.
 * @property {string} statsDataId  e-Stat `statsDataId` for getStatsData.
 * @property {string} raw          Where the raw payload is written. Must stay under
 *                                 public/datastore/: that directory is cached, and
 *                                 strip-raw-data.mjs removes it from the export.
 * @property {string} out          The compact file the client fetches.
 * @property {string} label        Human name, used in logs and run summaries.
 */

/** @type {Dataset[]} */
export const DATASETS = [
  {
    id: 'processing',
    statsDataId: '0003449073',
    raw: 'public/datastore/processingData.json',
    out: 'public/data/dashboard.json',
    label: 'Application Processing',
  },
  {
    id: 'residents',
    statsDataId: '0004019020',
    raw: 'public/datastore/residentsData.json',
    out: 'public/data/residents.json',
    label: 'Resident Population',
  },
];

/** The directory every raw payload and the watcher baseline live in — the unit of caching. */
export const DATASTORE_DIR = 'public/datastore';

/**
 * The watcher's record of what it last saw, kept inside DATASTORE_DIR so it
 * shares one cache entry with the payloads it describes and is never restored
 * without them.
 */
export const BASELINE_PATH = `${DATASTORE_DIR}/.estat-baseline.json`;

/**
 * Per-dataset override for the raw path, e.g. ESTAT_RAW_RESIDENTS. Generated
 * from the id so a new dataset gets one without further wiring.
 */
export const rawPathEnvVar = (id) => `ESTAT_RAW_${id.toUpperCase()}`;

/** The raw path for a dataset, honouring its environment override. */
export const rawPathOf = (dataset, env = process.env) => env[rawPathEnvVar(dataset.id)] || dataset.raw;

/** Looks a dataset up by id, failing with the valid ids rather than `undefined`. */
export const datasetById = (id) => {
  const dataset = DATASETS.find((entry) => entry.id === id);
  if (!dataset) {
    throw new Error(`unknown dataset "${id}" — known ids: ${DATASETS.map((entry) => entry.id).join(', ')}`);
  }
  return dataset;
};
