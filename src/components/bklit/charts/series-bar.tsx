"use client";

import type { Transition } from "motion/react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { chartCssVars, useChart } from "./chart-context";
import { useChartLegendHover } from "./chart-legend-hover";
import { transitionWithDelay } from "./motion-utils";
import {
  applyBarWidthRatio,
  computeSeriesBarWidth,
  findStackPosition,
} from "./series-bar-layout";

function computeSeriesBarLayout(input: {
  stacked: boolean;
  composedStackOffsets: Map<number, Map<string, number>> | undefined;
  rowIndex: number;
  dataKey: string;
  value: number;
  yScale: (n: number) => number | undefined;
  innerHeight: number;
  xCenter: number;
  barWidth: number;
  seriesCount: number;
  gap: number;
  seriesIndex: number;
  stackGap: number;
  isLastSeries: boolean;
  radius: number;
}): {
  barLeft: number;
  barHeight: number;
  effectiveRadius: number;
  valueY: number;
} {
  const {
    stacked,
    composedStackOffsets,
    rowIndex,
    dataKey,
    value,
    yScale,
    innerHeight,
    xCenter,
    barWidth,
    seriesCount,
    gap,
    seriesIndex,
    stackGap,
    isLastSeries,
    radius,
  } = input;

  if (stacked && composedStackOffsets) {
    const offset = composedStackOffsets.get(rowIndex)?.get(dataKey) ?? 0;
    const valuePos = yScale(value) ?? 0;
    let barHeight = innerHeight - valuePos;
    const offsetY = yScale(offset) ?? innerHeight;
    const gapOffset = seriesIndex * stackGap;
    const valueY = offsetY - barHeight - gapOffset;
    if (!isLastSeries && stackGap > 0) {
      barHeight = Math.max(0, barHeight - stackGap);
    }
    const barLeft = xCenter - barWidth / 2;
    const applyRounding = stackGap > 0 || isLastSeries;
    return {
      barLeft,
      barHeight,
      effectiveRadius: applyRounding ? radius : 0,
      valueY,
    };
  }

  const groupWidth =
    seriesCount * barWidth + (seriesCount > 1 ? (seriesCount - 1) * gap : 0);
  const valueY = yScale(value) ?? innerHeight;
  return {
    barLeft: xCenter - groupWidth / 2 + seriesIndex * (barWidth + gap),
    barHeight: innerHeight - valueY,
    effectiveRadius: radius,
    valueY,
  };
}

export interface SeriesBarProps {
  /** Key in data for bar height (y value) */
  dataKey: string;
  /** Fill color. Default: var(--chart-line-primary) */
  fill?: string;
  /** Tooltip dot color when fill is gradient/pattern. Default: fill */
  stroke?: string;
  /** Corner radius for bar top corners. Default: 0 (square tops, similar to Bar lineCap="butt") */
  radius?: number;
  /** Animate grow from baseline. Default: true */
  animate?: boolean;
  /** Opacity for non-hovered bars when another point is hovered (matches BarChart). Default: 0.3 */
  fadedOpacity?: number;
  /**
   * LOCAL MODIFICATION: which stack this bar joins when the chart is `stacked`.
   * Bars sharing a `stackId` stack against each other; separate stacks are drawn
   * over the same x, in child order, so a narrower one (see `widthRatio`) reads
   * as a bullet inside the wider one. Default: all bars share one stack, which
   * is upstream's only behaviour. (Re-apply after a re-vendor.)
   */
  stackId?: string;
  /**
   * LOCAL MODIFICATION: bar width as a fraction of the column's bar width,
   * still centred on the same x. Used to inset an overlaid stack. Floored so it
   * stays visible on a narrow column. Read from the first `SeriesBar` of each
   * `stackId` and applied to the whole stack — segments that rendered at
   * different widths would read as a staircase, not a stack. Default: 1.
   * (Re-apply after a re-vendor.)
   */
  widthRatio?: number;
  /**
   * LOCAL MODIFICATION: vertical gap between this stack's segments, overriding
   * the chart's `stackGap`. A gap that separates two large segments erases a
   * small one — it is subtracted from each segment's height — so a stack of
   * thin slices needs its own, usually 0. Read from the first `SeriesBar` of
   * the stack. (Re-apply after a re-vendor.)
   */
  stackGap?: number;
}

