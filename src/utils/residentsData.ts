// src/utils/residentsData.ts
// Shared shape of the pre-transformed Foreign Residents file the client loads.
// Same idea as dashboardData.ts — index tables plus flat value tuples — but a
// stride of 4 over a different cube (period x status x nationality), and a
// `kind` discriminator in the meta so the two files can never be unpacked by
// the wrong reader.

export interface ResidentRecord {
  /** Half-year period, `YYYY-06` or `YYYY-12`. */
  period: string;
  /** e-Stat cat01 residence-status code. */
  status: string;
  /** e-Stat cat02 nationality/region code. */
  nationality: string;
  value: number;
}

export interface ResidentsDataFile {
  meta: {
    schema: 1;
    /** Set the two build outputs apart — see loadResidentsData / loadLocalData. */
    kind: 'residents';
    /** e-Stat TABLE_INF.SURVEY_DATE of the source payload */
    surveyDate: string | number;
    source: 'e-stat' | 'fixture';
  };
  periods: string[];
  statuses: string[];
  nationalities: string[];
  /** Flat [periodIdx, statusIdx, nationalityIdx, value] tuples, stride 4 */
  values: number[];
}

const STRIDE = 4;

export function packResidentsData(
  records: ResidentRecord[],
  meta: ResidentsDataFile['meta']
): ResidentsDataFile {
  const index = (list: string[]) => new Map(list.map((value, i) => [value, i]));
  const periods = [...new Set(records.map((record) => record.period))].sort();
  const statuses = [...new Set(records.map((record) => record.status))].sort();
  const nationalities = [...new Set(records.map((record) => record.nationality))].sort();
  const [pIdx, sIdx, nIdx] = [index(periods), index(statuses), index(nationalities)];

  const values = new Array<number>(records.length * STRIDE);
  records.forEach((record, i) => {
    const o = i * STRIDE;
    values[o] = pIdx.get(record.period)!;
    values[o + 1] = sIdx.get(record.status)!;
    values[o + 2] = nIdx.get(record.nationality)!;
    values[o + 3] = record.value;
  });

  return { meta, periods, statuses, nationalities, values };
}

export function unpackResidentsData(file: ResidentsDataFile): ResidentRecord[] {
  const { periods, statuses, nationalities, values } = file;
  const records: ResidentRecord[] = new Array(values.length / STRIDE);
  for (let i = 0, o = 0; o < values.length; i++, o += STRIDE) {
    records[i] = {
      period: periods[values[o]],
      status: statuses[values[o + 1]],
      nationality: nationalities[values[o + 2]],
      value: values[o + 3],
    };
  }
  return records;
}
