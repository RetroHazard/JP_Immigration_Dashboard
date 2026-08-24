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

/**
 * The "Show the math" breakdown claims a specific arithmetic relationship for
 * every variable it renders. These pin those claims to the code, so a change
 * to one without the other fails here rather than shipping a formula that
 * disagrees with the number printed beside it.
 */
describe('calculateEstimatedDate model variables', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const at = (now: string, months: string[], applicationDate: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${now}T12:00:00Z`));
    const result = calculateEstimatedDate(buildMonthlyData(months, NEW_PER_MONTH, PROCESSED_PER_MONTH), {
      bureau: BUREAU,
      type: TYPE,
      applicationDate,
    });
    if (!result) throw new Error('expected an estimate');
    return result.details;
  };

  it('holds every identity the breakdown puts on screen', () => {
    const { modelVariables: v, branches } = at('2025-08-15', MONTHS, '2025-07-31');

    expect(v.R_proc).toBeCloseTo(v.Sigma_P / v.Sigma_D, 10);
    expect(v.R_new).toBeCloseTo(v.Sigma_N / v.Sigma_D, 10);

    const inAppMonth = branches.appMonth === 'reported' ? v.R_proc * (v.D_month - v.A_day) : 0;
    expect(v.C_proc).toBeCloseTo(v.P_after + inAppMonth, 10);

    expect(v.Q_app).toBe(Math.round(v.C_prev + v.N_app - v.P_app));
    expect(v.S_proc).toBe(Math.round(v.C_proc + v.E_proc));
    expect(v.Q_pos).toBe(v.Q_app - v.S_proc);
    expect(v.D_rem).toBeCloseTo(v.Q_pos / v.R_proc, 10);
    expect(v.D_est).toBe(v.D_rem >= 0 ? Math.ceil(v.D_rem) : Math.floor(v.D_rem));
    expect(v.U_days).toBe(Math.round(Math.abs(v.D_rem) * (v.R_sd / v.R_bar)));
  });

  it('rounds the two processed-since terms together, not one by one', () => {
    // The breakdown used to subtract C_proc and E_proc from Q_app separately,
    // each rounded on its own, while the code rounded their sum - so the
    // subtraction on screen could miss the result beside it by one.
    const { modelVariables: v } = at('2025-08-15', MONTHS, '2025-07-31');

    expect(v.Q_pos).toBe(v.Q_app - Math.round(v.C_proc + v.E_proc));
  });

  it('keeps the mean monthly rate distinct from the overall processing rate', () => {
    // R_bar weights every month equally; R_proc weights each by its length.
    // Step 5 divides by R_bar, so collapsing the two would quietly change the
    // uncertainty band.
    const { modelVariables: v } = at('2025-08-15', MONTHS, '2025-07-31');

    expect(v.R_bar).not.toBeCloseTo(v.R_proc, 6);
  });

  describe('branch discriminators', () => {
    it('reads the carry-over off the previous month when it is published', () => {
      const { modelVariables: v, branches } = at('2025-08-15', MONTHS, '2025-07-31');

      expect(branches.carryover).toBe('reported');
      expect(v.C_prev).toBeCloseTo((v.T_prev ?? 0) - (v.P_prev ?? 0), 10);
      expect(v.C_seed).toBeUndefined();
      expect(v.M_sim).toBeUndefined();
    });

    it('simulates the carry-over forward when the previous month is not published', () => {
      const { modelVariables: v, branches } = at('2025-09-20', MONTHS.slice(0, 6), '2025-09-15');

      expect(branches.carryover).toBe('simulated');
      // July and August, rolled forward from June.
      expect(v.M_sim).toBe(2);
      expect(v.C_seed).toBeGreaterThan(0);
      expect(v.T_prev).toBeUndefined();
      expect(v.P_prev).toBeUndefined();
    });

    it('has nothing to carry over for the earliest month the data covers', () => {
      const { modelVariables: v, branches } = at('2025-08-15', MONTHS, '2025-01-15');

      expect(branches.carryover).toBe('unavailable');
      expect(v.C_prev).toBe(0);
      expect(v.C_seed).toBeUndefined();
    });

    it('pro-rates the application month when it is published, and projects it otherwise', () => {
      const reported = at('2025-08-15', MONTHS, '2025-07-31');
      expect(reported.branches.appMonth).toBe('reported');
      expect(reported.modelVariables.N_month).toBeGreaterThan(0);
      expect(reported.modelVariables.N_app).toBeCloseTo(
        ((reported.modelVariables.N_month ?? 0) / reported.modelVariables.D_month) * reported.modelVariables.A_day,
        10
      );

      const projected = at('2025-09-20', MONTHS.slice(0, 6), '2025-09-15');
      expect(projected.branches.appMonth).toBe('projected');
      expect(projected.modelVariables.N_month).toBeUndefined();
      expect(projected.modelVariables.N_app).toBeCloseTo(
        projected.modelVariables.R_new * projected.modelVariables.A_day,
        10
      );
    });

    it('measures from the application date once it runs past the published months', () => {
      // The comparison is lexicographic, a YYYY-MM-DD against a YYYY-MM, so any
      // day inside the last published month already counts as beyond it.
      const beyond = at('2025-08-15', MONTHS, '2025-07-31');
      expect(beyond.branches.sinceApplication).toBe('fromApplication');
      expect(beyond.modelVariables.E_proc).toBeCloseTo(
        beyond.modelVariables.R_proc * beyond.modelVariables.T_app - beyond.modelVariables.C_proc,
        10
      );

      const within = at('2025-08-15', MONTHS, '2025-03-15');
      expect(within.branches.sinceApplication).toBe('fromLastData');
      expect(within.modelVariables.E_proc).toBeCloseTo(
        within.modelVariables.R_proc * within.modelVariables.T_data,
        10
      );
    });
  });

  it('floors the whole-day offset once the estimate is past due', () => {
    const { modelVariables: v, isPastDue } = at('2025-08-15', MONTHS, '2025-01-15');

    expect(isPastDue).toBe(true);
    expect(v.D_rem).toBeLessThan(0);
    expect(v.D_est).toBe(Math.floor(v.D_rem));
  });
});
