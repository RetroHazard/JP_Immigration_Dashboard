#!/usr/bin/env node
/**
 * Decides whether e-Stat has published anything new, and prepares the deploy if so.
 *
 * Runs daily from .github/workflows/watcher.yaml. The shape of a run:
 *
 *   1. The Actions cache restores public/datastore/ — the raw payloads plus
 *      .estat-baseline.json, the record of the SURVEY_DATE each table had when it
 *      was last published.
 *   2. Every dataset in scripts/datasets.mjs is *probed* — a single-row request
 *      that returns TABLE_INF in a couple of kilobytes. On a normal day that is
 *      the whole run: two small requests, no download, no deploy.
 *   3. If any date moved, every payload is downloaded in full and the baseline is
 *      rewritten, so the cache entry the deploy reads is internally consistent.
 *
 * Downloading *all* tables when *any* one moves is deliberate: one cache entry
 * covers the whole datastore, so a deploy can never pair a fresh copy of one
 * table with a stale copy of another.
 *
 * The run summary is written here rather than in a workflow step, including on
 * the failure path. A summary composed in YAML from a step output reports "no
 * changes" whenever the step that sets it never ran, which is exactly backwards
 * on a red run.
 *
 * Usage (locally): ESTAT_APP_ID=<app id> node scripts/estat-watch.mjs
 */
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

import { BASELINE_PATH, DATASETS, DATASTORE_DIR, rawPathOf } from './datasets.mjs';
import { ensureDatasets, fail, notice, probeDataset, requireAppId, warn } from './fetch-estat-data.mjs';

/**
 * Reads the previous run's survey dates.
 *
 * A missing file is the first run, an evicted cache, or the first run after this
 * script was introduced. A malformed one is a corrupted cache entry. Both are
 * treated the same way — as "no baseline" — because failing here would wedge the
 * watcher permanently: the run would die before the save below, so the bad entry
 * would never be replaced and every later run would fail identically. Re-
 * baselining costs one detection cycle and then self-heals.
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
 * The whole change-detection rule, as a pure function of what was recorded and
 * what was just probed. This decides whether the site publishes, so it is kept
 * free of I/O and tested directly in scripts/__tests__/estat-watch.test.mjs.
 *
 * `changed` triggers a deploy. `save` refreshes the cache — which is a superset,
 * since a table seen for the first time needs recording even though there is
 * nothing to compare it against and so nothing to publish.
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

  // A dataset removed from the manifest leaves a stale key behind. Harmless to
  // compare against, but the baseline is rewritten from the probes on save, so
  // it disappears on the next one.
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

  // Something moved, or something has never been recorded. Either way the cache
  // entry is about to be rewritten, so every payload is re-downloaded — a mixed
  // entry is the one state the single-cache design exists to prevent.
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
    // Written before exiting, so a failed run's summary says it failed. The
    // previous implementation composed this in YAML from a step output and read
    // an unset output as "no changes detected" on a red run.
    writeSummary(['### Check failed', '', 'No deploy was triggered.', '', '```', message, '```', '', checkedAt()]);
    fail(message);
  });
}
