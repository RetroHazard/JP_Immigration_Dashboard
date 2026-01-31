// src/utils/calculateEstimates.ts
import type { ImmigrationData } from '../hooks/useImmigrationData';

interface ApplicationDetails {
  bureau: string;
  type: string;
  applicationDate: string;
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
  modelVariables: {
    C_prev: number;
    N_app: number;
    P_app: number;
    R_daily: number;
    Sigma_P: number;
    Sigma_D: number;
    Q_app: number;
    C_proc: number;
    E_proc: number;
    Q_pos: number;
    D_rem: number;
  };
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
  // --------------------------------------------
  // Input Validation & Early Exit
  // --------------------------------------------
  if (!data || !details.bureau || !details.type || !details.applicationDate) {
    return null;
  }

  // --------------------------------------------
  // Data Filtering and Preparation
  // --------------------------------------------
  const { bureau, type, applicationDate } = details;
  const filteredData = data.filter((entry) => entry.bureau === bureau && entry.type === type);
  if (filteredData.length === 0) return null;

  // Get sorted unique months from filtered data
  const months = [...new Set(filteredData.map((entry) => entry.month))].sort();
  const lastAvailableMonth = months[months.length - 1];

  // Data quality validation: require minimum 3 months, optimal is 6
  const MIN_MONTHS_REQUIRED = 3;
  const OPTIMAL_MONTHS = 6;

  if (months.length < MIN_MONTHS_REQUIRED) {
    console.warn(
      `⚠️  Insufficient data for estimation`,
      `\n  Bureau: ${bureau}`,
      `\n  Type: ${type}`,
      `\n  Months available: ${months.length}`,
      `\n  Minimum required: ${MIN_MONTHS_REQUIRED}`,
      `\n  → Cannot generate reliable estimate`
    );
    return null;
  }

  // Use the most recent data available (up to 6 months)
  const selectedMonths = months.slice(-OPTIMAL_MONTHS);

  // Data quality will be determined later based on application date context
  // (whether we have actual data for the application period)

  // --------------------------------------------
  // Helper Functions
  // --------------------------------------------
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

  const formatMonth = (date: Date) => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

  // --------------------------------------------
  // Core Rate Calculations
  // --------------------------------------------
  // Calculate daily processing rates
  const totalNew = sumByStatus('103000', (m) => selectedMonths.includes(m));
  const totalProcessed = sumByStatus('300000', (m) => selectedMonths.includes(m));
  const totalDays = selectedMonths.reduce((sum, month) => sum + getDaysInMonth(month), 0);

  const dailyProcessed = totalProcessed / totalDays;
  const dailyNew = totalNew / totalDays;
  const processingRate = dailyProcessed;

  // --------------------------------------------
  // Application Date Analysis
  // --------------------------------------------
  const appDate = new Date(applicationDate);
  const appDay = appDate.getDate();
  const applicationMonth = formatMonth(appDate);

  // Previous month calculation
  const prevMonthDate = new Date(appDate);
  prevMonthDate.setMonth(appDate.getMonth() - 1);
  const prevMonth = formatMonth(prevMonthDate);

  // --------------------------------------------
  // Available Data Detection & Quality Assessment
  // --------------------------------------------
  const hasActualAppMonth = months.includes(applicationMonth);
  const hasActualPrevMonth = months.includes(prevMonth);

  // Calculate how far we're estimating beyond available data
  const lastAvailableDate = new Date(lastAvailableMonth + '-01');
  const appMonthDate = new Date(applicationMonth + '-01');
  const monthsBeyondData = hasActualAppMonth
    ? 0
    : Math.max(0, (appMonthDate.getFullYear() - lastAvailableDate.getFullYear()) * 12
        + (appMonthDate.getMonth() - lastAvailableDate.getMonth()));

  // Determine data quality based on application date context
  // - 'high': Application date has actual data (within our dataset)
  // - 'low': Application date is beyond available data (requires simulation)
  const dataQuality = hasActualAppMonth && monthsBeyondData === 0
    ? 'high'
    : 'low';

  if (dataQuality === 'low') {
    const reason = !hasActualAppMonth
      ? `application date is ${monthsBeyondData} month${monthsBeyondData === 1 ? '' : 's'} beyond available data`
      : `insufficient historical data (${selectedMonths.length} months)`;

    console.warn(
      `⚠️  Estimate quality reduced`,
      `\n  Bureau: ${bureau}`,
      `\n  Type: ${type}`,
      `\n  Application date: ${applicationMonth}`,
      `\n  Last available data: ${lastAvailableMonth}`,
      `\n  Reason: ${reason}`,
      `\n  → Estimate is based on simulation rather than actual data`
    );
  }

  // --------------------------------------------
  // Queue Position Calculations
  // --------------------------------------------
  // Current queue state calculations
  const lastAvailableDateEnd = new Date(
    Date.UTC(parseInt(lastAvailableMonth.split('-')[0]), parseInt(lastAvailableMonth.split('-')[1]) - 1, 1)
  );
  lastAvailableDateEnd.setMonth(lastAvailableDateEnd.getMonth() + 1);
  lastAvailableDateEnd.setDate(0);
  const predictionDays = getDaysBetweenDates(lastAvailableDateEnd, new Date());

