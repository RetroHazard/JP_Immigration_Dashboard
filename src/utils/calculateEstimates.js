export const calculateEstimatedDate = (data, details) => {
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
  const sumByStatus = (status, monthCondition) =>
    filteredData
      .filter((entry) => entry.status === status && monthCondition(entry.month))
      .reduce((sum, entry) => sum + entry.value, 0);

  const getDaysInMonth = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const getDaysBetweenDates = (start, end) => {
    const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    return Math.ceil((utcEnd - utcStart) / (1000 * 60 * 60 * 24));
  };

  const formatMonth = (date) => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

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

  const confirmedProcessed = sumByStatus('300000', (m) => m > applicationMonth) + Math.round(processedInAppMonth);

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
  const getMonthData = (month, status) =>
    filteredData.find((entry) => entry.month === month && entry.status === status)?.value || 0;

  // Carryover calculations
  let carriedOver = 0;
  if (hasActualPrevMonth) {
    carriedOver = getMonthData(prevMonth, '102000');
  } else {
    const historicalMonths = months.filter((m) => m < applicationMonth);
    if (historicalMonths.length) {
      carriedOver = getMonthData(historicalMonths.slice(-1)[0], '102000');
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
  const calculationDetails = {
    adjustedQueueTotal,
    queueAtApplication,
    calculationBreakdown: {
      carriedOver,
      receivedByAppDate: Math.round(receivedByAppDate),
      processedByAppDate: Math.round(processedByAppDate),
      dailyNew,
      predictionDays: Math.abs(predictionDays),
      dailyProcessed,
      appDay,
      totalProcessed,
      totalDays,
    },
    monthlyRate: Math.round(processingRate * 30),
    processedSince: totalProcessedSinceApp,
    queuePosition: remainingAhead,
    estimatedMonths: remainingAhead / (processingRate * 30),
    dailyRate: processingRate,
    estimatedDays: Math.abs(estimatedDays),
    isPastDue: remainingAhead <= 0,
  };

  return {
    estimatedDate: remainingAhead <= 0 ? estimatedDate : new Date(estimatedDate.setHours(0, 0, 0, 0)),
    details: calculationDetails,
  };
};
