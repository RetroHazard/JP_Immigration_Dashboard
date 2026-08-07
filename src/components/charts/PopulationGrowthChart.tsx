// src/components/charts/PopulationGrowthChart.tsx
// The headline view: the whole foreign-resident population per half-year as
// stacked bars on Bklit's ComposedChart — 2M to 4M with the COVID dip in the
// middle — split by status group (why people are here) or, via the toggle,
// by world region (where they are from). Event markers annotate the moments
// the shape of the data changes: the Specified Skilled Worker launch, the
// pandemic border closure, and the 2015 Korea reporting split.
'use client';

import { useMemo, useState } from 'react';

import { BadgeCheck, Plane, Split } from 'lucide-react';
import type React from 'react';

import type { StatusGroup } from '../../constants/residenceStatuses';
import { useLocale } from '../../i18n/LocaleContext';
import { useRegionLabel, useStatusGroupLabel } from '../../i18n/useDomainLabels';
import { GROUP_COLOR } from '../../utils/residenceStatusTree';
import { periodToDate } from '../../utils/residentPeriod';
import {
  buildRegionSeries,
  buildStatusGroupSeries,
  type GrowthBreakdown,
  REGION_COLOR,
} from '../../utils/residentsGrowth';
import { ComposedChart } from '../bklit/charts/composed-chart';
import { Grid } from '../bklit/charts/grid';
import { type ChartMarker, ChartMarkers, MarkerTooltipContent, useActiveMarkers } from '../bklit/charts/markers';
import { SeriesBar } from '../bklit/charts/series-bar';
import { ChartTooltip } from '../bklit/charts/tooltip';
import { XAxis } from '../bklit/charts/x-axis';
import { YAxis } from '../bklit/charts/y-axis';
import type { ResidentChartData } from '../common/ChartComponents';
import { SeriesLegend } from '../common/SeriesLegend';

/**
 * The events worth pinning to the timeline. Dates are half-year keys matched
 * against the plotted periods, so a marker outside the visible window (or a
 * range that starts after it) simply isn't rendered.
 */
const EVENTS = [
  {
    period: '2015-12',
    icon: <Split className="size-3.5" aria-hidden="true" />,
    titleKey: 'residents.markerKoreaSplit.title',
    descriptionKey: 'residents.markerKoreaSplit.description',
  },
  {
    period: '2019-06',
    icon: <BadgeCheck className="size-3.5" aria-hidden="true" />,
    titleKey: 'residents.markerSsw.title',
    descriptionKey: 'residents.markerSsw.description',
  },
  {
    period: '2020-06',
    icon: <Plane className="size-3.5" aria-hidden="true" />,
    titleKey: 'residents.markerCovid.title',
    descriptionKey: 'residents.markerCovid.description',
  },
] as const;

/** Marker details shown inside the shared crosshair tooltip. */
const TooltipMarkers: React.FC<{ markers: ChartMarker[] }> = ({ markers }) => {
  const active = useActiveMarkers(markers);
  return active.length > 0 ? <MarkerTooltipContent markers={active} /> : null;
};

export const PopulationGrowthChart: React.FC<ResidentChartData> = ({ data, filters, range }) => {
  const { t } = useLocale();
  const groupLabel = useStatusGroupLabel();
  const regionLabel = useRegionLabel();
  const [breakdown, setBreakdown] = useState<GrowthBreakdown>('group');
  const [hiddenSeries, setHiddenSeries] = useState<ReadonlySet<string>>(() => new Set());

  const { keys, rows } = useMemo(
    () =>
      breakdown === 'group'
        ? buildStatusGroupSeries(data, { nationality: filters.nationality, region: filters.region }, range)
        : buildRegionSeries(data, { nationality: filters.nationality, region: filters.region }, range),
    [breakdown, data, filters.nationality, filters.region, range]
  );

  const series = useMemo(
    () =>
      keys.map((key) => ({
        id: key,
        color: breakdown === 'group' ? GROUP_COLOR[key as StatusGroup] : (REGION_COLOR[key] ?? 'var(--chart-8)'),
        label: breakdown === 'group' ? groupLabel(key as StatusGroup) : regionLabel(key),
      })),
    [keys, breakdown, groupLabel, regionLabel]
  );

  const chartData = useMemo(
    () =>
      rows.map((row) => {
        const point: Record<string, unknown> = { date: periodToDate(row.period), total: row.total };
        for (const key of keys) point[key] = row.values[key] ?? 0;
        return point;
      }),
    [rows, keys]
  );

  const markers: ChartMarker[] = useMemo(() => {
    const plotted = new Set(rows.map((row) => row.period));
    return EVENTS.filter((event) => plotted.has(event.period)).map((event) => ({
      date: periodToDate(event.period),
      icon: event.icon,
      title: t(event.titleKey),
      description: t(event.descriptionKey),
    }));
  }, [rows, t]);

  const visible = series.filter((entry) => !hiddenSeries.has(entry.id));

  const toggleSeries = (id: string) =>
    setHiddenSeries((previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  if (series.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground">
        {t('common.noDataForFilters')}
      </div>
    );
  }

  return (
    <div className="chart-card-content">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex gap-1 text-xs" role="group" aria-label={t('charts.growth.label')}>
          {(['group', 'region'] as GrowthBreakdown[]).map((option) => (
            <button
              key={option}
              onClick={() => setBreakdown(option)}
              aria-pressed={breakdown === option}
              className={
                breakdown === option
                  ? 'rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground'
                  : 'rounded-md px-2 py-1 text-secondary-foreground hover:bg-muted'
              }
            >
              {t(option === 'group' ? 'residents.stackByGroup' : 'residents.stackByRegion')}
            </button>
          ))}
        </div>
        <SeriesLegend
          items={series.map((entry) => ({
            id: entry.id,
            label: entry.label,
            color: entry.color,
            hidden: hiddenSeries.has(entry.id),
          }))}
          onToggle={toggleSeries}
          toggleTitle={(item) => t(item.hidden ? 'chart.legendShow' : 'chart.legendHide', { series: item.label })}
        />
      </div>
      {visible.length === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground">
          {t('chart.allSeriesHidden')}
        </div>
      ) : (
        <div className="chart-container" role="img" aria-label={t('charts.growth.aria')}>
          <ComposedChart data={chartData} stacked stackGap={1} maxBarSize={18} aspectRatio="16 / 8">
            <Grid horizontal />
            <YAxis />
            {visible.map((entry) => (
              <SeriesBar key={entry.id} dataKey={entry.id} fill={entry.color} />
            ))}
            <XAxis />
            <ChartMarkers items={markers} size={24} />
            <ChartTooltip
              rows={(point) => [
                ...visible.map((entry) => ({
                  color: entry.color,
                  label: entry.label,
                  value: Number(point[entry.id] ?? 0),
                })),
                {
                  color: 'var(--chart-foreground)',
                  label: t('residents.growthTotal'),
                  value: visible.reduce((sum, entry) => sum + Number(point[entry.id] ?? 0), 0),
                },
              ]}
            >
              <TooltipMarkers markers={markers} />
            </ChartTooltip>
          </ComposedChart>
        </div>
      )}
    </div>
  );
};
