// components/BureauDistributionRingChart.jsx
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { bureauOptions } from '../../constants/bureauOptions';
import { bureauColours } from '../../constants/bureauColours';

ChartJS.register(ArcElement, Tooltip, Legend);

export const BureauDistributionRingChart = ({ data, filters, isDarkMode }) => {
  // Get latest month from data
  const latestMonth = useMemo(() => {
    if (!data?.length) return '2024-11';
    const months = [...new Set(data.map((entry) => entry.month))].sort();
    return months[months.length - 1];
  }, [data]);

  // Filter data for latest month and selected type
  const filteredData = useMemo(
    () =>
      data.filter((entry) => entry.month === latestMonth && (filters.type === 'all' || entry.type === filters.type)),
    [data, latestMonth, filters.type]
  );

  const bureauData = useMemo(
    () =>
      bureauOptions
        .filter((b) => b.value !== 'all')
        .map((bureau) => ({
          label: bureau.label,
          value: filteredData
            .filter((d) => d.bureau === bureau.value)
            .reduce((sum, d) => {
              if (d.status === '102000' || d.status === '103000') {
                return sum + d.value; // Add received applications
              } else if (d.status === '300000') {
                return sum - d.value; // Subtract processed applications
              }
              return sum;
            }, 0),
        }))
        .filter((b) => b.value > 0), // Exclude negative/zero values
    [filteredData]
  );

  return (
    <div className="card-content">
      <div className="mb-4 flex h-full items-center justify-between">
        <div className="section-title">Bureau Distribution ({latestMonth})</div>
      </div>
      <div className="chart-container">
        <Doughnut
          data={{
            labels: bureauData.map((b) => b.label),
            datasets: [
              {
                data: bureauData.map((b) => b.value),
                backgroundColor: bureauData.map(
                  (b) => bureauColours[bureauOptions.find((bo) => bo.label === b.label)?.value]?.background || '#94a3b8'
                ),
                borderColor: bureauData.map(
                  (b) => bureauColours[bureauOptions.find((bo) => bo.label === b.label)?.value]?.border || '#64748b'
                ),
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '45%',
            plugins: {
              legend: {
                position: 'left',
                labels: {
                  color: isDarkMode ? '#fff' : '#000',
                  filter: (item) => item.text !== '0',
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.label}: ${context.parsed.toLocaleString()}`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};
