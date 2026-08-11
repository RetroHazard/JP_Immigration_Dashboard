"use client";

import { localPoint } from "@visx/event";
import type { scaleLinear, scaleTime } from "@visx/scale";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";
import { useTapPin } from "@/hooks/useTapPin";
import type { LineConfig, Margin, TooltipData } from "./chart-context";
import { useScheduledTooltip } from "./use-scheduled-tooltip";
import { normalizeYAxisId } from "./y-axis-scales";

type ScaleTime = ReturnType<typeof scaleTime<number>>;
type ScaleLinear = ReturnType<typeof scaleLinear<number>>;

/**
 * LOCAL MODIFICATION: how far the cursor must travel with the button held
 * before the gesture counts as a range drag rather than a click. Without a
 * threshold, `mousedown` had to assume every press was a drag and clear the
 * tooltip immediately, so clicking a chart looked like it dismissed the
 * tooltip. (Re-apply after a re-vendor.)
 */
const DRAG_THRESHOLD_PX = 4;

export interface ChartSelection {
  startX: number;
  endX: number;
  startIndex: number;
  endIndex: number;
  active: boolean;
}

interface UseChartInteractionParams {
  xScale: ScaleTime;
  yScale: ScaleLinear;
  yScales: Record<string, ScaleLinear>;
  data: Record<string, unknown>[];
  lines: LineConfig[];
  margin: Margin;
  xAccessor: (d: Record<string, unknown>) => Date;
  bisectDate: (
    data: Record<string, unknown>[],
    date: Date,
    lo: number
  ) => number;
  canInteract: boolean;
  /**
   * LOCAL MODIFICATION: the chart's outer element, used as the boundary for
   * "tapped outside" dismissal in tap mode. (Re-apply after a re-vendor.)
   */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface ChartInteractionResult {
  tooltipData: TooltipData | null;
  setTooltipData: React.Dispatch<React.SetStateAction<TooltipData | null>>;
  selection: ChartSelection | null;
  clearSelection: () => void;
  interactionHandlers: {
    onMouseMove?: (event: React.MouseEvent<SVGGElement>) => void;
    onMouseLeave?: () => void;
    onMouseDown?: (event: React.MouseEvent<SVGGElement>) => void;
    onMouseUp?: () => void;
    onClick?: (event: React.MouseEvent<SVGGElement>) => void;
  };
  interactionStyle: React.CSSProperties;
  /**
   * LOCAL MODIFICATION: true while a tap is holding the tooltip open, as
   * opposed to it tracking a hovering cursor. Nothing renders differently for
   * it today — the panel stays `pointer-events-none` so taps reach the
   * datapoint underneath — but it is the one way to tell the two states apart.
   * (Re-apply after a re-vendor.)
   */
  pinned: boolean;
  /** LOCAL MODIFICATION: dismiss handler for taps on the chart's empty space. */
  dismissTap: () => void;
  /** LOCAL MODIFICATION: whether this chart is currently in tap mode. */
  isTapMode: boolean;
}

export function useChartInteraction({
  xScale,
  yScale,
  yScales,
  data,
  lines,
  margin,
  xAccessor,
  bisectDate,
  canInteract,
  containerRef,
}: UseChartInteractionParams): ChartInteractionResult {
  const [selection, setSelection] = useState<ChartSelection | null>(null);
  const {
    tooltipData,
    setTooltipData,
    scheduleTooltip,
    commitTooltipNow,
    clearTooltip,
    // LOCAL MODIFICATION: `resetTooltipDedupe` went unused when the two-finger
    // selection branch was removed; `commitTooltipNow` covers the dedupe reset
    // the tap path needs. (Re-apply after a re-vendor.)
  } = useScheduledTooltip<TooltipData>();

  const isDraggingRef = useRef(false);
  // LOCAL MODIFICATION: the button is down but the gesture has not travelled
  // far enough to be a drag yet, so it may still turn out to be a click.
  // (Re-apply after a re-vendor.)
  const pendingDragRef = useRef(false);
  const dragStartXRef = useRef<number>(0);
  const lastHoveredXRef = useRef<number | null>(null);

  // LOCAL MODIFICATION: tap-to-pin on touch devices. On a coarse pointer the
  // mouse handlers below are never attached — the tooltip is driven entirely
  // from `handleClick` — which is what keeps the compatibility mouse events a
  // browser fires after `touchend` from re-opening or clearing a pinned
  // tooltip. (Re-apply after a re-vendor.)
  const coarsePointer = useCoarsePointer();
  const dismissTooltip = useCallback(() => {
    lastHoveredXRef.current = null;
    clearTooltip();
  }, [clearTooltip]);
  const tapMode = useTapPin({
    enabled: coarsePointer && canInteract,
    containerRef,
    onDismiss: dismissTooltip,
  });
  // The re-anchor effect below must release the pin without depending on
  // `tapMode`, whose identity changes on every pin.
  const tapModeRef = useRef(tapMode);
  tapModeRef.current = tapMode;

  const resolveTooltipFromX = useCallback(
    (pixelX: number): TooltipData | null => {
      const x0 = xScale.invert(pixelX);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];

      if (!d0) {
        return null;
      }

      let d = d0;
      let finalIndex = index - 1;
      if (d1) {
        const d0Time = xAccessor(d0).getTime();
        const d1Time = xAccessor(d1).getTime();
        if (x0.getTime() - d0Time > d1Time - x0.getTime()) {
          d = d1;
          finalIndex = index;
        }
      }

      const yPositions: Record<string, number> = {};
      for (const line of lines) {
        const value = d[line.dataKey];
        if (typeof value === "number") {
          const axisScale = yScales[normalizeYAxisId(line.yAxisId)] ?? yScale;
          yPositions[line.dataKey] = axisScale(value) ?? 0;
        }
      }

      return {
        point: d,
        index: finalIndex,
        x: xScale(xAccessor(d)) ?? 0,
        yPositions,
      };
    },
    [xScale, yScale, yScales, data, lines, xAccessor, bisectDate]
  );

