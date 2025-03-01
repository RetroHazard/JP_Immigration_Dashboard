// src/utils/dataTransform.ts
import type { ImmigrationData } from '../hooks/useImmigrationData';

interface RawDataEntry {
  '@time': string;
  '@cat03': string;
  '@cat02': string;
  '$': string;
  '@cat01': string;
}

interface RawData {
  GET_STATS_DATA: {
    STATISTICAL_DATA: {
      DATA_INF: {
        VALUE: RawDataEntry[];
      };
    };
  };
}

export const transformData = (rawData: RawData): ImmigrationData[] => {
  if (!rawData?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE) {
    return [];
  }

  const values = rawData.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE;

  return values.map((entry) => ({
    month: entry['@time'].substring(0, 4) + '-' + entry['@time'].substring(8, 10),
    bureau: entry['@cat03'],
    type: entry['@cat02'],
    value: parseInt(entry['$']),
    status: entry['@cat01'],
  }));
};