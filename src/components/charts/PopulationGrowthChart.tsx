// src/components/charts/PopulationGrowthChart.tsx
// The headline view: the whole foreign-resident population per half-year as
// stacked bars on Bklit's ComposedChart — 2M to 4M with the COVID dip in the
// middle — split by status group (why people are here) or, via the toggle,
// by world region (where they are from). Event markers annotate the moments
// the shape of the data changes — the Specified Skilled Worker launch, the
// pandemic border closure and reopening, the 2015 Korea reporting split — from
// the shared list in src/constants/policyEvents.ts.
'use client';

import { useMemo, useState } from 'react';

import type React from 'react';

import { RESIDENT_EVENTS } from '../../constants/policyEvents';
import type { StatusGroup } from '../../constants/residenceStatuses';
import { useLocale } from '../../i18n/LocaleContext';
import { useNationalityLabel, useRegionLabel, useStatusGroupLabel } from '../../i18n/useDomainLabels';
import { GROUP_COLOR } from '../../utils/residenceStatusTree';
import { periodToDate } from '../../utils/residentPeriod';
import {
  buildNationalitySeries,
  buildRegionSeries,
  buildStatusGroupSeries,
  GROWTH_OTHER,
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
import { PolicyEventList, usePolicyMarkers } from '../common/PolicyEventList';
import { SeriesLegend } from '../common/SeriesLegend';

/** Positional hues for the nationality stack (a filtered region's countries). */
const NATIONALITY_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
];

/** The everyone-else stack segment stays visually recessive. */
const OTHER_COLOR = 'var(--muted-foreground)';

/** Marker details shown inside the shared crosshair tooltip. */
const TooltipMarkers: React.FC<{ markers: ChartMarker[] }> = ({ markers }) => {
  const active = useActiveMarkers(markers);
  return active.length > 0 ? <MarkerTooltipContent markers={active} /> : null;
};

export const PopulationGrowthChart: React.FC<ResidentChartData> = ({ data, filters, range }) => {
  const { t, formatters } = useLocale();
  const groupLabel = useStatusGroupLabel();
  const regionLabel = useRegionLabel();
  const nationalityLabel = useNationalityLabel();
  const [breakdown, setBreakdown] = useState<GrowthBreakdown>('group');
  const [hiddenSeries, setHiddenSeries] = useState<ReadonlySet<string>>(() => new Set());

  // With a region filter active, a stack "by world region" would be a single
  // full-height stripe — the region breakdown becomes that region's
  // nationalities instead, and the toggle pill says so.
  const byNationality = breakdown === 'region' && filters.region !== 'all';

  const { keys, rows } = useMemo(() => {
    const growthFilters = { nationality: filters.nationality, region: filters.region };
    if (breakdown === 'group') return buildStatusGroupSeries(data, growthFilters, range);
    return filters.region !== 'all'
      ? buildNationalitySeries(data, growthFilters, range)
      : buildRegionSeries(data, growthFilters, range);
  }, [breakdown, data, filters.nationality, filters.region, range]);

  const series = useMemo(
    () =>
      keys.map((key, index) => {
        if (breakdown === 'group') {
          return { id: key, color: GROUP_COLOR[key as StatusGroup], label: groupLabel(key as StatusGroup) };
        }
        if (byNationality) {
          return key === GROWTH_OTHER
            ? { id: key, color: OTHER_COLOR, label: t('residents.otherNationalities') }
            : { id: key, color: NATIONALITY_COLORS[index % NATIONALITY_COLORS.length], label: nationalityLabel(key) };
        }
        return { id: key, color: REGION_COLOR[key] ?? 'var(--chart-8)', label: regionLabel(key) };
      }),
    [keys, breakdown, byNationality, groupLabel, regionLabel, nationalityLabel, t]
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

  const plottedPeriods = useMemo(() => rows.map((row) => row.period), [rows]);
  const { visible: events, markers } = usePolicyMarkers(RESIDENT_EVENTS, plottedPeriods);

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
              {t(
                option === 'group'
                  ? 'residents.stackByGroup'
                  : filters.region !== 'all'
                    ? 'residents.stackByNationality'
                    : 'residents.stackByRegion'
              )}
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
        <>
          <div className="chart-container" role="img" aria-label={t('charts.growth.aria')}>
            <ComposedChart
              data={chartData}
              stacked
              stackGap={1}
              maxBarSize={18}
              aspectRatio="16 / 8"
              // Half-yearly points are all Jun 1 / Dec 1 — the default month+day
              // labels carry no year and collapse to two ticks.
              formatDateLabel={(date) => formatters.monthYear(date)}
            >
              <Grid horizontal />
              <YAxis />
              {visible.map((entry) => (
                <SeriesBar key={entry.id} dataKey={entry.id} fill={entry.color} />
              ))}
              <XAxis />
              {/* `fan={false}`: see IntakeProcessingBarChart. Half-yearly
                periods sit about a marker's width apart, so the arc would
                reach through its neighbours here too. */}
              <ChartMarkers items={markers} fan={false} size={24} />
              {/* Dots off: every series here is a bar, and the tooltip places a
                bar's dot at its raw axis value rather than on the stacked
                segment. The highlighted bars carry the reading anyway. */}
              <ChartTooltip
                showDots={false}
                titleFormat={(date) => formatters.monthYear(date)}
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
          {/* Inside the ternary: the list describes the markers on the plot, so
            it goes when every series is hidden and the plot goes with them. */}
          <PolicyEventList events={events} />
        </>
      )}
    </div>
  );
};
