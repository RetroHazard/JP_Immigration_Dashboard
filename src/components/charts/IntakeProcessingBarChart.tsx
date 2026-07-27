// src/components/charts/IntakeProcessingBarChart.tsx
// Intake & Processing on Bklit's ComposedChart: stacked bars for the
// applications in the system each month (carried over + newly received)
// with the completed volume as a line on the SAME axis - the old dual
// synced y-axes were always one scale pretending to be two.
'use client';

import { useMemo } from 'react';

import type React from 'react';
import { curveMonotoneX } from '@visx/curve';

import { STATUS_CODES } from '../../constants/statusCodes';
import { bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import { ComposedChart } from '../bklit/charts/composed-chart';
import { Grid } from '../bklit/charts/grid';
import { Line } from '../bklit/charts/line';
import { SeriesBar } from '../bklit/charts/series-bar';
import { ChartTooltip } from '../bklit/charts/tooltip';
import { XAxis } from '../bklit/charts/x-axis';
import { YAxis } from '../bklit/charts/y-axis';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { SeriesLegend } from '../common/SeriesLegend';

const SERIES = [
  { key: 'Pending (carried over)', color: 'var(--chart-1)', shape: 'square' as const },
  { key: 'Received', color: 'var(--chart-2)', shape: 'square' as const },
  { key: 'Processed', color: 'var(--chart-3)', shape: 'line' as const },
];

export const IntakeProcessingBarChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const chartData = useMemo(() => {
    const months = monthsForRange(getAllMonths(data), range);
    return months.map((month) => {
      // 'all' bureau = the official nationwide aggregate row
      const monthData = selectData(data, {
        month,
        scope: bureauScopeFromFilter(filters.bureau),
        type: filters.type,
      });
      const sumOf = (status: string) =>
        monthData.reduce((sum, entry) => (entry.status === status ? sum + entry.value : sum), 0);
      return {
        date: new Date(`${month}-01T00:00:00`),
        'Pending (carried over)': sumOf(STATUS_CODES.OLD_APPLICATIONS),
        Received: sumOf(STATUS_CODES.NEW_APPLICATIONS),
        Processed: sumOf(STATUS_CODES.PROCESSED),
      };
    });
  }, [data, filters, range]);

  return (
    <div className="card-content">
      <SeriesLegend className="mb-2" items={SERIES.map((s) => ({ label: s.key, color: s.color, shape: s.shape }))} />
      <div
        className="chart-container"
        role="img"
        aria-label="Stacked bars of pending and received applications per month, with processed volume as a line"
      >
        <ComposedChart data={chartData} stacked stackGap={2} maxBarSize={30} aspectRatio="16 / 8">
          <Grid horizontal />
          <YAxis />
          <SeriesBar dataKey="Pending (carried over)" fill="var(--chart-1)" />
          <SeriesBar dataKey="Received" fill="var(--chart-2)" radius={3} />
          <Line dataKey="Processed" stroke="var(--chart-3)" curve={curveMonotoneX} strokeWidth={2.25} fadeEdges={false} />
          <XAxis />
          <ChartTooltip />
        </ComposedChart>
      </div>
    </div>
  );
};
