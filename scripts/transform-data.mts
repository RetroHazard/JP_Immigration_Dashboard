// Build-time transform: applies the e-Stat flattening and each table's
// corrections once and emits the compact files the client loads, so visitors
// never download the verbose raw payloads (stripped from the export after
// `next build`).
//
// What a table is lives in scripts/datasets.mjs; what it needs done lives in
// HANDLERS below, keyed by dataset id, because these are functions and the
// manifest must stay loadable by bare `node`. The tables share no dimension,
// only the lifecycle in `build`.
//
// Inputs come from the Actions cache in CI and are generated as fixtures when
// absent. Override a location with ESTAT_RAW_<ID>, e.g. ESTAT_RAW_RESIDENTS.
//
// Run with: tsx scripts/transform-data.mts
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { packDashboardData } from '../src/utils/dashboardData';
import { type RawData, transformData } from '../src/utils/dataTransform';
import { checkPayloadComplete, describePayloadProblems } from '../src/utils/estatPayload';
import { packResidentsData } from '../src/utils/residentsData';
import {
  type RawResidentsData,
  transformResidentsData,
  verifyResidentTotals,
} from '../src/utils/residentsTransform';
import { DATASETS, rawPathOf } from './datasets.mjs';
import { writeResidentsFixture } from './generateResidentsFixture.mts';

type Source = 'e-stat' | 'fixture';

/** Mirrors the `Dataset` typedef in scripts/datasets.mjs, which stays plain JS so bare node can read it. */
interface Dataset {
  id: string;
  statsDataId: string;
  raw: string;
  out: string;
  label: string;
}

interface Handler {
  /** Writes a deterministic stand-in so a build works without the e-Stat secret. */
  writeFixture: (outPath: string) => void;
  /** Flattens the raw payload into the record shape the packer expects. */
  transform: (raw: never) => unknown[];
  /**
   * Optional cross-check of the transformed records against the raw payload.
   * Returns a message to fail the build with, or null when it reconciles.
   */
  verify?: (raw: never, records: never) => string | null;
  /** Packs records into the compact file the client fetches. */
  pack: (records: never, meta: { schema: 1; surveyDate: string | number; source: Source }) => object;
  /** One line for the build log: what the counts in this file actually mean. */
  describe: (file: never, records: unknown[]) => string;
}

const HANDLERS: Record<string, Handler> = {
  processing: {
    // A CLI rather than an import: generate-fixture.mjs is a standalone script
    // with no exports.
    writeFixture: (outPath) => execFileSync('node', ['scripts/generate-fixture.mjs', outPath], { stdio: 'inherit' }),
    transform: (raw: RawData) => transformData(raw),
    pack: (records, meta) => packDashboardData(records, meta),
    describe: (file: ReturnType<typeof packDashboardData>, records) =>
      `${records.length} records over ${file.months.length} months`,
  },

  residents: {
    writeFixture: (outPath) => {
      const { rows, periods } = writeResidentsFixture(outPath);
      console.log(`   wrote ${outPath}: ${rows} values over ${periods} periods`);
    },
    transform: (raw: RawResidentsData) => transformResidentsData(raw),

    // The pruned leaves must add up to e-Stat's published totals on both axes.
    // A mismatch means the aggregate/subset classification in src/constants has
    // drifted, which yields a plausible but wrong chart, so it fails the build.
    verify: (raw: RawResidentsData, records: ReturnType<typeof transformResidentsData>) => {
      const mismatches = verifyResidentTotals(raw, records);
      if (mismatches.length === 0) return null;
      const preview = mismatches
        .slice(0, 8)
        .map(
          (m) =>
            `    ${m.period}  ${m.keyDimension} ${m.code}: leaves sum to ` +
            `${m.fromLeaves.toLocaleString('en-US')} over ${m.summedOver}, published ` +
            `${m.published.toLocaleString('en-US')}`
        )
        .join('\n');
      const message =
        `${mismatches.length} total(s) do not reconcile with the leaves kept:\n${preview}` +
        (mismatches.length > 8 ? `\n    …and ${mismatches.length - 8} more` : '') +
        `\n  Revisit isAggregate/isSubset in src/constants/residenceStatuses.ts and src/constants/nationalities.ts.`;
      if (process.env.RESIDENTS_ALLOW_TOTAL_MISMATCH === '1') {
        console.warn(`⚠️  ${message}\n  Continuing because RESIDENTS_ALLOW_TOTAL_MISMATCH=1.`);
        return null;
      }
      return message;
    },

    // `kind` discriminates the two build outputs (see loadResidentsData /
    // loadLocalData). The meta is written field by field so the emitted key
    // order, and so the emitted bytes, stay stable.
    pack: (records, { schema, surveyDate, source }) =>
      packResidentsData(records, { schema, kind: 'residents', surveyDate, source }),
    describe: (file: ReturnType<typeof packResidentsData>, records) =>
      `${records.length} records over ${file.periods.length} periods`,
  },
};

