// components/MonthlyRadarChart.jsx
import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, Filler, Legend, LineElement, PointElement, RadialLinearScale, Tooltip } from 'chart.js';
import { bureauOptions } from '../../constants/bureauOptions';
import { applicationOptions } from '../../constants/applicationOptions';
import { bureauColours } from '../../constants/bureauColours';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export const MonthlyRadarChart = ({ data, filters, isDarkMode }) => {
  // Automatically determine latest month from data
  const latestMonth = useMemo(() => {
    if (!data || data.length === 0) return '2024-11'; // Fallback
    const months = [...new Set(data.map((entry) => entry.month))].sort();
    return months[months.length - 1];
  }, [data]);

  // Filter data for latest month and selected bureau
  const filteredData = useMemo(
    () =>
      data.filter(
        (entry) => entry.month === latestMonth && (filters.bureau === 'all' || entry.bureau === filters.bureau)
      ),
    [data, latestMonth, filters.bureau]
  );

  // Calculate percentages for each bureau/type combination
  const { datasets, maxValue } = useMemo(() => {
    let max = 0;

    // Nationwide view - create dataset per bureau
    if (filters.bureau === 'all') {
      const bureauData = bureauOptions
        .filter((b) => b.value !== 'all')
        .map((bureau) => {
          const bureauEntries = filteredData.filter((d) => d.bureau === bureau.value);
          const total = bureauEntries.reduce((sum, d) => sum + d.value, 0);

          const percentages = applicationOptions
            .filter((t) => t.value !== 'all')
            .map((type) => {
              const typeValue = bureauEntries.filter((d) => d.type === type.value).reduce((sum, d) => sum + d.value, 0);
              const percent = total > 0 ? (typeValue / total) * 100 : 0;
              max = Math.max(max, percent);
              return percent;
            });

          return {
            label: bureau.label,
            data: percentages,
            borderColor: bureauColours[bureau.value]?.border || '#94a3b8',
            backgroundColor: bureauColours[bureau.value]?.background || '#94a3b860',
            pointRadius: percentages.map((p) => (p > 0 ? 3 : 0)),
            pointHoverRadius: percentages.map((p) => (p > 0 ? 5 : 0)),
          };
        });

      return { datasets: bureauData, maxValue: max };

      // Single bureau view
    } else {
      const total = filteredData.reduce((sum, d) => sum + d.value, 0);
      const percentages = applicationOptions
        .filter((t) => t.value !== 'all')
        .map((type) => {
          const typeValue = filteredData.filter((d) => d.type === type.value).reduce((sum, d) => sum + d.value, 0);
          const percent = total > 0 ? (typeValue / total) * 100 : 0;
          max = Math.max(max, percent);
          return percent;
        });

      return {
        datasets: [
          {
            label: bureauOptions.find((b) => b.value === filters.bureau)?.label,
            data: percentages,
            borderColor: bureauColours[filters.bureau]?.border || '#3B82F6',
            backgroundColor: bureauColours[filters.bureau]?.background || '#3B82F620',
            pointRadius: percentages.map((p) => (p > 0 ? 5 : 0)),
            pointHoverRadius: percentages.map((p) => (p > 0 ? 5 : 0)),
          },
        ],
        maxValue: max,
      };
    }
  }, [filteredData, filters.bureau]);

  // Auto-adjust scale with 10% buffer
  const scaleMax = Math.ceil(maxValue * 1.1);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: scaleMax,
        ticks: {
          display: false,
          precision: 0,
          color: isDarkMode ? '#fff' : '#000',
          backdropColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
        },
        grid: { color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
        pointLabels: {
          color: isDarkMode ? '#fff' : '#000',
          font: { size: 12 },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        position: 'top',
        labels: {
          color: isDarkMode ? '#fff' : '#000',
          boxWidth: 10,
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw.toFixed(1);
            return `${label}: ${value}%`;
          },
        },
      },
    },
  };

  return (
    <div className="card-content">
      <div className="mb-4 flex h-full items-center justify-between">
        <div className="section-title">Category Distribution</div>
      </div>
      <div className="chart-container">
        <Radar
          data={{
            labels: applicationOptions.filter((t) => t.value !== 'all').map((t) => t.label),
            datasets,
          }}
          options={options}
        />
      </div>
    </div>
  );
};
