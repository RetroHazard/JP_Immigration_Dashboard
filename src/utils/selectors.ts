// src/utils/selectors.ts
// Single, explicit data-selection API. Replaces the old convention where
// `bureau: 'all'` meant "include every bureau row" in App.tsx but "only the
// nationwide aggregate row" in useFilteredData — two silently conflicting
// semantics that charts papered over by re-filtering.
import { useMemo } from 'react';

import { STATUS_CODES } from '../constants/statusCodes';
import type { ImmigrationData } from '../hooks/useImmigrationData';

/**
 * What a consumer means by "which bureau(s)":
 * - nationwide:  only the official nationwide aggregate row (code 100000)
 * - bureau:      one specific bureau
 * - eachBureau:  every per-bureau row, aggregate row excluded (for breakdowns)
 */
export type BureauScope = { kind: 'nationwide' } | { kind: 'bureau'; code: string } | { kind: 'eachBureau' };

/** UI filter value -> scope for charts that show ONE series/total. */
export const bureauScopeFromFilter = (bureauFilter: string): BureauScope =>
  bureauFilter === 'all' ? { kind: 'nationwide' } : { kind: 'bureau', code: bureauFilter };

/** UI filter value -> scope for charts that break down BY bureau. */
export const breakdownScopeFromFilter = (bureauFilter: string): BureauScope =>
  bureauFilter === 'all' ? { kind: 'eachBureau' } : { kind: 'bureau', code: bureauFilter };

export const matchesBureauScope = (entry: ImmigrationData, scope: BureauScope): boolean => {
  switch (scope.kind) {
    case 'nationwide':
      return entry.bureau === STATUS_CODES.NATIONWIDE_BUREAU;
    case 'bureau':
      return entry.bureau === scope.code;
    case 'eachBureau':
      return entry.bureau !== STATUS_CODES.NATIONWIDE_BUREAU;
  }
};

export interface DataSelection {
  scope?: BureauScope;
  /** Application type code; 'all' or undefined = every type */
  type?: string;
  month?: string;
  status?: string;
}

export const selectData = (data: ImmigrationData[], selection: DataSelection = {}): ImmigrationData[] => {
  if (!data || data.length === 0) return [];
  const { scope, type, month, status } = selection;

  return data.filter((entry) => {
    if (month !== undefined && entry.month !== month) return false;
    if (scope !== undefined && !matchesBureauScope(entry, scope)) return false;
    if (type !== undefined && type !== 'all' && entry.type !== type) return false;
    if (status !== undefined && entry.status !== status) return false;
    return true;
  });
};

/** Memoized selectData keyed on the selection's VALUES (an inline options
 *  object no longer defeats the memo, unlike the old useFilteredData). */
export const useSelectedData = (data: ImmigrationData[], selection: DataSelection = {}): ImmigrationData[] => {
  const { scope, type, month, status } = selection;
  const scopeKey = scope === undefined ? '' : scope.kind === 'bureau' ? `bureau:${scope.code}` : scope.kind;
  return useMemo(
    () => selectData(data, { scope, type, month, status }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, scopeKey, type, month, status]
  );
};

export const getLatestMonth = (data: ImmigrationData[]): string | null => {
  if (!data || data.length === 0) return null;
  const months = [...new Set(data.map((entry) => entry.month))].sort();
  return months[months.length - 1] || null;
};

export const getAllMonths = (data: ImmigrationData[]): string[] => {
  if (!data || data.length === 0) return [];
  return [...new Set(data.map((entry) => entry.month))].sort();
};
