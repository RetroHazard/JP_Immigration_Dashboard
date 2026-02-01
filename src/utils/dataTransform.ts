// src/utils/dataTransform.ts
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { type EStatData, type EStatValue, makeCorrectedAccessor } from './correctBureauAggregates';

export interface RawDataEntry {
  '@time': string;
  '@cat03': string;
  '@cat02': string;
  $: string;
  '@cat01': string;
}

export interface RawData {
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

/**
 * Validates and parses the @time field from e-Stat data
 * Expected format: YYYYMMDD (e.g., "20250707")
 * Returns: YYYY-MM format (e.g., "2025-07")
 */
function validateAndParseMonth(timeStr: string): string {
  // Validate format and length
  if (!timeStr || timeStr.length < 10) {
    throw new Error(`Invalid @time format: "${timeStr}" (expected YYYYMMDD with at least 10 characters)`);
  }

  const year = timeStr.substring(0, 4);
  const month = timeStr.substring(8, 10);

  // Validate year and month are numeric
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
    throw new Error(`Invalid @time components: year="${year}", month="${month}" (expected numeric values)`);
  }

  // Validate month range (01-12)
  const monthNum = parseInt(month, 10);
  if (monthNum < 1 || monthNum > 12) {
    throw new Error(`Invalid month: ${month} (must be 01-12)`);
  }

  return `${year}-${month}`;
}

export const transformData = (rawData: RawData): ImmigrationData[] => {
  if (!rawData?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE) {
    return [];
  }

  const values = normalizeValues(rawData);
  const { getCorrectedValue } = makeCorrectedAccessor(rawData as unknown as EStatData);

  return values.map((entry) => {
    // Validate and parse month with proper error handling
    const month = validateAndParseMonth(entry['@time']);

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

    // Track NaN fallbacks for monitoring
    let finalValue: number;
    if (Number.isNaN(corrected)) {
      console.warn(
        `⚠️  Bureau correction returned NaN, using original value`,
        `\n  Month: ${month}`,
        `\n  Bureau: ${entry['@cat03']}`,
        `\n  Type: ${entry['@cat02']}`,
        `\n  Status: ${entry['@cat01']}`,
        `\n  Original value: ${original}`
      );
      finalValue = original;
    } else {
      finalValue = corrected;
    }

    return {
      month,
      bureau: entry['@cat03'],
      type: entry['@cat02'],
      value: finalValue,
      status: entry['@cat01'],
    };
  });
};