export function SeriesBar({
  dataKey,
  fill = chartCssVars.linePrimary,
  radius = 0,
  animate = true,
  fadedOpacity = 0.3,
  widthRatio = 1,
  stackGap: stackGapProp,
}: SeriesBarProps) {
  const {
    data,
    xScale,
    yScale,
    xAccessor,
    innerHeight,
    innerWidth,
    columnWidth,
    isLoaded,
    animationDuration,
    enterTransition,
    revealEpoch = 0,
    barScale,
    composedBarDataKeys,
    composedBarSize,
    composedMaxBarSize,
    composedBarGap,
    composedStacked,
    composedStackOffsets,
    composedStackGap,
    composedBarStacks,
    tooltipData,
  } = useChart();

  const barKeys = useMemo(() => {
    if (composedBarDataKeys && composedBarDataKeys.length > 0) {
      return composedBarDataKeys;
    }
    return [dataKey];
  }, [composedBarDataKeys, dataKey]);

  /** Position across every bar in the chart — what the legend hover keys off. */
  const globalSeriesIndex = useMemo(() => {
    const idx = barKeys.indexOf(dataKey);
    return idx >= 0 ? idx : 0;
  }, [barKeys, dataKey]);

  const gap = composedBarGap ?? 4;

  const stacked =
    Boolean(composedStacked) &&
    composedStackOffsets != null &&
    composedBarDataKeys != null &&
    composedBarDataKeys.length > 0;

  // LOCAL MODIFICATION: stacking maths is per stack, so a bar's offset index
  // and its "am I the top segment?" flag (which drive the stack gap and the
  // corner rounding) come from its own group, not from every bar in the chart.
  // Without `composedBarStacks` this collapses to upstream's single stack.
  // (Re-apply after a re-vendor.)
  const stackPosition = useMemo(
    () => (stacked ? findStackPosition(composedBarStacks, dataKey) : null),
    [composedBarStacks, dataKey, stacked]
  );
  const stackKeys = stackPosition?.stack.keys ?? barKeys;
  const seriesIndex = stackPosition?.index ?? globalSeriesIndex;
  const n = stackKeys.length;
  const isLastSeries = seriesIndex === n - 1;
  // The stack owns the width and the segment gap; the props are only where
  // they were declared.
  const effectiveWidthRatio = stackPosition?.stack.widthRatio ?? widthRatio;
  const stackGap =
    stackPosition?.stack.stackGap ?? stackGapProp ?? composedStackGap ?? 0;

  const barWidth = useMemo(
    () =>
      applyBarWidthRatio(
        computeSeriesBarWidth({
          innerWidth,
          dataLength: data.length,
          columnWidth,
          seriesCount: n,
          composedBarSize,
          composedMaxBarSize,
          composedBarGap: gap,
          stacked,
        }),
        effectiveWidthRatio
      ),
    [
      columnWidth,
      composedBarSize,
      composedMaxBarSize,
      data.length,
      effectiveWidthRatio,
      gap,
      innerWidth,
      n,
      stacked,
    ]
  );

  const totalAnimDuration = animationDuration || 1100;
  const staggerSpread = totalAnimDuration * 0.4;
  const calculatedStaggerDelay =
    data.length > 1 ? staggerSpread / 1000 / data.length : 0;
  const { hoveredIndex: legendHoveredIndex } = useChartLegendHover();
  const isLegendDimmed =
    legendHoveredIndex !== null && legendHoveredIndex !== globalSeriesIndex;
  const hoveredIndex = tooltipData?.index ?? null;

  if (barScale) {
    console.warn(
      "SeriesBar is for time-based ComposedChart / LineChart context. Use Bar inside BarChart for categorical x."
    );
    return null;
  }

  return (
    <g className="series-bar">
      {data.map((d, i) => {
        const value = d[dataKey];
        if (typeof value !== "number") {
          return null;
        }

        const xCenter = xScale(xAccessor(d)) ?? 0;

        const { barLeft, valueY, barHeight, effectiveRadius } =
          computeSeriesBarLayout({
            stacked,
            composedStackOffsets,
            rowIndex: i,
            dataKey,
            value,
            yScale,
            innerHeight,
            xCenter,
            barWidth,
            seriesCount: n,
            gap,
            seriesIndex,
            stackGap,
            isLastSeries,
            radius,
          });

        const categoryLabel = String(xAccessor(d).getTime());
        const isFaded =
          (hoveredIndex !== null && hoveredIndex !== i) || isLegendDimmed;

        if (animate && !isLoaded) {
          return (
            <SeriesBarRect
              barHeight={barHeight}
              barWidth={barWidth}
              calculatedStaggerDelay={calculatedStaggerDelay}
              enterTransition={enterTransition}
              fadedOpacity={fadedOpacity}
              fill={fill}
              index={i}
              innerHeight={innerHeight}
              isFaded={isFaded}
              key={`${dataKey}-${categoryLabel}-${revealEpoch}`}
              radius={effectiveRadius}
              revealEpoch={revealEpoch}
              x={barLeft}
              y={valueY}
            />
          );
        }

        return (
          <motion.rect
            animate={{ opacity: isFaded ? fadedOpacity : 1 }}
            fill={fill}
            height={barHeight}
            key={`${dataKey}-${categoryLabel}`}
            rx={effectiveRadius}
            ry={effectiveRadius}
            transition={{ opacity: { duration: 0.12 } }}
            width={barWidth}
            x={barLeft}
            y={valueY}
          />
        );
      })}
    </g>
  );
}

SeriesBar.displayName = "SeriesBar";

interface SeriesBarRectProps {
  x: number;
  y: number;
  barWidth: number;
  barHeight: number;
  fill: string;
  radius: number;
  index: number;
  innerHeight: number;
  calculatedStaggerDelay: number;
  enterTransition?: Transition;
  revealEpoch: number;
  isFaded: boolean;
  fadedOpacity: number;
}

function SeriesBarRect({
  x,
  y,
  barWidth,
  barHeight,
  fill,
  radius,
  index,
  innerHeight,
  calculatedStaggerDelay,
  enterTransition,
  revealEpoch,
  isFaded,
  fadedOpacity,
}: SeriesBarRectProps) {
  const enterAnim = transitionWithDelay(
    enterTransition,
    index * calculatedStaggerDelay
  );

  return (
    <motion.rect
      animate={{
        height: barHeight,
        y,
        opacity: isFaded ? fadedOpacity : 1,
      }}
      fill={fill}
      initial={{ height: 0, y: innerHeight, opacity: 1 }}
      key={`series-bar-${index}-${revealEpoch}`}
      rx={radius}
      ry={radius}
      transition={enterAnim}
      width={barWidth}
      x={x}
    />
  );
}

export default SeriesBar;
