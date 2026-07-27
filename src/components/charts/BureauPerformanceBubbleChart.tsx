// src/components/charts/BureauPerformanceBubbleChart.tsx
// Processing Efficiency as a purpose-built visx bubble chart on the design
// tokens. Bklit's ScatterChart is time-x with a fixed 0-100 y-domain, so it
// can't express volume-vs-rate with a size channel; this local component
// follows the same visual language (grid, ink, tooltip tokens) instead.
// Identity is carried by direct labels + tooltip, not by 14 unlabeled hues.
'use client';

import { useMemo, useState } from 'react';

import { scaleLinear, scaleSqrt } from 'd3-scale';
import type React from 'react';

import { bureauOptions } from '../../constants/bureauOptions';
import { STATUS_CODES } from '../../constants/statusCodes';
import { breakdownScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { SeriesLegend } from '../common/SeriesLegend';

interface BubblePoint {
  code: string;
  label: string;
  color: string;
  received: number;
  processed: number;
  rate: number;
}

// Bureau flag colors (same regional identity encoding as the map)
const bureauColor = new Map(
  bureauOptions.filter((bureau) => bureau.border).map((bureau) => [bureau.value, bureau.border as string])
);

const W = 720;
const H = 380;
const MARGIN = { top: 16, right: 24, bottom: 40, left: 48 };
const LABELED_BUBBLES = 5;

export const BureauPerformanceBubbleChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const [hovered, setHovered] = useState<BubblePoint | null>(null);

  const points = useMemo(() => {
    const months = monthsForRange(getAllMonths(data), range);
    const rows = selectData(data, {
      scope: breakdownScopeFromFilter(filters.bureau),
      type: filters.type,
    }).filter((entry) => months.includes(entry.month));

    return bureauOptions
      .filter((bureau) => bureau.value !== 'all')
      .map((bureau) => {
        const bureauRows = rows.filter((entry) => entry.bureau === bureau.value);
        const received = bureauRows.reduce(
          (sum, entry) => (entry.status === STATUS_CODES.NEW_APPLICATIONS ? sum + entry.value : sum),
          0
        );
        const processed = bureauRows.reduce(
          (sum, entry) => (entry.status === STATUS_CODES.PROCESSED ? sum + entry.value : sum),
          0
        );
        return {
          code: bureau.value,
          label: bureau.label,
          color: bureauColor.get(bureau.value) ?? 'var(--chart-1)',
          received,
          processed,
          rate: received > 0 ? (processed / received) * 100 : 0,
        };
      })
      .filter((point) => point.received > 0);
  }, [data, filters.bureau, filters.type, range]);

  const { xScale, yScale, rScale } = useMemo(() => {
    const maxX = Math.max(...points.map((p) => p.received), 1);
    const maxY = Math.max(...points.map((p) => p.rate), 100);
    const maxR = Math.max(...points.map((p) => p.processed), 1);
    return {
      xScale: scaleLinear()
        .domain([0, maxX * 1.08])
        .range([MARGIN.left, W - MARGIN.right]),
      yScale: scaleLinear()
        .domain([0, Math.min(Math.ceil(maxY / 20) * 20, 160)])
        .range([H - MARGIN.bottom, MARGIN.top]),
      rScale: scaleSqrt().domain([0, maxR]).range([3, 34]),
    };
  }, [points]);

  if (points.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        No data for this combination of filters.
      </div>
    );
  }

  const labeled = [...points].sort((a, b) => b.processed - a.processed).slice(0, LABELED_BUBBLES);
  const fmtK = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`);

  return (
    <div className="card-content">
      <SeriesLegend
        className="mb-1.5"
        items={[...points]
          .sort((a, b) => b.received - a.received)
          .map((point) => ({ label: point.label, color: point.color }))}
      />
      <p className="mb-2 text-xxs text-muted-foreground">
        Color = bureau (matching the Regional Map) · bubble size = applications processed over the selected period.
      </p>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Bubble chart of completion rate against received volume per bureau; bubble size shows processed volume"
        >
          {yScale.ticks(5).map((tick) => (
            <g key={`y${tick}`}>
              <line
                x1={MARGIN.left}
                x2={W - MARGIN.right}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="var(--chart-grid)"
              />
              <text
                x={MARGIN.left - 8}
                y={yScale(tick) + 3}
                textAnchor="end"
                fontSize={10}
                fill="var(--chart-foreground)"
              >
                {tick}%
              </text>
            </g>
          ))}
          {xScale.ticks(6).map((tick) => (
            <text
              key={`x${tick}`}
              x={xScale(tick)}
              y={H - MARGIN.bottom + 16}
              textAnchor="middle"
              fontSize={10}
              fill="var(--chart-foreground)"
            >
              {fmtK(tick)}
            </text>
          ))}
          <text
            x={(MARGIN.left + W - MARGIN.right) / 2}
            y={H - 6}
            textAnchor="middle"
            fontSize={10}
            fill="var(--chart-label)"
          >
            Applications received
          </text>
          {/* 100% completion reference */}
          <line
            x1={MARGIN.left}
            x2={W - MARGIN.right}
            y1={yScale(100)}
            y2={yScale(100)}
            stroke="var(--chart-crosshair)"
            strokeDasharray="4 4"
          />
          {points.map((point) => (
            <circle
              key={point.code}
              cx={xScale(point.received)}
              cy={yScale(point.rate)}
              r={rScale(point.processed)}
              fill={point.color}
              fillOpacity={hovered?.code === point.code ? 0.85 : 0.55}
              stroke={point.color}
              strokeWidth={1.5}
              className="cursor-pointer transition-[fill-opacity]"
              onMouseEnter={() => setHovered(point)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          {labeled.map((point) => (
            <text
              key={`label-${point.code}`}
              x={xScale(point.received)}
              y={yScale(point.rate) - rScale(point.processed) - 5}
              textAnchor="middle"
              fontSize={10.5}
              fontWeight={600}
              fill="var(--chart-label)"
              pointerEvents="none"
            >
              {point.label}
            </text>
          ))}
        </svg>
        {hovered && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-soft-lg"
            style={{
              left: `${(xScale(hovered.received) / W) * 100}%`,
              top: `${(yScale(hovered.rate) / H) * 100}%`,
              transform: 'translate(-50%, calc(-100% - 12px))',
            }}
          >
            <div className="font-semibold">{hovered.label}</div>
            <div className="mt-1 grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 tabular-nums text-muted-foreground">
              <span>Received</span>
              <span className="text-right text-popover-foreground">{hovered.received.toLocaleString()}</span>
              <span>Processed</span>
              <span className="text-right text-popover-foreground">{hovered.processed.toLocaleString()}</span>
              <span>Completion</span>
              <span className="text-right text-popover-foreground">{hovered.rate.toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
