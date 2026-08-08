import { describe, expect, it } from 'vitest';

import type { ResidentRecord } from '../residentsData';
import { buildResidentFlows, FLOWS_OTHER, type ResidentFlows } from '../residentsFlows';

const record = (period: string, status: string, nationality: string, value: number): ResidentRecord => ({
  period,
  status,
  nationality,
  value,
});

const ALL = { region: 'all', nationality: 'all', group: 'all' } as const;

// Nine Asian nationalities plus Brazil (South America) ranked 9th, so the
// top-7 cut leaves an Other bucket fed by two regions. 1430 永住者
// (residency), 1380 留学 (study).
const CODES = ['1230', '1360', '1110', '1330', '1270', '1080', '1200', '1380', '5090', '1220'];
const LATEST: ResidentRecord[] = CODES.flatMap((code, index) => [
  record('2025-12', '1430', code, 1000 - index * 50),
  record('2025-12', '1380', code, 10),
]);

const sum = (entries: { value: number }[]) => entries.reduce((total, entry) => total + entry.value, 0);

const assertConservation = (flows: ResidentFlows) => {
  const total = sum(flows.regions);
  expect(sum(flows.countries)).toBe(total);
  expect(sum(flows.groups)).toBe(total);
  expect(sum(flows.regionCountryLinks)).toBe(total);
  expect(sum(flows.countryGroupLinks)).toBe(total);
};

describe('buildResidentFlows', () => {
  it('reads a single snapshot — an explicit period, or the latest', () => {
    const older = [record('2025-06', '1430', '1230', 99999)];
    const flows = buildResidentFlows([...older, ...LATEST], ALL, null);
    expect(flows.period).toBe('2025-12');
    expect(sum(flows.regions)).toBe(LATEST.reduce((total, row) => total + row.value, 0));

    const past = buildResidentFlows([...older, ...LATEST], ALL, '2025-06');
    expect(past.period).toBe('2025-06');
    expect(sum(past.regions)).toBe(99999);

    // An out-of-coverage period degrades to latest rather than an empty chart.
    expect(buildResidentFlows(LATEST, ALL, '1999-06').period).toBe('2025-12');
  });

  it('conserves the total across all three tiers and both link sets', () => {
    assertConservation(buildResidentFlows(LATEST, ALL, null));
  });

  it('keeps the top 7 countries, pinning Other last with one link per contributing region', () => {
    const flows = buildResidentFlows(LATEST, ALL, null);
    expect(flows.countries).toHaveLength(8);
    expect(flows.countries.at(-1)?.code).toBe(FLOWS_OTHER);
    expect(flows.countries[0].code).toBe('1230');
    // Other holds Brazil (5090, South America) plus two Asian codes — so it
    // receives exactly two incoming region links.
    const otherLinks = flows.regionCountryLinks.filter((link) => link.country === FLOWS_OTHER);
    expect(otherLinks.map((link) => link.region).sort()).toEqual(['1000', '5000']);
  });

  it('never emits a link that skips a tier', () => {
    const flows = buildResidentFlows(LATEST, ALL, null);
    const countryCodes = new Set(flows.countries.map((entry) => entry.code));
    // Every region link lands on a middle node, every group link leaves one.
    expect(flows.regionCountryLinks.every((link) => countryCodes.has(link.country))).toBe(true);
    expect(flows.countryGroupLinks.every((link) => countryCodes.has(link.country))).toBe(true);
    // And every middle node has both inflow and outflow.
    for (const code of countryCodes) {
      expect(flows.regionCountryLinks.some((link) => link.country === code)).toBe(true);
      expect(flows.countryGroupLinks.some((link) => link.country === code)).toBe(true);
    }
  });

  it('collapses to one region when the region filter is set', () => {
    const flows = buildResidentFlows(LATEST, { ...ALL, region: '5000' }, null);
    // Brazil is index 8: 1430 row 600 + 1380 row 10.
    expect(flows.regions).toEqual([{ code: '5000', value: 610 }]);
    expect(flows.countries.map((entry) => entry.code)).toEqual(['5090']);
    assertConservation(flows);
  });

  it('collapses to a single country profile when a nationality is selected', () => {
    const flows = buildResidentFlows(LATEST, { ...ALL, nationality: '1360' }, null);
    expect(flows.regions).toEqual([{ code: '1000', value: 960 }]);
    expect(flows.countries).toEqual([{ code: '1360', value: 960 }]);
    expect(flows.countryGroupLinks).toEqual([
      { country: '1360', group: 'residency', value: 950 },
      { country: '1360', group: 'study', value: 10 },
    ]);
  });

  it('shrinks every tier when a status category is selected', () => {
    const flows = buildResidentFlows(LATEST, { ...ALL, group: 'study' }, null);
    expect(flows.groups).toEqual([{ group: 'study', value: 100 }]);
    expect(sum(flows.regions)).toBe(100);
    assertConservation(flows);
  });

  it('emits groups in fixed STATUS_GROUPS order', () => {
    const flows = buildResidentFlows(LATEST, ALL, null);
    expect(flows.groups.map((entry) => entry.group)).toEqual(['study', 'residency']);
  });

  it('is empty rather than throwing when there is no data', () => {
    expect(buildResidentFlows([], ALL, null)).toEqual({
      period: null,
      regions: [],
      countries: [],
      groups: [],
      regionCountryLinks: [],
      countryGroupLinks: [],
    });
  });
});