/**
 * A short read from e-Stat is a 200 with valid JSON and missing rows. Checked
 * before transforming, because downstream it surfaces as a reconciliation
 * failure that blames the (correct) hierarchy. Fixtures are generated whole, so
 * they are exempt.
 */
const assertComplete = (raw: unknown, path: string, statsDataId: string, source: Source) => {
  if (source === 'fixture') return;
  const problems = checkPayloadComplete(raw);
  if (problems.length > 0) {
    console.error(`✖ ${describePayloadProblems(path, problems, statsDataId)}`);
    process.exit(1);
  }
};

const die = (message: string): never => {
  console.error(`✖ ${message}`);
  process.exit(1);
};

const build = (dataset: Dataset) => {
  const handler = HANDLERS[dataset.id];
  if (!handler) {
    die(
      `no handler for dataset "${dataset.id}". A dataset registered in scripts/datasets.mjs also needs an entry in ` +
        `HANDLERS in scripts/transform-data.mts: a fixture writer, a transform, a packer and a describe.`
    );
  }

  const rawPath = rawPathOf(dataset);

  // Two independent signals: the file may be absent (generate a fixture), or a
  // fixture from an earlier run may already be there (its TABLE_INF.note says so).
  let source: Source = 'e-stat';
  if (!existsSync(rawPath)) {
    console.warn(`⚠️  ${rawPath} not found — generating a deterministic fixture (local/CI build without e-Stat data).`);
    handler.writeFixture(rawPath);
    source = 'fixture';
  }

  const raw = JSON.parse(readFileSync(rawPath, 'utf8')) as {
    GET_STATS_DATA?: { STATISTICAL_DATA?: { TABLE_INF?: { SURVEY_DATE?: string | number; note?: string } } };
  };
  const tableInf = raw.GET_STATS_DATA?.STATISTICAL_DATA?.TABLE_INF;
  if (tableInf?.note?.includes('FIXTURE')) source = 'fixture';

  assertComplete(raw, rawPath, dataset.statsDataId, source);

  const records = handler.transform(raw as never);
  if (records.length === 0) {
    die(`${dataset.label}: the transform produced 0 records from ${rawPath} — refusing to emit an empty file.`);
  }

  const problem = handler.verify?.(raw as never, records as never);
  if (problem) die(`${rawPath}: ${problem}`);

  const file = handler.pack(records as never, {
    schema: 1,
    surveyDate: tableInf?.SURVEY_DATE ?? 'unknown',
    source,
  });

  mkdirSync(dirname(dataset.out), { recursive: true });
  writeFileSync(dataset.out, JSON.stringify(file));

  const rawKb = Math.round(statSync(rawPath).size / 1024);
  const outKb = Math.round(statSync(dataset.out).size / 1024);
  console.log(
    `✓ ${dataset.out}: ${handler.describe(file as never, records)} ` +
      `(${outKb} KB, raw ${rawKb} KB, ${Math.round((1 - outKb / rawKb) * 100)}% smaller, source: ${source})`
  );
};

for (const dataset of DATASETS) build(dataset);
