// src/utils/residentsSelectors.ts
// Selection API for the Foreign Residents cube, mirroring selectors.ts for the
// processing cube. Kept separate rather than generalised: the two cubes share
// no dimension, and a union-typed selector would have to be re-narrowed at
// every call site anyway.
import { useMemo } from 'react';

import { NATIONALITY_SERIES_KEY,nationalityByCode } from '../constants/nationalities';
import { residenceStatusByCode, type StatusGroup } from '../constants/residenceStatuses';
import type { ResidentRecord } from './residentsData';

/**
 * Half-year windows. The processing charts count months, but this table
 * publishes twice a year, so `'12'` would read as "12 months" and mean six
 * years. The ranges are named in years to remove the ambiguity.
 */
export type ResidentRange = 'latest' | '3y' | '5y' | '10y' | 'all';

/** Periods per window; the table publishes two per year. */
const PERIODS_IN_RANGE: Record<Exclude<ResidentRange, 'all'>, number> = {
  latest: 1,
  '3y': 6,
  '5y': 10,
  '10y': 20,
};

export const getAllPeriods = (data: ResidentRecord[]): string[] => {
  if (!data || data.length === 0) return [];
  return [...new Set(data.map((record) => record.period))].sort();
};

export const getLatestPeriod = (data: ResidentRecord[]): string | null =>
  getAllPeriods(data).at(-1) ?? null;

export const periodsForRange = (allPeriods: string[], range: ResidentRange): string[] =>
  range === 'all' ? allPeriods : allPeriods.slice(-PERIODS_IN_RANGE[range]);

export interface ResidentSelection {
  /** cat02 code; 'all' or undefined = every nationality */
  nationality?: string;
  /** cat01 code; 'all' or undefined = every status */
  status?: string;
  /** Single period, e.g. '2025-12' */
  period?: string;
  /** Restrict to a window (from `periodsForRange`) */
  periods?: readonly string[];
  /** Continent code from NATIONALITY_REGIONS */
  region?: string;
  /** Coarse status family */
  group?: StatusGroup;
}

export const selectResidents = (
  data: ResidentRecord[],
  selection: ResidentSelection = {}
): ResidentRecord[] => {
  if (!data || data.length === 0) return [];
  const { nationality, status, period, periods, region, group } = selection;
  const windowed = periods ? new Set(periods) : null;

  return data.filter((record) => {
    if (period !== undefined && record.period !== period) return false;
    if (windowed && !windowed.has(record.period)) return false;
    if (nationality !== undefined && nationality !== 'all' && record.nationality !== nationality) return false;
    if (status !== undefined && status !== 'all' && record.status !== status) return false;
    if (region !== undefined && nationalityByCode(record.nationality)?.region !== region) return false;
    if (group !== undefined && residenceStatusByCode(record.status)?.group !== group) return false;
    return true;
  });
};

/** Memoized selectResidents, keyed on the selection's VALUES (see useSelectedData). */
export const useSelectedResidents = (
  data: ResidentRecord[],
  selection: ResidentSelection = {}
): ResidentRecord[] => {
  const { nationality, status, period, periods, region, group } = selection;
  const periodsKey = periods ? periods.join(',') : '';
  return useMemo(
    () => selectResidents(data, { nationality, status, period, periods, region, group }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, nationality, status, period, periodsKey, region, group]
  );
};

/**
 * Every shipped row is a leaf of both hierarchies (the build prunes the
 * rollups and the nested 「うち」 rows), so summing a selection is always
 * safe — no row is contained in another.
 */
export const sumResidents = (rows: ResidentRecord[]): number =>
  rows.reduce((total, record) => total + record.value, 0);

/** `code -> total` over the given rows, descending. */
export const totalsBy = (
  rows: ResidentRecord[],
  key: 'nationality' | 'status' | 'period'
): Map<string, number> => {
  const totals = new Map<string, number>();
  for (const record of rows) {
    totals.set(record[key], (totals.get(record[key]) ?? 0) + record.value);
  }
  return new Map([...totals.entries()].sort((a, b) => b[1] - a[1]));
};

/**
 * Folds a series that changed identity mid-history back onto the code it ran
 * under before — see NATIONALITY_SERIES_KEY. Only worth doing for views that
 * span the change; a single-period view never sees both halves.
 */
export const mergeContinuedSeries = (rows: ResidentRecord[]): ResidentRecord[] =>
  rows.map((row) => {
    const merged = NATIONALITY_SERIES_KEY[row.nationality];
    return merged ? { ...row, nationality: merged } : row;
  });

/**
 * The N codes with the largest total over the window, which is what keeps a
 * 200-country series list plottable. Ranked on the whole window rather than
 * the latest period so a series does not appear and disappear as the range
 * changes.
 */
export const topCodesBy = (
  rows: ResidentRecord[],
  key: 'nationality' | 'status',
  limit: number
): string[] => [...totalsBy(rows, key).keys()].slice(0, limit);
