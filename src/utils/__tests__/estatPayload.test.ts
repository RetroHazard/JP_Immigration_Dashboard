import { describe, expect, it } from 'vitest';

// mergePages is the part of the fetch worth pinning down and it needs no
// network, so it is imported straight from the build script (allowJs resolves
// it) — the same precedent as the catalogue test importing scripts/localeTemplate.
import { mergePages } from '../../../scripts/fetch-estat-data.mjs';
import { checkPayloadComplete, describePayloadProblems, type RawEStatPayload } from '../estatPayload';

const payload = ({
  rows = 2,
  totalNumber,
  nextKey,
  classInf,
  values,
}: {
  rows?: number;
  totalNumber?: number;
  nextKey?: number;
  classInf?: unknown;
  values?: Record<string, string>[];
} = {}): RawEStatPayload => ({
  GET_STATS_DATA: {
    STATISTICAL_DATA: {
      ...(totalNumber === undefined && nextKey === undefined
        ? {}
        : { RESULT_INF: { ...(totalNumber !== undefined && { TOTAL_NUMBER: totalNumber }), ...(nextKey !== undefined && { NEXT_KEY: nextKey }) } }),
      ...(classInf !== undefined ? { CLASS_INF: classInf as never } : {}),
      DATA_INF: {
        VALUE: values ?? Array.from({ length: rows }, (_, i) => ({ '@cat01': String(i), $: '1' })),
      },
    },
  },
});

describe('checkPayloadComplete', () => {
  it('passes a payload whose row count matches its own TOTAL_NUMBER', () => {
    expect(checkPayloadComplete(payload({ rows: 2, totalNumber: 2 }))).toEqual([]);
  });

  it('reports NEXT_KEY, which is the API saying there is more', () => {
    const problems = checkPayloadComplete(payload({ rows: 2, totalNumber: 2, nextKey: 100001 }));
    expect(problems).toContainEqual({
      kind: 'truncated',
      detail: 'RESULT_INF.NEXT_KEY is 100001, so the response stopped at the API’s page cap'.replace('’', "'"),
    });
  });

  it('reports a row count below TOTAL_NUMBER', () => {
    const problems = checkPayloadComplete(payload({ rows: 2, totalNumber: 5 }));
    expect(problems).toHaveLength(1);
    expect(problems[0].kind).toBe('truncated');
    expect(problems[0].detail).toContain('holds 2 rows but reports TOTAL_NUMBER 5');
  });

  it('reports a dimension the data does not cover, naming it', () => {
    // The exact shape of the bug this guard exists for: the capture declared 43
    // residence statuses in CLASS_INF and carried rows for 23 of them.
    const declared = Array.from({ length: 43 }, (_, i) => ({ '@code': String(i) }));
    const problems = checkPayloadComplete(
      payload({
        rows: 23,
        nextKey: 100001,
        classInf: { CLASS_OBJ: [{ '@id': 'cat01', CLASS: declared }] },
      })
    );
    expect(problems).toContainEqual({
      kind: 'coverage',
      detail: 'cat01 covers 23 of the 43 codes CLASS_INF declares',
    });
  });

  it('does not second-guess a payload whose own row count checks out', () => {
    // A code with no rows is unusual but not evidence of a short read, and
    // failing the build over one would be a false positive with no override.
    const declared = Array.from({ length: 43 }, (_, i) => ({ '@code': String(i) }));
    expect(
      checkPayloadComplete(
        payload({ rows: 23, totalNumber: 23, classInf: { CLASS_OBJ: [{ '@id': 'cat01', CLASS: declared }] } })
      )
    ).toEqual([]);
  });

  it('still catches the coverage gap when RESULT_INF is absent', () => {
    // sectionHeaderFlg and friends can drop RESULT_INF; CLASS_INF needs only
    // metaGetFlg=Y, so this signal survives on its own.
    const problems = checkPayloadComplete(
      payload({ rows: 1, classInf: { CLASS_OBJ: [{ '@id': 'cat01', CLASS: [{ '@code': '0' }, { '@code': '1' }] }] } })
    );
    expect(problems).toEqual([
      { kind: 'coverage', detail: 'cat01 covers 1 of the 2 codes CLASS_INF declares' },
    ]);
  });

  it('normalizes the single-member forms e-Stat collapses to bare objects', () => {
    // `tab` has one member in this table, so CLASS_OBJ and CLASS both arrive as
    // objects rather than arrays.
    const problems = checkPayloadComplete(
      payload({
        values: [{ '@tab': '01', $: '1' }],
        classInf: { CLASS_OBJ: { '@id': 'tab', CLASS: { '@code': '01' } } },
      })
    );
    expect(problems).toEqual([]);
  });

  it('reports a payload that is not an e-Stat envelope at all', () => {
    expect(checkPayloadComplete({})).toEqual([
      { kind: 'coverage', detail: 'no GET_STATS_DATA.STATISTICAL_DATA — this is not an e-Stat payload' },
    ]);
  });
});

