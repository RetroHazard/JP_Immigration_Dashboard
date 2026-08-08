import { describe, expect, it } from 'vitest';

import { nationalities,NATIONALITY_SUBSET_CODES } from '../../constants/nationalities';
import { residenceStatuses,STATUS_AGGREGATE_CODES } from '../../constants/residenceStatuses';
import { packResidentsData, type ResidentRecord,unpackResidentsData } from '../residentsData';
import {
  parseResidentPeriod,
  type RawResidentEntry,
  type RawResidentsData,
  transformResidentsData,
  verifyResidentTotals,
} from '../residentsTransform';

const row = (cat01: string, cat02: string, time: string, value: string): RawResidentEntry => ({
  '@tab': '01',
  '@cat01': cat01,
  '@cat02': cat02,
  '@time': time,
  '@unit': '人',
  $: value,
});

const payload = (values: RawResidentEntry[]): RawResidentsData => ({
  GET_STATS_DATA: { STATISTICAL_DATA: { DATA_INF: { VALUE: values } } },
});

const DEC = '2025001212';
const JUN = '2025000606';

describe('parseResidentPeriod', () => {
  it('reads e-Stat half-year time codes', () => {
    expect(parseResidentPeriod(DEC)).toBe('2025-12');
    expect(parseResidentPeriod(JUN)).toBe('2025-06');
  });

  it('rejects a month that is not a half-year boundary', () => {
    // The table publishes 半期. A month other than 06/12 means e-Stat changed
    // the cadence, which every "vs previous half" label downstream assumes.
    expect(() => parseResidentPeriod('2025000303')).toThrow(/expected -06 or -12/);
  });

  it('rejects a malformed time code rather than guessing', () => {
    expect(() => parseResidentPeriod('2025')).toThrow();
    expect(() => parseResidentPeriod('20xx001212')).toThrow();
  });
});

describe('transformResidentsData', () => {
  it('keeps the leaves of both hierarchies', () => {
    const records = transformResidentsData(payload([row('1430', '1230', DEC, '900000')]));
    expect(records).toEqual([{ period: '2025-12', status: '1430', nationality: '1230', value: 900000 }]);
  });

  it('drops every rollup status, including the three 合計 rows', () => {
    const values = [...STATUS_AGGREGATE_CODES].map((code) => row(code, '1230', DEC, '100'));
    expect(STATUS_AGGREGATE_CODES).toContain('1290'); // 技能実習合計
    expect(transformResidentsData(payload(values))).toEqual([]);
  });

  it('drops the 総数 and continent-rollup nationalities', () => {
    const values = ['0000', '1000', '2000', '3000', '4000', '5000', '6000'].map((code) =>
      row('1430', code, DEC, '100')
    );
    expect(transformResidentsData(payload(values))).toEqual([]);
  });

  it('keeps 無国籍, which is published at region level but has no members', () => {
    const records = transformResidentsData(payload([row('1430', '7000', DEC, '640')]));
    expect(records).toHaveLength(1);
    expect(records[0].nationality).toBe('7000');
  });

  it('drops the nested 「うち」 rows that would double-count', () => {
    expect([...NATIONALITY_SUBSET_CODES].sort()).toEqual(['1240', '1250', '2110']);
    const values = [...NATIONALITY_SUBSET_CODES].map((code) => row('1430', code, DEC, '100'));
    expect(transformResidentsData(payload(values))).toEqual([]);
  });

  it('keeps 韓国・朝鮮, which is a split series rather than a subset', () => {
    // It runs to 2015-06 and 韓国/朝鮮 take over from 2015-12, so the periods
    // never overlap — pruning it would erase Korea from the early history.
    const records = transformResidentsData(payload([row('1430', '1130', '2015000606', '497707')]));
    expect(records).toHaveLength(1);
  });

  it('drops zero rows and unparseable values', () => {
    const values = [row('1430', '1230', DEC, '0'), row('1430', '1360', DEC, '-'), row('1430', '1330', DEC, '5')];
    expect(transformResidentsData(payload(values))).toHaveLength(1);
  });

  it('accepts a single VALUE object as well as an array', () => {
    const single = {
      GET_STATS_DATA: { STATISTICAL_DATA: { DATA_INF: { VALUE: row('1430', '1230', DEC, '7') } } },
    } as RawResidentsData;
    expect(transformResidentsData(single)).toHaveLength(1);
  });

  it('returns nothing for an empty or error payload', () => {
    expect(transformResidentsData({})).toEqual([]);
    expect(transformResidentsData(payload([]))).toEqual([]);
  });
});

