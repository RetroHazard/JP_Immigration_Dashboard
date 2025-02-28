// src/components/charts/BureauDistributionRingChart.tsx
import React, { useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { bureauOptions } from '../../constants/bureauOptions';
import { ImmigrationChartData } from '../common/ChartComponents';

ChartJS.register(ArcElement, Tooltip, Legend);

export const BureauDistributionRingChart: React.FC<ImmigrationChartData> = ({ data, filters, isDarkMode }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1');

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
        (entry) => selectedMonths.includes(entry.month) && (filters.type === 'all' || entry.type === filters.type),
      ),
    [data, selectedMonths, filters.type],
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
    [filteredData],
  );

  // Chart options with percentage tooltip
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
    elements: {
      arc: {
        backgroundColor: (ctx: any) => {
          const bureau = bureauOptions.find((b) => b.value === bureauData[ctx.dataIndex]?.id);
          return bureau?.background || 'rgba(100, 116, 139, 0.4)'; // Fallback to Slate
        },
        borderColor: (ctx: any) => {
          const bureau = bureauOptions.find((b) => b.value === bureauData[ctx.dataIndex]?.id);
          return bureau?.border || 'rgba(100, 116, 139, 1)'; // Fallback to Slate
        },
        borderWidth: 1,
      },
    },
    plugins: {
      legend: {
        position: 'left' as const,
        labels: {
          color: isDarkMode ? '#fff' : '#000',
          filter: (item: any) => item.text !== '0',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0.0';
            return `${context.label}: ${percentage}%`;
          },
        },
      },
    },
  };

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
      <div className="chart-container">
        <Doughnut
          data={{
            labels: bureauData.map((b) => b.label),
            datasets: [{ data: bureauData.map((b) => b.value) }],
          }}
          options={options}
        />
      </div>
    </div>
  );
};