describe('describePayloadProblems', () => {
  it('names the file, the problems, and both ways out', () => {
    const message = describePayloadProblems(
      'public/datastore/residentsData.json',
      checkPayloadComplete(payload({ rows: 2, totalNumber: 5, nextKey: 3 })),
      '0004019020'
    );
    expect(message).toContain('public/datastore/residentsData.json looks incomplete');
    expect(message).toContain('NEXT_KEY is 3');
    expect(message).toContain('holds 2 rows but reports TOTAL_NUMBER 5');
    // The two remedies: re-fetch, or fall back to the fixture.
    expect(message).toContain('node scripts/fetch-estat-data.mjs --stats-data-id 0004019020');
    expect(message).toContain('delete the file');
  });
});

describe('mergePages', () => {
  const page = (values: { $: string }[], resultInf: Record<string, number>) => ({
    GET_STATS_DATA: {
      STATISTICAL_DATA: {
        TABLE_INF: { SURVEY_DATE: 202512 },
        CLASS_INF: { CLASS_OBJ: [{ '@id': 'cat01', CLASS: [{ '@code': '1' }] }] },
        RESULT_INF: resultInf,
        DATA_INF: { VALUE: values },
      },
    },
  });

  const first = page([{ $: '1' }, { $: '2' }], { TOTAL_NUMBER: 3, FROM_NUMBER: 1, TO_NUMBER: 2, NEXT_KEY: 3 });
  const second = page([{ $: '3' }], { TOTAL_NUMBER: 3, FROM_NUMBER: 3, TO_NUMBER: 3 });

  it('concatenates every page’s rows in request order', () => {
    const merged = mergePages([first, second]);
    expect(merged.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE).toEqual([{ $: '1' }, { $: '2' }, { $: '3' }]);
  });

  it('keeps page one’s metadata', () => {
    const merged = mergePages([first, second]);
    const data = merged.GET_STATS_DATA.STATISTICAL_DATA;
    expect(data.TABLE_INF).toEqual({ SURVEY_DATE: 202512 });
    expect(data.CLASS_INF.CLASS_OBJ).toHaveLength(1);
  });

  it('drops NEXT_KEY and corrects TO_NUMBER so the merge cannot look partial', () => {
    const merged = mergePages([first, second]);
    const resultInf = merged.GET_STATS_DATA.STATISTICAL_DATA.RESULT_INF;
    expect(resultInf.NEXT_KEY).toBeUndefined();
    expect(resultInf.TO_NUMBER).toBe(3);
    expect(resultInf.TOTAL_NUMBER).toBe(3);
    // And the merged result passes the completeness guard the build applies.
    expect(checkPayloadComplete(merged as RawEStatPayload)).toEqual([]);
    expect(resultInf.TOTAL_NUMBER).toBe(merged.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE.length);
  });

  it('does not mutate the pages it was given', () => {
    mergePages([first, second]);
    expect(first.GET_STATS_DATA.STATISTICAL_DATA.RESULT_INF.NEXT_KEY).toBe(3);
    expect(first.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE).toHaveLength(2);
  });

  it('handles a single page with no continuation', () => {
    const only = page([{ $: '1' }], { TOTAL_NUMBER: 1, FROM_NUMBER: 1, TO_NUMBER: 1 });
    expect(mergePages([only]).GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE).toEqual([{ $: '1' }]);
  });
});
