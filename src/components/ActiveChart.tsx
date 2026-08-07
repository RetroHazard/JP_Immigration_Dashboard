// src/components/ActiveChart.tsx
import { memo } from 'react';

import type React from 'react';

import type { ImmigrationData } from '../hooks/useImmigrationData';
import type { ResidentRecord } from '../utils/residentsData';
import type { ResidentRange } from '../utils/residentsSelectors';
import type { ChartRange } from '../utils/selectors';
import type { ChartDefinition, ResidentFilters } from './common/ChartComponents';

interface ActiveChartProps {
  /**
   * The resolved definition rather than an index: with two registries there is
   * no single array to index into, and the definition is what carries the
   * dataset discriminant the render below narrows on.
   */
  chart: ChartDefinition;
  processingData: ImmigrationData[];
  residentsData: ResidentRecord[];
  filters: { bureau: string; type: string };
  residentFilters: ResidentFilters;
  range: ChartRange | ResidentRange;
  /** As-of snapshot for the residents stock views; null = latest. */
  period: string | null;
}

/**
 * Memoized component that renders the currently active chart.
 * Prevents unnecessary re-renders when unrelated state changes.
 */
export const ActiveChart = memo<ActiveChartProps>(
  ({ chart, processingData, residentsData, filters, residentFilters, range, period }) => {
    if (chart.dataset === 'residents') {
      const Chart = chart.component;
      return <Chart data={residentsData} filters={residentFilters} range={range as ResidentRange} period={period} />;
    }
    const Chart = chart.component;
    return <Chart data={processingData} filters={filters} range={range as ChartRange} />;
  },
  (prev, next) =>
    prev.chart === next.chart &&
    prev.processingData === next.processingData &&
    prev.residentsData === next.residentsData &&
    prev.range === next.range &&
    prev.period === next.period &&
    prev.filters.bureau === next.filters.bureau &&
    prev.filters.type === next.filters.type &&
    prev.residentFilters.region === next.residentFilters.region &&
    prev.residentFilters.nationality === next.residentFilters.nationality &&
    prev.residentFilters.group === next.residentFilters.group
);

ActiveChart.displayName = 'ActiveChart';
