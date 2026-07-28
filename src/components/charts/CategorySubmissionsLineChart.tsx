// src/components/charts/CategorySubmissionsLineChart.tsx
// Monthly new submissions per application type, on Bklit's LineChart.
// Legend entries toggle their series; the y-domain tweens to the visible set.
'use client';

import { useMemo, useState } from 'react';

import type React from 'react';
import { curveMonotoneX } from '@visx/curve';

import { STATUS_CODES } from '../../constants/statusCodes';
import { bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import { Grid } from '../bklit/charts/grid';
import { Line, LineChart } from '../bklit/charts/line-chart';
import { ChartTooltip } from '../bklit/charts/tooltip';
import { XAxis } from '../bklit/charts/x-axis';
import { YAxis } from '../bklit/charts/y-axis';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { SeriesLegend } from '../common/SeriesLegend';

// `id` is the data-row property, the chart's dataKey, and the hide/show
// identity; `type` is the e-Stat application code the values come from;
// `label` is display text only. All three used to be one string, so toggling a
// series and plotting it both depended on the UI language.
const SERIES = [
  { id: 'acquisition', label: 'Acquisition', type: '10', color: 'var(--chart-1)' },
  { id: 'extension', label: 'Extension', type: '20', color: 'var(--chart-2)' },
  { id: 'change', label: 'Change of Status', type: '30', color: 'var(--chart-3)' },
  { id: 'activity', label: 'Activity Permission', type: '40', color: 'var(--chart-4)' },
  { id: 'reentry', label: 'Re-entry', type: '50', color: 'var(--chart-5)' },
  { id: 'permanent', label: 'Permanent Residence', type: '60', color: 'var(--chart-6)' },
] as const;

export const CategorySubmissionsLineChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const [hiddenSeries, setHiddenSeries] = useState<ReadonlySet<string>>(() => new Set());
  const toggleSeries = (id: string) =>
    setHiddenSeries((previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const visibleSeries = SERIES.filter((series) => !hiddenSeries.has(series.id));

  const chartData = useMemo(() => {
    const months = monthsForRange(getAllMonths(data), range);
    return months.map((month) => {
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
  }, [data, filters.bureau, range]);

  return (
    <div className="card-content">
      <SeriesLegend
        className="mb-2"
        items={SERIES.map((series) => ({
          id: series.id,
          label: series.label,
          color: series.color,
          shape: 'line',
          hidden: hiddenSeries.has(series.id),
        }))}
        onToggle={toggleSeries}
        toggleTitle={(item) => (item.hidden ? `Show ${item.label}` : `Hide ${item.label}`)}
      />
      {visibleSeries.length === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground">
          All series hidden — click a legend entry to show one.
        </div>
      ) : (
        <div
          className="chart-container"
          role="img"
          aria-label="Line chart of monthly new submissions per application type"
        >
          <LineChart data={chartData} aspectRatio="16 / 8">
            <Grid horizontal />
            <YAxis />
            {visibleSeries.map((series) => (
              <Line
                key={series.id}
                dataKey={series.id}
                curve={curveMonotoneX}
                stroke={series.color}
                strokeWidth={2}
                fadeEdges={false}
              />
            ))}
            <XAxis />
            {/* Rows are named explicitly: the tooltip would otherwise show the
                raw series ids now that those are no longer display text. */}
            <ChartTooltip
              rows={(point) =>
                visibleSeries.map((series) => ({
                  color: series.color,
                  label: series.label,
                  value: Number(point[series.id] ?? 0),
                }))
              }
            />
          </LineChart>
        </div>
      )}
    </div>
  );
};
