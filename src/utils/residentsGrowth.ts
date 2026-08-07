// src/utils/residentsGrowth.ts
// Series builders for the Population Growth view: one row per half-year, the
// total split into either status groups (why people are here) or world
// regions (where they are from). Each row is a snapshot of one period — the
// table reports a stock, so nothing is ever summed across periods.
import { NATIONALITY_REGIONS, nationalityByCode, STATELESS } from '../constants/nationalities';
import { residenceStatusByCode, STATUS_GROUPS, type StatusGroup } from '../constants/residenceStatuses';
import type { ResidentRecord } from './residentsData';
import type { ResidentRange } from './residentsSelectors';
import { getAllPeriods, periodsForRange, selectResidents } from './residentsSelectors';

export type GrowthBreakdown = 'group' | 'region';

export interface GrowthRow {
  period: string;
  /** One numeric entry per bucket key; a bucket with no volume is absent. */
  values: Record<string, number>;
  total: number;
}

export interface GrowthSeries {
  /** Bucket keys in fixed draw order — StatusGroup values or region codes. */
  keys: string[];
  rows: GrowthRow[];
}

const groupOf = (status: string): StatusGroup => residenceStatusByCode(status)?.group ?? 'other';

/** A nationality outside the constants table can only be counted as stateless-like unknown. */
const regionOf = (nationality: string): string => nationalityByCode(nationality)?.region ?? STATELESS;

const buildSeries = (
  data: ResidentRecord[],
  filters: { nationality?: string; status?: string },
  range: ResidentRange,
  allKeys: readonly string[],
  keyOf: (record: ResidentRecord) => string
): GrowthSeries => {
  const periods = periodsForRange(getAllPeriods(data), range);
  const rows = selectResidents(data, {
    periods,
    nationality: filters.nationality,
    status: filters.status,
  });

  const byPeriod = new Map<string, Record<string, number>>(periods.map((period) => [period, {}]));
  for (const record of rows) {
    const bucket = byPeriod.get(record.period);
    if (!bucket) continue;
    const key = keyOf(record);
    bucket[key] = (bucket[key] ?? 0) + record.value;
  }

  const growthRows: GrowthRow[] = periods.map((period) => {
    const values = byPeriod.get(period) ?? {};
    return {
      period,
      values,
      total: Object.values(values).reduce((sum, value) => sum + value, 0),
    };
  });

  // Only buckets that ever have volume: a filter that empties a bucket for
  // the whole window should also drop it from the legend and the stack.
  const keys = allKeys.filter((key) => growthRows.some((row) => (row.values[key] ?? 0) > 0));

  return { keys, rows: growthRows };
};

/** Total per half-year split by status group (work, training, study, …). */
export const buildStatusGroupSeries = (
  data: ResidentRecord[],
  filters: { nationality: string },
  range: ResidentRange
): GrowthSeries =>
  buildSeries(data, { nationality: filters.nationality }, range, STATUS_GROUPS, (record) => groupOf(record.status));

/** Total per half-year split by world region (continent rollups + stateless). */
export const buildRegionSeries = (
  data: ResidentRecord[],
  filters: { nationality: string },
  range: ResidentRange
): GrowthSeries =>
  buildSeries(data, { nationality: filters.nationality }, range, NATIONALITY_REGIONS, (record) =>
    regionOf(record.nationality)
  );

/**
 * Re-bases each series to 100 at the first period where it has a value, so a
 * 52,000 → 681,000 series (Vietnam) and a 650,000 → 930,000 one (China) are
 * comparable as growth multiples rather than the smaller being squashed
 * against the axis.
 *
 * A period before the series starts stays undefined — a gap, not a zero — and
 * a series whose base is 0 or missing is left undefined throughout rather
 * than dividing by zero (a status introduced mid-window has no base to index
 * against until its first period).
 */
export const indexSeries = (
  rows: readonly Record<string, unknown>[],
  keys: readonly string[]
): Record<string, unknown>[] => {
  const base = new Map<string, number>();
  for (const key of keys) {
    for (const row of rows) {
      const value = row[key];
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        base.set(key, value);
        break;
      }
    }
  }

  return rows.map((row) => {
    const next: Record<string, unknown> = { ...row };
    for (const key of keys) {
      const value = row[key];
      const baseValue = base.get(key);
      next[key] =
        typeof value === 'number' && Number.isFinite(value) && baseValue !== undefined
          ? (value / baseValue) * 100
          : undefined;
    }
    return next;
  });
};
