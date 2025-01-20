// utils/dataTransform.js
export const transformData = (rawData) => {
    if (!rawData?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE) {
        return [];
    }

    const values = rawData.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE;

    return values.map(entry => ({
        month: entry['@time'].substring(0, 4) + '-' + entry['@time'].substring(8, 10),
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
        pending
    };
};

const sumByStatus = (data, statusCode) => {
    return data
        .filter(entry => entry.status === statusCode)
        .reduce((sum, entry) => sum + entry.value, 0);
};
