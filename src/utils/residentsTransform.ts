// Build-time flattening of the e-Stat Foreign Residents table (0004019020)
// into the records the client filters. Redundant rows are dropped here:
//   - Rollups. Every 合計/総数 row is the sum of its children, which the client
//     recomputes on the corrected hierarchy in constants/residenceStatuses.ts
//     (the payload misparents the 技能実習 sub-statuses).
//   - Nested 「うち」 rows (うち中国〔香港〕/〔その他〕, うち英国〔香港〕) sit inside
//     their parent country's figure and would double-count. 韓国・朝鮮 is not
//     one: it is the pre-2015 combined Korea series, whose periods do not
//     overlap 韓国/朝鮮.
//   - Zero rows. e-Stat emits every (status, nationality) pair; ~60% are zero.
// What survives sums to the published totals, which `verifyResidentTotals` asserts.
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
 * `2025001212` -> `2025-12`, by the processing table's month rule. Only -06 and
 * -12 pass: the table is half-yearly (半期), so any other month means e-Stat
 * changed the series' cadence.
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
  period: string;
  /**
   * Which dimension `code` belongs to. The codes overlap: 1010 is 総数 as a
   * status and アフガニスタン as a nationality.
   */
  keyDimension: 'nationality' | 'status';
  code: string;
  /** The dimension the leaves were summed over to produce `fromLeaves`. */
  summedOver: 'nationality' | 'status';
  published: number;
  fromLeaves: number;
}

const STATUS_TOTAL_ROW = '1010';

/**
 * Cross-checks the kept leaves against the payload's published totals on both axes:
 *   - per (period, status), the 総数 nationality row must equal the sum of that
 *     status's nationality leaves (catches a misclassified region or 「うち」 subset);
 *   - per (period, nationality), the 総数 status row must equal the sum of that
 *     nationality's status leaves (catches a rollup kept as a leaf, or vice versa).
 * Drift gives a plausible but wrong chart, so the build fails on any mismatch.
 * Run only after checkPayloadComplete (estatPayload.ts): a truncated payload
 * fails every check for an unrelated reason.
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
    keyDimension: TotalsMismatch['keyDimension'],
    summedOver: TotalsMismatch['summedOver'],
    published: Map<string, number>,
    leaves: Map<string, number>
  ): TotalsMismatch[] =>
    [...published.entries()].flatMap(([key, total]) => {
      const [period, code] = key.split('\u0000');
      const summed = leaves.get(key) ?? 0;
      return summed === total
        ? []
        : [{ period, keyDimension, code, summedOver, published: total, fromLeaves: summed }];
    });

  return [
    ...compare('status', 'nationality', publishedByStatus, leavesByStatus),
    ...compare('nationality', 'status', publishedByNationality, leavesByNationality),
  ].sort((a, b) => a.period.localeCompare(b.period) || a.code.localeCompare(b.code));
};
