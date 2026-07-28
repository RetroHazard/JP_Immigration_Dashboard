// src/components/ActiveChart.tsx
import { memo } from 'react';

import type React from 'react';

import type { ImmigrationData } from '../hooks/useImmigrationData';
import type { ChartRange } from '../utils/selectors';
import { CHART_COMPONENTS } from './common/ChartComponents';

interface ActiveChartProps {
  activeChartIndex: number;
  data: ImmigrationData[];
  filters: { bureau: string; type: string };
  range: ChartRange;
}

/**
 * Memoized component that renders the currently active chart.
 * Prevents unnecessary re-renders when unrelated state changes.
 */
export const ActiveChart = memo<ActiveChartProps>(
  ({ activeChartIndex, data, filters, range }) => {
    const ChartComponent = CHART_COMPONENTS[activeChartIndex].component;
    return <ChartComponent data={data} filters={filters} range={range} />;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.activeChartIndex === nextProps.activeChartIndex &&
      prevProps.data === nextProps.data &&
      prevProps.range === nextProps.range &&
      prevProps.filters.bureau === nextProps.filters.bureau &&
      prevProps.filters.type === nextProps.filters.type
    );
  }
);

ActiveChart.displayName = 'ActiveChart';
