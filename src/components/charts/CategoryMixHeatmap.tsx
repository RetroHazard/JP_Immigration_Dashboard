// src/components/charts/CategoryMixHeatmap.tsx
// Category Mix as a bureaus × types heatmap: every bureau is a row, every
// application type a column, and each cell is that type's share of the
// bureau's own new submissions. Fixed share bins on the sequential scale
// keep the shading comparable across periods and bureaus.
'use client';

import { useMemo, useState } from 'react';

import { Plane } from 'lucide-react';
import type React from 'react';

import { applicationOptions } from '../../constants/applicationOptions';
import { bureauOptions } from '../../constants/bureauOptions';
import { STATUS_CODES } from '../../constants/statusCodes';
import { breakdownScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import type { ImmigrationChartData } from '../common/ChartComponents';

const METRICS = applicationOptions
  .filter((option) => option.value !== 'all')
  .map((option) => ({ key: option.value, short: option.short, label: option.label }));

// Fixed bin edges (share %), so a cell's shade means the same thing in every
// period, bureau, and compare view.
const BIN_EDGES = [5, 10, 20, 35];
const BIN_LABELS = ['< 5', '5–10', '10–20', '20–35', '≥ 35'];
const binFor = (share: number) => BIN_EDGES.filter((edge) => share >= edge).length;

// The two deepest bins sit at the far end of each theme's ramp, where the
// default foreground stops contrasting; the page background is the
// opposite ink in both themes.
const cellInk = (bin: number) => (bin >= 3 ? 'text-background' : 'text-foreground');
const binColor = (bin: number) => `var(--chart-scale-0${bin + 1})`;

const isAirport = (label: string) => label.toLowerCase().includes('airport');

export const CategoryMixHeatmap: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const [hideAirports, setHideAirports] = useState(false);

  // Mix percentages for EVERY bureau with data in the window, volume-sorted.
  const allStats = useMemo(() => {
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
        return { code: bureau.value, label: bureau.label, total, values };
      })
      .filter((row) => row.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [data, filters.bureau, range]);

  const hasAirports = allStats.some((row) => isAirport(row.label));
  const visibleStats = hideAirports ? allStats.filter((row) => !isAirport(row.label)) : allStats;

  if (allStats.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        No data for this combination of filters.
      </div>
    );
  }

  return (
    <div className="card-content">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xxs text-muted-foreground">
          <span>Share of bureau&rsquo;s intake (%)</span>
          {BIN_LABELS.map((label, bin) => (
            <span key={label} className="flex items-center gap-1">
              <span
                aria-hidden="true"
                className="inline-block size-3 rounded-sm border border-border/60"
                style={{ backgroundColor: binColor(bin) }}
              />
              {label}
            </span>
          ))}
        </div>
        {hasAirports && (
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-secondary-foreground">
            <input
              type="checkbox"
              checked={hideAirports}
              onChange={(event) => setHideAirports(event.target.checked)}
              className="accent-primary"
            />
            Hide port-of-entry offices
          </label>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[480px] text-xs">
          <caption className="sr-only">
            Application-type mix per bureau, as a percentage of each bureau&rsquo;s total new submissions
          </caption>
          <thead className="bg-muted text-left">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">
                Bureau
              </th>
              {METRICS.map((metric) => (
                <th key={metric.key} scope="col" className="px-2 py-2 text-center font-semibold" title={metric.label}>
                  <abbr className="no-underline" title={metric.label}>
                    {metric.short}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleStats.map((row) => (
              <tr key={row.code} className="border-t border-border">
                <th scope="row" className="whitespace-nowrap px-3 py-1.5 text-left font-medium">
                  <span className="flex items-center gap-1.5">
                    {isAirport(row.label) && (
                      <Plane className="size-3 shrink-0 text-muted-foreground" aria-label="Port-of-entry office" />
                    )}
                    {row.label}
                  </span>
                </th>
                {METRICS.map((metric) => {
                  const share = row.values[metric.key];
                  const bin = binFor(share);
                  return (
                    <td
                      key={metric.key}
                      className={`px-2 py-1.5 text-center font-medium tabular-nums ${cellInk(bin)}`}
                      style={{ backgroundColor: binColor(bin) }}
                      title={`${row.label} — ${metric.label}: ${share.toFixed(1)}% of intake`}
                    >
                      {share.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
