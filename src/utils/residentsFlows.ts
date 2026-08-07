// src/utils/residentsFlows.ts
// Flow builder for the three-tier Origins sankey: world region → country →
// status category, in a single period. The nationality × status
// cross-tabulation is the one thing in this cube no other view shows; the
// region tier keys it to geography.
//
// A stock figure, so the snapshot picker chooses which period to draw —
// never a window to sum. Every surviving record feeds exactly one
// region→country link and one country→group link, so the three tiers and
// both link sets all conserve the same total, and no link ever skips a tier
// (which is what keeps d3-sankey's center alignment producing clean columns).
import { nationalityByCode, STATELESS } from '../constants/nationalities';
import { residenceStatusByCode, STATUS_GROUPS, type StatusGroup } from '../constants/residenceStatuses';
import type { ResidentRecord } from './residentsData';
import { resolvePeriod, selectResidents, topCodesBy } from './residentsSelectors';

/**
 * Country key for the everyone-else bucket. Not an e-Stat code (those are
 * all numeric), so it can never collide with a real nationality.
 */
export const FLOWS_OTHER = 'other';

/** Middle-column cap: 7 named countries + Other keeps the labels legible. */
const TOP_N = 7;

export interface ResidentFlows {
  /** The snapshot the flows describe, for the "as of" label. */
  period: string | null;
  /** Region codes largest first. */
  regions: { code: string; value: number }[];
  /** Country codes largest first, FLOWS_OTHER pinned last when present. */
  countries: { code: string; value: number }[];
  /** Status groups in STATUS_GROUPS order; only those with volume. */
  groups: { group: StatusGroup; value: number }[];
  regionCountryLinks: { region: string; country: string; value: number }[];
  countryGroupLinks: { country: string; group: StatusGroup; value: number }[];
}

const EMPTY: ResidentFlows = {
  period: null,
  regions: [],
  countries: [],
  groups: [],
  regionCountryLinks: [],
  countryGroupLinks: [],
};

export const buildResidentFlows = (
  data: ResidentRecord[],
  filters: { region: string; nationality: string; group: StatusGroup | 'all' },
  period: string | null
): ResidentFlows => {
  const resolved = resolvePeriod(data, period);
  if (!resolved) return EMPTY;

  // The group filter shrinks the left and middle tiers too — conservation
  // holds because filtering happens before any link is counted.
  const rows = selectResidents(data, {
    period: resolved,
    region: filters.region,
    nationality: filters.nationality,
    group: filters.group,
  });

  // No mergeContinuedSeries here: a single-period view never sees both halves
  // of the 2015 Korea split, so folding would only relabel real codes.
  // With a single nationality selected the chart reads as that country's
  // profile; the top-N + Other split only applies to the wider views.
  const top = filters.nationality === 'all' ? new Set(topCodesBy(rows, 'nationality', TOP_N)) : null;

  const regionTotals = new Map<string, number>();
  const countryTotals = new Map<string, number>();
  const groupTotals = new Map<StatusGroup, number>();
  const rcLinks = new Map<string, number>();
  const cgLinks = new Map<string, number>();

  for (const record of rows) {
    const region = nationalityByCode(record.nationality)?.region ?? STATELESS;
    const country = top === null || top.has(record.nationality) ? record.nationality : FLOWS_OTHER;
    const group = residenceStatusByCode(record.status)?.group ?? 'other';

    regionTotals.set(region, (regionTotals.get(region) ?? 0) + record.value);
    countryTotals.set(country, (countryTotals.get(country) ?? 0) + record.value);
    groupTotals.set(group, (groupTotals.get(group) ?? 0) + record.value);
    // The Other bucket keeps one incoming link per contributing region, so
    // every path is strictly region → country → group.
    rcLinks.set(`${region}:${country}`, (rcLinks.get(`${region}:${country}`) ?? 0) + record.value);
    cgLinks.set(`${country}:${group}`, (cgLinks.get(`${country}:${group}`) ?? 0) + record.value);
  }

  const regions = [...regionTotals.entries()]
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([code, value]) => ({ code, value }));

  const countries = [...countryTotals.entries()]
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

  const regionCountryLinks = [...rcLinks.entries()]
    .filter(([, value]) => value > 0)
    .map(([key, value]) => {
      const [region, country] = key.split(':');
      return { region, country, value };
    });

  const countryGroupLinks = [...cgLinks.entries()]
    .filter(([, value]) => value > 0)
    .map(([key, value]) => {
      const [country, group] = key.split(':');
      return { country, group: group as StatusGroup, value };
    });

  return { period: resolved, regions, countries, groups, regionCountryLinks, countryGroupLinks };
};
