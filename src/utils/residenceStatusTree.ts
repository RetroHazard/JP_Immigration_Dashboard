// src/utils/residenceStatusTree.ts
// Hierarchy for the Residence Status Mix view: all residents → status group
// (work, training, study, family, residency, other) → individual status.
// The direct analogue of categoryMixTree.ts, and deliberately the same
// MixTree/MixCategory/MixLeaf shape so the treemap and sunburst components
// render either without knowing which dataset they are looking at.
//
// Rollups are summed from the leaves rather than read from the payload: the
// build prunes 総数 and the three 合計 rows precisely because they are
// derivable, and the leaves that remain use the corrected parentage in
// constants/residenceStatuses.ts.
import { residenceStatuses, STATUS_GROUPS, type StatusGroup } from '../constants/residenceStatuses';
import type { MixCategory, MixTree } from './categoryMixTree';
import type { ResidentRecord } from './residentsData';
import { resolvePeriod, selectResidents } from './residentsSelectors';

/**
 * Hue per group, stable regardless of which groups have volume this period.
 * Exported so every residents view that colors by status group (treemap,
 * sunburst, growth stack, sankey) agrees on the hues.
 */
export const GROUP_COLOR: Record<StatusGroup, string> = {
  work: 'var(--chart-mix-1)',
  training: 'var(--chart-mix-2)',
  study: 'var(--chart-mix-3)',
  family: 'var(--chart-mix-4)',
  residency: 'var(--chart-mix-5)',
  other: 'var(--chart-mix-6)',
};

const groupOf = new Map(residenceStatuses.map((status) => [status.value, status.group]));

export const buildResidenceStatusTree = (
  data: ResidentRecord[],
  filters: { nationality: string; region: string },
  period: string | null
): MixTree => {
  // A stock figure, not a flow: summing several half-years would count the
  // same person once per period. The view therefore draws exactly one
  // snapshot — the explicitly requested period, or the latest one.
  const resolved = resolvePeriod(data, period);
  if (!resolved) return { total: 0, categories: [] };

  const rows = selectResidents(data, {
    period: resolved,
    nationality: filters.nationality,
    region: filters.region,
  });

  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.status, (totals.get(row.status) ?? 0) + row.value);
  }

  const categories: MixCategory[] = STATUS_GROUPS.map((group) => {
    const children = [...totals.entries()]
      .filter(([status]) => groupOf.get(status) === group)
      .map(([status, value]) => ({ code: status, value }))
      .filter((leaf) => leaf.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      key: group,
      color: GROUP_COLOR[group],
      value: children.reduce((sum, leaf) => sum + leaf.value, 0),
      children,
    };
  })
    .filter((category) => category.value > 0)
    .sort((a, b) => b.value - a.value);

  return { total: categories.reduce((sum, category) => sum + category.value, 0), categories };
};

/** The period the tree above actually describes, for the "as of" label. */
export const treePeriod = (data: ResidentRecord[], period: string | null): string | null =>
  resolvePeriod(data, period);
