// src/components/charts/BureauPerformanceBubbleChart.jsx
import React, { useMemo, useState } from 'react';
import { Bubble } from 'react-chartjs-2';
import { Chart as ChartJS, Legend, LinearScale, PointElement, Title, Tooltip } from 'chart.js';
import { bureauOptions } from '../../constants/bureauOptions';
import { applicationOptions } from '../../constants/applicationOptions';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

export const BureauPerformanceBubbleChart = ({ data, filters, isDarkMode }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1');

  const sortedMonths = useMemo(() => {
    if (!data?.length) return [];
    return [...new Set(data.map((entry) => entry.month))].sort();
  }, [data]);

  const selectedMonths = useMemo(() => {
    if (selectedPeriod === 'all') return sortedMonths;
    const period = parseInt(selectedPeriod, 10);
    return sortedMonths.slice(-period);
  }, [selectedPeriod, sortedMonths]);

  const filteredData = useMemo(() => {
    return data.filter(
      (entry) =>
        selectedMonths.includes(entry.month) &&
        (filters.bureau === 'all' || entry.bureau === filters.bureau) &&
        (filters.type === 'all' || entry.type === filters.type) &&
        ['103000', '300000'].includes(entry.status)
    );
  }, [data, selectedMonths, filters.bureau, filters.type]);

  const chartData = useMemo(() => {
    const bureaus = bureauOptions.filter((b) => b.value !== 'all');
    const appTypes = applicationOptions.filter((t) => t.value !== 'all');

    // Calculate maximum processed value
    let maxProcessed = 0;
    bureaus.forEach((bureau) => {
      appTypes.forEach((type) => {
        const processed = filteredData
          .filter((d) => d.bureau === bureau.value && d.type === type.value)
          .filter((d) => d.status === '300000')
          .reduce((sum, d) => sum + d.value, 0);
        if (processed > maxProcessed) maxProcessed = processed;
      });
    });

    const AREA_SCALING_FACTOR = 15000; // Adjust based on visual requirements
    const sizeScale = maxProcessed > 0 ? Math.sqrt(AREA_SCALING_FACTOR / (Math.PI * maxProcessed)) : 0;

    return bureaus.map((bureau) => {
      const bureauDataPoints = appTypes
        .map((type) => {
          const bureauTypeData = filteredData.filter((d) => d.bureau === bureau.value && d.type === type.value);

          const totalReceived = bureauTypeData
            .filter((d) => d.status === '103000')
            .reduce((sum, d) => sum + d.value, 0);

          const totalProcessed = bureauTypeData
            .filter((d) => d.status === '300000')
            .reduce((sum, d) => sum + d.value, 0);

          const efficiency = totalReceived > 0 ? (totalProcessed / totalReceived) * 100 : 0;

          return {
            x: totalReceived,
            y: efficiency,
            r: Math.sqrt(totalProcessed) * sizeScale, // Controls bubble size
            label: type.label,
            processed: totalProcessed,
            bureau: bureau.label,
          };
        })
        .filter((point) => point.x > 0); // Exclude points with no data

      return {
        label: bureau.label,
        data: bureauDataPoints,
        backgroundColor: bureau.background,
        borderColor: bureau.border,
        borderWidth: 1,
      };
    });
  }, [filteredData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Volume Received',
          color: isDarkMode ? '#fff' : '#000',
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#000',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Completion Rate (%)',
          color: isDarkMode ? '#fff' : '#000',
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#000',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label(context) {
            const raw = context.raw || {};
            return [
              `${raw.bureau} - ${raw.label}`, // Use bureau from raw data
              `Received: ${raw.x.toLocaleString()}`,
              `Processed: ${raw.processed.toLocaleString()}`,
              `Efficiency: ${raw.y.toFixed(2)}%`,
            ];
          },
        },
      },
      legend: { display: false },
    },
  };

  return (
    <div className="card-content">
      <div className="mb-4 flex h-full items-center justify-between">
        <div className="section-title">Processing Efficiency</div>
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
        <Bubble data={{ datasets: chartData }} options={options} />
      </div>
    </div>
  );
};
