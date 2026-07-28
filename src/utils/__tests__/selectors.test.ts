import { describe, expect, it } from 'vitest';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { packDashboardData, unpackDashboardData } from '../dashboardData';
import { breakdownScopeFromFilter, bureauScopeFromFilter, selectData } from '../selectors';

const NATIONWIDE = '100000';

const entry = (overrides: Partial<ImmigrationData>): ImmigrationData => ({
  month: '2025-06',
  bureau: '101170',
  type: '20',
  status: '300000',
  value: 100,
  ...overrides,
});

const data: ImmigrationData[] = [
  entry({ bureau: NATIONWIDE, value: 1000 }),
  entry({ bureau: '101170', value: 600 }),
  entry({ bureau: '101460', value: 400 }),
  entry({ bureau: '101460', type: '10', value: 50 }),
  entry({ bureau: NATIONWIDE, month: '2025-05', value: 900 }),
];

describe('selectData bureau scopes', () => {
  it("nationwide scope returns only the aggregate row (the old 'all' ambiguity, resolved)", () => {
    const result = selectData(data, { scope: { kind: 'nationwide' }, month: '2025-06' });
    expect(result).toHaveLength(1);
    expect(result[0].bureau).toBe(NATIONWIDE);
    expect(result[0].value).toBe(1000);
  });

  it('bureau scope returns exactly that bureau', () => {
    const result = selectData(data, { scope: { kind: 'bureau', code: '101460' } });
    expect(result.map((r) => r.value).sort()).toEqual([400, 50].sort());
  });

  it('eachBureau scope excludes the aggregate row so breakdowns never double-count', () => {
    const result = selectData(data, { scope: { kind: 'eachBureau' }, month: '2025-06' });
    expect(result.every((r) => r.bureau !== NATIONWIDE)).toBe(true);
    expect(result.reduce((s, r) => s + r.value, 0)).toBe(600 + 400 + 50);
  });

  it("type 'all' and undefined both mean no type filtering", () => {
    expect(selectData(data, { type: 'all' })).toHaveLength(data.length);
    expect(selectData(data, {})).toHaveLength(data.length);
    expect(selectData(data, { type: '10' })).toHaveLength(1);
  });

  it('filter-value helpers map the UI value to the right scope per chart family', () => {
    expect(bureauScopeFromFilter('all')).toEqual({ kind: 'nationwide' });
    expect(bureauScopeFromFilter('101170')).toEqual({ kind: 'bureau', code: '101170' });
    expect(breakdownScopeFromFilter('all')).toEqual({ kind: 'eachBureau' });
    expect(breakdownScopeFromFilter('101170')).toEqual({ kind: 'bureau', code: '101170' });
  });
});

describe('dashboardData pack/unpack', () => {
  it('round-trips records exactly', () => {
    const meta = { schema: 1 as const, surveyDate: 202510, source: 'fixture' as const };
    const unpacked = unpackDashboardData(packDashboardData(data, meta));
    // Order may change (packing is stable by input order), so compare as sets
    const key = (r: ImmigrationData) => `${r.month}|${r.bureau}|${r.type}|${r.status}|${r.value}`;
    expect(unpacked.map(key).sort()).toEqual(data.map(key).sort());
    expect(unpacked).toHaveLength(data.length);
  });
});
