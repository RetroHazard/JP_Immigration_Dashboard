// scripts/transform-data.mts
// Build-time data transform: applies the e-Stat flattening and each table's
// corrections ONCE at build time and emits the compact files the client loads,
// instead of shipping the verbose raw payloads to every visitor.
//
// Two independent tables, each with its own input, output, and corrections:
//
//   processing  public/datastore/processingData.json -> public/data/dashboard.json
//               bureau x application type x status, monthly; bureau aggregates
//               deaggregated (correctBureauAggregates.ts)
//   residents   public/datastore/residentsData.json  -> public/data/residents.json
//               nationality x residence status, half-yearly; rollups and nested
//               rows pruned, then reconciled against e-Stat's own totals
//
// Inputs are restored from the Actions cache in CI and generated as fixtures
// locally when absent. Both raw files are stripped from the export output after
// `next build`. Override either location with PROCESSING_DATA_PATH /
// RESIDENTS_DATA_PATH.
//
// Run with: tsx scripts/transform-data.mts
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { packDashboardData } from '../src/utils/dashboardData';
import { type RawData, transformData } from '../src/utils/dataTransform';
import { packResidentsData } from '../src/utils/residentsData';
import {
  type RawResidentsData,
  transformResidentsData,
  verifyResidentTotals,
} from '../src/utils/residentsTransform';
import { writeResidentsFixture } from './generateResidentsFixture.mts';

const RAW_PATH = process.env.PROCESSING_DATA_PATH ?? 'public/datastore/processingData.json';
const OUT_PATH = 'public/data/dashboard.json';
const RESIDENTS_RAW_PATH = process.env.RESIDENTS_DATA_PATH ?? 'public/datastore/residentsData.json';
const RESIDENTS_OUT_PATH = 'public/data/residents.json';

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

// --- Foreign Residents table (0004019020) ---------------------------------
// A second, independent cube: nationality x residence status x half-year. It
// shares no dimension with the processing table above, so it gets its own
// transform and its own output file rather than being merged in.
let residentsSource: 'e-stat' | 'fixture' = 'e-stat';
if (!existsSync(RESIDENTS_RAW_PATH)) {
  console.warn(
    `⚠️  ${RESIDENTS_RAW_PATH} not found — generating a deterministic fixture (local/CI build without e-Stat data).`
  );
  const { rows, periods } = writeResidentsFixture(RESIDENTS_RAW_PATH);
  console.log(`   wrote ${RESIDENTS_RAW_PATH}: ${rows} values over ${periods} periods`);
  residentsSource = 'fixture';
}

const residentsRaw = JSON.parse(readFileSync(RESIDENTS_RAW_PATH, 'utf8')) as RawResidentsData;
const residentsTableInf = residentsRaw.GET_STATS_DATA?.STATISTICAL_DATA?.TABLE_INF;
if (residentsTableInf?.note?.includes('FIXTURE')) residentsSource = 'fixture';

const residentRecords = transformResidentsData(residentsRaw);
if (residentRecords.length === 0) {
  console.error(
    `✖ transformResidentsData produced 0 records from ${RESIDENTS_RAW_PATH} — refusing to emit an empty residents file.`
  );
  process.exit(1);
}

// The pruned leaves must still add up to e-Stat's own published totals on both
// axes. A mismatch means the aggregate/subset classification in
// src/constants has drifted from what e-Stat publishes — which produces a
// chart that looks fine and is quietly wrong, so it fails the build.
const mismatches = verifyResidentTotals(residentsRaw, residentRecords);
if (mismatches.length > 0) {
  const preview = mismatches
    .slice(0, 8)
    .map((m) => `    ${m.period} ${m.axis} axis, code ${m.code}: published ${m.published}, leaves ${m.fromLeaves}`)
    .join('\n');
  const message =
    `${mismatches.length} total(s) in ${RESIDENTS_RAW_PATH} do not reconcile with the leaves kept:\n${preview}` +
    (mismatches.length > 8 ? `\n    …and ${mismatches.length - 8} more` : '') +
    `\n  Revisit isAggregate/isSubset in src/constants/residenceStatuses.ts and src/constants/nationalities.ts.`;
  if (process.env.RESIDENTS_ALLOW_TOTAL_MISMATCH === '1') {
    console.warn(`⚠️  ${message}\n  Continuing because RESIDENTS_ALLOW_TOTAL_MISMATCH=1.`);
  } else {
    console.error(`✖ ${message}`);
    process.exit(1);
  }
}

const residentsFile = packResidentsData(residentRecords, {
  schema: 1,
  kind: 'residents',
  surveyDate: residentsTableInf?.SURVEY_DATE ?? 'unknown',
  source: residentsSource,
});

writeFileSync(RESIDENTS_OUT_PATH, JSON.stringify(residentsFile));

const residentsRawKb = Math.round(statSync(RESIDENTS_RAW_PATH).size / 1024);
const residentsOutKb = Math.round(statSync(RESIDENTS_OUT_PATH).size / 1024);
console.log(
  `✓ ${RESIDENTS_OUT_PATH}: ${residentRecords.length} records over ${residentsFile.periods.length} periods ` +
    `(${residentsOutKb} KB, raw ${residentsRawKb} KB, ` +
    `${Math.round((1 - residentsOutKb / residentsRawKb) * 100)}% smaller, source: ${residentsSource})`
);
