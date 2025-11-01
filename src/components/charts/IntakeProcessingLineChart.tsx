// src/components/charts/IntakeProcessingLineChart.tsx
import { useEffect, useState } from 'react';

import type { TooltipItem } from 'chart.js';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import type React from 'react';
import { Line } from 'react-chartjs-2';

import { BUREAU_CODES } from '../../constants/bureauCodes';
import { STATUS_CODES } from '../../constants/statusCodes';
import { useChartMonthRange } from '../../hooks/useChartMonthRange';
import type { ImmigrationChartData } from '../common/ChartComponents';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Filler, Legend);

export const IntakeProcessingLineChart: React.FC<ImmigrationChartData> = ({ data, filters, isDarkMode }) => {
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
      order: number;
      tension: number;
      fill: boolean;
    }[];
  }>({ labels: [], datasets: [] });

  useEffect(() => {
    if (!data || months.length === 0) return;

    const monthlyStats = months.map((month) => {
      const monthData = data.filter((entry) => {
        const matchesMonth = entry.month === month;
        const matchesType = filters.type === 'all' || entry.type === filters.type;
        if (filters.bureau === 'all') {
          return entry.bureau === BUREAU_CODES.NATIONWIDE && matchesMonth && matchesType;
        }
        return entry.bureau === filters.bureau && matchesMonth && matchesType;
      });
      return {
        month,
        totalApplications: monthData.reduce(
          (sum, entry) => (entry.status === STATUS_CODES.CARRIED_OVER ? sum + entry.value : sum),
          0
        ),
        processed: monthData.reduce((sum, entry) => (entry.status === STATUS_CODES.PROCESSED ? sum + entry.value : sum), 0),
        newApplications: monthData.reduce(
          (sum, entry) => (entry.status === STATUS_CODES.NEWLY_RECEIVED ? sum + entry.value : sum),
          0
        ),
      };
    });

    const processedData = {
      labels: months,
      datasets: [
        {
          label: 'Old Applications',
          data: monthlyStats.map((stat) => stat.totalApplications),
          backgroundColor: 'rgba(54, 162, 245, 0.75)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 2,
          order: 0,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'New Applications',
          data: monthlyStats.map((stat) => stat.newApplications),
          backgroundColor: 'rgba(245, 179, 8, 0.5)',
          borderColor: 'rgb(234, 179, 8)',
          borderWidth: 2,
          order: -1,
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Processed Applications',
          data: monthlyStats.map((stat) => stat.processed),
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgb(34, 220, 94)',
          borderWidth: 2,
          order: -2,
          tension: 0.4,
          fill: true,
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
        title: {
          display: true,
          text: 'Application Count',
          color: isDarkMode ? '#fff' : '#000',
        },
        ticks: {
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
        <div className="section-title">Processing and Reception</div>
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
