// src/components/charts/GeographicDistributionChart.jsx
import React, { useMemo, useState } from 'react';
import { bureauOptions } from '../../constants/bureauOptions';
import { japanPrefectures } from '../../constants/japanPrefectures';

export const GeographicDistributionChart = ({ data, filters, isDarkMode }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1');

  // Get sorted list of unique months
  const sortedMonths = useMemo(() => {
    if (!data?.length) return [];
    return [...new Set(data.map((entry) => entry.month))].sort();
  }, [data]);

  // Determine months to include based on selected period
  const selectedMonths = useMemo(() => {
    if (selectedPeriod === 'all') return sortedMonths;
    const period = parseInt(selectedPeriod, 10);
    return sortedMonths.slice(-period);
  }, [selectedPeriod, sortedMonths]);

  // Filter data for selected months and type
  const filteredData = useMemo(
    () =>
      data.filter(
        (entry) => selectedMonths.includes(entry.month) && (filters.type === 'all' || entry.type === filters.type)
      ),
    [data, selectedMonths, filters.type]
  );

  // Calculate bureau data with aggregated values
  const bureauData = useMemo(
    () =>
      bureauOptions
        .filter((b) => b.value !== 'all')
        .map((bureau) => ({
          id: bureau.value,
          label: bureau.label,
          value: filteredData
            .filter((d) => d.bureau === bureau.value)
            .reduce((sum, d) => {
              if (d.status === '102000' || d.status === '103000') {
                return sum + d.value;
              } else if (d.status === '300000') {
                return sum + d.value;
              }
              return sum;
            }, 0),
        }))
        .filter((b) => b.value > 0),
    [filteredData]
  );

  return (
    <div className="card-content">
      <div className="mb-4 flex h-full items-center justify-between">
        <div className="section-title">Bureau Distribution</div>
        <select
          className="chart-filter-select"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="1">Latest</option>
          <option value="6">6 Months</option>
          <option value="12">12 Months</option>
          <option value="24">24 Months</option>
          <option value="36">36 Months</option>
          <option value="all">All Data</option>
        </select>
      </div>
      <div className="chart-container">CHART GOES HERE</div>
    </div>
  );
};
