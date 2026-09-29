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
 * Validates and parses an e-Stat @time code: `2025000707` -> `2025-07` (year
 * from characters 0-3, month from 8-9). Exported because the Foreign Residents
 * table encodes @time the same way (`2025001212` -> `2025-12`).
 */
export function validateAndParseMonth(timeStr: string): string {
  if (!timeStr || timeStr.length < 10) {
    throw new Error(`Invalid @time format: "${timeStr}" (expected YYYYMMDD with at least 10 characters)`);
  }

  const year = timeStr.substring(0, 4);
  const month = timeStr.substring(8, 10);

  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
    throw new Error(`Invalid @time components: year="${year}", month="${month}" (expected numeric values)`);
  }

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
  const { getCorrectedValue, isBranchDataIncomplete } = makeCorrectedAccessor(rawData as unknown as EStatData);

  const result: ImmigrationData[] = [];

  for (const entry of values) {
    const month = validateAndParseMonth(entry['@time']);

    // Include every '@' attribute ('@tab' too): the accessor keys its lookup on all of them.
    const coord: Partial<EStatValue> = {};
    Object.keys(entry).forEach((k) => {
      if (k.startsWith('@') && k !== '@unit') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (coord as any)[k] = (entry as any)[k];
      }
    });

    if (isBranchDataIncomplete(coord)) {
      // An aggregate bureau (e.g. Osaka) whose branch office (e.g. Kobe) hasn't
      // published this period cannot be deaggregated yet. Skip it rather than
      // ship an inflated value; consumers already treat a missing month as pending.
      console.warn(
        `⚠️  Skipping aggregate bureau entry pending branch data`,
        `\n  Month: ${month}`,
        `\n  Bureau: ${entry['@cat03']}`,
        `\n  Type: ${entry['@cat02']}`,
        `\n  Status: ${entry['@cat01']}`
      );
      continue;
    }

    const corrected = getCorrectedValue(coord);
    const original = parseInt(entry['$']);

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

    result.push({
      month,
      bureau: entry['@cat03'],
      type: entry['@cat02'],
      value: finalValue,
      status: entry['@cat01'],
    });
  }

  return result;
};