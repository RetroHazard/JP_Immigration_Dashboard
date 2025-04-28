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
  // Configuration Constants
  // --------------------------------------------
  const minMonths = 3;
  const maxBackwardMonths = 3;

  // --------------------------------------------
  // Data Filtering and Preparation
  // --------------------------------------------
  const { bureau, type, applicationDate } = details;
  const filteredData = data.filter((entry) => entry.bureau === bureau && entry.type === type);
  if (filteredData.length === 0) return null;

  // Get sorted unique months from filtered data
  const months = [...new Set(filteredData.map((entry) => entry.month))].sort();
  const lastAvailableMonth = months[months.length - 1];
  const effectiveAppDate = applicationDate > lastAvailableMonth ? lastAvailableMonth : applicationDate;

  // Select relevant months for rate calculations
  let selectedMonths = months.filter((month) => month >= effectiveAppDate);
  if (selectedMonths.length < minMonths) {
    const beforeMonths = months.filter((month) => month < effectiveAppDate);
    const needed = Math.min(minMonths - selectedMonths.length, maxBackwardMonths);
    selectedMonths = [...beforeMonths.slice(-needed), ...selectedMonths];
  }

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
  // Historical Data Detection
  // --------------------------------------------
  const hasActualAppMonth = months.includes(applicationMonth);
  const hasActualPrevMonth = months.includes(prevMonth);

  // --------------------------------------------
  // Queue Position Calculations
  // --------------------------------------------
  // Current queue state calculations
  const lastAvailableDate = new Date(
    Date.UTC(parseInt(lastAvailableMonth.split('-')[0]), parseInt(lastAvailableMonth.split('-')[1]) - 1, 1)
  );
  lastAvailableDate.setMonth(lastAvailableDate.getMonth() + 1);
  lastAvailableDate.setDate(0);
  const predictionDays = getDaysBetweenDates(lastAvailableDate, new Date());

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
    carriedOver =
      getMonthData(prevMonth, '102000') + getMonthData(prevMonth, '103000') - getMonthData(prevMonth, '300000');
  } else {
    const historicalMonths = months.filter((m) => m < applicationMonth);
    if (historicalMonths.length) {
      const lastHistoricalMonth = historicalMonths.slice(-1)[0];

      // Calculate initial carriedOver from last historical month
      let simulatedCarriedOver =
        getMonthData(lastHistoricalMonth, '102000') +
        getMonthData(lastHistoricalMonth, '103000') -
        getMonthData(lastHistoricalMonth, '300000');

      // Calculate the exact number of full months between last historical month and application month
      const lastHistoricalDate = new Date(lastHistoricalMonth + '-01');
      const appMonthDate = new Date(applicationMonth + '-01');

      const currentMonthDate = new Date(lastHistoricalDate);
      currentMonthDate.setMonth(currentMonthDate.getMonth() + 1); // Start from next month

      while (currentMonthDate < appMonthDate) {
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
    modelVariables: {
      C_prev: Number(carriedOver), // Applications carried forward from the previous month.
      N_app: Number(receivedByAppDate), // Estimated applications received prior to submission time.
      P_app: Number(processedByAppDate), // Estimated applications processed prior to submission time.
      R_daily: Number(dailyProcessed), // Average applications processed per day.
      Sigma_P: Number(totalProcessed), // Sum of processed applications used for calculating averages.
      Sigma_D: Number(totalDays), // Sum of days used for calculating averages.
      Q_app: Number(queueAtApplication), // Estimated queue position at submission time.
      C_proc: Number(confirmedProcessed), // Confirmed number of applications processed since submission.
      E_proc: Number(estimatedProcessed), // Estimated number of applications processed since submission.
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
