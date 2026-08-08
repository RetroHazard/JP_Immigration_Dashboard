// scripts/generateResidentsFixture.mts
// Deterministic e-Stat-shaped fixture for the Foreign Residents table
// (0004019020), so local dev and forked CI can build without ESTAT_APP_ID.
//
// Unlike scripts/generate-fixture.mjs — which inlines its bureau codes — this
// one imports the real code lists from src/constants. There are 245 of them
// across the two axes, and a fixture that drifted from the constants would
// exercise a hierarchy the transform never actually sees.
//
// It mirrors e-Stat's semantics rather than only the leaves it ships: the
// rollup rows (総数 and the three 合計) and the nested 「うち」 rows are all
// emitted and are exactly consistent with the leaves, which is what lets
// verifyResidentTotals do real work against the fixture.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { nationalities, NATIONALITY_ROLLUP_REGIONS, NATIONALITY_TOTAL } from '../src/constants/nationalities';
import { residenceStatuses, STATUS_TOTAL } from '../src/constants/residenceStatuses';

/** Deterministic LCG, so the fixture never churns in git. */
let seed = 20260806;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

/** 2012-12 through 2025-12, the span the real table covers. */
const PERIODS: { year: number; month: 6 | 12 }[] = [];
for (let year = 2012; year <= 2025; year++) {
  if (year > 2012) PERIODS.push({ year, month: 6 });
  PERIODS.push({ year, month: 12 });
}
const timeCode = ({ year, month }: { year: number; month: 6 | 12 }) =>
  `${year}00${String(month).padStart(2, '0')}${String(month).padStart(2, '0')}`;
const periodIndex = (period: { year: number; month: 6 | 12 }) =>
  PERIODS.findIndex((p) => p.year === period.year && p.month === period.month);

/** Relative size per nationality; everything unlisted gets the long-tail default. */
const NATIONALITY_SCALE: Record<string, number> = {
  '1230': 900, // 中国
  '1360': 620, // ベトナム
  '1110': 400, // 韓国
  '1130': 430, // 韓国・朝鮮 (the pre-2015 combined series)
  '1330': 320, // フィリピン
  '5090': 210, // ブラジル
  '1270': 180, // ネパール
  '1080': 150, // インドネシア
  '1380': 120, // ミャンマー
  '1220': 60, // 台湾
  '4200': 60, // 米国
  '1210': 55, // タイ
  '1310': 25, // バングラデシュ
  '1070': 45, // インド
};

/** Relative size per residence status. */
const STATUS_SCALE: Record<string, number> = {
  '1430': 900, // 永住者
  '1210': 620, // 技術・人文知識・国際業務
  '1380': 350, // 留学
  '1470': 290, // 特別永住者
  '1460': 210, // 定住者
  '1410': 260, // 家族滞在
  '1440': 140, // 日本人の配偶者等
  '1420': 130, // 特定活動
  '1270': 200, // 特定技能1号
  '1280': 12, // 特定技能2号
  '1190': 180, // 技術 (pre-2015)
  '1200': 240, // 人文知識・国際業務 (pre-2015)
  '1140': 60, // 経営・管理
  '1130': 55, // 投資・経営 (pre-2015)
  '1250': 45, // 技能
  '1450': 50, // 永住者の配偶者等
};

/**
 * When a status or nationality series runs, as [firstPeriod, lastPeriod]
 * indices into PERIODS. This is what gives the fixture the same
 * discontinuities the real table has, so charts get exercised against them.
 */
const SPLIT_2015 = periodIndex({ year: 2015, month: 12 });
const RANGES: Record<string, [number, number]> = {
  // Merged into 技術・人文知識・国際業務 / renamed 経営・管理 in 2015.
  '1130': [0, SPLIT_2015 - 1],
  '1190': [0, SPLIT_2015 - 1],
  '1200': [0, SPLIT_2015 - 1],
  '1140': [SPLIT_2015, PERIODS.length - 1],
  '1210': [SPLIT_2015, PERIODS.length - 1],
  // 介護 (2017), 特定技能 (2019), 高度専門職 (2015-ish).
  '1230': [periodIndex({ year: 2017, month: 6 }), PERIODS.length - 1],
  '1270': [periodIndex({ year: 2019, month: 6 }), PERIODS.length - 1],
  '1280': [periodIndex({ year: 2021, month: 12 }), PERIODS.length - 1],
};
const NATIONALITY_RANGES: Record<string, [number, number]> = {
  // 韓国・朝鮮 ran until 2015-06; 韓国 and 朝鮮 take over from 2015-12.
  '1130': [0, SPLIT_2015 - 1],
  '1110': [SPLIT_2015, PERIODS.length - 1],
  '1120': [SPLIT_2015, PERIODS.length - 1],
  // The 「うち」 breakouts only start being published in 2023-12.
  '1240': [periodIndex({ year: 2023, month: 12 }), PERIODS.length - 1],
  '1250': [periodIndex({ year: 2023, month: 12 }), PERIODS.length - 1],
  '2110': [periodIndex({ year: 2023, month: 12 }), PERIODS.length - 1],
  '2500': [0, 0], // ユーゴスラヴィア: a single residual period
};

const inRange = (ranges: Record<string, [number, number]>, code: string, index: number) => {
  const range = ranges[code];
  return !range || (index >= range[0] && index <= range[1]);
};

const leafStatuses = residenceStatuses.filter((status) => !status.isAggregate);
const leafNationalities = nationalities.filter((nationality) => !nationality.isSubset);
const subsetNationalities = nationalities.filter((nationality) => nationality.isSubset);
/** Which parent each 「うち」 row is carved out of. */
const SUBSET_PARENT: Record<string, string> = { '1240': '1230', '1250': '1230', '2110': '2100' };

