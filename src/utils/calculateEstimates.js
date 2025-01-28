export const calculateEstimatedDate = (data, details) => {
  if (!data || !details.bureau || !details.type || !details.applicationDate) {
    return null;
  }

  const minMonths = 3;
  const maxMonths = 12;
  const maxBackwardMonths = 3;

  const { bureau, type, applicationDate } = details;

  // Filter data for specific bureau and type
  const filteredData = data.filter((entry) => entry.bureau === bureau && entry.type === type);

  if (filteredData.length === 0) return null;

  // Get unique months from filtered data
  const months = [...new Set(filteredData.map((entry) => entry.month))].sort();
  const lastAvailableMonth = months[months.length - 1];

  // If application date is after last available data, use last available month's data
  const effectiveApplicationDate = applicationDate > lastAvailableMonth ? lastAvailableMonth : applicationDate;

  // Split months into before and after application date
  const beforeMonths = months.filter((month) => month < effectiveApplicationDate);
  const afterMonths = months.filter((month) => month >= effectiveApplicationDate);

  // Start with forward-looking months
  let selectedMonths = afterMonths.slice(0, maxMonths);

  // If we don't have minimum months, add backward data (up to 3 months)
  if (selectedMonths.length < minMonths) {
    const needed = Math.min(minMonths - selectedMonths.length, maxBackwardMonths);
    selectedMonths = [...beforeMonths.slice(-needed), ...selectedMonths];
  }

  if (selectedMonths.length === 0) return null;

  // Find the first month after application date or use last available month
  let applicationMonth;
  if (applicationDate > lastAvailableMonth) {
    // For future dates, use the last available month's data
    applicationMonth = lastAvailableMonth;
  } else {
    // For past dates, find the first month after application
    applicationMonth = months.find((month) => month > applicationDate) || lastAvailableMonth;
  }

  if (!applicationMonth) return null;

  // Calculate applications processed since user's application date
  const confirmedProcessed = filteredData
    .filter((entry) => entry.month > applicationDate && entry.month <= lastAvailableMonth && entry.status === '300000')
    .reduce((sum, entry) => sum + entry.value, 0);

  // Get total applications in queue at application month
  const totalInQueue = filteredData
    .filter((entry) => entry.month === applicationMonth && entry.status === '102000')
    .reduce((sum, entry) => sum + entry.value, 0);

  // Calculate averages from last 3 months
  const lastThreeMonths = months.slice(-3);
  const averages = lastThreeMonths.reduce(
    (acc, month) => {
      const monthData = filteredData.filter((entry) => entry.month === month);
      return {
        newApplications:
          acc.newApplications +
          monthData.filter((entry) => entry.status === '103000').reduce((sum, entry) => sum + entry.value, 0),
        processed:
          acc.processed +
          monthData.filter((entry) => entry.status === '300000').reduce((sum, entry) => sum + entry.value, 0),
      };
    },
    { newApplications: 0, processed: 0 }
  );

  const monthlyNewAverage = averages.newApplications / 3;
  const monthlyProcessedAverage = averages.processed / 3;
  const netChangePerMonth = monthlyNewAverage - monthlyProcessedAverage;

  // Calculate prediction period
  const lastDataDate = new Date(lastAvailableMonth);
  const today = new Date();
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const fullMonths =
    (today.getFullYear() - lastDataDate.getFullYear()) * 12 + (today.getMonth() - lastDataDate.getMonth() - 1);
  const partialMonth = today.getDate() / daysInCurrentMonth;
  const predictionMonths = fullMonths + partialMonth;

  // Calculate predicted processed applications for missing months
  const predictedProcessed = predictionMonths * monthlyProcessedAverage;

  // Calculate months between application date and current date
  const applicationDateTime = new Date(applicationDate);
  const monthsSinceApplication =
    (today.getFullYear() - applicationDateTime.getFullYear()) * 12 +
    (today.getMonth() - applicationDateTime.getMonth() - 1) +
    today.getDate() / daysInCurrentMonth;

  // Adjust predicted processing based on application date
  const applicablePredictedProcessed =
    applicationDate > lastAvailableMonth ? monthlyProcessedAverage * monthsSinceApplication : predictedProcessed;

  // Total processed applications since application date
  const totalProcessedSinceApplication = Math.max(0, Math.round(confirmedProcessed + applicablePredictedProcessed));

  // Calculate adjusted queue total
  const predictedChange = netChangePerMonth * predictionMonths;
  const adjustedQueueTotal = Math.round(totalInQueue + predictedChange);

  // Calculate remaining applications ahead in queue
  const remainingAhead = Math.max(0, Math.round(adjustedQueueTotal - totalProcessedSinceApplication));

  // Calculate processing rate using trend data
  const totalProcessed = selectedMonths.reduce((total, month) => {
    const monthProcessed = filteredData
      .filter((entry) => entry.month === month && entry.status === '300000')
      .reduce((sum, entry) => sum + entry.value, 0);
    return total + monthProcessed;
  }, 0);

  const monthlyProcessingRate = Math.round(totalProcessed / selectedMonths.length);

  if (monthlyProcessingRate <= 0) return null;

  // Calculate estimated months based on remaining queue position
  const estimatedMonths = Math.ceil(remainingAhead / monthlyProcessingRate);

  // Calculate estimated completion date from application date
  const estimatedDate = new Date(applicationDateTime);
  if (remainingAhead <= 0) {
    // For past-due applications, calculate historical completion date
    const processingTime = Math.ceil(totalInQueue / monthlyProcessingRate);
    estimatedDate.setMonth(estimatedDate.getMonth() + processingTime);
  } else {
    // For active applications, calculate forward from current date
    const estimatedMonths = Math.ceil(remainingAhead / monthlyProcessingRate);
    estimatedDate.setTime(today.getTime());
    estimatedDate.setMonth(estimatedDate.getMonth() + estimatedMonths);
  }

  const calculationDetails = {
    adjustedQueueTotal,
    monthlyRate: monthlyProcessingRate,
    processedSince: totalProcessedSinceApplication,
    queuePosition: remainingAhead,
    estimatedMonths: estimatedMonths,
    isPastDue: remainingAhead <= 0,
  };

  return {
    estimatedDate,
    details: calculationDetails,
  };
};
