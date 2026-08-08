// scripts/transform-data.mts
// Build-time data transform: applies the e-Stat flattening and each table's
// corrections ONCE at build time and emits the compact files the client loads,
// instead of shipping the verbose raw payloads to every visitor.
//
// The tables to process come from scripts/datasets.mjs, the same manifest the
// fetch script and both workflows read. What a table *is* — its input, output and
// statsDataId — lives there; what it *needs done* lives in the HANDLERS table
// below, keyed by dataset id, because fixture writers and transforms are
// functions and the manifest has to stay loadable by bare `node`.
//
// Today that is two independent cubes:
//
//   processing  bureau x application type x status, monthly; bureau aggregates
//               deaggregated (correctBureauAggregates.ts)
//   residents   nationality x residence status, half-yearly; rollups and nested
//               rows pruned, then reconciled against e-Stat's own totals
//
// They share no dimension, so they share no code path — but they do share a
// lifecycle (fixture fallback, completeness check, transform, verify, pack,
// report), and that lifecycle is written once here.
//
// Inputs are restored from the Actions cache in CI and generated as fixtures
// locally when absent. Raw files are stripped from the export output after
// `next build`. Override any input location with ESTAT_RAW_<ID>, e.g.
// ESTAT_RAW_RESIDENTS.
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
    // A CLI rather than an import: this fixture predates the module-shaped one
    // and inlines its own bureau lists, so it has no TypeScript to import.
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

    // The pruned leaves must still add up to e-Stat's own published totals on
    // both axes. A mismatch means the aggregate/subset classification in
    // src/constants has drifted from what e-Stat publishes — which produces a
    // chart that looks fine and is quietly wrong, so it fails the build.
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

    // `kind` set out longhand rather than spread in: it discriminates the two
    // build outputs (see loadResidentsData / loadLocalData), and writing the meta
    // field by field keeps the emitted key order — and so the emitted bytes —
    // stable across refactors of this file.
    pack: (records, { schema, surveyDate, source }) =>
      packResidentsData(records, { schema, kind: 'residents', surveyDate, source }),
    describe: (file: ReturnType<typeof packResidentsData>, records) =>
      `${records.length} records over ${file.periods.length} periods`,
  },
};

/**
 * A short read from e-Stat is not an error condition — it is a 200 with valid
 * JSON, full metadata, and missing rows. Checked before anything is
 * transformed, because downstream the shortfall surfaces as a reconciliation
 * failure against a hierarchy that is correct, which points at the wrong file
 * entirely. Fixtures are exempt: they are generated whole by definition.
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

  // Two independent signals, because either can be true alone: the file may be
  // absent (generate one), or a fixture from an earlier run may already be
  // sitting there (it says so in its own TABLE_INF.note).
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
