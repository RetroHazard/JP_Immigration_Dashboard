// src/utils/residentUrlParams.ts
// Pure parse functions for the residents URL params. Kept out of
// DashboardShell so they are unit-testable without nuqs; the shell wraps
// them with nuqs `createParser`.
import { residenceStatusByCode, STATUS_GROUPS, type StatusGroup } from '../constants/residenceStatuses';

const GROUPS = new Set<string>(STATUS_GROUPS);

/**
 * `?status` now carries a status *category* (work, training, …). Links
 * written before the filter was simplified carry an e-Stat status code
 * instead — those resolve to the code's category rather than breaking, so
 * `?status=1430` still lands on Residency. Anything else is treated as
 * absent (null → nuqs default 'all').
 */
export const parseStatusParam = (value: string): 'all' | StatusGroup | null => {
  if (value === 'all') return 'all';
  if (GROUPS.has(value)) return value as StatusGroup;
  return residenceStatusByCode(value)?.group ?? null;
};

/**
 * `?period` names the snapshot a stock chart draws, e.g. '2019-06'. Only the
 * shape is validated here — whether the period exists in the loaded data is
 * `resolvePeriod`'s job, since the data arrives asynchronously.
 */
export const parsePeriodParam = (value: string): string | null =>
  /^\d{4}-(06|12)$/.test(value) ? value : null;
