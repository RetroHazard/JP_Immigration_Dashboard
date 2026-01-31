// src/components/ActiveChart.tsx
import { memo } from 'react';

import type React from 'react';

import type { ImmigrationData } from '../hooks/useImmigrationData';
import { CHART_COMPONENTS } from './common/ChartComponents';

interface ActiveChartProps {
  activeChartIndex: number;
  data: ImmigrationData[];
  filters: { bureau: string; type: string };
  isDarkMode: boolean;
}

/**
 * Memoized component that renders the currently active chart.
 * Prevents unnecessary re-renders when unrelated state changes.
 */
export const ActiveChart = memo<ActiveChartProps>(
  ({ activeChartIndex, data, filters, isDarkMode }) => {
    const ChartComponent = CHART_COMPONENTS[activeChartIndex].component;
    return <ChartComponent data={data} filters={filters} isDarkMode={isDarkMode} />;
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if these specific props change
    return (
      prevProps.activeChartIndex === nextProps.activeChartIndex &&
      prevProps.data === nextProps.data &&
      prevProps.filters.bureau === nextProps.filters.bureau &&
      prevProps.filters.type === nextProps.filters.type &&
      prevProps.isDarkMode === nextProps.isDarkMode
    );
  }
);

ActiveChart.displayName = 'ActiveChart';
