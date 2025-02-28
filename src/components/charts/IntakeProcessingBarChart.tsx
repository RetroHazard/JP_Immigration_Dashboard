// src/components/charts/IntakeProcessingBarChart.tsx
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { ImmigrationChartData } from '../common/ChartComponents';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const IntakeProcessingBarChart: React.FC<ImmigrationChartData> = ({ data, filters, isDarkMode }) => {
  const [monthRange, setMonthRange] = useState(12);
  const [showAllMonths, setShowAllMonths] = useState(false);

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Old Applications',
        data: [],
      },
      {
        label: 'New Applications',
        data: [],
      },
      {
        label: 'Processed Applications',
        data: [],
      },
    ],
  });

  useEffect(() => {
    if (!data) return;

    // Get the most recent month from the data
    const endMonth = [...new Set(data.map((entry) => entry.month))].sort().reverse()[0];

    // Get all months from data
    const allMonths = [...new Set(data.map((entry) => entry.month))].sort();

    // Find index of the most recent month
    const endIndex = allMonths.indexOf(endMonth);
    if (endIndex === -1) return;

    // Get months based on range
    let months;
    if (showAllMonths) {
      months = allMonths;
    } else {
      const startIndex = Math.max(0, endIndex - (monthRange - 1));
      months = allMonths.slice(startIndex, endIndex + 1);
    }

    const monthlyStats = months.map((month) => {
      const monthData = data.filter((entry) => {
        const matchesMonth = entry.month === month;
        const matchesType = filters.type === 'all' || entry.type === filters.type;

        if (filters.bureau === 'all') {
          return entry.bureau === '100000' && matchesMonth && matchesType;
        }
        return entry.bureau === filters.bureau && matchesMonth && matchesType;
      });

      return {
        month,
        totalApplications: monthData.reduce((sum, entry) => (entry.status === '102000' ? sum + entry.value : sum), 0), // 受理_旧受 (Previously Received)
        processed: monthData.reduce((sum, entry) => (entry.status === '300000' ? sum + entry.value : sum), 0), // 処理済み (Processed)
        newApplications: monthData.reduce((sum, entry) => (entry.status === '103000' ? sum + entry.value : sum), 0), // 受理_新受 (Newly Received)
      };
    });

    const processedData = {
      labels: months,
      datasets: [
        {
          label: 'Old Applications',
          data: monthlyStats.map((stat) => stat.totalApplications),
          backgroundColor: 'rgba(54, 162, 245, 0.7)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 2,
          yAxisID: 'y',
          order: 1,
        },
        {
          label: 'New Applications',
          data: monthlyStats.map((stat) => stat.newApplications),
          backgroundColor: 'rgba(245, 179, 8, 0.7)',
          borderColor: 'rgb(234, 179, 8)',
          borderWidth: 2,
          yAxisID: 'y',
          order: 2,
        },
        {
          label: 'Processed Applications',
          data: monthlyStats.map((stat) => stat.processed),
          backgroundColor: 'rgba(34, 197, 94, 0.9)',
          borderColor: 'rgb(34, 220, 94)',
          borderWidth: 2,
          yAxisID: 'y2',
          barPercentage: 0.6,
          order: 0,
        },
      ],
    };

    setChartData(processedData);
  }, [data, filters, monthRange, showAllMonths]);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Month',
          color: isDarkMode ? '#fff' : '#000',
        },
        ticks: {
          minRotation: 45,
          maxRotation: 45,
          color: isDarkMode ? '#fff' : '#000',
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Application Count',
          color: isDarkMode ? '#fff' : '#000',
        },
        ticks: {
          suggestedMin: Math.min(...chartData.datasets.map((dataset) => Math.min(...dataset.data))),
          suggestedMax: Math.max(...chartData.datasets.map((dataset) => Math.max(...dataset.data))),
          color: isDarkMode ? '#fff' : '#000',
        },
        afterBuildTicks: (axis) => {
          axis.chart.scales.y2.options.min = axis.min;
          axis.chart.scales.y2.options.max = axis.max;
        },
        grid: {
          color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
      },
      y2: {
        display: false,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: false,
          padding: 10,
          color: isDarkMode ? '#fff' : '#000',
        },
      },
      tooltip: {
        mode: 'index' as const,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <div className="card-content">
      <div className="mb-4 flex h-full items-center justify-between">
        <div className="section-title">Intake and Processing</div>
        <select
          className="chart-filter-select"
          value={showAllMonths ? 'all' : monthRange}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'all') {
              setShowAllMonths(true);
            } else {
              setShowAllMonths(false);
              setMonthRange(parseInt(value));
            }
          }}
        >
          <option value="6">6 Months</option>
          <option value="12">12 Months</option>
          <option value="24">24 Months</option>
          <option value="36">36 Months</option>
          <option value="all">All Data</option>
        </select>
      </div>

      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};