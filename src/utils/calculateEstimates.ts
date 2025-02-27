// src/utils/calculateEstimates.ts
import { ImmigrationData } from '../hooks/useImmigrationData';

interface ApplicationDetails {
  bureau: string;
  type: string;
  applicationDate: string;
}

interface CalculationDetails {
  adjustedQueueTotal: number;
  queueAtApplication: number;
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
    R_new: number;
    R_daily: number;
    Delta_net: number;
    t_pred: number;
    Sigma_P: number;
    Sigma_D: number;
    Q_app: number;
    C_proc: number;
    P_proc: number;
    Q_adj: number;
    Q_pos: number;
    D_rem: number;
  };
  isPastDue: boolean;
}

interface EstimatedDateResult {
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
  const netChangePerDay = dailyNew - dailyProcessed;
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

  const totalInQueue = sumByStatus(
    '102000',
    (m) =>
      m ===
      (applicationDate > lastAvailableMonth
        ? lastAvailableMonth
        : months.find((m) => m > applicationDate) || lastAvailableMonth)
  );

  // --------------------------------------------
  // Predictive Calculations
  // --------------------------------------------
  const daysSinceApplication = getDaysBetweenDates(appDate, new Date());
  const predictedProcessed =
    applicationDate > lastAvailableMonth ? dailyProcessed * daysSinceApplication : dailyProcessed * predictionDays;

  const totalProcessedSinceApp = Math.round(confirmedProcessed + predictedProcessed);
  const adjustedQueueTotal = Math.round(totalInQueue + netChangePerDay * predictionDays);
  const remainingAhead = Math.round(adjustedQueueTotal - totalProcessedSinceApp);

  // --------------------------------------------
  // Queue at Application Date Calculation
  // --------------------------------------------
  const getMonthData = (month: string, status: string) =>
    filteredData.find((entry) => entry.month === month && entry.status === status)?.value || 0;

  // Carryover calculations
  let carriedOver = 0;
  if (hasActualPrevMonth) {
    carriedOver =
      getMonthData(prevMonth, '102000') + getMonthData(prevMonth, '103000') - getMonthData(prevMonth, '300000');
  } else {
    const historicalMonths = months.filter((m) => m < applicationMonth);
    if (historicalMonths.length) {
      carriedOver =
        getMonthData(historicalMonths.slice(-1)[0], '102000') +
        getMonthData(historicalMonths.slice(-1)[0], '103000') -
        getMonthData(historicalMonths.slice(-1)[0], '300000');
    }
  }

  // Received/processed by application date
  let receivedByAppDate, processedByAppDate;
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

  const queueAtApplication = Math.round(carriedOver + receivedByAppDate - processedByAppDate);

  // --------------------------------------------
  // Final Estimation
  // --------------------------------------------
  if (processingRate <= 0) return null;

  const estimatedDate = new Date();
  const daysRequired = remainingAhead / processingRate;
  const estimatedDays = daysRequired >= 0 ? Math.ceil(daysRequired) : Math.floor(daysRequired);

  estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);

  // --------------------------------------------
  // Result Compilation
  // --------------------------------------------
  const calculationDetails: CalculationDetails = {
    adjustedQueueTotal,
    queueAtApplication,
    totalProcessedSinceApp,
    carriedOver,
    dailyNew,
    dailyProcessed,
    appDay,
    totalProcessed,
    totalDays,
    modelVariables: {
      C_prev: Number(carriedOver), // Applications carried over from month prior to submission
      N_app: Number(receivedByAppDate), // New applications received prior to submission
      P_app: Number(processedByAppDate), // Applications processed prior to submission
      R_new: Number(dailyNew), // Application submissions per day
      R_daily: Number(dailyProcessed), // Applications processed per day
      Delta_net: Number(dailyNew - dailyProcessed), // Daily change in queue total
      t_pred: Number(predictionDays), // Number of days where prediction data is used
      Sigma_P: Number(totalProcessed), // Total number of applications processed since submission
      Sigma_D: Number(totalDays), // Total days in data since application month (inclusive)
      Q_app: Number(carriedOver + receivedByAppDate - processedByAppDate), // Estimated queue position at submission time
      C_proc: Number(confirmedProcessed), // Confirmed applications processed since submission time
      P_proc: Number(predictedProcessed), // Estimated applications processed since last data point
      Q_adj: Number(
        carriedOver + receivedByAppDate - processedByAppDate + (dailyNew - dailyProcessed) * predictionDays
      ), // Estimated current queue total
      Q_pos: Number(
        carriedOver +
          receivedByAppDate -
          processedByAppDate +
          (dailyNew - dailyProcessed) * predictionDays -
          totalProcessedSinceApp
      ), // Estimated queue position
      D_rem: Number(
        (carriedOver +
          receivedByAppDate -
          processedByAppDate +
          (dailyNew - dailyProcessed) * predictionDays -
          totalProcessedSinceApp) /
          dailyProcessed
      ), // Estimated days remaining to completion
    },
    isPastDue: remainingAhead <= 0,
  };

  return {
    estimatedDate: remainingAhead <= 0 ? estimatedDate : new Date(estimatedDate.setHours(0, 0, 0, 0)),
    details: calculationDetails,
  };
};