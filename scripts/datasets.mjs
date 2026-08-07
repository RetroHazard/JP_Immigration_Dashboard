/**
 * Every e-Stat table this project publishes, in one place.
 *
 * This file is the single source of truth for the pipeline. Adding a table here
 * is the whole job: the fetch script, the watcher, the build transform and both
 * workflows all read it, and none of them name a dataset directly. Nothing in
 * `.github/` needs to change to add a third.
 *
 * Deliberately plain data with no imports, so bare `node` can load it — the
 * watcher's check-updates job runs without `npm ci`, and `scripts/datasets.mjs`
 * is the one module it has to be able to read. Anything a dataset needs that
 * cannot be expressed as data — its fixture writer, transform, packer and
 * verifier — is keyed by `id` in the handler table in scripts/transform-data.mts,
 * which runs under tsx and can hold functions.
 *
 * It lives under scripts/ rather than a new top-level directory so that it is
 * already inside deploy.yaml's `paths:` allowlist (`scripts/**`): registering a
 * dataset redeploys the site without anyone remembering to widen the filter.
 *
 * @typedef {object} Dataset
 * @property {string} id           Stable key. Names the handler in transform-data.mts
 *                                 and the entry in the watcher's baseline file, and
 *                                 forms the ESTAT_RAW_<ID> path override.
 * @property {string} statsDataId  e-Stat `statsDataId` for getStatsData.
 * @property {string} raw          Where the raw payload is written. Must stay under
 *                                 public/datastore/ — that directory is what gets
 *                                 cached, and strip-raw-data.mjs removes it from the
 *                                 export so the verbose payload never ships.
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
 * shares one cache entry with the payloads it describes. A baseline that could
 * be restored without its data, or the reverse, would let the watcher compare
 * against something that was never published.
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
