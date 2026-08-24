// src/components/charts/IntakeProcessingBarChart.tsx
// Intake & Processing on Bklit's ComposedChart: stacked bars for the
// applications in the system each month (carried over + newly received)
// with the completed volume as a line on the SAME axis - the old dual
// synced y-axes were always one scale pretending to be two.
//
// The approval rate is the one series that earns a second axis, pinned to
// 0-100%: a percentage against a count is a different unit, not the same
// scale twice. Its components (granted / denied / other) are deliberately
// not plotted - they are two-percent slivers of a bar that is itself a
// fraction of the column. The data table below the chart carries them.
'use client';

import { useMemo } from 'react';

import type React from 'react';
import { curveMonotoneX } from '@visx/curve';

import { STATUS_CODES } from '../../constants/statusCodes';
import { useLocale } from '../../i18n/LocaleContext';
import type { DictionaryKey } from '../../i18n/types';
import { bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import { measureLabelWidth } from '../bklit/charts/chart-formatters';
import { ComposedChart } from '../bklit/charts/composed-chart';
import { Grid } from '../bklit/charts/grid';
import { Line } from '../bklit/charts/line';
import { SeriesBar } from '../bklit/charts/series-bar';
import { ChartTooltip } from '../bklit/charts/tooltip';
import { XAxis } from '../bklit/charts/x-axis';
import { YAxis } from '../bklit/charts/y-axis';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { SeriesLegend } from '../common/SeriesLegend';

/** Not a status row — derived below, and the only series on the right axis. */
const RATE_ID = 'approvalRate';

// `id` is the data-row property and the chart's dataKey; `label` is display
// text only. They used to be the same string, which made the plotted data
// shape depend on the UI language.
//
// Order matters twice over and must match the child order below: stacking runs
// in child order, and the tooltip resolves a line's dot colour by its position
// in that same list (see resolveDotColor in chart-tooltip.tsx).
const SERIES: { id: string; labelKey: DictionaryKey; color: string; shape: 'square' | 'line' }[] = [
  { id: 'pending', labelKey: 'metric.pending', color: 'var(--chart-1)', shape: 'square' },
  { id: 'received', labelKey: 'metric.received', color: 'var(--chart-2)', shape: 'square' },
  { id: 'processed', labelKey: 'metric.processed', color: 'var(--chart-3)', shape: 'line' },
  { id: RATE_ID, labelKey: 'metric.approvalRate', color: 'var(--chart-7)', shape: 'line' },
];

/** Which published status row each plotted count comes from. */
const STATUS_BY_ID: Record<string, string> = {
  pending: STATUS_CODES.OLD_APPLICATIONS,
  received: STATUS_CODES.NEW_APPLICATIONS,
  processed: STATUS_CODES.PROCESSED,
};

/**
 * One chart row per month in range. Exported so the arithmetic can be tested
 * on its own — visx sizes itself from a real layout, which jsdom cannot give
 * it, so a rendered chart proves nothing about these numbers.
 */
export const buildIntakeRows = (
  data: ImmigrationChartData['data'],
  filters: ImmigrationChartData['filters'],
  range: ImmigrationChartData['range']
): Record<string, unknown>[] => {
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
    for (const [id, status] of Object.entries(STATUS_BY_ID)) row[id] = sumOf(status);
    // Denominator is the published 300000 row rather than the three outcome
    // rows added back up, matching the Outcomes gauge and the stats cards.
    // Guard the divisor, not the result: NaN and Infinity are both `typeof
    // "number"`, and Line would place either at pixel 0 — the top of the plot.
    const processed = Number(row.processed);
    row[RATE_ID] = processed > 0 ? (sumOf(STATUS_CODES.GRANTED) / processed) * 100 : 0;
    return row;
  });
};

export const IntakeProcessingBarChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const { t, formatters } = useLocale();
  const { bureau, type } = filters;
  const series = useMemo(() => SERIES.map((entry) => ({ ...entry, label: t(entry.labelKey) })), [t]);
  // Keyed on the filter values rather than the object, which is rebuilt on
  // every parent render — ActiveChart's own memo compares them the same way.
  const chartData = useMemo(() => buildIntakeRows(data, { bureau, type }, range), [data, bureau, type, range]);
  // Only the left axis gets a locale-measured margin (estimateAxisMarginLeft);
  // the right one is a flat 40px, of which y-axis.tsx's own 8px padding leaves
  // 32 for text. "100%" barely fits that and fr/de's "100 %" does not, and
  // `whitespace-nowrap` means it overflows toward the card edge rather than
  // wrapping. Measure it instead — the same trick, and it does not take more
  // width off the plot than the labels actually need.
  const rateAxisMargin = useMemo(
    () => Math.max(40, Math.ceil(measureLabelWidth(formatters.percent(100, 0))) + 16),
    [formatters]
  );

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
          margin={{ right: rateAxisMargin }}
          yAxisDomains={{ right: [0, 100] }}
          // Monthly points are all on the 1st — the default month+day labels
          // drop the year, which is ambiguous across multi-year ranges.
          formatDateLabel={(date) => formatters.monthYear(date)}
        >
          <Grid horizontal />
          <YAxis />
          <YAxis
            yAxisId="right"
            orientation="right"
            numTicks={5}
            formatValue={(value) => formatters.percent(value, 0)}
          />
          <SeriesBar dataKey="pending" fill="var(--chart-1)" />
          <SeriesBar dataKey="received" fill="var(--chart-2)" radius={3} />
          <Line dataKey="processed" stroke="var(--chart-3)" curve={curveMonotoneX} strokeWidth={2.25} fadeEdges={false} />
          <Line
            dataKey={RATE_ID}
            yAxisId="right"
            stroke="var(--chart-7)"
            curve={curveMonotoneX}
            strokeWidth={2.25}
            fadeEdges={false}
          />
          <XAxis />
          {/* Rows are named explicitly: the tooltip would otherwise show the
              raw series ids now that those are no longer display text. They
              stay in child order because the dot layer looks a line's colour
              up by its index here. Only the two real lines get a dot — a
              stacked bar's dot is placed at its raw axis value, which is
              nowhere near its segment. */}
          <ChartTooltip
            dotKeys={['processed', RATE_ID]}
            titleFormat={(date) => formatters.monthYear(date)}
            rows={(point) =>
              series.map((entry) => ({
                color: entry.color,
                label: entry.label,
                value:
                  entry.id === RATE_ID
                    ? formatters.percent(Number(point[entry.id] ?? 0))
                    : Number(point[entry.id] ?? 0),
              }))
            }
          />
        </ComposedChart>
      </div>
    </div>
  );
};
