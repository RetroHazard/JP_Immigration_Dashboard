// src/components/charts/CategoryMixTreemap.tsx
// Category Mix as small-multiple treemaps: one equal-sized square per bureau,
// subdivided by application type. Every square is that bureau's 100% intake
// mix, so the shape of each bureau's workload reads as a comparable
// fingerprint. Type colors match the Application Types chart.
'use client';

import { useMemo, useState } from 'react';

import { Plane } from 'lucide-react';
import type React from 'react';

import { applicationOptions } from '../../constants/applicationOptions';
import { bureauOptions } from '../../constants/bureauOptions';
import { STATUS_CODES } from '../../constants/statusCodes';
import { useTheme } from '../../contexts/ThemeContext';
import { breakdownScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { SeriesLegend } from '../common/SeriesLegend';

// Same type→color assignment as CategorySubmissionsLineChart, so an
// application type keeps one color everywhere in the dashboard.
// `ink` picks the label color with ≥3:1 contrast against that series token
// in BOTH themes: 'pale' = near-white text, 'deep' = near-black text.
const SERIES_INKS: ('pale' | 'deep')[] = ['pale', 'deep', 'deep', 'deep', 'deep', 'pale'];
const METRICS = applicationOptions
  .filter((option) => option.value !== 'all')
  .map((option, index) => ({
    key: option.value,
    short: option.short,
    label: option.label,
    color: `var(--chart-${index + 1})`,
    ink: SERIES_INKS[index],
  }));

const isAirport = (label: string) => label.toLowerCase().includes('airport');

interface TreemapRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Squarified treemap (Bruls et al.): fills width × height with one rectangle
// per weight, keeping aspect ratios as close to square as possible. Weights
// of zero get a zero-sized rect. Small and purpose-built — six rectangles
// don't warrant a hierarchy library.
const layoutTreemap = (weights: number[], width: number, height: number): TreemapRect[] => {
  const total = weights.reduce((sum, value) => sum + value, 0);
  const rects: TreemapRect[] = weights.map(() => ({ x: 0, y: 0, w: 0, h: 0 }));
  if (total <= 0) return rects;

  const scale = (width * height) / total;
  const order = weights
    .map((weight, index) => index)
    .filter((index) => weights[index] > 0)
    .sort((a, b) => weights[b] - weights[a]);

  let x = 0;
  let y = 0;
  let w = width;
  let h = height;
  let row: number[] = [];
  let rowSum = 0;

  // Worst (largest) aspect ratio in the row if laid along a side of `side` length
  const worst = (rowIndices: number[], sum: number, side: number) => {
    const thickness = (sum * scale) / side;
    return rowIndices.reduce((max, index) => {
      const length = (weights[index] * scale) / thickness;
      return Math.max(max, thickness / length, length / thickness);
    }, 0);
  };

  const layoutRow = (rowIndices: number[], sum: number) => {
    const area = sum * scale;
    if (w < h) {
      const thickness = area / w;
      let cx = x;
      for (const index of rowIndices) {
        const length = (weights[index] * scale) / thickness;
        rects[index] = { x: cx, y, w: length, h: thickness };
        cx += length;
      }
      y += thickness;
      h -= thickness;
    } else {
      const thickness = area / h;
      let cy = y;
      for (const index of rowIndices) {
        const length = (weights[index] * scale) / thickness;
        rects[index] = { x, y: cy, w: thickness, h: length };
        cy += length;
      }
      x += thickness;
      w -= thickness;
    }
  };

  for (const index of order) {
    const side = Math.min(w, h);
    if (row.length > 0 && worst([...row, index], rowSum + weights[index], side) > worst(row, rowSum, side)) {
      layoutRow(row, rowSum);
      row = [];
      rowSum = 0;
    }
    row.push(index);
    rowSum += weights[index];
  }
  if (row.length > 0) layoutRow(row, rowSum);
  return rects;
};

interface BureauMix {
  code: string;
  label: string;
  total: number;
  shares: number[];
  counts: number[];
}

const BureauTreemap: React.FC<{ row: BureauMix; isDarkMode: boolean }> = ({ row, isDarkMode }) => {
  const rects = layoutTreemap(row.shares, 100, 100);
  // In light mode the page background is near-white and the foreground is
  // near-black; in dark mode they swap, so the pale/deep pairing flips too.
  const paleInk = isDarkMode ? 'var(--foreground)' : 'var(--background)';
  const deepInk = isDarkMode ? 'var(--background)' : 'var(--foreground)';

  const summary = METRICS.map((metric, index) => ({ metric, share: row.shares[index] }))
    .filter((entry) => entry.share > 0)
    .sort((a, b) => b.share - a.share)
    .slice(0, 3)
    .map((entry) => `${entry.metric.label} ${entry.share.toFixed(1)}%`)
    .join(', ');

  return (
    <figure className="min-w-0">
      <svg
        viewBox="0 0 100 100"
        className="aspect-square w-full overflow-hidden rounded-lg"
        role="img"
        aria-label={`${row.label} intake mix: ${summary}`}
      >
        {METRICS.map((metric, index) => {
          const rect = rects[index];
          if (rect.w <= 0 || rect.h <= 0) return null;
          const showCode = rect.w >= 15 && rect.h >= 10;
          const showShare = showCode && rect.h >= 20;
          const ink = metric.ink === 'pale' ? paleInk : deepInk;
          return (
            <g key={metric.key}>
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                fill={metric.color}
                stroke="var(--card)"
                strokeWidth={1}
                className="transition-all duration-500 motion-reduce:transition-none"
              >
                <title>
                  {`${metric.label}: ${row.shares[index].toFixed(1)}% · ${row.counts[index].toLocaleString()} applications`}
                </title>
              </rect>
              {showCode && (
                <text
                  x={rect.x + rect.w / 2}
                  y={rect.y + rect.h / 2 + (showShare ? -1.5 : 2)}
                  textAnchor="middle"
                  fontSize={6}
                  fontWeight={700}
                  fill={ink}
                  className="pointer-events-none transition-all duration-500 motion-reduce:transition-none"
                >
                  {metric.short}
                </text>
              )}
              {showShare && (
                <text
                  x={rect.x + rect.w / 2}
                  y={rect.y + rect.h / 2 + 6}
                  textAnchor="middle"
                  fontSize={5}
                  fill={ink}
                  fillOpacity={0.85}
                  className="pointer-events-none transition-all duration-500 motion-reduce:transition-none"
                >
                  {row.shares[index].toFixed(1)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1.5 flex items-baseline justify-between gap-2 text-xs">
        <span className="flex min-w-0 items-center gap-1 font-medium">
          {isAirport(row.label) && (
            <Plane className="size-3 shrink-0 text-muted-foreground" aria-label="Port-of-entry office" />
          )}
          <span className="truncate">{row.label}</span>
        </span>
        <span
          className="shrink-0 text-xxs tabular-nums text-muted-foreground"
          title={`${row.total.toLocaleString()} new applications in the selected period`}
        >
          {row.total.toLocaleString()}
        </span>
      </figcaption>
    </figure>
  );
};

export const CategoryMixTreemap: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const [hideAirports, setHideAirports] = useState(false);
  const { isDarkMode } = useTheme();

  // Mix shares + counts for EVERY bureau with data in the window, volume-sorted.
  const allStats = useMemo<BureauMix[]>(() => {
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
        const counts = METRICS.map((metric) =>
          bureauRows.reduce((sum, entry) => (entry.type === metric.key ? sum + entry.value : sum), 0)
        );
        const shares = counts.map((count) => (total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0));
        return { code: bureau.value, label: bureau.label, total, shares, counts };
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <SeriesLegend items={METRICS.map((metric) => ({ label: metric.label, color: metric.color }))} />
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
      <p className="mb-3 text-xxs text-muted-foreground">
        Each square is one bureau&rsquo;s total intake; tiles show each application type&rsquo;s share of it.
      </p>
      <div
        className={
          visibleStats.length === 1
            ? 'mx-auto grid w-full max-w-sm grid-cols-1'
            : 'grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4'
        }
      >
        {visibleStats.map((row) => (
          <BureauTreemap key={row.code} row={row} isDarkMode={isDarkMode} />
        ))}
      </div>
    </div>
  );
};
