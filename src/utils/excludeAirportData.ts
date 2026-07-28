// src/utils/excludeAirportData.ts
// The global airport toggle's data transform. Dropping the airport rows is
// only half the job: the parent bureaus already exclude their branch offices
// (build-time deaggregation), but the official nationwide aggregate row still
// contains the airport volumes. So excluded airports are also subtracted from
// the nationwide row, per month/type/status, keeping stats and nationwide
// chart scopes consistent with the visible bureaus.

import { STATUS_CODES } from '../constants/statusCodes';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { AIRPORT_BUREAU_CODES } from './getBureauData';

export function excludeAirportData(data: ImmigrationData[]): ImmigrationData[] {
  const airportSums = new Map<string, number>();
  for (const entry of data) {
    if (!AIRPORT_BUREAU_CODES.has(entry.bureau)) continue;
    const key = `${entry.month}|${entry.type}|${entry.status}`;
    airportSums.set(key, (airportSums.get(key) ?? 0) + entry.value);
  }

  return data
    .filter((entry) => !AIRPORT_BUREAU_CODES.has(entry.bureau))
    .map((entry) => {
      if (entry.bureau !== STATUS_CODES.NATIONWIDE_BUREAU) return entry;
      const deduction = airportSums.get(`${entry.month}|${entry.type}|${entry.status}`) ?? 0;
      return deduction > 0 ? { ...entry, value: Math.max(entry.value - deduction, 0) } : entry;
    });
}
