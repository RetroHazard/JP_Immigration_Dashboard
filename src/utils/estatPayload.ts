// Is this raw e-Stat payload the whole table? `getStatsData` caps a response at
// 100,000 rows (continuation in RESULT_INF.NEXT_KEY), and a short read is a
// normal HTTP 200 with complete metadata, just missing rows. A payload placed by
// hand skips scripts/fetch-estat-data.mjs's paging, and the transform can't tell
// an empty category from unsent rows: it would blame a hierarchy that is correct.

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
 * Three signals because they fail independently: RESULT_INF is conclusive but
 * can be absent depending on the request flags, while the CLASS_INF comparison
 * needs only `metaGetFlg=Y`.
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

  // A RESULT_INF that exists and agrees accounts for every row. Checking
  // coverage anyway would fail the build on a code with no rows, which is
  // unusual (e-Stat emits the zeros) but not by itself evidence of a short read.
  const rowCountVerified = problems.length === 0 && typeof totalNumber === 'number';
  if (rowCountVerified) return problems;

  // Otherwise fall back to CLASS_INF, which works without RESULT_INF and names
  // the dimension that is short rather than just the row count.
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
