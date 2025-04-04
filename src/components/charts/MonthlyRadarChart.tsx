import { useMemo, useState } from 'react';

import { Chart as ChartJS, Filler, Legend, LineElement, PointElement, RadialLinearScale, Tooltip } from 'chart.js';
import type React from 'react';
import { Radar } from 'react-chartjs-2';

import { applicationOptions } from '../../constants/applicationOptions';
import { bureauOptions } from '../../constants/bureauOptions';
import type { ImmigrationChartData } from '../common/ChartComponents';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export const MonthlyRadarChart: React.FC<ImmigrationChartData> = ({ data, filters, isDarkMode }) => {
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

  // Filter data for selected months and bureau
  const filteredData = useMemo(
    () =>
      data.filter(
        (entry) => selectedMonths.includes(entry.month) && (filters.bureau === 'all' || entry.bureau === filters.bureau)
      ),
    [data, selectedMonths, filters.bureau]
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
            borderColor: bureau.border || '#94a3b8',
            backgroundColor: bureau.background || '#94a3b860',
            pointRadius: percentages.map((p) => (p > 0 ? 3 : 0)),
            pointHoverRadius: percentages.map((p) => (p > 0 ? 5 : 0)),
          };
        });

      return { datasets: bureauData, maxValue: max };

      // Single bureau view
    } else {
      const total = filteredData.reduce((sum, d) => sum + d.value, 0);
      const bureau = bureauOptions.find((b) => b.value === filters.bureau);
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
            borderColor: bureau?.border || '#3B82F6',
            backgroundColor: bureau?.background || '#3B82F620',
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
        grid: { color: isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' },
        pointLabels: {
          color: isDarkMode ? '#fff' : '#000',
          font: { size: 12 },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
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
      <div className="chart-container">
        <Radar
          data={{
            labels: applicationOptions.filter((t) => t.value !== 'all').map((t) => t.short),
            datasets,
          }}
          options={options}
        />
      </div>
    </div>
  );
};
