// src/utils/residentsTransform.ts
// Build-time flattening of the e-Stat Foreign Residents table (0004019020)
// into the records the client filters.
//
// Two-thirds of the raw payload is redundant, so it is dropped here rather
// than shipped to every visitor:
//
//   - Rollup rows. Every 合計/総数 row on either axis is the sum of its own
//     children, so the client recomputes them from the leaves instead. The
//     hierarchy used is the CORRECTED one in constants/residenceStatuses.ts,
//     not the payload's own (which misparents the 技能実習 sub-statuses).
//   - Nested 「うち」 rows. うち中国〔香港〕/〔その他〕 and うち英国〔香港〕 sit
//     inside their parent country's figure; keeping them would double-count.
//     Note that 韓国・朝鮮 is NOT one of these — it is the pre-2015 combined
//     Korea series and its periods do not overlap 韓国/朝鮮, so it stays.
//   - Zero rows. e-Stat emits a row per (status, nationality) pair whether or
//     not anyone holds that combination; ~60% of the leaves are zeros.
//
// What survives is exactly the set that sums to the published totals, which
// `verifyResidentTotals` asserts against the payload's own 総数 row.
import {
  NATIONALITY_ROLLUP_REGIONS,
  NATIONALITY_SUBSET_CODES,
  NATIONALITY_TOTAL,
} from '../constants/nationalities';
import { STATUS_AGGREGATE_CODES } from '../constants/residenceStatuses';
import { validateAndParseMonth } from './dataTransform';
import type { ResidentRecord } from './residentsData';

export interface RawResidentEntry {
  '@tab'?: string;
  '@cat01': string;
  '@cat02': string;
  '@time': string;
  '@unit'?: string;
  $: string;
}

export interface RawResidentsData {
  GET_STATS_DATA?: {
    STATISTICAL_DATA?: {
      DATA_INF?: { VALUE?: RawResidentEntry[] | RawResidentEntry };
      TABLE_INF?: { SURVEY_DATE?: string | number; note?: string };
    };
  };
}

const ROLLUP_REGION_CODES = new Set<string>(NATIONALITY_ROLLUP_REGIONS);

/** cat02 rows that are a rollup or a nested subset — never shipped. */
const isDerivableNationality = (code: string): boolean =>
  code === NATIONALITY_TOTAL || ROLLUP_REGION_CODES.has(code) || NATIONALITY_SUBSET_CODES.has(code);

const normalizeValues = (raw: RawResidentsData): RawResidentEntry[] => {
  const value = raw?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE;
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

/**
 * `2025001212` -> `2025-12`. The year/month extraction is the same rule the
 * processing table uses, so it is shared; the half-year constraint on top is
 * specific to this table's 半期 cycle and is what would catch e-Stat switching
 * this series to a different cadence.
 */
export const parseResidentPeriod = (timeStr: string): string => {
  const period = validateAndParseMonth(timeStr);
  const month = period.slice(-2);
  if (month !== '06' && month !== '12') {
    throw new Error(`Invalid Foreign Residents period: "${timeStr}" resolved to ${period} (expected -06 or -12)`);
  }
  return period;
};

export const transformResidentsData = (raw: RawResidentsData): ResidentRecord[] => {
  const records: ResidentRecord[] = [];

  for (const entry of normalizeValues(raw)) {
    if (STATUS_AGGREGATE_CODES.has(entry['@cat01'])) continue;
    if (isDerivableNationality(entry['@cat02'])) continue;

    // e-Stat writes '-' for "figure not available" (DATA_INF.NOTE); it is not
    // a zero, and there is nothing to plot either way.
    const value = Number.parseInt(entry.$, 10);
    if (!Number.isFinite(value) || value === 0) continue;

    records.push({
      period: parseResidentPeriod(entry['@time']),
      status: entry['@cat01'],
      nationality: entry['@cat02'],
      value,
    });
  }

  return records;
};

export interface TotalsMismatch {
  axis: 'nationality' | 'status';
  period: string;
  /** The other axis's code the published total was read for. */
  code: string;
  published: number;
  fromLeaves: number;
}

const STATUS_TOTAL_ROW = '1010';

/**
 * Cross-checks the leaves we kept against the payload's own published totals,
 * on both axes:
 *
 *   - nationality: for each (period, status), the 総数 nationality row must
 *     equal the sum of that status's nationality leaves. This is what catches
 *     a region or a 「うち」 subset being misclassified.
 *   - status: for each (period, nationality), the 総数 status row must equal
 *     the sum of that nationality's status leaves. This is what catches a
 *     rollup being treated as a leaf, or a leaf being pruned as a rollup.
 *
 * Either kind of drift produces a chart that looks entirely plausible and is
 * quietly wrong, so the build fails on a mismatch rather than warning.
 */
export const verifyResidentTotals = (raw: RawResidentsData, records: ResidentRecord[]): TotalsMismatch[] => {
  const publishedByStatus = new Map<string, number>();
  const publishedByNationality = new Map<string, number>();
  for (const entry of normalizeValues(raw)) {
    const value = Number.parseInt(entry.$, 10);
    if (!Number.isFinite(value)) continue;
    const period = parseResidentPeriod(entry['@time']);
    if (entry['@cat02'] === NATIONALITY_TOTAL && !STATUS_AGGREGATE_CODES.has(entry['@cat01'])) {
      publishedByStatus.set(`${period}\u0000${entry['@cat01']}`, value);
    }
    if (entry['@cat01'] === STATUS_TOTAL_ROW && !isDerivableNationality(entry['@cat02'])) {
      publishedByNationality.set(`${period}\u0000${entry['@cat02']}`, value);
    }
  }

  const leavesByStatus = new Map<string, number>();
  const leavesByNationality = new Map<string, number>();
  for (const record of records) {
    const statusKey = `${record.period}\u0000${record.status}`;
    const nationalityKey = `${record.period}\u0000${record.nationality}`;
    leavesByStatus.set(statusKey, (leavesByStatus.get(statusKey) ?? 0) + record.value);
    leavesByNationality.set(nationalityKey, (leavesByNationality.get(nationalityKey) ?? 0) + record.value);
  }

  const compare = (
    axis: TotalsMismatch['axis'],
    published: Map<string, number>,
    leaves: Map<string, number>
  ): TotalsMismatch[] =>
    [...published.entries()].flatMap(([key, total]) => {
      const [period, code] = key.split('\u0000');
      const summed = leaves.get(key) ?? 0;
      return summed === total ? [] : [{ axis, period, code, published: total, fromLeaves: summed }];
    });

  return [
    // The nationality axis is summed per status, so it is keyed by status code.
    ...compare('nationality', publishedByStatus, leavesByStatus),
    ...compare('status', publishedByNationality, leavesByNationality),
  ].sort((a, b) => a.period.localeCompare(b.period) || a.code.localeCompare(b.code));
};
