import { describe, expect, it } from 'vitest';

import { loadResidentsData } from '../loadResidentsData';
import { buildResidenceStatusTree } from '../residenceStatusTree';
import { formatPeriod, periodToDate } from '../residentPeriod';
import type { ResidentRecord } from '../residentsData';
import { unpackResidentsData } from '../residentsData';
import {
  getAllPeriods,
  getLatestPeriod,
  mergeContinuedSeries,
  periodsForRange,
  resolvePeriod,
  selectResidents,
  sumResidents,
  topCodesBy,
  totalsBy,
} from '../residentsSelectors';

const record = (period: string, status: string, nationality: string, value: number): ResidentRecord => ({
  period,
  status,
  nationality,
  value,
});

const DATA: ResidentRecord[] = [
  record('2024-12', '1430', '1230', 100),
  record('2024-12', '1380', '1360', 40),
  record('2025-06', '1430', '1230', 110),
  record('2025-06', '1380', '1360', 45),
  record('2025-12', '1430', '1230', 120),
  record('2025-12', '1380', '1360', 50),
  record('2025-12', '1430', '7000', 3),
];

describe('period helpers', () => {
  it('lists periods in chronological order', () => {
    expect(getAllPeriods(DATA)).toEqual(['2024-12', '2025-06', '2025-12']);
    expect(getLatestPeriod(DATA)).toBe('2025-12');
  });

  it('counts a year as two periods, not twelve', () => {
    const periods = ['2021-06', '2021-12', '2022-06', '2022-12', '2023-06', '2023-12', '2024-06'];
    expect(periodsForRange(periods, '3y')).toHaveLength(6);
    expect(periodsForRange(periods, 'latest')).toEqual(['2024-06']);
    expect(periodsForRange(periods, 'all')).toEqual(periods);
  });

  it('formats a period as a month and year in the reader’s locale', () => {
    expect(periodToDate('2025-12').getMonth()).toBe(11);
    // Read with local getters, matching how periodToDate builds the date —
    // toISOString() re-read it in UTC, which shifted the local midnight to the
    // previous day anywhere east of UTC and failed this test under JST.
    const en = {
      monthYear: (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    } as never;
    expect(formatPeriod('2025-12', en)).toBe('2025-12');
    expect(formatPeriod(null, en)).toBe('');
  });

  it('resolves a requested snapshot, degrading unknown periods to latest', () => {
    expect(resolvePeriod(DATA, '2024-12')).toBe('2024-12');
    expect(resolvePeriod(DATA, null)).toBe('2025-12');
    // Out-of-coverage URL input falls back rather than emptying the chart.
    expect(resolvePeriod(DATA, '1999-06')).toBe('2025-12');
    expect(resolvePeriod([], '2024-12')).toBeNull();
  });
});

describe('selectResidents', () => {
  it('treats an absent filter and "all" the same way', () => {
    expect(selectResidents(DATA, { period: '2025-12' })).toHaveLength(3);
    expect(selectResidents(DATA, { period: '2025-12', status: 'all' })).toHaveLength(3);
  });

  it('narrows by status, nationality and window', () => {
    expect(sumResidents(selectResidents(DATA, { status: '1430' }))).toBe(333);
    expect(sumResidents(selectResidents(DATA, { nationality: '1360' }))).toBe(135);
    expect(sumResidents(selectResidents(DATA, { periods: ['2025-12'] }))).toBe(173);
  });

  it('narrows by region and status group', () => {
    // 1230 is in Asia, 7000 is 無国籍 in a region of its own.
    expect(selectResidents(DATA, { period: '2025-12', region: '7000' })).toHaveLength(1);
    expect(selectResidents(DATA, { period: '2025-12', group: 'study' })).toHaveLength(1);
  });

  it("treats 'all' as no filter for region and group too", () => {
    expect(selectResidents(DATA, { period: '2025-12', region: 'all' })).toHaveLength(3);
    expect(selectResidents(DATA, { period: '2025-12', group: 'all' })).toHaveLength(3);
  });

  it('ranks totals descending', () => {
    const totals = totalsBy(selectResidents(DATA, { period: '2025-12' }), 'nationality');
    expect([...totals.keys()]).toEqual(['1230', '1360', '7000']);
    expect(topCodesBy(DATA, 'nationality', 2)).toEqual(['1230', '1360']);
  });
});

describe('mergeContinuedSeries', () => {
  it('folds 韓国 and 朝鮮 back onto the pre-2015 combined code', () => {
    const split = [
      record('2015-06', '1430', '1130', 500),
      record('2015-12', '1430', '1110', 460),
      record('2015-12', '1430', '1120', 40),
    ];
    const totals = totalsBy(mergeContinuedSeries(split), 'nationality');
    // One continuous series rather than a collapse and two arrivals.
    expect([...totals.keys()]).toEqual(['1130']);
    expect(totals.get('1130')).toBe(1000);
  });

  it('leaves every other nationality untouched', () => {
    expect(mergeContinuedSeries(DATA)).toEqual(DATA);
  });
});

describe('buildResidenceStatusTree', () => {
  it('draws the requested snapshot, defaulting to the latest period', () => {
    // Summing half-years would count the same resident once per period.
    expect(buildResidenceStatusTree(DATA, { nationality: 'all', region: 'all' }, null).total).toBe(173);
    expect(buildResidenceStatusTree(DATA, { nationality: 'all', region: 'all' }, '2024-12').total).toBe(140);
  });

  it('groups statuses by purpose of stay, largest group first', () => {
    const tree = buildResidenceStatusTree(DATA, { nationality: 'all', region: 'all' }, null);
    expect(tree.categories.map((category) => category.key)).toEqual(['residency', 'study']);
    // One leaf per status, summed across nationalities: 120 (CN) + 3 (無国籍).
    expect(tree.categories[0].children).toEqual([{ code: '1430', value: 123 }]);
    expect(tree.categories[1].children).toEqual([{ code: '1380', value: 50 }]);
  });

  it('narrows to one nationality or one region', () => {
    const tree = buildResidenceStatusTree(DATA, { nationality: '1360', region: 'all' }, null);
    expect(tree.total).toBe(50);
    expect(tree.categories.map((category) => category.key)).toEqual(['study']);
    // 7000 is 無国籍, a region of its own.
    expect(buildResidenceStatusTree(DATA, { nationality: 'all', region: '7000' }, null).total).toBe(3);
  });

  it('is empty rather than throwing when there is no data', () => {
    expect(buildResidenceStatusTree([], { nationality: 'all', region: 'all' }, null)).toEqual({
      total: 0,
      categories: [],
    });
  });
});

describe('loadResidentsData', () => {
  // Only `ok`, `status` and `json` are read; a full Response stub would be
  // noise, so the cast is narrowed to what the loader actually touches.
  const fetchReturning = (body: unknown, ok = true) => {
    globalThis.fetch = (() =>
      Promise.resolve({ ok, status: ok ? 200 : 404, json: () => Promise.resolve(body) } as Response)) as typeof fetch;
  };

  it('unpacks a well-formed residents file', async () => {
    const file = {
      meta: { schema: 1, kind: 'residents', surveyDate: 202512, source: 'e-stat' },
      periods: ['2025-12'],
      statuses: ['1430'],
      nationalities: ['1230'],
      values: [0, 0, 0, 42],
    };
    fetchReturning(file);
    const loaded = await loadResidentsData();
    expect(loaded?.records).toEqual([record('2025-12', '1430', '1230', 42)]);
  });

  it('refuses the processing file, whose stride is different', async () => {
    // Without the `kind` check this unpacks to plausible-looking garbage
    // rather than failing.
    fetchReturning({
      meta: { schema: 1, surveyDate: 202512, source: 'e-stat' },
      months: ['2025-12'],
      bureaus: ['100000'],
      types: ['20'],
      statuses: ['103000'],
      values: [0, 0, 0, 0, 42],
    });
    expect(await loadResidentsData()).toBeNull();
  });

  it('returns null on an HTTP error instead of throwing', async () => {
    fetchReturning({}, false);
    expect(await loadResidentsData()).toBeNull();
  });
});

describe('unpackResidentsData', () => {
  it('reads back an empty file', () => {
    expect(
      unpackResidentsData({
        meta: { schema: 1, kind: 'residents', surveyDate: 'unknown', source: 'fixture' },
        periods: [],
        statuses: [],
        nationalities: [],
        values: [],
      })
    ).toEqual([]);
  });
});
