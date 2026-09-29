// src/components/charts/CategorySubmissionsLineChart.tsx
// Monthly new submissions per application type, on Bklit's LineChart.
// Legend entries toggle their series; the y-domain tweens to the visible set.
'use client';

import { useMemo, useState } from 'react';

import type React from 'react';
import { curveMonotoneX } from '@visx/curve';

import { STATUS_CODES } from '../../constants/statusCodes';
import { useLocale } from '../../i18n/LocaleContext';
import { bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import { Grid } from '../bklit/charts/grid';
import { Line, LineChart } from '../bklit/charts/line-chart';
import { ChartTooltip } from '../bklit/charts/tooltip';
import { XAxis } from '../bklit/charts/x-axis';
import { YAxis } from '../bklit/charts/y-axis';
import { niceYDomain } from '../bklit/charts/y-domain-utils';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { SeriesLegend } from '../common/SeriesLegend';

// `id` is the data-row property, the chart's dataKey, and the hide/show
// identity; `type` is the e-Stat application code the values come from;
// `label` is display text only. All three used to be one string, so toggling a
// series and plotting it both depended on the UI language.
const SERIES = [
  { id: 'acquisition', labelKey: 'chart.types.series.acquisition', type: '10', color: 'var(--chart-1)' },
  { id: 'extension', labelKey: 'chart.types.series.extension', type: '20', color: 'var(--chart-2)' },
  { id: 'change', labelKey: 'chart.types.series.change', type: '30', color: 'var(--chart-3)' },
  { id: 'activity', labelKey: 'chart.types.series.activity', type: '40', color: 'var(--chart-4)' },
  { id: 'reentry', labelKey: 'chart.types.series.reentry', type: '50', color: 'var(--chart-5)' },
  { id: 'permanent', labelKey: 'chart.types.series.permanent', type: '60', color: 'var(--chart-6)' },
] as const;

const buildTypeRows = (
  data: ImmigrationChartData['data'],
  filters: ImmigrationChartData['filters'],
  range: ImmigrationChartData['range']
): Record<string, unknown>[] =>
  monthsForRange(getAllMonths(data), range).map((month) => {
    // 'all' bureau = the official nationwide aggregate row
    const monthData = selectData(data, {
      month,
      scope: bureauScopeFromFilter(filters.bureau),
      status: STATUS_CODES.NEW_APPLICATIONS,
    });
    const row: Record<string, unknown> = { date: new Date(`${month}-01T00:00:00`) };
    for (const series of SERIES) {
      row[series.id] = monthData.reduce((sum, entry) => (entry.type === series.type ? sum + entry.value : sum), 0);
    }
    return row;
  });

/**
 * The highest monthly value of any series. Compare mode shares the greater of
 * the two bureaus' values so both panes draw to one scale. Ignores the legend's
 * hidden series — that toggle is per pane, and a scale that moved when one pane
 * hid a line would stop the two matching.
 */
export const typesAxisMax = (
  data: ImmigrationChartData['data'],
  filters: ImmigrationChartData['filters'],
  range: ImmigrationChartData['range']
): number =>
  buildTypeRows(data, filters, range).reduce(
    (max, row) => Math.max(max, ...SERIES.map((series) => Number(row[series.id]))),
    0
  );

export const CategorySubmissionsLineChart: React.FC<ImmigrationChartData> = ({ data, filters, range, yMax }) => {
  const { t, formatters } = useLocale();
  const series = useMemo(() => SERIES.map((entry) => ({ ...entry, label: t(entry.labelKey) })), [t]);
  const [hiddenSeries, setHiddenSeries] = useState<ReadonlySet<string>>(() => new Set());
  const toggleSeries = (id: string) =>
    setHiddenSeries((previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const visibleSeries = series.filter((entry) => !hiddenSeries.has(entry.id));

  const chartData = useMemo(
    () => buildTypeRows(data, { bureau: filters.bureau, type: filters.type }, range),
    [data, filters.bureau, filters.type, range]
  );
  // Only when compare mode supplies a shared max; otherwise the domain keeps
  // tweening to whichever series are visible.
  const yAxisDomains = useMemo<Record<string, [number, number]> | undefined>(
    () => (yMax && yMax > 0 ? { left: niceYDomain([0, yMax]) } : undefined),
    [yMax]
  );

  return (
    <div className="chart-card-content">
      <SeriesLegend
        className="mb-2"
        items={series.map((entry) => ({
          id: entry.id,
          label: entry.label,
          color: entry.color,
          shape: 'line',
          hidden: hiddenSeries.has(entry.id),
        }))}
        onToggle={toggleSeries}
        toggleTitle={(item) => t(item.hidden ? 'chart.legendShow' : 'chart.legendHide', { series: item.label })}
      />
      {visibleSeries.length === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground">
          {t('chart.allSeriesHidden')}
        </div>
      ) : (
        <div
          className="chart-container"
          role="img"
          aria-label={t('charts.types.aria')}
        >
          <LineChart
            data={chartData}
            aspectRatio="16 / 8"
            yAxisDomains={yAxisDomains}
            // Monthly points are all on the 1st — the default month+day labels
            // drop the year, which is ambiguous across multi-year ranges.
            formatDateLabel={(date) => formatters.monthYear(date)}
          >
            <Grid horizontal />
            <YAxis />
            {visibleSeries.map((entry) => (
              <Line
                key={entry.id}
                dataKey={entry.id}
                curve={curveMonotoneX}
                stroke={entry.color}
                strokeWidth={2}
                fadeEdges={false}
              />
            ))}
            <XAxis />
            {/* Rows are named explicitly: the tooltip would otherwise show the
                raw series ids now that those are no longer display text. */}
            <ChartTooltip
              titleFormat={(date) => formatters.monthYear(date)}
              rows={(point) =>
                visibleSeries.map((entry) => ({
                  color: entry.color,
                  label: entry.label,
                  value: Number(point[entry.id] ?? 0),
                }))
              }
            />
          </LineChart>
        </div>
      )}
    </div>
  );
};
