// src/utils/dataTransform.ts
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { type EStatData, type EStatValue, makeCorrectedAccessor } from './correctBureauAggregates';

interface RawDataEntry {
  '@time': string;
  '@cat03': string;
  '@cat02': string;
  $: string;
  '@cat01': string;
}

interface RawData {
  GET_STATS_DATA: {
    STATISTICAL_DATA: {
      DATA_INF: {
        VALUE: RawDataEntry[] | RawDataEntry;
      };
    };
  };
}

function normalizeValues(rawData: RawData) {
  const v = rawData?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE;
  if (!v) return [] as RawDataEntry[];
  return Array.isArray(v) ? v : [v];
}

export const transformData = (rawData: RawData): ImmigrationData[] => {
  if (!rawData?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE) {
    return [];
  }

  const values = normalizeValues(rawData);
  const { getCorrectedValue } = makeCorrectedAccessor(rawData as unknown as EStatData);

  return values.map((entry) => {
    // Keep your existing YYYY-MM formatting
    const month = entry['@time'].substring(0, 4) + '-' + entry['@time'].substring(8, 10);

    // IMPORTANT: include ALL '@' attrs present on the entry (e.g., '@tab', '@cat01', '@cat02', '@cat03', '@time', etc.)
    const coord: Partial<EStatValue> = {};
    Object.keys(entry).forEach((k) => {
      if (k.startsWith('@') && k !== '@unit') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (coord as any)[k] = (entry as any)[k];
      }
    });

    const corrected = getCorrectedValue(coord);
    const original = parseInt(entry['$']);

    return {
      month,
      bureau: entry['@cat03'],
      type: entry['@cat02'],
      // If for some reason a cell isn't found, fall back to original behavior
      value: Number.isNaN(corrected) ? original : corrected,
      status: entry['@cat01'],
    };
  });
};