// src/components/charts/MonthlyRadarChart.tsx
// Category Mix on Bklit's RadarChart: each bureau's workload as a share of
// its own total. The nationwide view has a bureau picker (chips) so any
// combination of bureaus can be compared, with quick actions for the
// default top-5 and excluding port-of-entry offices.
'use client';

import { useMemo, useState } from 'react';

import { Plane } from 'lucide-react';
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

const AUTO_TOP = 5;
// Readability cap: past six overlapping polygons the radar stops being legible
const MAX_SELECTED = 6;
const SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
];

const METRICS = applicationOptions
  .filter((option) => option.value !== 'all')
  .map((option) => ({ key: option.value, label: option.short }));

const isAirport = (label: string) => label.toLowerCase().includes('airport');

export const MonthlyRadarChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  // null = automatic top-N by volume (the default)
  const [selectedCodes, setSelectedCodes] = useState<string[] | null>(null);

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

  const autoCodes = useMemo(() => allStats.slice(0, AUTO_TOP).map((row) => row.code), [allStats]);
  const isSingleBureau = filters.bureau !== 'all';
  const activeCodes = isSingleBureau ? [filters.bureau] : (selectedCodes ?? autoCodes);

  const series = useMemo(
    () =>
      allStats
        .filter((row) => activeCodes.includes(row.code))
        .slice(0, MAX_SELECTED)
        .map((row, index) => ({ label: row.label, values: row.values, color: SERIES_COLORS[index] })),
    [allStats, activeCodes]
  );

  const toggleBureau = (code: string) => {
    const base = selectedCodes ?? autoCodes;
    const next = base.includes(code) ? base.filter((c) => c !== code) : [...base, code];
    if (next.length === 0 || next.length > MAX_SELECTED) return;
    setSelectedCodes(next);
  };

  const excludeAirports = () => {
    const base = selectedCodes ?? autoCodes;
    const next = base.filter((code) => {
      const bureau = allStats.find((row) => row.code === code);
      return bureau ? !isAirport(bureau.label) : true;
    });
    if (next.length > 0) setSelectedCodes(next);
  };

  const selectionHasAirports = activeCodes.some((code) => {
    const bureau = allStats.find((row) => row.code === code);
    return bureau ? isAirport(bureau.label) : false;
  });

  if (allStats.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        No data for this combination of filters.
      </div>
    );
  }

  return (
    <div className="card-content">
      {!isSingleBureau && (
        <div className="mb-2">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Bureaus to display">
            {allStats.map((row) => {
              const active = activeCodes.includes(row.code);
              const atCap = !active && activeCodes.length >= MAX_SELECTED;
              return (
                <button
                  key={row.code}
                  onClick={() => toggleBureau(row.code)}
                  aria-pressed={active}
                  disabled={atCap}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    active
                      ? 'border-transparent bg-primary text-primary-foreground'
                      : 'border-border text-secondary-foreground hover:bg-muted'
                  }`}
                >
                  {isAirport(row.label) && <Plane className="size-3" aria-hidden="true" />}
                  {row.label}
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-xxs text-muted-foreground">
            <span>Up to {MAX_SELECTED} bureaus.</span>
            <button onClick={() => setSelectedCodes(null)} className="text-primary hover:opacity-80">
              Reset to top {AUTO_TOP}
            </button>
            {selectionHasAirports && (
              <button onClick={excludeAirports} className="text-primary hover:opacity-80">
                Exclude port-of-entry offices
              </button>
            )}
          </div>
        </div>
      )}
      <SeriesLegend className="mb-2" items={series.map((row) => ({ label: row.label, color: row.color }))} />
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
