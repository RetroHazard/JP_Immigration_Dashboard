// src/components/charts/BureauPerformanceBubbleChart.tsx
import { useMemo } from 'react';

import { Chart as ChartJS, Legend, LinearScale, PointElement, Title, Tooltip, type TooltipItem } from 'chart.js';
import type React from 'react';
import { Bubble } from 'react-chartjs-2';

import { applicationOptions } from '../../constants/applicationOptions';
import { bureauOptions } from '../../constants/bureauOptions';
import { STATUS_CODES } from '../../constants/statusCodes';
import { useTheme } from '../../contexts/ThemeContext';
import { breakdownScopeFromFilter, monthsForRange, selectData } from '../../utils/selectors';
import type { ImmigrationChartData } from '../common/ChartComponents';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

interface BubbleDataPoint {
  x: number;
  y: number;
  r: number;
  label: string;
  processed: number;
  bureau: string;
}

export const BureauPerformanceBubbleChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const { isDarkMode } = useTheme();

  const sortedMonths = useMemo(() => {
    if (!data?.length) return [];
    return [...new Set(data.map((entry) => entry.month))].sort();
  }, [data]);

  const selectedMonths = useMemo(() => monthsForRange(sortedMonths, range), [range, sortedMonths]);

  const filteredData = useMemo(() => {
    // Per-bureau breakdown ('all' = every bureau, aggregate row excluded),
    // honoring the active bureau/type filters.
    const relevantStatuses = [STATUS_CODES.NEW_APPLICATIONS, STATUS_CODES.PROCESSED] as string[];
    return selectData(data, { scope: breakdownScopeFromFilter(filters.bureau), type: filters.type }).filter(
      (entry) => selectedMonths.includes(entry.month) && relevantStatuses.includes(entry.status)
    );
  }, [data, filters.bureau, filters.type, selectedMonths]);

  const chartData = useMemo(() => {
    const bureaus = bureauOptions.filter((b) => b.value !== 'all');
    const appTypes = applicationOptions.filter((t) => t.value !== 'all');

    // Calculate maximum processed value
    let maxProcessed = 0;
    bureaus.forEach((bureau) => {
      appTypes.forEach((type) => {
        const processed = filteredData
          .filter((d) => d.bureau === bureau.value && d.type === type.value)
          .filter((d) => d.status === STATUS_CODES.PROCESSED)
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
            .filter((d) => d.status === STATUS_CODES.NEW_APPLICATIONS)
            .reduce((sum, d) => sum + d.value, 0);

          const totalProcessed = bureauTypeData
            .filter((d) => d.status === STATUS_CODES.PROCESSED)
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

  const options = useMemo(() => ({
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
          label(context: TooltipItem<'bubble'>) {
            const raw = context.raw as BubbleDataPoint;
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
  }), [isDarkMode]);

  return (
    <div className="card-content">
      <div className="chart-container">
        <Bubble data={{ datasets: chartData }} options={options} />
      </div>
    </div>
  );
};
