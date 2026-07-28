// src/utils/dashboardData.ts
// Shared shape of the pre-transformed data file the client loads directly.
// The build step (scripts/transform-data.mts) packs the verbose e-Stat payload
// into index tables + flat value tuples (~10x smaller); the client unpacks it
// back into the ImmigrationData[] shape the rest of the app consumes.

export interface ImmigrationRecord {
  month: string;
  bureau: string;
  type: string;
  value: number;
  status: string;
}

export interface DashboardDataFile {
  meta: {
    schema: 1;
    /** e-Stat TABLE_INF.SURVEY_DATE of the source payload */
    surveyDate: string | number;
    source: 'e-stat' | 'fixture';
  };
  months: string[];
  bureaus: string[];
  types: string[];
  statuses: string[];
  /** Flat [monthIdx, bureauIdx, typeIdx, statusIdx, value] tuples, stride 5 */
  values: number[];
}

const STRIDE = 5;

export function packDashboardData(
  records: ImmigrationRecord[],
  meta: DashboardDataFile['meta']
): DashboardDataFile {
  const index = (list: string[]) => new Map(list.map((v, i) => [v, i]));
  const months = [...new Set(records.map((r) => r.month))].sort();
  const bureaus = [...new Set(records.map((r) => r.bureau))].sort();
  const types = [...new Set(records.map((r) => r.type))].sort();
  const statuses = [...new Set(records.map((r) => r.status))].sort();
  const [mIdx, bIdx, tIdx, sIdx] = [index(months), index(bureaus), index(types), index(statuses)];

  const values = new Array<number>(records.length * STRIDE);
  records.forEach((r, i) => {
    const o = i * STRIDE;
    values[o] = mIdx.get(r.month)!;
    values[o + 1] = bIdx.get(r.bureau)!;
    values[o + 2] = tIdx.get(r.type)!;
    values[o + 3] = sIdx.get(r.status)!;
    values[o + 4] = r.value;
  });

  return { meta, months, bureaus, types, statuses, values };
}

export function unpackDashboardData(file: DashboardDataFile): ImmigrationRecord[] {
  const { months, bureaus, types, statuses, values } = file;
  const records: ImmigrationRecord[] = new Array(values.length / STRIDE);
  for (let i = 0, o = 0; o < values.length; i++, o += STRIDE) {
    records[i] = {
      month: months[values[o]],
      bureau: bureaus[values[o + 1]],
      type: types[values[o + 2]],
      status: statuses[values[o + 3]],
      value: values[o + 4],
    };
  }
  return records;
}
