import { afterEach, describe, expect, it, vi } from 'vitest';

import { STATUS_CODES } from '../../constants/statusCodes';
import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { calculateEstimatedDate } from '../calculateEstimates';

const BUREAU = 'Osaka';
const TYPE = 'X';

function buildMonthlyData(
  months: string[],
  newPerMonth: Record<string, number>,
  processedPerMonth: Record<string, number>
): ImmigrationData[] {
  const out: ImmigrationData[] = [];
  let carriedTotal = 0;

  for (const month of months) {
    const received = newPerMonth[month];
    const processed = processedPerMonth[month];
    // TOTAL_APPLICATIONS (受理_計) is old-carried-in + new-this-month, not a
    // running cumulative total - see calculateEstimatedDate's carriedOver.
    carriedTotal = Math.max(0, carriedTotal - processed) + received;

    out.push({ month, bureau: BUREAU, type: TYPE, value: received, status: STATUS_CODES.NEW_APPLICATIONS });
    out.push({ month, bureau: BUREAU, type: TYPE, value: processed, status: STATUS_CODES.PROCESSED });
    out.push({ month, bureau: BUREAU, type: TYPE, value: carriedTotal, status: STATUS_CODES.TOTAL_APPLICATIONS });
  }

  return out;
}

const MONTHS = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07'];
const NEW_PER_MONTH: Record<string, number> = {
  '2025-01': 3200,
  '2025-02': 2900,
  '2025-03': 3400,
  '2025-04': 4200,
  '2025-05': 3600,
  '2025-06': 3300,
  '2025-07': 3100,
};
const PROCESSED_PER_MONTH: Record<string, number> = {
  '2025-01': 3000,
  '2025-02': 2800,
  '2025-03': 3100,
  '2025-04': 3300,
  '2025-05': 3200,
  '2025-06': 3400,
  // Deliberately well below the other months, to model a real slow
  // processing month (holiday closures, staffing, etc.) landing right as it
  // is first published.
  '2025-07': 1400,
};

describe('calculateEstimatedDate month-boundary sensitivity', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('documents that the estimate can jump sharply the moment a new month is first published', () => {
    // Before July's figures are published, "today" (2025-07-30) falls beyond
    // the available data, so the model simulates forward from June.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-07-30T12:00:00Z'));
    const before = calculateEstimatedDate(buildMonthlyData(MONTHS.slice(0, 6), NEW_PER_MONTH, PROCESSED_PER_MONTH), {
      bureau: BUREAU,
      type: TYPE,
      applicationDate: '2025-07-30',
    });

    // A day later, July's actual (much slower) figures have landed.
    vi.setSystemTime(new Date('2025-07-31T12:00:00Z'));
    const after = calculateEstimatedDate(buildMonthlyData(MONTHS, NEW_PER_MONTH, PROCESSED_PER_MONTH), {
      bureau: BUREAU,
      type: TYPE,
      applicationDate: '2025-07-31',
    });

    expect(before?.details.dataQuality).toBe('low');
    expect(after?.details.dataQuality).toBe('high');

    const daysBefore = before?.details.modelVariables.D_rem ?? 0;
    const daysAfter = after?.details.modelVariables.D_rem ?? 0;

    // This is expected, legitimate movement: once July's real (slower)
    // throughput is known, both the 6-month rolling processing rate and the
    // actual carryover correctly reflect it, in place of a same simulated
    // estimate. The swing itself isn't a bug - see
    // correctBureauAggregates.test.ts for the actual defect (a branch-lag
    // bug that used to make aggregate bureaus like Osaka look artificially
    // fast for a day before silently correcting itself).
    expect(daysAfter).toBeGreaterThan(daysBefore);
  });
});
