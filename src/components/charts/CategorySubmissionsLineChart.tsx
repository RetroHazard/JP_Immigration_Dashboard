// src/components/charts/CategorySubmissionsLineChart.tsx
import { useEffect, useMemo, useState } from 'react';

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type TooltipItem,
} from 'chart.js';
import type React from 'react';
import { Line } from 'react-chartjs-2';

import { STATUS_CODES } from '../../constants/statusCodes';
import { useTheme } from '../../contexts/ThemeContext';
import { filterData, getAllMonths } from '../../hooks/useFilteredData';
import type { ImmigrationChartData } from '../common/ChartComponents';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export const CategorySubmissionsLineChart: React.FC<ImmigrationChartData> = ({ data, filters }) => {
  const { isDarkMode } = useTheme();
  const [monthRange, setMonthRange] = useState(12);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    if (!data) return;

    // Get all months from data using helper
    const allMonths = getAllMonths(data);
    if (allMonths.length === 0) return;

    // Get the most recent month
    const endMonth = allMonths[allMonths.length - 1];

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
      // Use shared filter function for consistent filtering
      // Note: type filter is intentionally omitted - this chart shows ALL types as separate lines
      const monthData = filterData(data, {
        month,
        bureau: filters.bureau,
        status: STATUS_CODES.NEW_APPLICATIONS,
      });
      return {
        month,
        statusAcquisition: monthData.reduce((sum, entry) => (entry.type === '10' ? entry.value : sum), 0),
        extensionOfStay: monthData.reduce((sum, entry) => (entry.type === '20' ? entry.value : sum), 0),
        changeOfStatus: monthData.reduce((sum, entry) => (entry.type === '30' ? entry.value : sum), 0),
        permissionForActivity: monthData.reduce((sum, entry) => (entry.type === '40' ? entry.value : sum), 0),
        reentry: monthData.reduce((sum, entry) => (entry.type === '50' ? entry.value : sum), 0),
        permanentResidence: monthData.reduce((sum, entry) => (entry.type === '60' ? entry.value : sum), 0),
      };
    });

    const processedData = {
      labels: months,
      datasets: [
        {
          label: 'Acquisition',
          data: monthlyStats.map((stat) => stat.statusAcquisition),
          backgroundColor: 'rgba(54, 162, 235, 0.4)', // Light blue
          borderColor: 'rgb(54, 162, 235)', // Blue
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Extension',
          data: monthlyStats.map((stat) => stat.extensionOfStay),
          backgroundColor: 'rgba(75, 192, 192, 0.4)', // Light teal
          borderColor: 'rgb(75, 192, 192)', // Teal
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Change',
          data: monthlyStats.map((stat) => stat.changeOfStatus),
          backgroundColor: 'rgba(255, 206, 86, 0.4)', // Light yellow
          borderColor: 'rgb(255, 206, 86)', // Yellow
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Activity',
          data: monthlyStats.map((stat) => stat.permissionForActivity),
          backgroundColor: 'rgba(153, 102, 255, 0.4)', // Light purple
          borderColor: 'rgb(153, 102, 255)', // Purple
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Re-entry',
          data: monthlyStats.map((stat) => stat.reentry),
          backgroundColor: 'rgba(255, 99, 132, 0.4)', // Light red
          borderColor: 'rgb(255, 99, 132)', // Red
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Permanent',
          data: monthlyStats.map((stat) => stat.permanentResidence),
          backgroundColor: 'rgba(201, 203, 207, 0.4)', // Light gray
          borderColor: 'rgb(201, 203, 207)', // Gray
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        },
      ],
    };

    setChartData(processedData);
  }, [data, filters, monthRange, showAllMonths]);

  const options = useMemo(() => ({
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
        position: 'top' as const,
        labels: {
          usePointStyle: false,
          padding: 10,
          color: isDarkMode ? '#fff' : '#000',
        },
      },
      title: {
        display: false,
        text: 'Application Types by Period',
        padding: {
          top: 10,
          bottom: 10,
        },
      },
      tooltip: {
        mode: 'index' as const,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
  }), [isDarkMode, chartData]);

  return (
    <div className="card-content">
      <div className="mb-4 flex h-full items-center justify-between">
        <h2 className="section-title">Category Submissions</h2>
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
