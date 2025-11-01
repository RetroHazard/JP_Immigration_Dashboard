// src/utils/correctBureauAggregates.ts
// Non-mutating, O(1) access-time corrections for "管内" bureaus using bureau CODES.
// Works directly on the e-Stat DATA_INF.VALUE entries and never mutates the source.

import type { BureauOption } from '../types/bureau';
import type { EStatResponse, EStatValue } from '../types/estat';
import { bureauOptions } from '../constants/bureauOptions';

// For backwards compatibility, export EStatValue from the shared types
export type { EStatValue } from '../types/estat';

// Simplified type alias for the e-Stat data structure
export type EStatData = EStatResponse;

// Use code mapping (see bureauOptions values)
const AGGREGATE_MAPPING: Record<string, string[]> = Object.fromEntries(
  bureauOptions
    .filter((b: BureauOption): b is BureauOption & { children: string[] } =>
      Array.isArray(b.children) && b.children.length > 0
    )
    .map((b) => [b.value, b.children])
);

export function makeCorrectedAccessor(data: EStatData) {
  const sd = data.GET_STATS_DATA.STATISTICAL_DATA;

  // Normalize VALUE to array
  const values = Array.isArray(sd.DATA_INF.VALUE)
    ? sd.DATA_INF.VALUE
    : [sd.DATA_INF.VALUE];

  // Determine the coordinate keys present in this cube
  const sample = (values[0] ?? {}) as EStatValue;
  const dimKeys = Object.keys(sample)
    .filter((k) => k.startsWith("@"))
    .filter((k) => k !== "@unit" && k !== "$");

  const toKey = (coord: Partial<EStatValue>) =>
    dimKeys.map((k) => String(coord[k as keyof EStatValue] ?? "")).join("|");

  const toNum = (s?: string) =>
    s == null || s === "" ? NaN : Number(s);

  // Build an index of original values for fast lookup
  const index = new Map<string, number>();
  for (const v of values) {
    index.set(toKey(v), toNum(v["$"]));
  }

  // Memoize corrected results
  const memo = new Map<string, number>();

  /**
   * Returns the corrected numeric value for coord:
   *  - For aggregate bureaus in AGGREGATE_MAPPING, subtracts branch totals
   *    at the same coordinates (only @cat03 differs).
   *  - For others, returns the original value.
   * Returns NaN when base is missing/unparseable, mirroring parseInt behavior.
   */
  function getCorrectedValue(coord: Partial<EStatValue>): number {
    const key = toKey(coord);
    if (memo.has(key)) return memo.get(key)!;

    const base = index.get(key);
    if (typeof base !== "number") {
      memo.set(key, NaN);
      return NaN;
    }

    const bureau = String(coord["@cat03"] ?? "");
    const branches = AGGREGATE_MAPPING[bureau];

    if (!branches) {
      memo.set(key, base);
      return base;
    }

    let subtotal = 0;
    for (const br of branches) {
      const brKey = dimKeys
        .map((dk) => (dk === "@cat03" ? br : String(coord[dk as keyof EStatValue] ?? "")))
        .join("|");
      const brVal = index.get(brKey);
      if (typeof brVal === "number" && !Number.isNaN(brVal)) {
        subtotal += brVal;
      }
    }

    const corrected = base - subtotal;
    memo.set(key, corrected);
    return corrected;
  }

  return {
    getCorrectedValue,
    isAggregateBureauCode: (code: string) => code in AGGREGATE_MAPPING,
    getBranchCodes: (code: string) => AGGREGATE_MAPPING[code] ?? [],
    dimKeys,
  };
}
