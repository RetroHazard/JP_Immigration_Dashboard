// src/utils/correctBureauAggregates.ts
// Non-mutating, O(1) access-time corrections for “管内” bureaus using bureau CODES.
// Works directly on the e-Stat DATA_INF.VALUE entries and never mutates the source.

import { type BureauOption,bureauOptions } from '../constants/bureauOptions';

export type EStatValue = {
  [k: string]: string | undefined; // "@tab", "@cat01", "@cat02", "@cat03", "@time", "$", etc.
  "@cat03": string;                // bureau code
  "@time": string;                 // time code (e.g., 2025000707)
  "$"?: string;                    // numeric value as string
};

type ClassEntry = { "@code": string; "@name": string };
type ClassObj = {
  "@id": string;
  "@name": string;
  CLASS: ClassEntry | ClassEntry[];
};

export type EStatData = {
  GET_STATS_DATA: {
    STATISTICAL_DATA: {
      CLASS_INF: {
        CLASS_OBJ: ClassObj | ClassObj[];
      };
      DATA_INF: {
        VALUE: EStatValue | EStatValue[];
      };
    };
  };
};

// Use code mapping (see bureauOptions values)
const AGGREGATE_MAPPING: Record<string, string[]> = Object.fromEntries(
  bureauOptions
    .filter((b: BureauOption) => Array.isArray(b.children) && b.children.length)
    .map((b) => [b.value, b.children as string[]])
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

  // Tracks coords where an aggregate bureau's correction was skipped because
  // one or more branch offices haven't published data for that period yet.
  const incomplete = new Set<string>();

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
      } else {
        // A branch office has no entry for this exact time period, meaning
        // e-Stat hasn't published its breakdown yet even though the parent
        // aggregate (which still includes the branch's applications) is
        // already available. Deaggregating now would understate the branch
        // subtraction and return an inflated figure that silently drops once
        // the branch catches up — surface it as incomplete instead.
        incomplete.add(key);
      }
    }

    if (incomplete.has(key)) {
      memo.set(key, NaN);
      return NaN;
    }

    const corrected = base - subtotal;

    // Validate that correction doesn't produce negative values
    if (corrected < 0) {
      console.warn(
        `⚠️  Bureau deaggregation produced negative value`,
        `\n  Bureau: ${bureau}`,
        `\n  Coordinate: ${key}`,
        `\n  Base value: ${base}`,
        `\n  Branch subtotal: ${subtotal}`,
        `\n  Corrected (negative): ${corrected}`,
        `\n  → Falling back to uncorrected base value`
      );
      memo.set(key, base); // Fallback to uncorrected
      return base;
    }

    memo.set(key, corrected);
    return corrected;
  }

  return {
    getCorrectedValue,
    isAggregateBureauCode: (code: string) => code in AGGREGATE_MAPPING,
    getBranchCodes: (code: string) => AGGREGATE_MAPPING[code] ?? [],
    // True when coord is an aggregate bureau whose deaggregation could not be
    // completed because at least one branch office had no published entry
    // for this exact time period. Callers should treat this data point as
    // not-yet-available rather than falling back to the raw (branch-inclusive)
    // value, which would otherwise appear to silently drop once the branch's
    // figures are published.
    isBranchDataIncomplete: (coord: Partial<EStatValue>): boolean => {
      getCorrectedValue(coord);
      return incomplete.has(toKey(coord));
    },
    dimKeys,
  };
}
