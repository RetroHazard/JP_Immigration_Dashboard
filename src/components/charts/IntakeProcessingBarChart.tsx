// src/components/charts/IntakeProcessingBarChart.tsx
// Intake & Processing on Bklit's ComposedChart, read as a bullet chart: the
// wide bar is the pile of applications in the system that month (carried over
// + newly received), and the narrower bar set inside it is the slice the
// bureaus actually disposed of, split into granted / denied / other. The inner
// stack is always a subset of the outer one — you cannot decide more
// applications than are in the pool — so the inset reads as a proportion.
//
// The approval rate rides a real second axis, pinned to 0-100%. The old
// Chart.js version's two axes were force-synced to identical ranges, which the
// previous rewrite was right to collapse; a percentage against a count is a
// different unit, not the same scale twice.
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

/** The intake stack recedes so the outcome stack in front of it reads as the subject. */
const intakeFill = (slot: number) => `color-mix(in oklab, var(--chart-${slot}) 55%, var(--chart-background))`;

const INTAKE_STACK = 'intake';
const OUTCOME_STACK = 'outcome';
/** Inset of the outcome stack inside the intake bar; the stack applies it to every segment. */
const OUTCOME_WIDTH_RATIO = 0.5;
// Denials and withdrawals are single-digit percentages of a bar that is itself
// a fraction of the column, so their segments are a few pixels tall. The 2px
// gap that separates the two intake segments is subtracted from each segment's
// height, which erased them outright — the outcome stack runs contiguous.
const OUTCOME_STACK_GAP = 0;

// `id` is the data-row property and the chart's dataKey; `label` is display
// text only. They used to be the same string, which made the plotted data
// shape depend on the UI language.
//
// Order matters twice over and must match the child order below: stacking runs
// in child order, and the tooltip resolves a line's dot colour by its position
// in that same list (see resolveDotColor in chart-tooltip.tsx).
const SERIES = [
  { id: 'pending', labelKey: 'metric.pending', status: STATUS_CODES.OLD_APPLICATIONS },
  { id: 'received', labelKey: 'metric.received', status: STATUS_CODES.NEW_APPLICATIONS },
  { id: 'granted', labelKey: 'metric.granted', status: STATUS_CODES.GRANTED },
  { id: 'denied', labelKey: 'metric.denied', status: STATUS_CODES.DENIED },
  { id: 'other', labelKey: 'metric.other', status: STATUS_CODES.OTHER },
] as const;

/** Legend and tooltip colours, keyed by series id. Bars read the same values below. */
const COLORS: Record<string, string> = {
  pending: intakeFill(1),
  received: intakeFill(2),
  granted: 'var(--chart-3)',
  denied: 'var(--chart-8)',
  // Amber over pink for the third slice: denied and other stack directly on
  // top of each other as slivers a few pixels tall, so what separates them has
  // to be lightness, not hue. Green / red / amber also reads as the outcome
  // triad it is.
  other: 'var(--chart-4)',
  approvalRate: 'var(--chart-7)',
};

/** Not a status row — derived below, and the only series on the right axis. */
const RATE_ID = 'approvalRate';

/** Legend order, which is also child order. The rate is the one non-status entry. */
const LEGEND = [
  ...SERIES.map((entry) => ({ id: entry.id as string, labelKey: entry.labelKey, shape: 'square' as const })),
  { id: RATE_ID, labelKey: 'metric.approvalRate' as const, shape: 'line' as const },
];

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
    for (const series of SERIES) row[series.id] = sumOf(series.status);
    // Denominator is the published 300000 row rather than the three outcome
    // rows re-added, matching the Outcomes gauge and the stats cards. Guard
    // the divisor, not the result: NaN and Infinity are both `typeof
    // "number"`, and Line would place either at pixel 0 — the top of the plot.
    const processed = sumOf(STATUS_CODES.PROCESSED);
    row[RATE_ID] = processed > 0 ? (Number(row.granted) / processed) * 100 : 0;
    return row;
  });
};

export const IntakeProcessingBarChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const { t, formatters } = useLocale();
  const { bureau, type } = filters;
  const series = useMemo(
    () => LEGEND.map((entry) => ({ ...entry, color: COLORS[entry.id] ?? 'var(--chart-1)', label: t(entry.labelKey) })),
    [t]
  );
  // Keyed on the filter values rather than the object, which is rebuilt on
  // every parent render — ActiveChart's own memo compares them the same way.
  const chartData = useMemo(() => buildIntakeRows(data, { bureau, type }, range), [data, bureau, type, range]);

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
          // The right strip is a flat 40px with no locale-aware sizing of its
          // own (estimateAxisMarginLeft covers the left only), and "100 %" —
          // fr and de put a space in — doesn't fit what padding leaves of it.
          margin={{ right: 52 }}
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
          <SeriesBar dataKey="pending" stackId={INTAKE_STACK} fill={COLORS.pending} />
          <SeriesBar dataKey="received" stackId={INTAKE_STACK} fill={COLORS.received} radius={3} />
          <SeriesBar
            dataKey="granted"
            stackId={OUTCOME_STACK}
            widthRatio={OUTCOME_WIDTH_RATIO}
            stackGap={OUTCOME_STACK_GAP}
            fill={COLORS.granted}
          />
          <SeriesBar dataKey="denied" stackId={OUTCOME_STACK} fill={COLORS.denied} />
          <SeriesBar dataKey="other" stackId={OUTCOME_STACK} fill={COLORS.other} radius={2} />
          <Line
            dataKey={RATE_ID}
            yAxisId="right"
            stroke={COLORS.approvalRate}
            curve={curveMonotoneX}
            strokeWidth={2.25}
            fadeEdges={false}
          />
          <XAxis />
          {/* Rows are named explicitly: the tooltip would otherwise show the
              raw series ids now that those are no longer display text. They
              stay in child order because the dot layer looks a line's colour
              up by its index here. Only the rate gets a dot — a stacked bar's
              dot is placed at its raw axis value, nowhere near its segment. */}
          <ChartTooltip
            dotKeys={[RATE_ID]}
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
