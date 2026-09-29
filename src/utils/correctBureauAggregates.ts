// Access-time corrections for “管内” bureaus, by bureau code: e-Stat's figure for
// an aggregate bureau includes its branch offices, so their values are subtracted.
// Memoized, and never mutates the source DATA_INF.VALUE entries.

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

const AGGREGATE_MAPPING: Record<string, string[]> = Object.fromEntries(
  bureauOptions
    .filter((b: BureauOption) => Array.isArray(b.children) && b.children.length)
    .map((b) => [b.value, b.children as string[]])
);

export function makeCorrectedAccessor(data: EStatData) {
  const sd = data.GET_STATS_DATA.STATISTICAL_DATA;

  const values = Array.isArray(sd.DATA_INF.VALUE)
    ? sd.DATA_INF.VALUE
    : [sd.DATA_INF.VALUE];

  const sample = (values[0] ?? {}) as EStatValue;
  const dimKeys = Object.keys(sample)
    .filter((k) => k.startsWith("@"))
    .filter((k) => k !== "@unit" && k !== "$");

  const toKey = (coord: Partial<EStatValue>) =>
    dimKeys.map((k) => String(coord[k as keyof EStatValue] ?? "")).join("|");

  const toNum = (s?: string) =>
    s == null || s === "" ? NaN : Number(s);

  const index = new Map<string, number>();
  for (const v of values) {
    index.set(toKey(v), toNum(v["$"]));
  }

  const memo = new Map<string, number>();

  // Coords whose correction was skipped because a branch hasn't published yet.
  const incomplete = new Set<string>();

  /**
   * Returns the corrected numeric value for coord:
   *  - For aggregate bureaus in AGGREGATE_MAPPING, subtracts branch totals
   *    at the same coordinates (only @cat03 differs).
   *  - For others, returns the original value.
   * Returns NaN when base is missing/unparseable, mirroring parseInt behavior,
   * or when a branch has no entry yet.
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
        // e-Stat hasn't published this branch's breakdown for the period,
        // though the aggregate (which still includes it) is out. Subtracting
        // without it would give an inflated figure that drops once the branch
        // catches up, so mark it incomplete instead.
        incomplete.add(key);
      }
    }

    if (incomplete.has(key)) {
      memo.set(key, NaN);
      return NaN;
    }

    const corrected = base - subtotal;

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
      memo.set(key, base);
      return base;
    }

    memo.set(key, corrected);
    return corrected;
  }

  return {
    getCorrectedValue,
    isAggregateBureauCode: (code: string) => code in AGGREGATE_MAPPING,
    getBranchCodes: (code: string) => AGGREGATE_MAPPING[code] ?? [],
    // True when coord is an aggregate bureau missing a branch's entry for the
    // period. Callers treat it as not yet available rather than falling back to
    // the raw, branch-inclusive value, which would drop once the branch publishes.
    isBranchDataIncomplete: (coord: Partial<EStatValue>): boolean => {
      getCorrectedValue(coord);
      return incomplete.has(toKey(coord));
    },
    dimKeys,
  };
}
