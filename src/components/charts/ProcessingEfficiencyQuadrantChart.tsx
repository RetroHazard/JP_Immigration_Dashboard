// src/components/charts/ProcessingEfficiencyQuadrantChart.tsx
// Processing Efficiency as a quadrant scatter: completion rate against intake
// volume per bureau, bubble size carrying processed volume, with median
// guides splitting the plot so high-volume bureaus falling behind stand out
// spatially. Purpose-built SVG on the design tokens (Bklit's ScatterChart is
// time-x with a fixed 0-100 y-domain, so it can't express this); the clip
// reveal, crosshair, and hover card follow the Bklit visual language, and the
// rate axis zooms to the data (dot marks tolerate a non-zero baseline — the
// tick labels make the floor explicit).
//
// NOT currently registered — the ranked lollipop is the live Processing
// Efficiency view. Same data and props contract; swap the `efficiency` entry
// in ChartComponents.tsx to switch over.
'use client';

import { useEffect, useId, useMemo, useState } from 'react';

import { animate } from 'animejs';
import { scaleLinear, scaleSqrt } from 'd3-scale';
import type React from 'react';
import useMeasure from 'react-use-measure';

import { useTheme } from '../../contexts/ThemeContext';
import { useBureauLabel } from '../../i18n/useDomainLabels';
import { useAnimeScope } from '../../lib/motion';
import type { EfficiencyPoint } from '../../utils/processingEfficiency';
import { computeEfficiencyPoints, fmtCount, median } from '../../utils/processingEfficiency';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { EfficiencyHoverCard } from './EfficiencyHoverCard';

const MARGIN = { top: 18, right: 26, bottom: 42, left: 46 };
const LABELED_BUBBLES = 5;
/** Median guides are meaningless for a near-empty plot (e.g. a single-bureau filter) */
const MIN_QUADRANT_POINTS = 4;

interface Hover {
  point: EfficiencyPoint;
  x: number;
  y: number;
}

export const ProcessingEfficiencyQuadrantChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const { isDarkMode } = useTheme();
  const bureauLabel = useBureauLabel();
  const clipId = `reveal-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [measureRef, bounds] = useMeasure({ debounce: 10 });
  const [hovered, setHovered] = useState<Hover | null>(null);

  const points = useMemo(
    () => computeEfficiencyPoints(data, filters, range, isDarkMode, bureauLabel),
    [data, filters, range, isDarkMode, bureauLabel]
  );

  const W = Math.round(bounds.width);
  const H = Math.min(Math.max(Math.round(W * 0.55), 300), 430);
  const ready = W > 0 && points.length > 0;

  // Replay the reveal when the selection changes (Bklit's revealSignature
  // idea), but not on plain resizes.
  const selectionKey = `${filters.bureau}|${filters.type}|${range}`;
  useEffect(() => setHovered(null), [selectionKey]);
  const revealRoot = useAnimeScope<HTMLDivElement>(() => {
    animate('[data-reveal-rect]', { width: [0, W], duration: 1100, ease: 'cubicBezier(0.85, 0, 0.15, 1)' });
  }, [selectionKey, ready]);

  const { xScale, yScale, rScale, rateFloor, rateTop, xTickStep } = useMemo(() => {
    const maxReceived = Math.max(...points.map((p) => p.received), 1);
    const maxRate = Math.max(...points.map((p) => p.rate), 0);
    const minRate = Math.min(...points.map((p) => p.rate), maxRate);
    // Zoom the rate axis to the data; completed volume can exceed intake in
    // backlog-clearing months, so the top isn't hard-capped at 100.
    const top = Math.max(100, Math.ceil(maxRate / 5) * 5);
    const floor = Math.max(Math.min(Math.floor(minRate / 10) * 10, top - 20), 0);
    const maxX = maxReceived * 1.08;
    return {
      xScale: scaleLinear().domain([0, maxX]).range([MARGIN.left, W - MARGIN.right]),
      yScale: scaleLinear()
        .domain([floor, top])
        .range([H - MARGIN.bottom, MARGIN.top]),
      rScale: scaleSqrt()
        .domain([0, Math.max(...points.map((p) => p.processed), 1)])
        .range([3, Math.max(Math.min(W / 21, 36), 22)]),
      rateFloor: floor,
      rateTop: top,
      xTickStep: maxX > 100000 ? 25000 : maxX > 40000 ? 10000 : maxX > 8000 ? 5000 : 1000,
    };
  }, [points, W, H]);

  if (points.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        No data for this combination of filters.
      </div>
    );
  }

  const yTicks: number[] = [];
  const yStep = rateTop - rateFloor <= 40 ? 5 : 10;
  for (let tick = rateFloor; tick <= rateTop; tick += yStep) yTicks.push(tick);
  const xTicks: number[] = [];
  for (let tick = 0; tick <= xScale.domain()[1]; tick += xTickStep) xTicks.push(tick);

  const showQuadrants = points.length >= MIN_QUADRANT_POINTS;
  const medianReceived = median(points.map((p) => p.received));
  const medianRate = median(points.map((p) => p.rate));
  const byVolume = [...points].sort((a, b) => b.received - a.received);
  const labeled = [...points].sort((a, b) => b.processed - a.processed).slice(0, LABELED_BUBBLES);

  const hoverProps = (point: EfficiencyPoint) => ({
    onPointerEnter: (e: React.PointerEvent) => setHovered({ point, x: e.clientX, y: e.clientY }),
    onPointerMove: (e: React.PointerEvent) => setHovered({ point, x: e.clientX, y: e.clientY }),
    onPointerDown: (e: React.PointerEvent) => setHovered({ point, x: e.clientX, y: e.clientY }),
    onPointerLeave: () => setHovered(null),
  });

  return (
    <div className="card-content">
      <div
        className="relative"
        ref={(node) => {
          measureRef(node);
          revealRoot.current = node;
        }}
      >
        {ready && (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block w-full"
            style={{ touchAction: 'pan-y' }}
            role="img"
            aria-label="Quadrant chart of completion rate against received volume per bureau; bubble size shows processed volume"
            onPointerLeave={() => setHovered(null)}
          >
            {/* Grid + axes */}
            {yTicks.map((tick) => (
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
                  y={yScale(tick) + 3.5}
                  textAnchor="end"
                  fontSize={10.5}
                  fill="var(--chart-foreground)"
                >
                  {tick}%
                </text>
              </g>
            ))}
            {xTicks.map((tick) => (
              <text
                key={`x${tick}`}
                x={xScale(tick)}
                y={H - MARGIN.bottom + 17}
                textAnchor="middle"
                fontSize={10.5}
                fill="var(--chart-foreground)"
              >
                {fmtCount(tick)}
              </text>
            ))}
            <text
              x={(MARGIN.left + W - MARGIN.right) / 2}
              y={H - 7}
              textAnchor="middle"
              fontSize={10.5}
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
            <text x={W - MARGIN.right} y={yScale(100) - 5} textAnchor="end" fontSize={9.5} fill="var(--chart-foreground)">
              100% of intake completed
            </text>

            {/* Median quadrants; the shaded region is the watch-list */}
            {showQuadrants && (
              <g>
                <rect
                  x={xScale(medianReceived)}
                  y={yScale(medianRate)}
                  width={W - MARGIN.right - xScale(medianReceived)}
                  height={H - MARGIN.bottom - yScale(medianRate)}
                  fill="var(--chart-segment-background)"
                  rx={4}
                />
                <line
                  x1={xScale(medianReceived)}
                  x2={xScale(medianReceived)}
                  y1={MARGIN.top}
                  y2={H - MARGIN.bottom}
                  stroke="var(--chart-crosshair)"
                  strokeDasharray="2 4"
                  opacity={0.7}
                />
                <line
                  x1={MARGIN.left}
                  x2={W - MARGIN.right}
                  y1={yScale(medianRate)}
                  y2={yScale(medianRate)}
                  stroke="var(--chart-crosshair)"
                  strokeDasharray="2 4"
                  opacity={0.7}
                />
                <text
                  x={W - MARGIN.right - 6}
                  y={MARGIN.top + 11}
                  textAnchor="end"
                  fontSize={9}
                  fontWeight={600}
                  letterSpacing="0.06em"
                  fill="var(--chart-foreground)"
                >
                  HIGH VOLUME · KEEPING PACE
                </text>
                <text
                  x={W - MARGIN.right - 6}
                  y={H - MARGIN.bottom - 8}
                  textAnchor="end"
                  fontSize={9}
                  fontWeight={600}
                  letterSpacing="0.06em"
                  fill="var(--chart-foreground)"
                >
                  HIGH VOLUME · FALLING BEHIND
                </text>
              </g>
            )}

            {/* Crosshair guides for the hovered bureau */}
            {hovered && (
              <g pointerEvents="none">
                <line
                  x1={xScale(hovered.point.received)}
                  x2={xScale(hovered.point.received)}
                  y1={MARGIN.top}
                  y2={H - MARGIN.bottom}
                  stroke="var(--chart-crosshair)"
                  strokeDasharray="3 3"
                  opacity={0.9}
                />
                <line
                  x1={MARGIN.left}
                  x2={W - MARGIN.right}
                  y1={yScale(hovered.point.rate)}
                  y2={yScale(hovered.point.rate)}
                  stroke="var(--chart-crosshair)"
                  strokeDasharray="3 3"
                  opacity={0.9}
                />
              </g>
            )}

            {/* Plot, revealed left-to-right on enter */}
            <defs>
              <clipPath id={clipId}>
                <rect data-reveal-rect x={0} y={0} width={W} height={H} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              {byVolume.map((point) => (
                <circle
                  key={point.code}
                  cx={xScale(point.received)}
                  cy={yScale(point.rate)}
                  r={rScale(point.processed)}
                  fill={point.color}
                  fillOpacity={hovered ? (hovered.point.code === point.code ? 0.85 : 0.16) : 0.6}
                  stroke={point.outline}
                  strokeWidth={1.5}
                  strokeDasharray={point.isAirport ? '4 2.5' : undefined}
                  className="cursor-pointer transition-[fill-opacity] duration-150"
                  {...hoverProps(point)}
                />
              ))}
              {labeled.map((point) => (
                <text
                  key={`label-${point.code}`}
                  x={xScale(point.received)}
                  y={yScale(point.rate) - rScale(point.processed) - 6}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="var(--chart-label)"
                  pointerEvents="none"
                >
                  {point.label}
                </text>
              ))}
            </g>
          </svg>
        )}
        {hovered && <EfficiencyHoverCard point={hovered.point} x={hovered.x} y={hovered.y} />}
      </div>
    </div>
  );
};
