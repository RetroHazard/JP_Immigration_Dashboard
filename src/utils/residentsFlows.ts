// src/utils/residentsFlows.ts
// Flow builder for the Origins → Status Groups sankey: how many residents of
// each (top) nationality hold each family of residence status, in a single
// period. The nationality × status cross-tabulation is the one thing in this
// cube no other view shows.
//
// A stock figure, so the range picker chooses which snapshot to show rather
// than a window to sum — same contract as buildResidenceStatusTree.
import { residenceStatusByCode, STATUS_GROUPS, type StatusGroup } from '../constants/residenceStatuses';
import type { ResidentRecord } from './residentsData';
import type { ResidentRange } from './residentsSelectors';
import { getAllPeriods, periodsForRange, selectResidents, topCodesBy } from './residentsSelectors';

/**
 * Source key for the everyone-else bucket. Not an e-Stat code (those are all
 * numeric), so it can never collide with a real nationality.
 */
export const FLOWS_OTHER = 'other';

/** Enough sources to show the shape of the population without spaghetti. */
const TOP_N = 8;

export interface ResidentFlows {
  /** The snapshot the flows describe, for the "as of" label. */
  period: string | null;
  /** Nationality codes largest first, then FLOWS_OTHER when it has volume. */
  sources: { code: string; value: number }[];
  /** Status groups in STATUS_GROUPS order; only those with volume. */
  groups: { group: StatusGroup; value: number }[];
  /** One link per (source, group) pair with volume. */
  links: { source: string; group: StatusGroup; value: number }[];
}

export const buildResidentFlows = (
  data: ResidentRecord[],
  filters: { nationality: string },
  range: ResidentRange
): ResidentFlows => {
  const period = periodsForRange(getAllPeriods(data), range).at(-1) ?? null;
  if (!period) return { period, sources: [], groups: [], links: [] };

  // No mergeContinuedSeries here: a single-period view never sees both halves
  // of the 2015 Korea split, so folding would only relabel real codes.
  const rows = selectResidents(data, { period, nationality: filters.nationality });

  // With a single nationality selected the chart reads as that country's
  // status profile; the top-N + Other split only applies to the full set.
  const top =
    filters.nationality === 'all' ? new Set(topCodesBy(rows, 'nationality', TOP_N)) : null;

  const linkTotals = new Map<string, number>();
  const sourceTotals = new Map<string, number>();
  const groupTotals = new Map<StatusGroup, number>();
  for (const record of rows) {
    const source = top === null || top.has(record.nationality) ? record.nationality : FLOWS_OTHER;
    const group = residenceStatusByCode(record.status)?.group ?? 'other';
    linkTotals.set(`${source}:${group}`, (linkTotals.get(`${source}:${group}`) ?? 0) + record.value);
    sourceTotals.set(source, (sourceTotals.get(source) ?? 0) + record.value);
    groupTotals.set(group, (groupTotals.get(group) ?? 0) + record.value);
  }

  // Largest nationality first, the Other bucket always last regardless of
  // its size so the named countries stay adjacent.
  const sources = [...sourceTotals.entries()]
    .filter(([, value]) => value > 0)
    .sort(([codeA, valueA], [codeB, valueB]) => {
      if (codeA === FLOWS_OTHER) return 1;
      if (codeB === FLOWS_OTHER) return -1;
      return valueB - valueA;
    })
    .map(([code, value]) => ({ code, value }));

  const groups = STATUS_GROUPS.filter((group) => (groupTotals.get(group) ?? 0) > 0).map((group) => ({
    group,
    value: groupTotals.get(group) ?? 0,
  }));

  const links = sources.flatMap(({ code }) =>
    groups
      .map(({ group }) => ({ source: code, group, value: linkTotals.get(`${code}:${group}`) ?? 0 }))
      .filter((link) => link.value > 0)
  );

  return { period, sources, groups, links };
};
