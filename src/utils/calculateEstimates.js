export const calculateEstimatedDate = (data, details) => {
  if (!data || !details.bureau || !details.type || !details.applicationDate) {
    return null;
  }

  const minMonths = 3;
  const maxBackwardMonths = 3;

  const { bureau, type, applicationDate } = details;
  const filteredData = data.filter((entry) => entry.bureau === bureau && entry.type === type);
  if (filteredData.length === 0) return null;

  // Helper to sum values by status and month condition
  const sumByStatus = (status, monthCondition) =>
    filteredData
      .filter((entry) => entry.status === status && monthCondition(entry.month))
      .reduce((sum, entry) => sum + entry.value, 0);

  // Get unique sorted months and determine key dates
  const months = [...new Set(filteredData.map((entry) => entry.month))].sort();
  const lastAvailableMonth = months[months.length - 1];
  const effectiveApplicationDate = applicationDate > lastAvailableMonth ? lastAvailableMonth : applicationDate;

  // Select relevant months for calculations
  let selectedMonths = months.filter((month) => month >= effectiveApplicationDate);
  if (selectedMonths.length < minMonths) {
    const beforeMonths = months.filter((month) => month < effectiveApplicationDate);
    const needed = Math.min(minMonths - selectedMonths.length, maxBackwardMonths);
    selectedMonths = [...beforeMonths.slice(-needed), ...selectedMonths];
  }

  // Determine if daily estimation is possible (6+ months of data)
  const useDailyEstimate = selectedMonths.length >= 6;

  // --- Core Calculation Logic ---
  const getDaysInMonth = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const getDaysBetweenDates = (startDate, endDate) => {
    const timeDiff = endDate - startDate;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  // Declare variables in parent scope
  let processingRate, netChangePerDay, dailyProcessed, monthlyProcessedAverage, predictionMonths;

  if (useDailyEstimate) {
    // Daily rate calculation
    const totalNew = sumByStatus('103000', (m) => selectedMonths.includes(m));
    const totalProcessed = sumByStatus('300000', (m) => selectedMonths.includes(m));
    const totalDays = selectedMonths.reduce((sum, month) => sum + getDaysInMonth(month), 0);

    dailyProcessed = totalProcessed / totalDays;
    const dailyNew = totalNew / totalDays;
    netChangePerDay = dailyNew - dailyProcessed;
    processingRate = dailyProcessed;

    // Days since last available month
    const lastAvailableDate = new Date(`${lastAvailableMonth}-01`);
    lastAvailableDate.setMonth(lastAvailableDate.getMonth() + 1);
    lastAvailableDate.setDate(0);
    predictionMonths = getDaysBetweenDates(lastAvailableDate, new Date());
  } else {
    // Monthly rate calculation
    const lastThreeMonths = months.slice(-3);
    const avgInitial = { newApplications: 0, processed: 0 };
    const averages = lastThreeMonths.reduce(
      (acc, month) => ({
        newApplications: acc.newApplications + sumByStatus('103000', (m) => m === month),
        processed: acc.processed + sumByStatus('300000', (m) => m === month),
      }),
      avgInitial
    );
    const monthCount = lastThreeMonths.length || 1;
    const monthlyNewAverage = averages.newApplications / monthCount;
    monthlyProcessedAverage = averages.processed / monthCount;
    const netChangePerMonth = monthlyNewAverage - monthlyProcessedAverage;

    // Calculate prediction months
    const today = new Date();
    const lastDataDate = new Date(lastAvailableMonth);
    predictionMonths =
      (today.getFullYear() - lastDataDate.getFullYear()) * 12 +
      (today.getMonth() - lastDataDate.getMonth()) +
      today.getDate() / new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    processingRate = monthlyProcessedAverage;
    netChangePerDay = netChangePerMonth / 30; // Convert monthly net change to daily
  }

  // Common calculations
  const applicationDateTime = new Date(applicationDate);
  const confirmedProcessed = sumByStatus('300000', (m) => m > applicationDate && m <= lastAvailableMonth);
  const totalInQueue = sumByStatus(
    '102000',
    (m) =>
      m ===
      (applicationDate > lastAvailableMonth
        ? lastAvailableMonth
        : months.find((m) => m > applicationDate) || lastAvailableMonth)
  );

  // Calculate applicable predicted processed
  let applicablePredictedProcessed;
  if (useDailyEstimate) {
    const daysSinceApplication = getDaysBetweenDates(applicationDateTime, new Date());
    applicablePredictedProcessed =
      applicationDate > lastAvailableMonth ? dailyProcessed * daysSinceApplication : dailyProcessed * predictionMonths;
  } else {
    const monthsSinceApplication =
      (new Date().getFullYear() - applicationDateTime.getFullYear()) * 12 +
      (new Date().getMonth() - applicationDateTime.getMonth()) +
      new Date().getDate() / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    applicablePredictedProcessed =
      applicationDate > lastAvailableMonth
        ? monthlyProcessedAverage * monthsSinceApplication
        : monthlyProcessedAverage * predictionMonths;
  }

  // Total processed and queue adjustments
  const totalProcessedSinceApplication = Math.max(0, Math.round(confirmedProcessed + applicablePredictedProcessed));
  const adjustedQueueTotal = Math.round(
    totalInQueue + (useDailyEstimate ? netChangePerDay * predictionMonths : netChangePerDay * 30 * predictionMonths) // Convert daily net change back to monthly
  );
  const remainingAhead = Math.max(0, Math.round(adjustedQueueTotal - totalProcessedSinceApplication));

  // Estimate date
  if (processingRate <= 0) return null;
  const estimatedDate = new Date();

  if (useDailyEstimate) {
    const estimatedDays = Math.ceil(remainingAhead / processingRate);
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
  } else {
    const estimatedMonths = Math.ceil(remainingAhead / processingRate);
    estimatedDate.setMonth(estimatedDate.getMonth() + estimatedMonths);
  }

  // Compile details
  const calculationDetails = {
    adjustedQueueTotal,
    monthlyRate: useDailyEstimate ? Math.round(processingRate * 30) : Math.round(processingRate),
    processedSince: totalProcessedSinceApplication,
    queuePosition: remainingAhead,
    estimatedMonths: useDailyEstimate
      ? Math.ceil(remainingAhead / (processingRate * 30))
      : Math.ceil(remainingAhead / processingRate),
    useDailyEstimate,
    isPastDue: remainingAhead <= 0,
    ...(useDailyEstimate && { dailyRate: processingRate, estimatedDays: Math.ceil(remainingAhead / processingRate) }),
  };

  return {
    estimatedDate,
    details: calculationDetails,
  };
};
