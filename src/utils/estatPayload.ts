// src/utils/estatPayload.ts
// Is this raw e-Stat payload the whole table?
//
// `getStatsData` caps a response at 100,000 rows and reports the continuation
// offset as RESULT_INF.NEXT_KEY. A short read is not an error condition: it
// arrives as HTTP 200, valid JSON, complete metadata, every field in place —
// just missing rows. scripts/fetch-estat-data.mjs pages past the cap and
// asserts the merged count, but a payload placed by hand never goes through it,
// and the transform downstream cannot tell "this category is empty" from "these
// rows were never sent". It reports the shortfall as a reconciliation failure
// against a hierarchy that is in fact correct, which sends the reader to
// exactly the wrong file.
//
// So the completeness question gets asked here, first and explicitly.

/** A dimension's members, as CLASS_INF declares them. */
interface ClassEntry {
  '@code': string;
}

interface ClassObj {
  '@id': string;
  CLASS: ClassEntry | ClassEntry[];
}

interface StatisticalData {
  RESULT_INF?: {
    TOTAL_NUMBER?: number;
    NEXT_KEY?: number | string;
  };
  CLASS_INF?: {
    CLASS_OBJ?: ClassObj | ClassObj[];
  };
  DATA_INF?: {
    VALUE?: Record<string, string> | Record<string, string>[];
  };
}

export interface RawEStatPayload {
  GET_STATS_DATA?: {
    STATISTICAL_DATA?: StatisticalData;
  };
}

export interface PayloadProblem {
  /** `truncated`: the API told us there is more. `coverage`: rows are missing. */
  kind: 'truncated' | 'coverage';
  detail: string;
}

/** e-Stat collapses a single-member list to a bare object throughout. */
const asArray = <T>(value: T | T[] | undefined): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/**
 * Reports every way the payload looks incomplete. Empty means it looks whole.
 *
 * Three signals rather than one, because they fail independently: RESULT_INF is
 * conclusive but can be absent depending on the request flags, and the CLASS_INF
 * comparison needs only `metaGetFlg=Y`. On the capture that prompted this, the
 * coverage signal is the one that names the problem outright — cat01 carries 23
 * of the 43 residence statuses the metadata declares.
 */
export const checkPayloadComplete = (raw: RawEStatPayload): PayloadProblem[] => {
  const data = raw?.GET_STATS_DATA?.STATISTICAL_DATA;
  if (!data) {
    return [{ kind: 'coverage', detail: 'no GET_STATS_DATA.STATISTICAL_DATA — this is not an e-Stat payload' }];
  }

  const values = asArray(data.DATA_INF?.VALUE);
  const problems: PayloadProblem[] = [];

  const nextKey = data.RESULT_INF?.NEXT_KEY;
  const totalNumber = data.RESULT_INF?.TOTAL_NUMBER;

  if (nextKey !== undefined && nextKey !== null) {
    problems.push({
      kind: 'truncated',
      detail: `RESULT_INF.NEXT_KEY is ${nextKey}, so the response stopped at the API's page cap`,
    });
  }

  if (typeof totalNumber === 'number' && values.length !== totalNumber) {
    problems.push({
      kind: 'truncated',
      detail: `holds ${values.length.toLocaleString('en-US')} rows but reports TOTAL_NUMBER ${totalNumber.toLocaleString('en-US')}`,
    });
  }

  // When RESULT_INF both exists and agrees, the API has already accounted for
  // every row and there is nothing left to infer. Checking coverage anyway
  // would turn a genuinely empty code into a build failure — a code with no
  // rows is unusual, since e-Stat emits a row per combination including the
  // zeros, but it is not by itself evidence of a short read.
  const rowCountVerified = problems.length === 0 && typeof totalNumber === 'number';
  if (rowCountVerified) return problems;

  // Otherwise CLASS_INF is the signal that survives: it needs only
  // `metaGetFlg=Y`, so it works on a payload whose RESULT_INF is absent, and it
  // names the dimension that is short rather than just the row count.
  for (const classObj of asArray(data.CLASS_INF?.CLASS_OBJ)) {
    const declared = new Set(asArray(classObj.CLASS).map((entry) => entry['@code']));
    if (declared.size === 0) continue;
    const dimension = `@${classObj['@id']}`;
    const present = new Set(values.map((value) => value[dimension]).filter((code) => code !== undefined));
    if (present.size < declared.size) {
      problems.push({
        kind: 'coverage',
        detail: `${classObj['@id']} covers ${present.size} of the ${declared.size} codes CLASS_INF declares`,
      });
    }
  }

  return problems;
};

/**
 * The message the build prints. Names the file, what is wrong with it, and both
 * ways out — re-fetch, or delete it and build against the fixture.
 */
export const describePayloadProblems = (path: string, problems: PayloadProblem[], statsDataId: string): string =>
  [
    `${path} looks incomplete:`,
    ...problems.map((problem) => `    ${problem.detail}`),
    `  e-Stat caps a response at 100,000 rows. Fetch a complete copy with:`,
    `    ESTAT_APP_ID=<your app id> node scripts/fetch-estat-data.mjs --stats-data-id ${statsDataId} --out ${path} --force`,
    `  Or delete the file to build against the deterministic fixture instead.`,
  ].join('\n');
