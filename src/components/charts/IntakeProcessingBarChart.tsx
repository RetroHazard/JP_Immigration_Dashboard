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
import { useLocale } from '../../i18n/LocaleContext';
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

// `id` is the data-row property and the chart's dataKey; `label` is display
// text only. They used to be the same string, which made the plotted data
// shape depend on the UI language.
const SERIES = [
  { id: 'pending', labelKey: 'metric.pending', status: STATUS_CODES.OLD_APPLICATIONS, color: 'var(--chart-1)', shape: 'square' },
  { id: 'received', labelKey: 'metric.received', status: STATUS_CODES.NEW_APPLICATIONS, color: 'var(--chart-2)', shape: 'square' },
  { id: 'processed', labelKey: 'metric.processed', status: STATUS_CODES.PROCESSED, color: 'var(--chart-3)', shape: 'line' },
] as const;

export const IntakeProcessingBarChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const { t, formatters } = useLocale();
  const series = useMemo(() => SERIES.map((entry) => ({ ...entry, label: t(entry.labelKey) })), [t]);
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
      const row: Record<string, unknown> = { date: new Date(`${month}-01T00:00:00`) };
      for (const series of SERIES) row[series.id] = sumOf(series.status);
      return row;
    });
  }, [data, filters, range]);

  return (
    <div className="chart-card-content">
      <SeriesLegend className="mb-2" items={series} />
      <div
        className="chart-container"
        role="img"
        aria-label={t('charts.intake.aria')}
      >
        <ComposedChart
          data={chartData}
          stacked
          stackGap={2}
          maxBarSize={30}
          aspectRatio="16 / 8"
          // Monthly points are all on the 1st — the default month+day labels
          // drop the year, which is ambiguous across multi-year ranges.
          formatDateLabel={(date) => formatters.monthYear(date)}
        >
          <Grid horizontal />
          <YAxis />
          <SeriesBar dataKey="pending" fill="var(--chart-1)" />
          <SeriesBar dataKey="received" fill="var(--chart-2)" radius={3} />
          <Line dataKey="processed" stroke="var(--chart-3)" curve={curveMonotoneX} strokeWidth={2.25} fadeEdges={false} />
          <XAxis />
          {/* Rows are named explicitly: the tooltip would otherwise show the
              raw series ids now that those are no longer display text. */}
          <ChartTooltip
            titleFormat={(date) => formatters.monthYear(date)}
            rows={(point) =>
              series.map((entry) => ({
                color: entry.color,
                label: entry.label,
                value: Number(point[entry.id] ?? 0),
              }))
            }
          />
        </ComposedChart>
      </div>
    </div>
  );
};