describe('verifyResidentTotals', () => {
  // Two nationalities x two statuses, with e-Stat's own rollups alongside.
  const leaves = [
    row('1430', '1230', DEC, '100'),
    row('1430', '1360', DEC, '30'),
    row('1380', '1230', DEC, '20'),
    row('1380', '1360', DEC, '5'),
  ];
  const rollups = [
    row('1010', '0000', DEC, '155'), // grand total
    row('1010', '1230', DEC, '120'), // per-nationality status total
    row('1010', '1360', DEC, '35'),
    row('1430', '0000', DEC, '130'), // per-status nationality total
    row('1380', '0000', DEC, '25'),
  ];

  it('is silent when the kept leaves reconcile on both axes', () => {
    const raw = payload([...leaves, ...rollups]);
    expect(verifyResidentTotals(raw, transformResidentsData(raw))).toEqual([]);
  });

  it('names the status a nationality-sum mismatch belongs to', () => {
    const raw = payload([...leaves, ...rollups.filter((r) => r['@cat01'] !== '1430'), row('1430', '0000', DEC, '999')]);
    const mismatches = verifyResidentTotals(raw, transformResidentsData(raw));
    expect(mismatches).toEqual([
      {
        period: '2025-12',
        keyDimension: 'status',
        code: '1430',
        summedOver: 'nationality',
        published: 999,
        fromLeaves: 130,
      },
    ]);
  });

  it('names the NATIONALITY a status-sum mismatch belongs to', () => {
    // Simulates a status wrongly classified as a rollup: its leaves never
    // ship, so every nationality column comes up short.
    //
    // keyDimension is the point of this case. The codes overlap numerically
    // between the two tables — 1010 is 総数 as a status and アフガニスタン as a
    // nationality — so a mismatch reported without it sends the reader to the
    // wrong constants file, which is exactly what happened when a truncated
    // payload first tripped this check.
    const raw = payload([...leaves.filter((r) => r['@cat01'] !== '1380'), ...rollups]);
    const mismatches = verifyResidentTotals(raw, transformResidentsData(raw));
    const byNationality = mismatches.filter((m) => m.keyDimension === 'nationality');
    expect(byNationality).toHaveLength(2);
    expect(byNationality.map((m) => m.code).sort()).toEqual(['1230', '1360']);
    expect(byNationality.every((m) => m.summedOver === 'status')).toBe(true);
    expect(mismatches.every((m) => m.fromLeaves < m.published)).toBe(true);
  });
});

describe('packResidentsData', () => {
  const records: ResidentRecord[] = [
    { period: '2025-12', status: '1430', nationality: '1230', value: 900000 },
    { period: '2025-06', status: '1380', nationality: '1360', value: 12 },
    { period: '2025-12', status: '1380', nationality: '1230', value: 3 },
  ];
  const meta = { schema: 1, kind: 'residents', surveyDate: 202512, source: 'e-stat' } as const;

  it('round-trips every record unchanged', () => {
    expect(unpackResidentsData(packResidentsData(records, meta))).toEqual(records);
  });

  it('stores each distinct label once', () => {
    const file = packResidentsData(records, meta);
    expect(file.periods).toEqual(['2025-06', '2025-12']);
    expect(file.statuses).toEqual(['1380', '1430']);
    expect(file.values).toHaveLength(records.length * 4);
  });

  it('carries the kind discriminant that keeps the two data files apart', () => {
    expect(packResidentsData(records, meta).meta.kind).toBe('residents');
  });
});

describe('domain constants', () => {
  it('parents the 技能実習 sub-statuses to 技能実習合計, not 特定技能合計', () => {
    // e-Stat publishes these with @parentCode 1260. Taking it at face value
    // roughly triples Specified Skilled Worker and empties Technical Intern
    // Training — the regression this table exists to prevent.
    for (const code of ['1300', '1310', '1320', '1330', '1340', '1350']) {
      expect(residenceStatuses.find((status) => status.value === code)?.parent).toBe('1290');
    }
  });

  it('parents the five status-based residences to 総数, which the payload omits', () => {
    for (const code of ['1430', '1440', '1450', '1460', '1470']) {
      expect(residenceStatuses.find((status) => status.value === code)?.parent).toBe('1010');
    }
  });

  it('gives every status a group and every non-total status a parent', () => {
    for (const status of residenceStatuses) {
      expect(status.group).toBeTruthy();
      if (status.value !== '1010') expect(status.parent).toBeTruthy();
    }
  });

  it('resolves every ISO code it declares through Intl.DisplayNames', () => {
    const display = new Intl.DisplayNames(['en'], { type: 'region' });
    const unresolved = nationalities
      .filter((nationality) => nationality.iso2 !== null)
      .filter((nationality) => display.of(nationality.iso2!) === nationality.iso2);
    expect(unresolved).toEqual([]);
  });

  it('assigns no ISO code twice', () => {
    const codes = nationalities.map((n) => n.iso2).filter(Boolean);
    expect(codes).toHaveLength(new Set(codes).size);
    const numeric = nationalities.map((n) => n.iso3n).filter((n) => n !== null);
    expect(numeric).toHaveLength(new Set(numeric).size);
  });

  it('groups every nationality into a region that exists', () => {
    const regions = new Set(['1000', '2000', '3000', '4000', '5000', '6000', '7000']);
    expect(nationalities.filter((n) => !regions.has(n.region))).toEqual([]);
  });
});