  const resolveIndexFromX = useCallback(
    (pixelX: number): number => {
      const x0 = xScale.invert(pixelX);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      if (!d0) {
        return 0;
      }
      if (d1) {
        const d0Time = xAccessor(d0).getTime();
        const d1Time = xAccessor(d1).getTime();
        if (x0.getTime() - d0Time > d1Time - x0.getTime()) {
          return index;
        }
      }
      return index - 1;
    },
    [xScale, data, xAccessor, bisectDate]
  );

  const getChartX = useCallback(
    (
      event: React.MouseEvent<SVGGElement> | React.TouchEvent<SVGGElement>,
      touchIndex = 0
    ): number | null => {
      let point: { x: number; y: number } | null = null;

      if ("touches" in event) {
        const touch = event.touches[touchIndex];
        if (!touch) {
          return null;
        }
        const svg = event.currentTarget.ownerSVGElement;
        if (!svg) {
          return null;
        }
        point = localPoint(svg, touch as unknown as MouseEvent);
      } else {
        point = localPoint(event);
      }

      if (!point) {
        return null;
      }
      return point.x - margin.left;
    },
    [margin.left]
  );

  /**
   * LOCAL MODIFICATION: the tap's y in container pixels — `localPoint` is
   * already relative to the svg, which fills the container, so no margin is
   * subtracted the way `getChartX` does. Only the tap path needs it.
   * (Re-apply after a re-vendor.)
   */
  const getTapY = useCallback((event: React.MouseEvent<SVGGElement>): number | undefined => {
    return localPoint(event)?.y;
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGGElement>) => {
      const chartX = getChartX(event);
      if (chartX === null) {
        return;
      }

      // LOCAL MODIFICATION: a held button only becomes a drag once it has
      // travelled far enough, and the tooltip is cleared at that moment rather
      // than on `mousedown`. Below the threshold the hover path keeps running,
      // so a plain click leaves the tooltip exactly as it found it.
      // (Re-apply after a re-vendor.)
      if (
        pendingDragRef.current &&
        !isDraggingRef.current &&
        Math.abs(chartX - dragStartXRef.current) > DRAG_THRESHOLD_PX
      ) {
        isDraggingRef.current = true;
        clearTooltip();
      }

      if (isDraggingRef.current) {
        const startX = Math.min(dragStartXRef.current, chartX);
        const endX = Math.max(dragStartXRef.current, chartX);
        setSelection({
          startX,
          endX,
          startIndex: resolveIndexFromX(startX),
          endIndex: resolveIndexFromX(endX),
          active: true,
        });
        return;
      }

      lastHoveredXRef.current = chartX;
      const tooltip = resolveTooltipFromX(chartX);
      if (tooltip) {
        scheduleTooltip(tooltip);
      }
    },
    [
      clearTooltip,
      getChartX,
      resolveTooltipFromX,
      resolveIndexFromX,
      scheduleTooltip,
    ]
  );

