// src/components/charts/NationalityTrendChart.tsx
// The largest nationalities across every half-year the table covers, on
// Bklit's LineChart. Legend entries toggle their series.
//
// Series are ranked over the whole visible window rather than the latest
// period, so a nationality does not appear and disappear as the range changes.
'use client';

import { useMemo, useState } from 'react';

import type React from 'react';
import { curveMonotoneX } from '@visx/curve';

import { useLocale } from '../../i18n/LocaleContext';
import { useNationalityLabel } from '../../i18n/useDomainLabels';
import { periodToDate } from '../../utils/residentPeriod';
import {
  getAllPeriods,
  mergeContinuedSeries,
  periodsForRange,
  selectResidents,
  topCodesBy,
  totalsBy,
} from '../../utils/residentsSelectors';
import { Grid } from '../bklit/charts/grid';
import { Line, LineChart } from '../bklit/charts/line-chart';
import { ChartTooltip } from '../bklit/charts/tooltip';
import { XAxis } from '../bklit/charts/x-axis';
import { YAxis } from '../bklit/charts/y-axis';
import type { ResidentChartData } from '../common/ChartComponents';
import { SeriesLegend } from '../common/SeriesLegend';

/** Enough to show the shape of the population without an unreadable legend. */
const TOP_N = 8;
const SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-mix-1)',
  'var(--chart-mix-4)',
];

export const NationalityTrendChart: React.FC<ResidentChartData> = ({ data, filters, range }) => {
  const { t } = useLocale();
  const nationalityLabel = useNationalityLabel();
  const [hiddenSeries, setHiddenSeries] = useState<ReadonlySet<string>>(() => new Set());

  const { chartData, series } = useMemo(() => {
    const periods = periodsForRange(getAllPeriods(data), range);
    // Folded before ranking: 韓国 and 朝鮮 would otherwise each rank on their
    // post-2015 figures alone, and both would draw a line that starts partway
    // across the chart.
    const rows = mergeContinuedSeries(selectResidents(data, { periods, status: filters.status }));
    const codes = topCodesBy(rows, 'nationality', TOP_N);

    const byPeriod = new Map(periods.map((period) => [period, new Map<string, number>()]));
    for (const row of rows) {
      const bucket = byPeriod.get(row.period);
      if (bucket) bucket.set(row.nationality, (bucket.get(row.nationality) ?? 0) + row.value);
    }

    return {
      series: codes.map((code, index) => ({
        id: code,
        color: SERIES_COLORS[index % SERIES_COLORS.length],
      })),
      chartData: periods.map((period) => {
        const bucket = byPeriod.get(period);
        const row: Record<string, unknown> = { date: periodToDate(period) };
        for (const code of codes) {
          // undefined, not 0: a series that did not exist in this period (韓国
          // before 2015, say) leaves a gap rather than dropping to the axis and
          // implying nobody held that nationality.
          row[code] = bucket?.get(code);
        }
        return row;
      }),
    };
  }, [data, filters.status, range]);

  const labelled = series.map((entry) => ({ ...entry, label: nationalityLabel(entry.id) }));
  const visible = labelled.filter((entry) => !hiddenSeries.has(entry.id));

  const toggleSeries = (id: string) =>
    setHiddenSeries((previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  if (labelled.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground">
        {t('common.noDataForFilters')}
      </div>
    );
  }

  return (
    <div className="chart-card-content">
      <SeriesLegend
        className="mb-2"
        items={labelled.map((entry) => ({
          id: entry.id,
          label: entry.label,
          color: entry.color,
          shape: 'line',
          hidden: hiddenSeries.has(entry.id),
        }))}
        onToggle={toggleSeries}
        toggleTitle={(item) => t(item.hidden ? 'chart.legendShow' : 'chart.legendHide', { series: item.label })}
      />
      {visible.length === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground">
          {t('chart.allSeriesHidden')}
        </div>
      ) : (
        <div className="chart-container" role="img" aria-label={t('charts.origins.aria')}>
          <LineChart data={chartData} aspectRatio="16 / 8">
            <Grid horizontal />
            <YAxis />
            {visible.map((entry) => (
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
            <ChartTooltip
              rows={(point) =>
                visible
                  .filter((entry) => point[entry.id] !== undefined)
                  .map((entry) => ({
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

/** Exported for the stat tiles, which rank the same way the chart does. */
export const rankNationalities = totalsBy;
