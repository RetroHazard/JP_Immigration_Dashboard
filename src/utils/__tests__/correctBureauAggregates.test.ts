import { describe, expect, it } from 'vitest';

import type { RawData } from '../dataTransform';
import { transformData } from '../dataTransform';

// Osaka (101460) aggregates its branch offices 101480 and Kobe (101490).
// See src/constants/bureauOptions.ts.
const OSAKA = '101460';
const KOBE = '101490';
const OTHER_BRANCH = '101480';
const NAHA = '101740'; // non-aggregate bureau, used as a control

const STATUS = '300000'; // PROCESSED
const TYPE = '1';

function entry(time: string, cat03: string, value: number) {
  return { '@time': time, '@cat01': STATUS, '@cat02': TYPE, '@cat03': cat03, $: String(value) };
}

function buildRawData(entries: ReturnType<typeof entry>[]): RawData {
  return {
    GET_STATS_DATA: { STATISTICAL_DATA: { DATA_INF: { VALUE: entries } } },
  };
}

describe('transformData / aggregate bureau deaggregation', () => {
  it('subtracts branch totals when all branches have reported for the period', () => {
    const raw = buildRawData([
      entry('2025000706', OSAKA, 5000),
      entry('2025000706', KOBE, 800),
      entry('2025000706', OTHER_BRANCH, 200),
    ]);

    const result = transformData(raw);
    const osaka = result.find((r) => r.bureau === OSAKA && r.month === '2025-06');

    expect(osaka?.value).toBe(5000 - 800 - 200);
  });

  it('does not surface an inflated, branch-inclusive figure when a branch has not published yet', () => {
    // Kobe has not published its July figures yet, even though the Osaka
    // regional total (which still includes Kobe's applications) is already
    // available. Naively subtracting only the branches that ARE present
    // would return 5200 - 210 = 4990, silently including Kobe's ~800
    // applications until Kobe's row appears - which is exactly the kind of
    // one-day jump reported against the live dashboard.
    const raw = buildRawData([
      entry('2025000707', OSAKA, 5200),
      entry('2025000707', OTHER_BRANCH, 210),
      // Kobe (101490) intentionally omitted for July.
    ]);

    const result = transformData(raw);
    const osakaJuly = result.find((r) => r.bureau === OSAKA && r.month === '2025-07');

    // The incomplete month should be dropped entirely rather than shown
    // with an inflated (branch-inclusive) value.
    expect(osakaJuly).toBeUndefined();
    // The complete, non-aggregate-dependent branch entry is unaffected.
    expect(result.find((r) => r.bureau === OTHER_BRANCH && r.month === '2025-07')?.value).toBe(210);
  });

  it('reconciles cleanly once the missing branch is published, without an inflated interim value', () => {
    const julyBefore = buildRawData([
      entry('2025000707', OSAKA, 5200),
      entry('2025000707', OTHER_BRANCH, 210),
    ]);
    const julyAfter = buildRawData([
      entry('2025000707', OSAKA, 5200),
      entry('2025000707', OTHER_BRANCH, 210),
      entry('2025000707', KOBE, 800),
    ]);

    const before = transformData(julyBefore).find((r) => r.bureau === OSAKA);
    const after = transformData(julyAfter).find((r) => r.bureau === OSAKA);

    expect(before).toBeUndefined();
    expect(after?.value).toBe(5200 - 210 - 800);
  });

  it('leaves non-aggregate bureaus untouched', () => {
    const raw = buildRawData([entry('2025000707', NAHA, 1234)]);
    const result = transformData(raw);

    expect(result.find((r) => r.bureau === NAHA)?.value).toBe(1234);
  });
});
