// utils/dataTransform.js
export const transformData = (rawData) => {
    const values = rawData.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE;

    return values.map(entry => ({
        month: entry['@time'].slice(0, 7), // Format: YYYY-MM
        bureau: entry['@cat03'],
        type: entry['@cat02'],
        value: parseInt(entry['$']),
        status: entry['@cat01']
    }));
};

export const matchesFilters = (entry, filters) => {
    const matchesBureau = filters.bureau === 'all' || entry.bureau === filters.bureau;
    const matchesType = filters.type === 'all' || entry.type === filters.type;
    const matchesMonth = !filters.month || entry.month === filters.month;

    return matchesBureau && matchesType && matchesMonth;
};

export const getCurrentStats = (data, filters) => {
    if (!data || data.length === 0) return null;

    // Get the most recent month's data
    const months = [...new Set(data.map(entry => entry.month))];
    const currentMonth = months.sort().reverse()[0]; // Latest month

    const currentMonthData = data.filter(entry =>
        entry.month === currentMonth &&
        matchesFilters(entry, filters)
    );

    const totalApplications = sumByStatus(currentMonthData, '100000');
    const processed = sumByStatus(currentMonthData, '300000');
    const approved = sumByStatus(currentMonthData, '301000');
    const pending = totalApplications - processed;

    return {
        totalApplications,
        processed,
        approved,
        pending,
    };
};

const sumByStatus = (data, statusCode) => {
    return data
        .filter(entry => entry.status === statusCode)
        .reduce((sum, entry) => sum + entry.value, 0);
};

export const aggregateByBureau = (data, filters) => {
    const currentStats = getCurrentStats(data, filters);
    if (!currentStats) return {};

    return data.reduce((acc, entry) => {
        if (matchesFilters(entry, filters) && entry.status === '100000') {
            const key = `${entry.bureau}-${entry.type}`;
            acc[key] = (acc[key] || 0) + entry.value;
        }
        return acc;
    }, {});
};

export const calculateApprovalRate = (data, filters) => {
    const stats = getCurrentStats(data, filters);
    if (!stats || !stats.processed) return 0;

    return (stats.approved / stats.processed * 100).toFixed(1);
};
