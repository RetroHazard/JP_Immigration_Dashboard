// src/components/charts/NationalityMoversChart.tsx
// Biggest Movers: the largest gains and losses between the two ends of the
// selected range, as a diverging bar chart.
//
// Both ends are single snapshots rather than sums — the table reports a stock,
// so "change over three years" means the 2022-12 figure subtracted from the
// 2025-12 one, not the difference between two three-year totals.
//
// A series that does not exist at both ends is dropped rather than treated as
// a move from zero: 韓国 appears in 2015-12 because 韓国・朝鮮 was split, not
// because 400,000 people arrived that half-year.
//
// Deliberately hand-rolled rather than Bklit: the vendored BarChart floors
// its value domain at zero (`domain: [0, maxValue * 1.1]`, bar-chart.tsx), so
// it cannot draw the negative half of a diverging bar.
'use client';

import { useMemo, useState } from 'react';

import type React from 'react';

import { useLocale } from '../../i18n/LocaleContext';
import { useNationalityLabel, useResidenceStatusLabel } from '../../i18n/useDomainLabels';
import { formatPeriod } from '../../utils/residentPeriod';
import {
  getAllPeriods,
  mergeContinuedSeries,
  periodsForRange,
  selectResidents,
  totalsBy,
} from '../../utils/residentsSelectors';
import type { ResidentChartData } from '../common/ChartComponents';

/** Rows per side. Enough to see the pattern, few enough to read the labels. */
const TOP_N = 10;

type Axis = 'nationality' | 'status';

interface Mover {
  code: string;
  from: number;
  to: number;
  delta: number;
}

export const NationalityMoversChart: React.FC<ResidentChartData> = ({ data, filters, range }) => {
  const { t, formatters } = useLocale();
  const nationalityLabel = useNationalityLabel();
  const statusLabel = useResidenceStatusLabel();
  const [axis, setAxis] = useState<Axis>('nationality');

  const { movers, first, last, scale } = useMemo(() => {
    const periods = periodsForRange(getAllPeriods(data), range);
    const first = periods.at(0) ?? null;
    const last = periods.at(-1) ?? null;
    if (!first || !last || first === last) return { movers: [], first, last, scale: 0 };

    // The category filter narrows the population on the nationality axis; on
    // the status axis it would reduce the chart to that category's few bars,
    // so it is ignored there. The region filter applies to both axes.
    const group = axis === 'nationality' ? filters.group : 'all';
    // Folded so the 2015 Korea split reads as one population rather than a
    // 500,000-person disappearance and two arrivals.
    const at = (period: string) =>
      totalsBy(
        axis === 'nationality'
          ? mergeContinuedSeries(selectResidents(data, { period, region: filters.region, group }))
          : selectResidents(data, { period, region: filters.region, group }),
        axis
      );
    const before = at(first);
    const after = at(last);

    const movers: Mover[] = [...new Set([...before.keys(), ...after.keys()])]
      .filter((code) => before.has(code) && after.has(code))
      .map((code) => {
        const from = before.get(code) ?? 0;
        const to = after.get(code) ?? 0;
        return { code, from, to, delta: to - from };
      })
      .filter((mover) => mover.delta !== 0)
      .sort((a, b) => b.delta - a.delta);

    const top = [...movers.slice(0, TOP_N), ...movers.slice(-TOP_N)]
      // slice(0,N) and slice(-N) overlap when there are fewer than 2N movers.
      .filter((mover, index, all) => all.findIndex((other) => other.code === mover.code) === index);

    return {
      movers: top,
      first,
      last,
      scale: Math.max(...top.map((mover) => Math.abs(mover.delta)), 0),
    };
  }, [axis, data, filters.region, filters.group, range]);

  const labelOf = axis === 'nationality' ? nationalityLabel : statusLabel;

  return (
    <div className="chart-card-content">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <div className="flex gap-1 text-xs" role="group" aria-label={t('charts.movers.label')}>
          {(['nationality', 'status'] as Axis[]).map((option) => (
            <button
              key={option}
              onClick={() => setAxis(option)}
              aria-pressed={axis === option}
              className={
                axis === option
                  ? 'rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground'
                  : 'rounded-md px-2 py-1 text-secondary-foreground hover:bg-muted'
              }
            >
              {t(option === 'nationality' ? 'residents.byNationality' : 'residents.byStatus')}
            </button>
          ))}
        </div>
        {first && last && (
          <span className="text-xxs text-muted-foreground">
            {t('residents.coverageRange', {
              from: formatPeriod(first, formatters),
              to: formatPeriod(last, formatters),
            })}
          </span>
        )}
      </div>

      {movers.length === 0 || scale === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground">
          {t('residents.noChange')}
        </div>
      ) : (
        <ul className="flex flex-col gap-1" role="img" aria-label={t('charts.movers.aria')}>
          {movers.map((mover) => {
            const positive = mover.delta > 0;
            const width = `${(Math.abs(mover.delta) / scale) * 100}%`;
            return (
              <li key={mover.code} className="grid grid-cols-[minmax(0,10rem)_1fr] items-center gap-2 text-xs">
                <span className="truncate text-right text-secondary-foreground" title={labelOf(mover.code)}>
                  {labelOf(mover.code)}
                </span>
                {/* Two half-tracks around a shared centre line, so gains and
                    losses are comparable at a glance without a value axis. */}
                <span className="grid grid-cols-2 items-center">
                  <span className="flex h-4 justify-end border-r border-border">
                    {!positive && (
                      <span className="rounded-l-sm bg-destructive/70" style={{ width }} aria-hidden="true" />
                    )}
                  </span>
                  <span className="flex h-4 items-center gap-1.5">
                    {positive && (
                      <span className="h-full rounded-r-sm bg-primary/70" style={{ width }} aria-hidden="true" />
                    )}
                    <span className="whitespace-nowrap font-mono text-xxs tabular-nums text-muted-foreground">
                      {positive ? '+' : '−'}
                      {formatters.number(Math.abs(mover.delta))}
                    </span>
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
