import { STATUS_CODES } from '../constants/statusCodes';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { logger } from './logger';

interface ApplicationDetails {
  bureau: string;
  type: string;
  applicationDate: string;
}

/**
 * Which code path produced each branch-dependent variable, so the "Show the
 * math" breakdown can render only the branch that ran.
 */
export interface ModelBranches {
  /** `C_prev`: reported by the previous month, simulated forward from the last month with data, or absent entirely. */
  carryover: 'reported' | 'simulated' | 'unavailable';
  /** `N_app`/`P_app`/`C_proc`: pro-rated from the application month's own figures, or projected from the window rates. */
  appMonth: 'reported' | 'projected';
  /** `E_proc`: measured forward from the application date, or projected past the last published month. */
  sinceApplication: 'fromApplication' | 'fromLastData';
}

/**
 * The display-facing view of the model, ordered so that every variable is
 * defined before the one that consumes it. Optional fields exist on only one
 * branch - see `ModelBranches`.
 */
export interface ModelVariables {
  // Step 1: throughput over the sampled window
  Sigma_P: number;
  Sigma_N: number;
  Sigma_D: number;
  R_proc: number;
  R_new: number;
  // Step 2: the queue on the application date
  A_day: number;
  D_month: number;
  /** `carryover: 'reported'` only. */
  T_prev?: number;
  /** `carryover: 'reported'` only. */
  P_prev?: number;
  /** `carryover: 'simulated'` only - the reported carry-over the roll-forward starts from. */
  C_seed?: number;
  /** `carryover: 'simulated'` only - how many months it was rolled forward. */
  M_sim?: number;
  /** `appMonth: 'reported'` only. */
  N_month?: number;
  /** `appMonth: 'reported'` only. */
  P_month?: number;
  C_prev: number;
  N_app: number;
  P_app: number;
  Q_app: number;
  // Step 3: what has been processed since
  P_after: number;
  T_app: number;
  T_data: number;
  C_proc: number;
  E_proc: number;
  S_proc: number;
  // Step 4: position in the queue, and how long it takes to clear
  Q_pos: number;
  D_rem: number;
  // Step 5: whole-day offset, and the spread around it
  D_est: number;
  R_bar: number;
  R_sd: number;
  U_days: number;
}

interface CalculationDetails {
  queueAtApplication: number;
  queuePosition: number;
  totalProcessedSinceApp: number;
  carriedOver: number;
  dailyNew: number;
  dailyProcessed: number;
  appDay: number;
  totalProcessed: number;
  totalDays: number;
  dataQuality: 'high' | 'low';
  monthsUsed: number;
  /** ± band on the remaining days, from month-to-month processing-rate variance */
  uncertaintyDays: number;
  modelVariables: ModelVariables;
  branches: ModelBranches;
  isPastDue: boolean;
}

export interface EstimatedDateResult {
  estimatedDate: Date;
  details: CalculationDetails;
}