  // Processed applications estimation
  let processedInAppMonth = 0;
  if (hasActualAppMonth) {
    const daysInMonth = getDaysInMonth(applicationMonth);
    processedInAppMonth = dailyProcessed * (daysInMonth - appDay);
  }

  const confirmedProcessed = sumByStatus('300000', (m) => m > applicationMonth) + processedInAppMonth;

  // --------------------------------------------
  // Predictive Calculations
  // --------------------------------------------
  const daysSinceApplication = getDaysBetweenDates(appDate, new Date());
  const estimatedProcessed =
    applicationDate > lastAvailableMonth
      ? dailyProcessed * daysSinceApplication - confirmedProcessed
      : dailyProcessed * predictionDays;

  const totalProcessedSinceApp = Math.round(confirmedProcessed + estimatedProcessed);

  // --------------------------------------------
  // Queue at Application Date Calculation
  // --------------------------------------------
  const getMonthData = (month: string, status: string) =>
    filteredData.find((entry) => entry.month === month && entry.status === status)?.value || 0;

  // --------------------------------------------
  // Carryover calculations
  // --------------------------------------------
  let carriedOver = 0;
  if (hasActualPrevMonth) {
    carriedOver = getMonthData(prevMonth, '100000') - getMonthData(prevMonth, '300000');
  } else {
    const availableMonths = months.filter((m) => m < applicationMonth);
    if (availableMonths.length) {
      const lastAvailableMonth = availableMonths.slice(-1)[0];

      // Calculate initial carriedOver from the last available month
      let simulatedCarriedOver =
        getMonthData(lastAvailableMonth, '100000') - getMonthData(lastAvailableMonth, '300000');

      // Calculate the exact number of full months between the last available month and application month
      const lastAvailableDate = new Date(lastAvailableMonth + '-01');
      const appMonthDate = new Date(applicationMonth + '-01');

      const currentMonthDate = new Date(lastAvailableDate);
      currentMonthDate.setMonth(currentMonthDate.getMonth() + 1); // Start from next month

      // Infinite loop protection: maximum 5 years of simulation
      const MAX_MONTHS_TO_SIMULATE = 60;
      let monthsSimulated = 0;

      while (currentMonthDate < appMonthDate) {
        monthsSimulated++;

        // Safety check to prevent infinite loops
        if (monthsSimulated > MAX_MONTHS_TO_SIMULATE) {
          console.error(
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

        const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();

        const netChange = (dailyNew - dailyProcessed) * daysInMonth;
        simulatedCarriedOver = Math.max(0, simulatedCarriedOver + netChange);

        currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
      }

      carriedOver = simulatedCarriedOver;
    }
  }

  // Received/processed by application date
  let receivedByAppDate: number, processedByAppDate: number;
  if (hasActualAppMonth) {
    const receivedInMonth = getMonthData(applicationMonth, '103000');
    const processedInMonth = getMonthData(applicationMonth, '300000');
    const daysInMonth = getDaysInMonth(applicationMonth);

    receivedByAppDate = (receivedInMonth / daysInMonth) * appDay;
    processedByAppDate = (processedInMonth / daysInMonth) * appDay;
  } else {
    receivedByAppDate = dailyNew * appDay;
    processedByAppDate = dailyProcessed * appDay;
  }

  // --------------------------------------------
  // Final Estimation
  // --------------------------------------------
  if (processingRate <= 0) return null;

  const estimatedDate = new Date();
  const queueAtApplication = Math.round(carriedOver + receivedByAppDate - processedByAppDate);
  const queuePosition = queueAtApplication - totalProcessedSinceApp;
  const daysRemaining = queuePosition / dailyProcessed;
  const estimatedDays = daysRemaining >= 0 ? Math.ceil(daysRemaining) : Math.floor(daysRemaining);

  estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

  // --------------------------------------------
  // Result Compilation
  // --------------------------------------------
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
    modelVariables: {
      C_prev: Number(carriedOver), // Applications carried forward from the previous month.
      N_app: Number(receivedByAppDate), // Estimated applications received prior to submission time.
      P_app: Number(processedByAppDate), // Estimated applications processed prior to submission time.
      R_daily: Number(dailyProcessed), // Average applications processed per day.
      Sigma_P: Number(totalProcessed), // Sum of processed applications used for calculating averages.
      Sigma_D: Number(totalDays), // Sum of days used for calculating averages.
      Q_app: Number(queueAtApplication), // Estimated queue position at submission time.
      C_proc: Number(confirmedProcessed), // Confirmed number of applications processed since submission.
      E_proc: Number(estimatedProcessed), // Estimated number of applications processed since last data point.
      Q_pos: Number(queuePosition), // Estimated position in the processing queue.
      D_rem: Number(daysRemaining), // Estimated days until processing completes.
    },
    isPastDue: queuePosition <= 0,
  };

  return {
    estimatedDate: queuePosition <= 0 ? estimatedDate : new Date(estimatedDate.setHours(0, 0, 0, 0)),
    details: calculationDetails,
  };
};
