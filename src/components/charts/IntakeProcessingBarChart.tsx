// src/components/charts/IntakeProcessingBarChart.tsx
import { useEffect, useMemo, useRef, useState } from 'react';

import type { ChartData } from 'chart.js';
import {
  BarElement,
  CategoryScale,
  type Chart,
  Chart as ChartJS,
  type ChartEvent,
  Legend,
  type LegendElement,
  type LegendItem,
  LinearScale,
  type Scale,
  Title,
  Tooltip,
  type TooltipItem,
} from 'chart.js';
import type React from 'react';
import { Bar } from 'react-chartjs-2';

import { STATUS_CODES } from '../../constants/statusCodes';
import { useTheme } from '../../contexts/ThemeContext';
import { bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import type { ImmigrationChartData } from '../common/ChartComponents';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const IntakeProcessingBarChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const { isDarkMode } = useTheme();
  const chartRef = useRef<Chart<'bar'>>(null);

  const [chartData, setChartData] = useState<ChartData<'bar', number[], string>>({
    labels: [],
    datasets: [
      {
        label: 'Pending',
        data: [],
      },
      {
        label: 'Received',
        data: [],
      },
      {
        label: 'Processed',
        data: [],
      },
    ],
  });

  useEffect(() => {
    if (!data) return;

    // Get all months from data using helper
    const allMonths = getAllMonths(data);
    if (allMonths.length === 0) return;

    const months = monthsForRange(allMonths, range);

    const monthlyStats = months.map((month) => {
      // 'all' bureau = the official nationwide aggregate row
      const monthData = selectData(data, {
        month,
        scope: bureauScopeFromFilter(filters.bureau),
        type: filters.type,
      });

      return {
        month,
        totalApplications: monthData.reduce((sum, entry) => (entry.status === STATUS_CODES.OLD_APPLICATIONS ? sum + entry.value : sum), 0), // 受理_旧受 (Previously Received)
        processed: monthData.reduce((sum, entry) => (entry.status === STATUS_CODES.PROCESSED ? sum + entry.value : sum), 0), // 処理済み (Processed)
        newApplications: monthData.reduce((sum, entry) => (entry.status === STATUS_CODES.NEW_APPLICATIONS ? sum + entry.value : sum), 0), // 受理_新受 (Newly Received)
      };
    });

    const processedData = {
      labels: months,
      datasets: [
        {
          label: 'Pending',
          data: monthlyStats.map((stat) => stat.totalApplications),
          backgroundColor: 'rgba(54, 162, 245, 0.7)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 2,
          yAxisID: 'y',
          order: 1,
        },
        {
          label: 'Received',
          data: monthlyStats.map((stat) => stat.newApplications),
          backgroundColor: 'rgba(245, 179, 8, 0.7)',
          borderColor: 'rgb(234, 179, 8)',
          borderWidth: 2,
          yAxisID: 'y',
          order: 2,
        },
        {
          label: 'Processed',
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
  }, [data, filters, range]);

  const options = useMemo(() => ({
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
          color: isDarkMode ? '#fff' : '#000',
        },
        afterDataLimits: (axis: Scale) => {
          // Synchronize y2 with y after data limits are calculated
          if (axis.chart.scales.y2) {
            axis.chart.scales.y2.min = axis.min;
            axis.chart.scales.y2.max = axis.max;
          }
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
        onClick: (e: ChartEvent, legendItem: LegendItem, legend: LegendElement<'bar'>) => {
          const chart = legend.chart;
          const index = legendItem.datasetIndex;

          if (index === undefined) return;

          // Toggle dataset visibility
          chart.setDatasetVisibility(index, !chart.isDatasetVisible(index));

          // Force chart update to trigger scale recalculation with animation
          chart.update();
        },
      },
      tooltip: {
        mode: 'index' as const,
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            return `${context.dataset.label}: ${(context.parsed.y ?? 0).toLocaleString()}`;
          },
        },
      },
    },
  }), [isDarkMode]);

  return (
    <div className="card-content">

      <div className="chart-container">
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};
