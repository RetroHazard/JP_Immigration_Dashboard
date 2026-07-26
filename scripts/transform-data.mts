// scripts/transform-data.mts
// Build-time data transform: applies the e-Stat flattening + bureau aggregate
// correction ONCE at build time and emits the compact file the client loads,
// instead of shipping the verbose raw payload to every visitor.
//
// Input:  public/datastore/statData.json (restored from the Actions cache in
//         CI; generated as a fixture locally when absent). The raw file is
//         stripped from the export output after `next build`.
// Output: public/data/dashboard.json
//
// Run with: tsx scripts/transform-data.mts
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { packDashboardData } from '../src/utils/dashboardData';
import { type RawData, transformData } from '../src/utils/dataTransform';

const RAW_PATH = process.env.DATA_PATH ?? 'public/datastore/statData.json';
const OUT_PATH = 'public/data/dashboard.json';

let source: 'e-stat' | 'fixture' = 'e-stat';
if (!existsSync(RAW_PATH)) {
  console.warn(`⚠️  ${RAW_PATH} not found — generating a deterministic fixture (local/CI build without e-Stat data).`);
  execFileSync('node', ['scripts/generate-fixture.mjs', RAW_PATH], { stdio: 'inherit' });
  source = 'fixture';
}

const raw = JSON.parse(readFileSync(RAW_PATH, 'utf8')) as RawData & {
  GET_STATS_DATA?: { STATISTICAL_DATA?: { TABLE_INF?: { SURVEY_DATE?: string | number; note?: string } } };
};

const tableInf = raw.GET_STATS_DATA?.STATISTICAL_DATA?.TABLE_INF;
if (tableInf?.note?.includes('FIXTURE')) source = 'fixture';

const records = transformData(raw);
if (records.length === 0) {
  console.error(`✖ transformData produced 0 records from ${RAW_PATH} — refusing to emit an empty dashboard file.`);
  process.exit(1);
}

const file = packDashboardData(records, {
  schema: 1,
  surveyDate: tableInf?.SURVEY_DATE ?? 'unknown',
  source,
});

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(file));

const rawKb = Math.round(statSync(RAW_PATH).size / 1024);
const outKb = Math.round(statSync(OUT_PATH).size / 1024);
console.log(
  `✓ ${OUT_PATH}: ${records.length} records over ${file.months.length} months ` +
    `(${outKb} KB, raw ${rawKb} KB, ${Math.round((1 - outKb / rawKb) * 100)}% smaller, source: ${source})`
);
