// Intake & Processing on Bklit's ComposedChart: stacked bars for the
// applications in the system each month (carried over + newly received), with
// the completed volume as a line on the same axis. Only the approval rate, a
// different unit, gets a second axis (0-100%); its granted / denied / other
// components are too thin to plot, so the data table carries them. Policy
// markers (src/constants/policyEvents.ts) annotate the months a rule changed.
'use client';

import { useMemo } from 'react';

import type React from 'react';
import { curveMonotoneX } from '@visx/curve';

import { POLICY_EVENTS } from '../../constants/policyEvents';
import { STATUS_CODES } from '../../constants/statusCodes';
import { useLocale } from '../../i18n/LocaleContext';
import type { DictionaryKey } from '../../i18n/types';
import { bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import { measureLabelWidth } from '../bklit/charts/chart-formatters';
import { ComposedChart } from '../bklit/charts/composed-chart';
import { Grid } from '../bklit/charts/grid';
import { Line } from '../bklit/charts/line';
import { type ChartMarker, ChartMarkers, MarkerTooltipContent, useActiveMarkers } from '../bklit/charts/markers';
import { SeriesBar } from '../bklit/charts/series-bar';
import { ChartTooltip } from '../bklit/charts/tooltip';
import { XAxis } from '../bklit/charts/x-axis';
import { YAxis } from '../bklit/charts/y-axis';
import { niceYDomain } from '../bklit/charts/y-domain-utils';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { PolicyEventList, usePolicyMarkers } from '../common/PolicyEventList';
import { SeriesLegend } from '../common/SeriesLegend';

/** Not a status row — derived below, and the only series on the right axis. */
const RATE_ID = 'approvalRate';

// Hoisted: both y-domain memos in the chart shell depend on it, so a fresh
// object would re-render every series on every render.
const RATE_AXIS_DOMAIN: Record<string, [number, number]> = { right: [0, 100] };

// `id` is the data-row property and dataKey; the label is display text only,
// so the data shape doesn't depend on the UI language. Order must match the
// child order below: stacking runs in child order, and the tooltip resolves a
// line's dot colour by its position (see resolveDotColor in chart-tooltip.tsx).
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
 * One chart row per month in range. Exported for tests: visx sizes itself from
 * a real layout, which jsdom can't give it, so a rendered chart proves nothing
 * about these numbers.
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
    // Denominator is the published 300000 row, not the outcome rows summed,
    // matching the Outcomes gauge and the stats cards. Guard the divisor, not
    // the result: Line plots NaN or Infinity at pixel 0, the top of the plot.
    const processed = Number(row.processed);
    row[RATE_ID] = processed > 0 ? (sumOf(STATUS_CODES.GRANTED) / processed) * 100 : 0;
    return row;
  });
};

/**
 * The tallest thing on the count axis: a stacked bar (carried over + received)
 * or the processed line, whichever is higher in any month. Compare mode shares
 * the greater of the two bureaus' values so both panes draw to one scale.
 */
export const intakeAxisMax = (
  data: ImmigrationChartData['data'],
  filters: ImmigrationChartData['filters'],
  range: ImmigrationChartData['range']
): number =>
  buildIntakeRows(data, filters, range).reduce(
    (max, row) => Math.max(max, Number(row.pending) + Number(row.received), Number(row.processed)),
    0
  );

/** Marker details shown inside the shared crosshair tooltip. */
const TooltipMarkers: React.FC<{ markers: ChartMarker[] }> = ({ markers }) => {
  const active = useActiveMarkers(markers);
  return active.length > 0 ? <MarkerTooltipContent markers={active} /> : null;
};

export const IntakeProcessingBarChart: React.FC<ImmigrationChartData> = ({ data, filters, range, yMax, hidePolicyList }) => {
  const { t, formatters } = useLocale();
  const { bureau, type } = filters;
  const series = useMemo(() => SERIES.map((entry) => ({ ...entry, label: t(entry.labelKey) })), [t]);
  const months = useMemo(() => monthsForRange(getAllMonths(data), range), [data, range]);
  // Keyed on the filter values, not the object, which is rebuilt on every
  // parent render (ActiveChart's memo compares them the same way).
  const chartData = useMemo(() => buildIntakeRows(data, { bureau, type }, range), [data, bureau, type, range]);
  // The right axis defaults to a flat 40px, leaving 32px of text after
  // y-axis.tsx's padding: too narrow for fr/de "100 %", which can't wrap and
  // overflows the card. Measure it, as estimateAxisMarginLeft does on the left.
  const rateAxisMargin = useMemo(
    () => Math.max(40, Math.ceil(measureLabelWidth(formatters.percent(100, 0))) + 16),
    [formatters]
  );

  // The rate axis is always pinned; a shared max additionally pins the count
  // axis. Rounded up with the same `nice` step the chart would apply itself, so
  // the ticks read the same as an unshared axis.
  const yAxisDomains = useMemo<Record<string, [number, number]>>(
    () => (yMax && yMax > 0 ? { ...RATE_AXIS_DOMAIN, left: niceYDomain([0, yMax]) } : RATE_AXIS_DOMAIN),
    [yMax]
  );

  const { visible: events, markers } = usePolicyMarkers(POLICY_EVENTS, months);

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
          yAxisDomains={yAxisDomains}
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
          {/* `fan={false}`: the 50px fan arc reaches straight through the
              neighbouring markers on a monthly axis. A shared month stays one
              badged circle, and the tooltip below lists both events. */}
          <ChartMarkers items={markers} size={months.length > 48 ? 18 : 24} fan={false} />
          {/* Rows are named explicitly, or the tooltip shows raw series ids.
              They stay in child order: the dot layer looks a line's colour up
              by index. Only the two lines get a dot; a stacked bar's dot sits
              at its raw axis value, nowhere near its segment. */}
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
          >
            <TooltipMarkers markers={markers} />
          </ChartTooltip>
        </ComposedChart>
      </div>
      {!hidePolicyList && <PolicyEventList events={events} />}
    </div>
  );
};
