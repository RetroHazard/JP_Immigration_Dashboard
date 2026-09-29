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
  /** Compare mode's shared count-axis max; see ImmigrationChartData.yMax. */
  yMax?: number;
  /** Compare mode: the shell lists policy events once; see ImmigrationChartData. */
  hidePolicyList?: boolean;
}

/** Memoized so unrelated shell state doesn't re-render the chart. */
export const ActiveChart = memo<ActiveChartProps>(
  ({ chart, processingData, residentsData, filters, residentFilters, range, period, yMax, hidePolicyList }) => {
    if (chart.dataset === 'residents') {
      const Chart = chart.component;
      return <Chart data={residentsData} filters={residentFilters} range={range as ResidentRange} period={period} />;
    }
    const Chart = chart.component;
    return <Chart data={processingData} filters={filters} range={range as ChartRange} yMax={yMax} hidePolicyList={hidePolicyList} />;
  },
  (prev, next) =>
    prev.chart === next.chart &&
    prev.processingData === next.processingData &&
    prev.residentsData === next.residentsData &&
    prev.range === next.range &&
    prev.period === next.period &&
    prev.yMax === next.yMax &&
    prev.hidePolicyList === next.hidePolicyList &&
    prev.filters.bureau === next.filters.bureau &&
    prev.filters.type === next.filters.type &&
    prev.residentFilters.region === next.residentFilters.region &&
    prev.residentFilters.nationality === next.residentFilters.nationality &&
    prev.residentFilters.group === next.residentFilters.group
);

ActiveChart.displayName = 'ActiveChart';
