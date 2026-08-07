#!/usr/bin/env node
/**
 * Downloads and validates e-Stat statistics payloads.
 *
 * `getStatsData` caps a response at 100,000 rows and reports the continuation
 * offset as RESULT_INF.NEXT_KEY. A short read comes back as HTTP 200 with valid
 * JSON and complete metadata — nothing about it looks wrong until a chart is
 * quietly missing half its data. So this pages until NEXT_KEY is gone, merges,
 * and asserts the merged row count against TOTAL_NUMBER before writing.
 *
 * It also exposes the cheap half of the same API: `probeDataset` asks for a
 * single row with no class metadata, which returns the table's SURVEY_DATE in a
 * couple of kilobytes. That is the entire signal the watcher needs, so the
 * watcher no longer downloads two full tables a day to read one date field.
 *
 * This lives here rather than in a workflow's shell so that CI and a developer
 * run the same code. Hand-rolling the paging locally is how a truncated payload
 * got into a working tree in the first place.
 *
 * Dependency-free on purpose: the watcher's check-updates job has no `npm ci`.
 *
 * Usage (locally):
 *   ESTAT_APP_ID=<app id> node scripts/fetch-estat-data.mjs --all
 *   ESTAT_APP_ID=<app id> node scripts/fetch-estat-data.mjs --dataset residents
 *
 * Datasets come from scripts/datasets.mjs. --stats-data-id/--out remain for
 * fetching a table that is not registered there:
 *   ESTAT_APP_ID=<app id> node scripts/fetch-estat-data.mjs \
 *     --stats-data-id 0004019020 --out public/datastore/residentsData.json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { datasetById, DATASETS, rawPathOf } from './datasets.mjs';

const ENDPOINT = 'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData';

/** Above any real table: 20 pages is 2,000,000 rows. A loop that reaches it has a bug. */
const MAX_PAGES = 20;
/** Mirrors the curl budget this replaced: --max-time 300, --retry 3 --retry-delay 15. */
const REQUEST_TIMEOUT_MS = 300_000;
const MAX_ATTEMPTS = 4;
const RETRY_DELAY_MS = 15_000;
/** A probe reads one row of metadata; it should never sit for the full-download budget. */
const PROBE_TIMEOUT_MS = 60_000;

const inCI = process.env.GITHUB_ACTIONS === 'true';
export const notice = (message) => console.log(inCI ? `::notice::${message}` : message);
export const warn = (message) => console.warn(inCI ? `::warning::${message}` : `warning: ${message}`);
export const fail = (message) => {
  console.error(inCI ? `::error::${message}` : `error: ${message}`);
  process.exit(1);
};

const parseArgs = (argv) => {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--force') flags.force = true;
    else if (arg === '--all') flags.all = true;
    else if (arg === '--dataset') flags.dataset = argv[++i];
    else if (arg === '--stats-data-id') flags.statsDataId = argv[++i];
    else if (arg === '--out') flags.out = argv[++i];
    else fail(`unrecognized argument: ${arg}`);
  }
  return flags;
};

/** The app id must never reach a log line, so it is read once and never echoed. */
export const requireAppId = (env = process.env) => {
  const appId = env.ESTAT_APP_ID;
  if (!appId) fail('ESTAT_APP_ID is not set. Register at https://www.e-stat.go.jp/ to get an application ID.');
  return appId;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One request, with the retry behaviour the curl flags used to provide.
 *
 * Rejects rather than exiting: `probeDataset` needs to name which table failed,
 * and the watcher needs to write a run summary before the process dies.
 */
const request = async (params, { timeoutMs = REQUEST_TIMEOUT_MS } = {}) => {
  const url = new URL(ENDPOINT);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));

  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      // The URL carries the app ID, so it must never reach a log line.
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < MAX_ATTEMPTS) {
        warn(`e-Stat request failed (attempt ${attempt}/${MAX_ATTEMPTS}): ${lastError}. Retrying.`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }
  throw new Error(`e-Stat request failed after ${MAX_ATTEMPTS} attempts: ${lastError}`);
};