export const calculateEstimatedDate = (
  data: ImmigrationData[],
  details: ApplicationDetails
): EstimatedDateResult | null => {
  if (!data || !details.bureau || !details.type || !details.applicationDate) {
    return null;
  }

  const { bureau, type, applicationDate } = details;
  const filteredData = data.filter((entry) => entry.bureau === bureau && entry.type === type);
  if (filteredData.length === 0) return null;

  const months = [...new Set(filteredData.map((entry) => entry.month))].sort();
  const lastAvailableMonth = months[months.length - 1];

  const MIN_MONTHS_REQUIRED = 3;
  const OPTIMAL_MONTHS = 6;

  if (months.length < MIN_MONTHS_REQUIRED) {
    logger.warn(
      `⚠️  Insufficient data for estimation`,
      `\n  Bureau: ${bureau}`,
      `\n  Type: ${type}`,
      `\n  Months available: ${months.length}`,
      `\n  Minimum required: ${MIN_MONTHS_REQUIRED}`,
      `\n  → Cannot generate reliable estimate`
    );
    return null;
  }

  const selectedMonths = months.slice(-OPTIMAL_MONTHS);

  const sumByStatus = (status: string, monthCondition: (month: string) => boolean) =>
    filteredData
      .filter((entry) => entry.status === status && monthCondition(entry.month))
      .reduce((sum, entry) => sum + entry.value, 0);

  const getDaysInMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const getDaysBetweenDates = (start: Date, end: Date) => {
    const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    return Math.ceil((utcEnd - utcStart) / (1000 * 60 * 60 * 24));
  };

  // Calendar pinned to JST: applications are filed, processed and published on
  // Japan's calendar, so the model computes on it for every viewer. Date-only
  // strings are split numerically (`new Date('YYYY-MM-DD')` parses as UTC but
  // reads back local fields, a day early west of UTC), months step as integer
  // indexes, and "today" is today's date in Asia/Tokyo. JST is a fixed UTC+9
  // with no DST, so the offset is a constant.
  const monthIndexOf = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    return year * 12 + (month - 1);
  };
  const monthFromIndex = (index: number) => `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const nowShifted = new Date(Date.now() + JST_OFFSET_MS);
  // Local midnight carrying JST's calendar date, so the local-time day
  // arithmetic below reads the same date in every timezone.
  const todayJst = new Date(nowShifted.getUTCFullYear(), nowShifted.getUTCMonth(), nowShifted.getUTCDate());

  const totalNew = sumByStatus(STATUS_CODES.NEW_APPLICATIONS, (m) => selectedMonths.includes(m));
  const totalProcessed = sumByStatus(STATUS_CODES.PROCESSED, (m) => selectedMonths.includes(m));
  const totalDays = selectedMonths.reduce((sum, month) => sum + getDaysInMonth(month), 0);

  const dailyProcessed = totalProcessed / totalDays;
  const dailyNew = totalNew / totalDays;
  const processingRate = dailyProcessed;

  const [appYear, appMonthNumber, appDay] = applicationDate.split('-').map(Number);
  const appDate = new Date(appYear, appMonthNumber - 1, appDay);
  const applicationMonth = applicationDate.slice(0, 7);

  const prevMonth = monthFromIndex(monthIndexOf(applicationMonth) - 1);

  const hasActualAppMonth = months.includes(applicationMonth);
  const hasActualPrevMonth = months.includes(prevMonth);

  const monthsBeyondData = hasActualAppMonth
    ? 0
    : Math.max(0, monthIndexOf(applicationMonth) - monthIndexOf(lastAvailableMonth));

  const dataQuality = hasActualAppMonth && monthsBeyondData === 0
    ? 'high'
    : 'low';

  if (dataQuality === 'low') {
    const reason = !hasActualAppMonth
      ? `application date is ${monthsBeyondData} month${monthsBeyondData === 1 ? '' : 's'} beyond available data`
      : `insufficient historical data (${selectedMonths.length} months)`;

    logger.warn(
      `⚠️  Estimate quality reduced`,
      `\n  Bureau: ${bureau}`,
      `\n  Type: ${type}`,
      `\n  Application date: ${applicationMonth}`,
      `\n  Last available data: ${lastAvailableMonth}`,
      `\n  Reason: ${reason}`,
      `\n  → Estimate is based on simulation rather than actual data`
    );
  }

  const [lastYear, lastMonthNumber] = lastAvailableMonth.split('-').map(Number);
  // Day 0 of the following month: the last day of the last published month.
  const lastAvailableDateEnd = new Date(lastYear, lastMonthNumber, 0);
  const predictionDays = getDaysBetweenDates(lastAvailableDateEnd, todayJst);

  const daysInApplicationMonth = getDaysInMonth(applicationMonth);
  const processedInAppMonth = hasActualAppMonth ? dailyProcessed * (daysInApplicationMonth - appDay) : 0;

  // Held apart from the application month's own remainder: the breakdown shows
  // the two terms of C_proc separately.
  const processedAfterAppMonth = sumByStatus(STATUS_CODES.PROCESSED, (m) => m > applicationMonth);
  const confirmedProcessed = processedAfterAppMonth + processedInAppMonth;

  const daysSinceApplication = getDaysBetweenDates(appDate, todayJst);
  const isBeyondPublishedData = applicationDate > lastAvailableMonth;
  const estimatedProcessed = isBeyondPublishedData
    ? dailyProcessed * daysSinceApplication - confirmedProcessed
    : dailyProcessed * predictionDays;

  const totalProcessedSinceApp = Math.round(confirmedProcessed + estimatedProcessed);

  const getMonthData = (month: string, status: string) =>
    filteredData.find((entry) => entry.month === month && entry.status === status)?.value || 0;

  let carriedOver = 0;
  let reportedPrevTotal: number | undefined;
  let reportedPrevProcessed: number | undefined;
  let carrySeed: number | undefined;
  let carryMonthsSimulated: number | undefined;
  if (hasActualPrevMonth) {
    reportedPrevTotal = getMonthData(prevMonth, STATUS_CODES.TOTAL_APPLICATIONS);
    reportedPrevProcessed = getMonthData(prevMonth, STATUS_CODES.PROCESSED);
    carriedOver = reportedPrevTotal - reportedPrevProcessed;
  } else {
    const availableMonths = months.filter((m) => m < applicationMonth);
    if (availableMonths.length) {
      const lastAvailableMonth = availableMonths.slice(-1)[0];

      let simulatedCarriedOver =
        getMonthData(lastAvailableMonth, STATUS_CODES.TOTAL_APPLICATIONS) - getMonthData(lastAvailableMonth, STATUS_CODES.PROCESSED);
      carrySeed = simulatedCarriedOver;

      // Roll forward each full month between the last available month and the
      // application month.
      const appMonthIndex = monthIndexOf(applicationMonth);
      let currentMonthIndex = monthIndexOf(lastAvailableMonth) + 1;

      // More than five years to roll forward suggests a bad date; give up instead.
      const MAX_MONTHS_TO_SIMULATE = 60;
      let monthsSimulated = 0;

      while (currentMonthIndex < appMonthIndex) {
        monthsSimulated++;

        if (monthsSimulated > MAX_MONTHS_TO_SIMULATE) {
          logger.error(
            `⚠️  Carryover simulation exceeded maximum iterations`,
            `\n  Bureau: ${bureau}`,
            `\n  Type: ${type}`,
            `\n  Application month: ${applicationMonth}`,
            `\n  Last available month: ${lastAvailableMonth}`,
            `\n  Months simulated: ${monthsSimulated}`,
            `\n  → Aborting estimation (possible date error)`
          );
          return null;
        }

        const daysInMonth = getDaysInMonth(monthFromIndex(currentMonthIndex));

        const netChange = (dailyNew - dailyProcessed) * daysInMonth;
        simulatedCarriedOver = Math.max(0, simulatedCarriedOver + netChange);

        currentMonthIndex++;
      }

      carryMonthsSimulated = monthsSimulated;
      carriedOver = simulatedCarriedOver;
    }
  }

  let receivedByAppDate: number, processedByAppDate: number;
  let reportedMonthNew: number | undefined;
  let reportedMonthProcessed: number | undefined;
  if (hasActualAppMonth) {
    reportedMonthNew = getMonthData(applicationMonth, STATUS_CODES.NEW_APPLICATIONS);
    reportedMonthProcessed = getMonthData(applicationMonth, STATUS_CODES.PROCESSED);

    receivedByAppDate = (reportedMonthNew / daysInApplicationMonth) * appDay;
    processedByAppDate = (reportedMonthProcessed / daysInApplicationMonth) * appDay;
  } else {
    receivedByAppDate = dailyNew * appDay;
    processedByAppDate = dailyProcessed * appDay;
  }

  if (processingRate <= 0) return null;

  // Anchored to JST's today (already local midnight), so the completion date
  // reads the same for every viewer.
  const estimatedDate = new Date(todayJst);
  const queueAtApplication = Math.round(carriedOver + receivedByAppDate - processedByAppDate);
  const queuePosition = queueAtApplication - totalProcessedSinceApp;
  const daysRemaining = queuePosition / dailyProcessed;
  const estimatedDays = daysRemaining >= 0 ? Math.ceil(daysRemaining) : Math.floor(daysRemaining);

  estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

  // Uncertainty band, by first-order error propagation on D = Q / R: a spread
  // of sigma in the daily processing rate widens the estimate by |D| * (sigma / R),
  // sigma being the month-to-month standard deviation over the sampled window.
  const monthlyRates = selectedMonths.map(
    (month) => sumByStatus(STATUS_CODES.PROCESSED, (m) => m === month) / getDaysInMonth(month)
  );
  const meanRate = monthlyRates.reduce((sum, rate) => sum + rate, 0) / monthlyRates.length;
  const rateStdDev = Math.sqrt(
    monthlyRates.reduce((sum, rate) => sum + (rate - meanRate) ** 2, 0) / monthlyRates.length
  );
  const uncertaintyDays = meanRate > 0 ? Math.round(Math.abs(daysRemaining) * (rateStdDev / meanRate)) : 0;

  const calculationDetails: CalculationDetails = {
    queueAtApplication,
    queuePosition,
    totalProcessedSinceApp,
    carriedOver,
    dailyNew,
    dailyProcessed,
    appDay,
    totalProcessed,
    totalDays,
    dataQuality,
    monthsUsed: selectedMonths.length,
    uncertaintyDays,
    // Every field is explained in the catalogue, under
    // `estimator.formula.var.*` - the "Show the math" popovers read from there.
    modelVariables: {
      Sigma_P: totalProcessed,
      Sigma_N: totalNew,
      Sigma_D: totalDays,
      R_proc: dailyProcessed,
      R_new: dailyNew,
      A_day: appDay,
      D_month: daysInApplicationMonth,
      T_prev: reportedPrevTotal,
      P_prev: reportedPrevProcessed,
      C_seed: carrySeed,
      M_sim: carryMonthsSimulated,
      N_month: reportedMonthNew,
      P_month: reportedMonthProcessed,
      C_prev: carriedOver,
      N_app: receivedByAppDate,
      P_app: processedByAppDate,
      Q_app: queueAtApplication,
      P_after: processedAfterAppMonth,
      T_app: daysSinceApplication,
      T_data: predictionDays,
      C_proc: confirmedProcessed,
      E_proc: estimatedProcessed,
      S_proc: totalProcessedSinceApp,
      Q_pos: queuePosition,
      D_rem: daysRemaining,
      D_est: estimatedDays,
      R_bar: meanRate,
      R_sd: rateStdDev,
      U_days: uncertaintyDays,
    },
    branches: {
      // A date in the earliest month the dataset covers has no prior month to
      // carry anything over from, and nothing to simulate forward from either.
      carryover: hasActualPrevMonth ? 'reported' : carrySeed === undefined ? 'unavailable' : 'simulated',
      appMonth: hasActualAppMonth ? 'reported' : 'projected',
      sinceApplication: isBeyondPublishedData ? 'fromApplication' : 'fromLastData',
    },
    isPastDue: queuePosition <= 0,
  };

  return {
    estimatedDate,
    details: calculationDetails,
  };
};