  const handleMouseLeave = useCallback(() => {
    lastHoveredXRef.current = null;
    clearTooltip();
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
    // LOCAL MODIFICATION: an armed-but-never-promoted press must not survive
    // the cursor leaving. (Re-apply after a re-vendor.)
    pendingDragRef.current = false;
    setSelection(null);
  }, [clearTooltip]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<SVGGElement>) => {
      const chartX = getChartX(event);
      if (chartX === null) {
        return;
      }
      // LOCAL MODIFICATION: this used to set `isDraggingRef` and call
      // `clearTooltip()` outright, which dismissed the tooltip on every click
      // because a press cannot yet be told apart from a drag. Both now happen
      // in `handleMouseMove`, once the cursor has actually travelled.
      // (Re-apply after a re-vendor.)
      pendingDragRef.current = true;
      dragStartXRef.current = chartX;
      setSelection(null);
    },
    [getChartX]
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
    // LOCAL MODIFICATION: see `handleMouseDown`. (Re-apply after a re-vendor.)
    pendingDragRef.current = false;
    setSelection(null);
  }, []);

  /**
   * LOCAL MODIFICATION: replaces the touch handlers, which showed a tooltip
   * while a finger was held down and cleared it on `touchend`. A tap now pins
   * the tooltip until it is tapped again, another datapoint is tapped, or the
   * registry dismisses it.
   *
   * `click` rather than touch bookkeeping: the browser already tells a tap
   * apart from a scroll or a drag, with the right slop per platform, and
   * withholds the click entirely when the gesture becomes a scroll. The old
   * `preventDefault()` calls were no-ops anyway — React registers
   * `touchstart`/`touchmove` passively — which is why `touchAction: "none"`
   * was needed, and why removing them costs nothing.
   *
   * The two-finger range selection is gone with them. It only ever set
   * `selection`, which the mouse-drag path still sets on desktop, so the
   * highlight band behaves exactly as before there.
   * (Re-apply after a re-vendor.)
   */
  const handleClick = useCallback(
    (event: React.MouseEvent<SVGGElement>) => {
      if (!tapMode) {
        return;
      }
      const chartX = getChartX(event);
      const tooltip = chartX === null ? null : resolveTooltipFromX(chartX);
      if (!tooltip) {
        tapMode.clear();
        dismissTooltip();
        return;
      }
      if (tapMode.tap(String(tooltip.index)) === "unpinned") {
        dismissTooltip();
        return;
      }
      lastHoveredXRef.current = chartX;
      // `tapY` rides along on the tooltip so the panel can sit above the
      // finger; nothing else reads it, and the hover path never sets it.
      commitTooltipNow({ ...tooltip, tapY: getTapY(event) });
    },
    [
      commitTooltipNow,
      dismissTooltip,
      getChartX,
      getTapY,
      resolveTooltipFromX,
      tapMode,
    ]
  );

  /** LOCAL MODIFICATION: taps on the chart's margins/empty space dismiss. */
  const dismissTap = useCallback(() => {
    tapModeRef.current?.clear();
    dismissTooltip();
  }, [dismissTooltip]);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  // Re-anchor tooltip/crosshair when x-scale or visible data changes (e.g. brush zoom commit).
  useEffect(() => {
    if (!canInteract || lastHoveredXRef.current === null) {
      return;
    }
    const tooltip = resolveTooltipFromX(lastHoveredXRef.current);
    if (tooltip) {
      scheduleTooltip(tooltip, `${tooltip.index}:${Math.round(tooltip.x)}`);
      return;
    }
    // LOCAL MODIFICATION: also drop the pin, or the registry keeps a dead
    // owner (and its document listeners) after the data changes underneath it.
    // (Re-apply after a re-vendor.)
    tapModeRef.current?.clear();
    clearTooltip();
  }, [canInteract, clearTooltip, resolveTooltipFromX, scheduleTooltip]);

  // LOCAL MODIFICATION: on a coarse pointer only `onClick` is attached. The
  // mouse handlers are deliberately absent rather than guarded, so the
  // synthesized mouse events a browser fires after a tap have nothing to land
  // on — including `handleMouseDown`, which clears the tooltip and would
  // otherwise eat the pin. (Re-apply after a re-vendor.)
  const buildHandlers = () => {
    if (!canInteract) {
      return {};
    }
    if (tapMode) {
      return { onClick: handleClick };
    }
    return {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
    };
  };
  const interactionHandlers = buildHandlers();

  const interactionStyle: React.CSSProperties = {
    cursor: canInteract ? "crosshair" : "default",
    // LOCAL MODIFICATION: `none` blanket-blocked page scrolling over the plot
    // area, which on a phone makes these tall charts a scroll dead zone. It was
    // only needed because the touch handlers wanted to preventDefault; with
    // those gone, `manipulation` keeps vertical scroll working and still
    // suppresses double-tap zoom on a quick pin/unpin. Hover devices keep the
    // vendored default, which the mouse-drag selection relies on.
    // (Re-apply after a re-vendor.)
    touchAction: tapMode ? "manipulation" : "none",
  };

  return {
    tooltipData,
    setTooltipData,
    selection,
    clearSelection,
    interactionHandlers,
    interactionStyle,
    pinned: tapMode?.pinned ?? false,
    dismissTap,
    isTapMode: tapMode !== null,
  };
}