const asArray = (value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

const statisticalDataOf = (page) => page?.GET_STATS_DATA?.STATISTICAL_DATA;

/** The API's failure mode is a 200 carrying an error envelope, so say what came back. */
const describeEnvelope = (body) => JSON.stringify(body?.GET_STATS_DATA?.RESULT ?? body).slice(0, 500);

/**
 * Page 1 carries the metadata (TABLE_INF, CLASS_INF); later pages contribute
 * only rows. NEXT_KEY is dropped and TO_NUMBER corrected so the merged file
 * cannot be mistaken for, or misreport itself as, a partial one.
 *
 * Exported for tests — this is the part with logic worth pinning down, and it
 * needs no network.
 */
export const mergePages = (pages) => {
  const merged = structuredClone(pages[0]);
  const data = statisticalDataOf(merged);
  data.DATA_INF.VALUE = pages.flatMap((page) => asArray(statisticalDataOf(page)?.DATA_INF?.VALUE));
  if (data.RESULT_INF) {
    data.RESULT_INF.TO_NUMBER = data.DATA_INF.VALUE.length;
    delete data.RESULT_INF.NEXT_KEY;
  }
  return merged;
};

/** The assertion that makes a short read loud instead of plausible. */
const assertComplete = (payload, label) => {
  const data = statisticalDataOf(payload);
  if (!data) {
    fail(`${label} is missing GET_STATS_DATA.STATISTICAL_DATA — the API likely returned an error envelope:\n${describeEnvelope(payload)}`);
  }
  const rows = asArray(data.DATA_INF?.VALUE).length;
  const expected = data.RESULT_INF?.TOTAL_NUMBER;
  if (typeof expected === 'number' && rows !== expected) {
    fail(`${label} holds ${rows.toLocaleString('en-US')} rows but reports TOTAL_NUMBER ${expected.toLocaleString('en-US')}. The payload is incomplete.`);
  }
  return rows;
};

/**
 * Reads a table's SURVEY_DATE without downloading the table.
 *
 * `limit=1` bounds the response to a single row and `metaGetFlg=N` drops
 * CLASS_INF, but TABLE_INF still comes back — so this is the same envelope and
 * the same field the full payload carries, at a few kilobytes instead of tens of
 * megabytes.
 *
 * SURVEY_DATE is the entire change signal, so a missing or null one throws
 * rather than being reported as a value. If e-Stat ever moved or renamed the
 * field, a null-tolerant read would compare equal to the previous null and the
 * watcher would report "no change" every day, forever, with a green check and no
 * deploy. Failing loudly is the only acceptable outcome.
 */
export const probeDataset = async ({ appId, statsDataId, label = statsDataId }) => {
  const body = await request(
    { appId, lang: 'J', statsDataId, metaGetFlg: 'N', cntGetFlg: 'N', limit: 1 },
    { timeoutMs: PROBE_TIMEOUT_MS }
  );
  const surveyDate = statisticalDataOf(body)?.TABLE_INF?.SURVEY_DATE;
  if (surveyDate === undefined || surveyDate === null) {
    throw new Error(
      `${label} (${statsDataId}): the probe response has no TABLE_INF.SURVEY_DATE. The e-Stat response schema may ` +
        `have changed — the change detector cannot be trusted until this is resolved. Response was:\n${describeEnvelope(body)}`
    );
  }
  return String(surveyDate);
};

/**
 * Downloads one table in full, paging past the 100,000-row cap, and writes it.
 * Returns the row count.
 */
export const fetchDataset = async ({ appId, statsDataId, outPath, label = statsDataId }) => {
  mkdirSync(dirname(outPath), { recursive: true });

  const pages = [];
  let startPosition = 1;
  for (let page = 1; ; page++) {
    if (page > MAX_PAGES) {
      fail(
        `Still paging after ${MAX_PAGES} requests for ${label} (${statsDataId}). Either the table grew past ` +
          `${(MAX_PAGES * 100000).toLocaleString('en-US')} rows or NEXT_KEY is no longer advancing.`
      );
    }
    const body = await request({
      appId,
      lang: 'J',
      statsDataId,
      metaGetFlg: 'Y',
      sectionHeaderFlg: 2,
      replaceSpChars: 0,
      startPosition,
    });
    const data = statisticalDataOf(body);
    if (!data) {
      fail(
        `Page ${page} of ${label} (${statsDataId}) is missing GET_STATS_DATA.STATISTICAL_DATA — the API likely ` +
          `returned an error envelope:\n${describeEnvelope(body)}`
      );
    }
    pages.push(body);

    const nextKey = data.RESULT_INF?.NEXT_KEY;
    if (nextKey === undefined || nextKey === null) break;
    startPosition = nextKey;
    notice(`${label} page ${page} done, continuing from row ${startPosition}.`);
  }

  const merged = mergePages(pages);
  const rows = assertComplete(merged, outPath);
  writeFileSync(outPath, JSON.stringify(merged));
  notice(`Merged ${pages.length} page(s) into ${outPath}: ${rows.toLocaleString('en-US')} rows.`);
  return rows;
};

/**
 * Downloads whatever is missing, or everything when `force`.
 *
 * The deploy calls this without `force`: the cache has usually already supplied
 * the payloads, and a present file is validated and kept rather than re-fetched.
 * The watcher calls it with `force` once it knows a table has moved.
 */
export const ensureDatasets = async ({ appId, datasets, force = false, env = process.env }) => {
  for (const dataset of datasets) {
    const outPath = rawPathOf(dataset, env);
    if (!force && existsSync(outPath)) {
      assertComplete(JSON.parse(readFileSync(outPath, 'utf8')), outPath);
      notice(`Using the cached ${dataset.label} payload at ${outPath}.`);
      continue;
    }
    if (!force) notice(`No cached ${dataset.label} payload present - downloading a fresh copy.`);
    await fetchDataset({ appId, statsDataId: dataset.statsDataId, outPath, label: dataset.label });
  }
};

const main = async () => {
  const flags = parseArgs(process.argv.slice(2));
  const appId = requireAppId();

  // An explicit statsDataId/out pair addresses a table that is not in the
  // manifest; everything else resolves through it.
  if (flags.statsDataId || flags.out) {
    if (!flags.statsDataId || !flags.out) fail('--stats-data-id and --out must be given together.');
    await fetchDataset({ appId, statsDataId: flags.statsDataId, outPath: flags.out });
    return;
  }

  if (flags.dataset && flags.all) fail('pass either --dataset or --all, not both.');
  if (!flags.dataset && !flags.all) fail('nothing to fetch — pass --all, --dataset <id>, or --stats-data-id with --out.');

  const datasets = flags.all ? DATASETS : [datasetById(flags.dataset)];
  await ensureDatasets({ appId, datasets, force: flags.force === true });
};

// Skip the download when imported by a test; only a direct run should fetch.
// Errors are funnelled through `fail` so a bad dataset id or an exhausted retry
// budget reads as one annotated line rather than a stack trace.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  await main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
}