interface RawRow {
  '@tab': string;
  '@cat01': string;
  '@cat02': string;
  '@time': string;
  '@unit': string;
  $: string;
}

export const buildResidentsFixture = () => {
  const VALUE: RawRow[] = [];
  const push = (time: string, status: string, nationality: string, value: number) =>
    VALUE.push({
      '@tab': '01',
      '@cat01': status,
      '@cat02': nationality,
      '@time': time,
      '@unit': '人',
      $: String(Math.max(0, Math.round(value))),
    });

  for (const [index, period] of PERIODS.entries()) {
    const time = timeCode(period);
    // Steady growth across the span, so trend charts have something to show.
    const growth = 1 + index * 0.045;

    // --- leaves ---------------------------------------------------------
    const leaves = new Map<string, number>();
    for (const status of leafStatuses) {
      if (!inRange(RANGES, status.value, index)) continue;
      const statusScale = STATUS_SCALE[status.value] ?? 8;
      for (const nationality of leafNationalities) {
        if (!inRange(NATIONALITY_RANGES, nationality.value, index)) continue;
        const nationalityScale = NATIONALITY_SCALE[nationality.value] ?? 1;
        const magnitude = statusScale * nationalityScale * growth * (0.6 + 0.8 * rand());
        // The long tail really is mostly empty: e-Stat publishes a row for
        // every pair, and roughly 60% of them are zero.
        const value = magnitude < 400 && rand() < 0.72 ? 0 : magnitude / 90;
        leaves.set(`${status.value}|${nationality.value}`, Math.round(value));
      }
    }

    const leafValue = (status: string, nationality: string) => leaves.get(`${status}|${nationality}`) ?? 0;
    const emitted = (status: string, nationality: string) => leaves.has(`${status}|${nationality}`);

    for (const [key, value] of leaves) {
      const [status, nationality] = key.split('|');
      push(time, status, nationality, value);
    }

    // --- nested 「うち」 rows, carved out of their parent's figure --------
    for (const subset of subsetNationalities) {
      if (!inRange(NATIONALITY_RANGES, subset.value, index)) continue;
      const parent = SUBSET_PARENT[subset.value];
      for (const status of leafStatuses) {
        if (!emitted(status.value, parent)) continue;
        push(time, status.value, subset.value, leafValue(status.value, parent) * 0.02);
      }
    }

    // --- rollups, summed from the leaves so the totals reconcile ---------
    const statusChildren = (parent: string) =>
      residenceStatuses.filter((status) => status.parent === parent && !status.isAggregate);

    const sumOver = (statuses: string[], nationalityCodes: string[]) =>
      statuses.reduce(
        (total, status) => total + nationalityCodes.reduce((sub, code) => sub + leafValue(status, code), 0),
        0
      );

    const allLeafStatusCodes = leafStatuses.map((status) => status.value);
    const leafCodesByRegion = new Map<string, string[]>();
    for (const region of NATIONALITY_ROLLUP_REGIONS) {
      leafCodesByRegion.set(
        region,
        leafNationalities.filter((nationality) => nationality.region === region).map((n) => n.value)
      );
    }
    const allLeafNationalityCodes = leafNationalities.map((nationality) => nationality.value);

    for (const aggregate of residenceStatuses.filter((status) => status.isAggregate)) {
      const children =
        aggregate.value === STATUS_TOTAL ? allLeafStatusCodes : statusChildren(aggregate.value).map((s) => s.value);
      // Per-nationality rollup rows, then region rollups, then the grand total.
      for (const nationality of allLeafNationalityCodes) {
        push(time, aggregate.value, nationality, sumOver(children, [nationality]));
      }
      for (const region of NATIONALITY_ROLLUP_REGIONS) {
        push(time, aggregate.value, region, sumOver(children, leafCodesByRegion.get(region) ?? []));
      }
      push(time, aggregate.value, NATIONALITY_TOTAL, sumOver(children, allLeafNationalityCodes));
      // The 「うち」 columns get rollup rows too, summed from their own carved-
      // out values rather than the parent's (they are not in leafValue).
      for (const subset of subsetNationalities) {
        if (!inRange(NATIONALITY_RANGES, subset.value, index)) continue;
        const parent = SUBSET_PARENT[subset.value];
        push(
          time,
          aggregate.value,
          subset.value,
          children.reduce((total, status) => total + Math.round(leafValue(status, parent) * 0.02), 0)
        );
      }
    }

    // Region and grand-total rows for the leaf statuses.
    for (const status of leafStatuses) {
      if (!inRange(RANGES, status.value, index)) continue;
      for (const region of NATIONALITY_ROLLUP_REGIONS) {
        push(time, status.value, region, sumOver([status.value], leafCodesByRegion.get(region) ?? []));
      }
      push(time, status.value, NATIONALITY_TOTAL, sumOver([status.value], allLeafNationalityCodes));
    }
  }

  const last = PERIODS.at(-1)!;
  return {
    GET_STATS_DATA: {
      RESULT: { STATUS: 0, DATE: '2026-08-06' },
      STATISTICAL_DATA: {
        TABLE_INF: {
          SURVEY_DATE: last.year * 100 + last.month,
          note: 'FIXTURE - generated by scripts/generateResidentsFixture.mts',
        },
        RESULT_INF: { TOTAL_NUMBER: VALUE.length, FROM_NUMBER: 1, TO_NUMBER: VALUE.length },
        DATA_INF: { VALUE },
      },
    },
  };
};

export const writeResidentsFixture = (outPath: string) => {
  const fixture = buildResidentsFixture();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(fixture));
  return {
    rows: fixture.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE.length,
    periods: PERIODS.length,
  };
};
