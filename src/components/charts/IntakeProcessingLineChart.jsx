// components/IntakeProcessingLineChart.jsx
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export const IntakeProcessingLineChart = ({ data, filters, isDarkMode }) => {
  const [monthRange, setMonthRange] = useState(12);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    if (!data) return;

    const endMonth = filters.month || [...new Set(data.map((entry) => entry.month))].sort().reverse()[0];
    const allMonths = [...new Set(data.map((entry) => entry.month))].sort();
    const endIndex = allMonths.indexOf(endMonth);
    if (endIndex === -1) return;

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
        totalApplications: monthData.reduce((sum, entry) => (entry.status === '102000' ? sum + entry.value : sum), 0),
        processed: monthData.reduce((sum, entry) => (entry.status === '300000' ? sum + entry.value : sum), 0),
        newApplications: monthData.reduce((sum, entry) => (entry.status === '103000' ? sum + entry.value : sum), 0),
      };
    });

    const processedData = {
      labels: months,
      datasets: [
        {
          label: 'Old Applications',
          data: monthlyStats.map((stat) => stat.totalApplications),
          backgroundColor: 'rgba(54, 162, 245, 0.4)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 2,
          order: 1,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'New Applications',
          data: monthlyStats.map((stat) => stat.newApplications),
          backgroundColor: 'rgba(245, 179, 8, 0.4)',
          borderColor: 'rgb(234, 179, 8)',
          borderWidth: 2,
          order: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Processed Applications',
          data: monthlyStats.map((stat) => stat.processed),
          backgroundColor: 'rgba(34, 197, 94, 0.4)',
          borderColor: 'rgb(34, 220, 94)',
          borderWidth: 2,
          order: 0,
          tension: 0.4,
          fill: true,
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
        stacked: false,
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
        stacked: false,
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
        grid: {
          color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: false,
          padding: 10,
          color: isDarkMode ? '#fff' : '#000',
        },
      },
      title: {
        display: false,
        text: 'Immigration Applications by Period',
        padding: {
          top: 10,
          bottom: 10,
        },
      },
      tooltip: {
        mode: 'index',
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
        <h2 className="section-title">Processing and Reception</h2>
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
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
