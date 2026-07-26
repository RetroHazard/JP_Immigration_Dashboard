// src/components/charts/CategorySubmissionsLineChart.tsx
import { useEffect, useMemo, useState } from 'react';

import type { ChartData } from 'chart.js';
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
import { bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import type { ImmigrationChartData } from '../common/ChartComponents';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

export const CategorySubmissionsLineChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const { isDarkMode } = useTheme();
  const [chartData, setChartData] = useState<ChartData<'line', number[], string>>({ labels: [], datasets: [] });

  useEffect(() => {
    if (!data) return;

    // Get all months from data using helper
    const allMonths = getAllMonths(data);
    if (allMonths.length === 0) return;

    const months = monthsForRange(allMonths, range);

    const monthlyStats = months.map((month) => {
      // Type filter intentionally omitted - this chart shows ALL types as separate lines.
      // 'all' bureau = the official nationwide aggregate row.
      const monthData = selectData(data, {
        month,
        scope: bureauScopeFromFilter(filters.bureau),
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
  }, [data, filters, range]);

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
            return `${context.dataset.label}: ${(context.parsed.y ?? 0).toLocaleString()}`;
          },
        },
      },
    },
  }), [isDarkMode, chartData]);

  return (
    <div className="card-content">

      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
