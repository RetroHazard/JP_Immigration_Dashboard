// utils/dataTransform.js
export const transformData = (rawData) => {
  if (!rawData?.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE) {
    return [];
  }

  const values = rawData.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE;

  return values.map((entry) => ({
    month: entry['@time'].substring(0, 4) + '-' + entry['@time'].substring(8, 10),
    bureau: entry['@cat03'],
    type: entry['@cat02'],
    value: parseInt(entry['$']),
    status: entry['@cat01'],
  }));
};
