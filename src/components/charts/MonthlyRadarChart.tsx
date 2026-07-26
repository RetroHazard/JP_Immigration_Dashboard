// src/components/charts/MonthlyRadarChart.tsx
// Category Mix on Bklit's RadarChart: each bureau's workload as a share of
// its own total. Nationwide view shows the top bureaus by volume WITH a
// legend (the old chart plotted up to 14 unlabeled overlapping polygons).
'use client';

import { useMemo } from 'react';

import type React from 'react';

import { applicationOptions } from '../../constants/applicationOptions';
import { bureauOptions } from '../../constants/bureauOptions';
import { STATUS_CODES } from '../../constants/statusCodes';
import { breakdownScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import { RadarArea } from '../bklit/charts/radar-area';
import { RadarAxis } from '../bklit/charts/radar-axis';
import { RadarChart } from '../bklit/charts/radar-chart';
import { RadarGrid } from '../bklit/charts/radar-grid';
import { RadarLabels } from '../bklit/charts/radar-labels';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { SeriesLegend } from '../common/SeriesLegend';

const MAX_BUREAUS = 5;
const SERIES_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

const METRICS = applicationOptions
  .filter((option) => option.value !== 'all')
  .map((option) => ({ key: option.value, label: option.short }));

export const MonthlyRadarChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const series = useMemo(() => {
    const months = monthsForRange(getAllMonths(data), range);
    const rows = selectData(data, {
      scope: breakdownScopeFromFilter(filters.bureau),
      status: STATUS_CODES.NEW_APPLICATIONS,
    }).filter((entry) => months.includes(entry.month));

    return bureauOptions
      .filter((bureau) => bureau.value !== 'all')
      .map((bureau) => {
        const bureauRows = rows.filter((entry) => entry.bureau === bureau.value);
        const total = bureauRows.reduce((sum, entry) => sum + entry.value, 0);
        const values: Record<string, number> = {};
        for (const metric of METRICS) {
          const typeTotal = bureauRows.reduce(
            (sum, entry) => (entry.type === metric.key ? sum + entry.value : sum),
            0
          );
          values[metric.key] = total > 0 ? Number(((typeTotal / total) * 100).toFixed(1)) : 0;
        }
        return { label: bureau.label, total, values };
      })
      .filter((row) => row.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, MAX_BUREAUS)
      .map((row, index) => ({ label: row.label, values: row.values, color: SERIES_COLORS[index] }));
  }, [data, filters.bureau, range]);

  if (series.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        No data for this combination of filters.
      </div>
    );
  }

  return (
    <div className="card-content">
      <SeriesLegend
        className="mb-2"
        items={series.map((row) => ({ label: row.label, color: row.color }))}
      />
      {filters.bureau === 'all' && (
        <p className="mb-2 text-xxs text-muted-foreground">
          Showing the {series.length} highest-volume bureaus. Pick a bureau in the filter above to inspect one.
        </p>
      )}
      <div
        className="flex justify-center"
        role="img"
        aria-label="Radar chart of application-type mix as a percentage of each bureau's total"
      >
        <RadarChart data={series} metrics={METRICS} size={380}>
          <RadarGrid />
          <RadarAxis />
          <RadarLabels fontSize={10} offset={16} />
          {series.map((row, index) => (
            <RadarArea key={row.label} index={index} color={row.color} />
          ))}
        </RadarChart>
      </div>
    </div>
  );
};
