#!/usr/bin/env node
/**
 * Decides whether e-Stat has published anything new, and prepares the deploy if so.
 *
 * Runs daily from .github/workflows/watcher.yaml:
 *
 *   1. The Actions cache restores public/datastore/: the raw payloads plus
 *      .estat-baseline.json, the SURVEY_DATE each table had when last published.
 *   2. Every dataset in scripts/datasets.mjs is probed with a single-row request.
 *      On a normal day that is the whole run.
 *   3. If any date moved, every payload is downloaded in full and the baseline
 *      rewritten. One cache entry covers the whole datastore, so a deploy never
 *      pairs a fresh copy of one table with a stale copy of another.
 *
 * The run summary is written here, including on failure. One composed in YAML
 * from a step output reads "no changes" when the step that sets it never ran.
 *
 * Usage (locally): ESTAT_APP_ID=<app id> node scripts/estat-watch.mjs
 */
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { BASELINE_PATH, DATASETS, DATASTORE_DIR, rawPathOf } from './datasets.mjs';
import { ensureDatasets, fail, notice, probeDataset, requireAppId, warn } from './fetch-estat-data.mjs';

/**
 * Reads the previous run's survey dates. A missing file (first run, evicted
 * cache) and a malformed one (corrupted cache entry) both mean "no baseline":
 * failing here would stop the run before the save, so the bad entry would never
 * be replaced and every later run would fail the same way.
 */
export const readBaseline = (path = BASELINE_PATH) => {
  if (!existsSync(path)) return {};
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object');
    return parsed;
  } catch (error) {
    warn(`${path} is unreadable (${error.message}). Re-baselining without deploying.`);
    return {};
  }
};

/**
 * The change-detection rule, kept free of I/O so it can be tested directly.
 *
 * `changed` triggers a deploy. `save` refreshes the cache and is a superset: a
 * table seen for the first time needs recording but has nothing to publish.
 *
 * @param {Record<string, string>} baseline  Survey dates from the previous run, keyed by dataset id.
 * @param {{id: string, label: string, surveyDate: string}[]} probes  What e-Stat reports now.
 * @returns {{changed: boolean, save: boolean, reasons: {id: string, state: string, detail: string}[]}}
 */
export const decide = (baseline, probes) => {
  const reasons = [];
  let changed = false;
  let save = false;

  for (const { id, label, surveyDate } of probes) {
    const previous = baseline[id];

    if (previous === undefined) {
      // First run, an evicted cache, or a dataset just added to the manifest.
      // Record it, but do not read "we have never seen this" as "this moved".
      reasons.push({ id, state: 'baseline', detail: `${label}: no previous record. Baselining at ${surveyDate}.` });
      save = true;
      continue;
    }

    if (String(previous) !== String(surveyDate)) {
      reasons.push({ id, state: 'changed', detail: `${label}: SURVEY_DATE changed from ${previous} to ${surveyDate}.` });
      changed = true;
      save = true;
      continue;
    }

    reasons.push({ id, state: 'unchanged', detail: `${label}: unchanged (still ${surveyDate}).` });
  }

  // A dataset removed from the manifest leaves a stale key, which is never
  // compared and drops out on the next save (the baseline is rebuilt from probes).
  return { changed, save, reasons };
};

/** Content-derived so the key changes exactly when the data does. */
const cacheKeyFor = (datasets, env = process.env) => {
  const hash = createHash('sha256');
  for (const dataset of datasets) hash.update(readFileSync(rawPathOf(dataset, env)));
  return `estat-data-${hash.digest('hex').slice(0, 16)}`;
};

const setOutput = (key, value) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
};

const writeSummary = (lines) => {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
};

const checkedAt = () => {
  const stamp = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date());
  return `**Checked at:** ${stamp} JST`;
};

const main = async () => {
  const appId = requireAppId();

  const probes = [];
  for (const dataset of DATASETS) {
    const surveyDate = await probeDataset({
      appId,
      statsDataId: dataset.statsDataId,
      label: dataset.label,
    });
    notice(`${dataset.label}: SURVEY_DATE ${surveyDate}`);
    probes.push({ id: dataset.id, label: dataset.label, surveyDate });
  }

  const baseline = readBaseline();
  const { changed, save, reasons } = decide(baseline, probes);
  for (const reason of reasons) notice(reason.detail);

  setOutput('changed', String(changed));
  setOutput('save', String(save));

  if (!save) {
    writeSummary([
      '### No changes detected',
      '',
      'Every table is unchanged since the last check. No deploy triggered.',
      '',
      ...reasons.map((reason) => `- ${reason.detail}`),
      '',
      checkedAt(),
    ]);
    return;
  }

  notice('Downloading every payload so the cache entry stays internally consistent.');
  await ensureDatasets({ appId, datasets: DATASETS, force: true });

  mkdirSync(DATASTORE_DIR, { recursive: true });
  writeFileSync(
    BASELINE_PATH,
    `${JSON.stringify(Object.fromEntries(probes.map(({ id, surveyDate }) => [id, surveyDate])), null, 2)}\n`
  );

  const cacheKey = cacheKeyFor(DATASETS);
  setOutput('cache-key', cacheKey);
  notice(`Cache key for this payload set: ${cacheKey}`);

  writeSummary([
    changed ? '### New data detected' : '### Baseline recorded',
    '',
    changed
      ? 'Deploy has been triggered automatically.'
      : 'A table had no previous record, so this run saved a baseline without deploying. The next change will publish.',
    '',
    ...reasons.map((reason) => `- ${reason.detail}`),
    '',
    checkedAt(),
  ]);
};

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  await main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    // Written before exiting, so a failed run's summary says it failed.
    writeSummary(['### Check failed', '', 'No deploy was triggered.', '', '```', message, '```', '', checkedAt()]);
    fail(message);
  });
}
