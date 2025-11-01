// src/utils/dataTransform.ts
import type { ApplicationTypeCode } from '../constants/applicationTypes';
import type { BureauCode } from '../constants/bureauCodes';
import type { StatusCode } from '../constants/statusCodes';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import type { EStatResponse, EStatValue } from '../types/estat';
import { makeCorrectedAccessor } from './correctBureauAggregates';

function normalizeValues(rawData: EStatResponse): EStatValue[] {
  const v = rawData?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE;
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export const transformData = (rawData: EStatResponse): ImmigrationData[] => {
  if (!rawData?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE) {
    return [];
  }

  const values = normalizeValues(rawData);
  const { getCorrectedValue } = makeCorrectedAccessor(rawData);

  return values.map((entry) => {
    const timeCode = entry['@time'] ?? '';
    const month = timeCode.substring(0, 4) + '-' + timeCode.substring(8, 10);

    // IMPORTANT: include ALL '@' attrs present on the entry (e.g., '@tab', '@cat01', '@cat02', '@cat03', '@time', etc.)
    const coord: Partial<EStatValue> = {};
    (Object.keys(entry) as Array<keyof EStatValue>).forEach((k) => {
      if (typeof k === 'string' && k.startsWith('@') && k !== '@unit') {
        coord[k] = entry[k];
      }
    });

    const corrected = getCorrectedValue(coord);
    const original = parseInt(entry['$'] ?? '0');

    return {
      month,
      bureau: entry['@cat03'] as BureauCode,
      type: entry['@cat02'] as ApplicationTypeCode,
      // If for some reason a cell isn't found, fall back to original behavior
      value: Number.isNaN(corrected) ? original : corrected,
      status: entry['@cat01'] as StatusCode,
    };
  });
};