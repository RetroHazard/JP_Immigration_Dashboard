// src/components/charts/CategorySubmissionsLineChart.tsx
import { useEffect, useState } from 'react';

import type { TooltipItem } from 'chart.js';
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
import type React from 'react';
import { Line } from 'react-chartjs-2';

import { APPLICATION_TYPE_CODES } from '../../constants/applicationTypes';
import { BUREAU_CODES } from '../../constants/bureauCodes';
import { STATUS_CODES } from '../../constants/statusCodes';
import { useChartMonthRange } from '../../hooks/useChartMonthRange';
import type { ImmigrationChartData } from '../common/ChartComponents';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export const CategorySubmissionsLineChart: React.FC<ImmigrationChartData> = ({ data, filters, isDarkMode }) => {
  const { months, monthRange, setMonthRange, showAllMonths, setShowAllMonths } = useChartMonthRange({
    data,
    defaultRange: 12,
  });

  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      tension: number;
      fill: boolean;
    }[];
  }>({ labels: [], datasets: [] });

  useEffect(() => {
    if (!data || months.length === 0) return;

    const monthlyStats = months.map((month) => {
      const monthData = data.filter((entry) => {
        const matchesMonth = entry.month === month;
        if (filters.bureau === 'all') {
          return entry.bureau === BUREAU_CODES.NATIONWIDE && entry.status === STATUS_CODES.NEWLY_RECEIVED && matchesMonth;
        }
        return entry.bureau === filters.bureau && entry.status === STATUS_CODES.NEWLY_RECEIVED && matchesMonth;
      });
      return {
        month,
        statusAcquisition: monthData.reduce(
          (sum, entry) => (entry.type === APPLICATION_TYPE_CODES.STATUS_ACQUISITION ? entry.value : sum),
          0
        ),
        extensionOfStay: monthData.reduce(
          (sum, entry) => (entry.type === APPLICATION_TYPE_CODES.EXTENSION_OF_STAY ? entry.value : sum),
          0
        ),
        changeOfStatus: monthData.reduce(
          (sum, entry) => (entry.type === APPLICATION_TYPE_CODES.CHANGE_OF_STATUS ? entry.value : sum),
          0
        ),
        permissionForActivity: monthData.reduce(
          (sum, entry) => (entry.type === APPLICATION_TYPE_CODES.PERMISSION_FOR_ACTIVITY ? entry.value : sum),
          0
        ),
        reentry: monthData.reduce((sum, entry) => (entry.type === APPLICATION_TYPE_CODES.REENTRY ? entry.value : sum), 0),
        permanentResidence: monthData.reduce(
          (sum, entry) => (entry.type === APPLICATION_TYPE_CODES.PERMANENT_RESIDENCE ? entry.value : sum),
          0
        ),
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
  }, [data, filters, months]);

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
  };

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
