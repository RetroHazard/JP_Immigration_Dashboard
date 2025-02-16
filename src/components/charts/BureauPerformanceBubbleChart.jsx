// components/charts/BureauPerformanceBubbleChart.jsx
import React, { useMemo } from 'react';
import { Bubble } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend, Title } from 'chart.js';
import { bureauOptions } from '../../constants/bureauOptions';
import { bureauColours } from '../../constants/bureauColours';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

export const BureauPerformanceBubbleChart = ({ data, filters, isDarkMode }) => {
  // Get latest month from data
  const latestMonth = useMemo(() => {
    if (!data?.length) return '2024-11';
    const months = [...new Set(data.map((entry) => entry.month))].sort();
    return months[months.length - 1];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(
      (entry) =>
        entry.month === latestMonth &&
        (filters.type === 'all' || entry.type === filters.type) &&
        ['103000', '300000'].includes(entry.status)
    );
  }, [data, latestMonth, filters.type]);

  const chartData = useMemo(() => {
    return bureauOptions
      .filter((b) => b.value !== 'all')
      .map((bureau) => {
        const bureauData = filteredData.filter((d) => d.bureau === bureau.value);

        // Calculate total received applications
        const totalReceived = bureauData.filter((d) => d.status === '103000').reduce((sum, d) => sum + d.value, 0);

        // Calculate total processed applications
        const totalProcessed = bureauData.filter((d) => d.status === '300000').reduce((sum, d) => sum + d.value, 0);

        // Calculate processing efficiency
        const efficiency = totalReceived > 0 ? (totalProcessed / totalReceived) * 100 : 0;

        console.log('Bureau Value:', bureau.value);
        console.log('Available Bureau Colours:', bureauColours);

        return {
          label: bureau.label,
          x: totalReceived,
          y: efficiency,
          r: Math.sqrt(totalProcessed) * 0.8,
          backgroundColor: bureauColours[bureau.value] || 'rgba(75, 192, 192, 0.6)', // Default fallback
          borderColor: bureauColours[bureau.value] || 'rgba(75, 192, 192, 1)', // Default fallback
        };
      })
      .filter((item) => item.x > 0); // Exclude zero values
  }, [filteredData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Monthly Application Volume',
          color: isDarkMode ? '#fff' : '#000',
        },
        ticks: {
          beginAtZero: true,
          color: isDarkMode ? '#fff' : '#000',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Processing Completion Rate (%)',
          color: isDarkMode ? '#fff' : '#000',
        },
        ticks: {
          beginAtZero: true,
          max: 100, // Efficiency is a percentage (0-100)
          color: isDarkMode ? '#fff' : '#000',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label(context) {
            const raw = context.raw || {};
            const label = raw.label || 'Unknown Bureau';
            const x = raw.x || 0;
            const y = raw.y || 0;
            const z = raw.z || 0;
            const r = raw.r || 0;

            // Ensure all values are numbers
            return [
              `${label}`,
              `Monthly Received: ${Number(x).toLocaleString()}`,
              `Monthly Processed: ${Number(z).toLocaleString()}`,
              `Efficiency (%): ${Number(y).toFixed(2)}%`,
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
        <div className="section-title">Processing Efficiency ({latestMonth})</div>
      </div>
      <div className="chart-container">
        <Bubble
          data={{
            datasets: chartData.map((item) => ({
              label: item.bureau,
              data: [{ x: item.x, y: item.y, r: item.r }],
              backgroundColor: bureauColours[item.bureau] || 'rgba(75, 192, 192, 0.6)',
              borderColor: bureauColours[item.bureau] || 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            })),
          }}
          options={options}
        />
      </div>
    </div>
  );
};
