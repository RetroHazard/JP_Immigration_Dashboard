import { describe, expect, it } from 'vitest';

import type { ResidentRecord } from '../residentsData';
import { buildRegionSeries, buildStatusGroupSeries, indexSeries } from '../residentsGrowth';

const record = (period: string, status: string, nationality: string, value: number): ResidentRecord => ({
  period,
  status,
  nationality,
  value,
});

// 1430 永住者 (residency), 1380 留学 (study), 1270 特定技能1号 (work).
// 1230 中国 (Asia), 5090 ブラジル (South America), 7000 無国籍 (stateless).
const DATA: ResidentRecord[] = [
  record('2024-12', '1430', '1230', 100),
  record('2024-12', '1380', '5090', 40),
  record('2025-06', '1430', '1230', 110),
  record('2025-06', '1380', '5090', 45),
  record('2025-06', '1270', '1230', 5),
  record('2025-12', '1430', '1230', 120),
  record('2025-12', '1380', '5090', 50),
  record('2025-12', '1270', '1230', 15),
  record('2025-12', '1430', '7000', 3),
];

describe('buildStatusGroupSeries', () => {
  it('reports one row per period, never summed across periods', () => {
    const series = buildStatusGroupSeries(DATA, { nationality: 'all' }, 'all');
    expect(series.rows.map((row) => row.period)).toEqual(['2024-12', '2025-06', '2025-12']);
    expect(series.rows.map((row) => row.total)).toEqual([140, 160, 188]);
  });

  it('buckets by status group in fixed draw order', () => {
    const series = buildStatusGroupSeries(DATA, { nationality: 'all' }, 'all');
    // Only groups with volume, in STATUS_GROUPS order: work, study, residency.
    expect(series.keys).toEqual(['work', 'study', 'residency']);
    expect(series.rows[2].values).toEqual({ residency: 123, study: 50, work: 15 });
    // 2024-12 has no work volume: absent, not zero.
    expect(series.rows[0].values.work).toBeUndefined();
  });

  it('narrows to one nationality', () => {
    const series = buildStatusGroupSeries(DATA, { nationality: '1230' }, 'all');
    expect(series.keys).toEqual(['work', 'residency']);
    expect(series.rows[2].total).toBe(135);
  });

  it('respects the range window', () => {
    const series = buildStatusGroupSeries(DATA, { nationality: 'all' }, 'latest');
    expect(series.rows).toHaveLength(1);
    expect(series.rows[0].period).toBe('2025-12');
  });

  it('is empty rather than throwing when there is no data', () => {
    expect(buildStatusGroupSeries([], { nationality: 'all' }, 'all')).toEqual({ keys: [], rows: [] });
  });
});

describe('buildRegionSeries', () => {
  it('buckets by continent, keeping 無国籍 as its own bucket', () => {
    const series = buildRegionSeries(DATA, { nationality: 'all' }, 'latest');
    // Asia (1000), South America (5000), stateless (7000) — rollup order.
    expect(series.keys).toEqual(['1000', '5000', '7000']);
    expect(series.rows[0].values).toEqual({ '1000': 135, '5000': 50, '7000': 3 });
  });

  it('drops regions with no volume anywhere in the window', () => {
    const series = buildRegionSeries(DATA, { nationality: '1230' }, 'all');
    expect(series.keys).toEqual(['1000']);
  });
});

describe('indexSeries', () => {
  const rows = [
    { date: 'a', vn: 50, cn: 650 },
    { date: 'b', vn: 100, cn: 780 },
    { date: 'c', vn: 200, cn: 910 },
  ];

  it('re-bases every series to 100 at its first value', () => {
    const indexed = indexSeries(rows, ['vn', 'cn']);
    expect(indexed.map((row) => row.vn)).toEqual([100, 200, 400]);
    expect(indexed.map((row) => row.cn)).toEqual([100, 120, 140]);
    // Non-series columns pass through untouched.
    expect(indexed.map((row) => row.date)).toEqual(['a', 'b', 'c']);
  });

  it('leaves gaps as gaps for a series that starts mid-window', () => {
    const sparse = [
      { late: undefined, early: 10 },
      { late: 30, early: 20 },
      { late: 60, early: 40 },
    ];
    const indexed = indexSeries(sparse, ['late', 'early']);
    // Base for `late` is its first present value (30), not the window start.
    expect(indexed.map((row) => row.late)).toEqual([undefined, 100, 200]);
    expect(indexed.map((row) => row.early)).toEqual([100, 200, 400]);
  });

  it('never divides by a zero or missing base', () => {
    const zeros = [
      { flat: 0, ghost: undefined },
      { flat: 0, ghost: undefined },
    ];
    const indexed = indexSeries(zeros, ['flat', 'ghost']);
    expect(indexed.every((row) => row.flat === undefined && row.ghost === undefined)).toBe(true);
  });
});
