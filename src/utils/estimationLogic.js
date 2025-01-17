// utils/estimationLogic.js
export const calculateEstimatedTime = (data, applicationDetails) => {
    const { bureau, type, applicationDate } = applicationDetails;

    const monthlyAverage = calculateMonthlyProcessingRate(data, bureau, type);
    const pendingApplications = getPendingApplicationsCount(data, bureau, type);
    const applicationsAhead = estimateApplicationsAhead(
        data,
        applicationDate,
        bureau,
        type
    );

    const estimatedDays = Math.ceil(applicationsAhead / (monthlyAverage / 30));
    return addBusinessDays(new Date(), estimatedDays);
};
