#!/usr/bin/env node
/**
 * Downloads and validates an e-Stat statistics payload.
 *
 * `getStatsData` caps a response at 100,000 rows and reports the continuation
 * offset as RESULT_INF.NEXT_KEY. A short read comes back as HTTP 200 with valid
 * JSON and complete metadata — nothing about it looks wrong until a chart is
 * quietly missing half its data. So this pages until NEXT_KEY is gone, merges,
 * and asserts the merged row count against TOTAL_NUMBER before writing.
 *
 * This lives here rather than in the composite action's shell so that CI and a
 * developer run the same code. Hand-rolling the paging locally is how a
 * truncated payload got into a working tree in the first place.
 *
 * Dependency-free on purpose: the watcher's check-updates job has no `npm ci`.
 *
 * Usage (locally):
 *   ESTAT_APP_ID=<app id> node scripts/fetch-estat-data.mjs \
 *     --stats-data-id 0004019020 --out public/datastore/residentsData.json --force
 *
 * Every parameter can also come from the environment — ESTAT_APP_ID,
 * ESTAT_STATS_DATA_ID, ESTAT_OUT_PATH, ESTAT_FORCE — which is how the action
 * passes them, so no value is ever interpolated into a rendered command line.
 */
import { appendFileSync,copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const ENDPOINT = 'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData';

/** Above any real table: 20 pages is 2,000,000 rows. A loop that reaches it has a bug. */
const MAX_PAGES = 20;
/** Mirrors the curl budget this replaced: --max-time 300, --retry 3 --retry-delay 15. */
const REQUEST_TIMEOUT_MS = 300_000;
const MAX_ATTEMPTS = 4;
const RETRY_DELAY_MS = 15_000;

const inCI = process.env.GITHUB_ACTIONS === 'true';
const notice = (message) => console.log(inCI ? `::notice::${message}` : message);
const warn = (message) => console.warn(inCI ? `::warning::${message}` : `warning: ${message}`);
const fail = (message) => {
  console.error(inCI ? `::error::${message}` : `error: ${message}`);
  process.exit(1);
};

const parseArgs = (argv) => {
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--force') flags.force = true;
    else if (arg === '--stats-data-id') flags.statsDataId = argv[++i];
    else if (arg === '--out') flags.out = argv[++i];
    else fail(`unrecognized argument: ${arg}`);
  }
  return flags;
};

/**
 * Resolved inside main() rather than at module scope, so importing this file
 * for its mergePages export neither validates arguments nor exits.
 */
const resolveConfig = () => {
  const flags = parseArgs(process.argv.slice(2));
  const config = {
    appId: process.env.ESTAT_APP_ID,
    statsDataId: flags.statsDataId ?? process.env.ESTAT_STATS_DATA_ID,
    outPath: flags.out ?? process.env.ESTAT_OUT_PATH,
    force: flags.force ?? process.env.ESTAT_FORCE === 'true',
  };
  if (!config.appId) fail('ESTAT_APP_ID is not set. Register at https://www.e-stat.go.jp/ to get an application ID.');
  if (!config.statsDataId) fail('no statsDataId — pass --stats-data-id or set ESTAT_STATS_DATA_ID.');
  if (!config.outPath) fail('no output path — pass --out or set ESTAT_OUT_PATH.');
  return config;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** One page, with the retry behaviour the curl flags used to provide. */
const fetchPage = async ({ appId, statsDataId }, startPosition) => {
  const url = new URL(ENDPOINT);
  url.searchParams.set('appId', appId);
  url.searchParams.set('lang', 'J');
  url.searchParams.set('statsDataId', statsDataId);
  url.searchParams.set('metaGetFlg', 'Y');
  url.searchParams.set('sectionHeaderFlg', '2');
  url.searchParams.set('replaceSpChars', '0');
  url.searchParams.set('startPosition', String(startPosition));

  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
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
  fail(`e-Stat request failed after ${MAX_ATTEMPTS} attempts for ${statsDataId}: ${lastError}`);
};

const asArray = (value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

const statisticalDataOf = (page) => page?.GET_STATS_DATA?.STATISTICAL_DATA;

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
    fail(
      `${label} is missing GET_STATS_DATA.STATISTICAL_DATA — the API likely returned an error envelope:\n` +
        JSON.stringify(payload?.GET_STATS_DATA?.RESULT ?? payload).slice(0, 500)
    );
  }
  const rows = asArray(data.DATA_INF?.VALUE).length;
  const expected = data.RESULT_INF?.TOTAL_NUMBER;
  if (typeof expected === 'number' && rows !== expected) {
    fail(`${label} holds ${rows.toLocaleString('en-US')} rows but reports TOTAL_NUMBER ${expected.toLocaleString('en-US')}. The payload is incomplete.`);
  }
  return rows;
};

const setOutput = (key, value) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
};

const main = async () => {
  const { statsDataId, outPath, force, ...credentials } = resolveConfig();
  const config = { ...credentials, statsDataId };

  mkdirSync(dirname(outPath), { recursive: true });

  const hadPrevious = existsSync(outPath);
  let previousPath = '';
  // Only preserve a comparison copy when about to overwrite; on the deploy path
  // the existing copy is used as-is.
  if (hadPrevious && force) {
    previousPath = join(dirname(outPath), `prev-${basename(outPath)}`);
    copyFileSync(outPath, previousPath);
  }
  setOutput('had-previous', String(hadPrevious));
  setOutput('previous-path', previousPath);

  if (!force && hadPrevious) {
    const cached = JSON.parse(readFileSync(outPath, 'utf8'));
    assertComplete(cached, outPath);
    notice(`Using the cached payload at ${outPath}.`);
    return;
  }

  if (!hadPrevious) notice(`No cached payload present - downloading a fresh copy of ${statsDataId}.`);

  const pages = [];
  let startPosition = 1;
  for (let page = 1; ; page++) {
    if (page > MAX_PAGES) {
      fail(`Still paging after ${MAX_PAGES} requests for ${statsDataId}. Either the table grew past ${(MAX_PAGES * 100000).toLocaleString('en-US')} rows or NEXT_KEY is no longer advancing.`);
    }
    const body = await fetchPage(config, startPosition);
    const data = statisticalDataOf(body);
    if (!data) {
      fail(
        `Page ${page} of ${statsDataId} is missing GET_STATS_DATA.STATISTICAL_DATA — the API likely returned an error envelope:\n` +
          JSON.stringify(body?.GET_STATS_DATA?.RESULT ?? body).slice(0, 500)
      );
    }
    pages.push(body);

    const nextKey = data.RESULT_INF?.NEXT_KEY;
    if (nextKey === undefined || nextKey === null) break;
    startPosition = nextKey;
    notice(`${statsDataId} page ${page} done, continuing from row ${startPosition}.`);
  }

  const merged = mergePages(pages);
  const rows = assertComplete(merged, outPath);
  writeFileSync(outPath, JSON.stringify(merged));
  notice(`Merged ${pages.length} page(s) into ${outPath}: ${rows.toLocaleString('en-US')} rows.`);
};

// Skip the download when imported by a test; only a direct run should fetch.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
