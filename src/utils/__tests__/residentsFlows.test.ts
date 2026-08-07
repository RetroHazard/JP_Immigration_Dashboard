import { describe, expect, it } from 'vitest';

import type { ResidentRecord } from '../residentsData';
import { buildResidentFlows, FLOWS_OTHER } from '../residentsFlows';

const record = (period: string, status: string, nationality: string, value: number): ResidentRecord => ({
  period,
  status,
  nationality,
  value,
});

// Ten nationalities so the top-8 cut leaves an Other bucket. 1430 永住者
// (residency), 1380 留学 (study).
const CODES = ['1230', '1360', '1110', '1330', '1270', '1080', '5090', '1380', '1200', '1220'];
const LATEST: ResidentRecord[] = CODES.flatMap((code, index) => [
  record('2025-12', '1430', code, 1000 - index * 50),
  record('2025-12', '1380', code, 10),
]);

describe('buildResidentFlows', () => {
  it('reads a single snapshot — the most recent period in the range', () => {
    const older = [record('2025-06', '1430', '1230', 99999)];
    const flows = buildResidentFlows([...older, ...LATEST], { nationality: 'all' }, 'all');
    expect(flows.period).toBe('2025-12');
    // The 2025-06 row must not leak into any total.
    const total = flows.sources.reduce((sum, source) => sum + source.value, 0);
    expect(total).toBe(LATEST.reduce((sum, row) => sum + row.value, 0));
  });

  it('keeps the top 8 nationalities and folds the rest into Other, last', () => {
    const flows = buildResidentFlows(LATEST, { nationality: 'all' }, 'latest');
    expect(flows.sources).toHaveLength(9);
    expect(flows.sources.at(-1)?.code).toBe(FLOWS_OTHER);
    // Largest first among the named sources.
    expect(flows.sources[0].code).toBe('1230');
    // Other = the two smallest nationalities' rows.
    expect(flows.sources.at(-1)?.value).toBe(600 + 10 + 550 + 10);
  });

  it('emits groups in fixed order and one link per pair with volume', () => {
    const flows = buildResidentFlows(LATEST, { nationality: 'all' }, 'latest');
    expect(flows.groups.map((entry) => entry.group)).toEqual(['study', 'residency']);
    // 9 sources × 2 groups, every pair has volume here.
    expect(flows.links).toHaveLength(18);
    const linkSum = flows.links.reduce((sum, link) => sum + link.value, 0);
    const groupSum = flows.groups.reduce((sum, entry) => sum + entry.value, 0);
    expect(linkSum).toBe(groupSum);
  });

  it('collapses to a single country profile when a nationality is selected', () => {
    const flows = buildResidentFlows(LATEST, { nationality: '1360' }, 'latest');
    expect(flows.sources).toEqual([{ code: '1360', value: 960 }]);
    expect(flows.links).toEqual([
      { source: '1360', group: 'study', value: 10 },
      { source: '1360', group: 'residency', value: 950 },
    ]);
  });

  it('is empty rather than throwing when there is no data', () => {
    expect(buildResidentFlows([], { nationality: 'all' }, 'latest')).toEqual({
      period: null,
      sources: [],
      groups: [],
      links: [],
    });
  });
});
