"use client";

import { motion, useSpring } from "motion/react";
import type { RefObject } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
// LOCAL MODIFICATION: tap-to-pin dismissal. (Re-apply after a re-vendor.)
import { closeActivePin } from "@/lib/tooltip-pin";
import { cn } from "@/lib/utils";
import { type SpringConfig, useChartConfig } from "../chart-config-context";
import { chartCssVars } from "../chart-context";

export interface TooltipBoxProps {
  /** X position in pixels (relative to container) */
  x: number;
  /** Y position in pixels (relative to container) */
  y: number;
  /** Whether the tooltip is visible */
  visible: boolean;
  /** Container ref for portal rendering */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Container width for flip detection */
  containerWidth: number;
  /** Container height for bounds clamping */
  containerHeight: number;
  /** Offset from the target position */
  offset?: number;
  /** Custom class name */
  className?: string;
  /** Tooltip content */
  children: React.ReactNode;
  /** Override left position (bypasses internal calculation) */
  left?: number | ReturnType<typeof useSpring>;
  /** Override top position (bypasses internal calculation) */
  top?: number | ReturnType<typeof useSpring>;
  /** Force flip direction (for custom positioning) */
  flipped?: boolean;
  /** Per-chart override; falls back to `ChartConfigProvider.tooltipBoxSpring`. */
  springConfig?: SpringConfig;
  /** Animate panel position with a spring. Default: true */
  animate?: boolean;
  /** Fade/scale the panel on show. Default: true */
  entrance?: boolean;
  /** Inline styles for the inner tooltip panel. */
  panelStyle?: React.CSSProperties;
  /**
   * Tooltip panel background color (CSS variable or color value).
   * Default: `var(--chart-tooltip-background)`.
   */
  backgroundColor?: string;
  /**
   * LOCAL MODIFICATION: set while a touch tap is holding the panel open. The
   * panel is normally `pointer-events-none`, but it portals into the chart
   * container — which is the element the pin registry treats as "inside the
   * chart" — so a tap on a pinned panel would fall straight through and re-pin
   * whatever sits beneath it. When interactive, the panel swallows the tap and
   * dismisses instead, which also gives touch users a large close target.
   * (Re-apply after a re-vendor.)
   */
  interactive?: boolean;
}

// Local extension: after the horizontal flip, clamp the panel inside the
// container on both axes. Upstream only flips X and clamps Y, so an anchor
// near (or, under zoom/pan, beyond) the container edge pushed the panel into
// the clipping card corner.
function placeTooltip(
  x: number,
  y: number,
  w: number,
  h: number,
  containerWidth: number,
  containerHeight: number,
  offset: number
) {
  const flip = x + w + offset > containerWidth;
  const rawLeft = flip ? x - offset - w : x + offset;
  return {
    flip,
    left: Math.max(offset, Math.min(rawLeft, containerWidth - w - offset)),
    top: Math.max(offset, Math.min(y - h / 2, containerHeight - h - offset)),
  };
}

// Inner-only-on-visible so `useSpring` initializes at the cursor's actual x/y
// instead of (0, 0) on first hover.
export function TooltipBox(props: TooltipBoxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = props.containerRef.current;
  if (!(mounted && container)) {
    return null;
  }
  if (!props.visible) {
    return null;
  }
  return <TooltipBoxInner {...props} container={container} />;
}

function TooltipBoxInner({
  x,
  y,
  containerWidth,
  containerHeight,
  offset = 16,
  className = "",
  children,
  left: leftOverride,
  top: topOverride,
  flipped: flippedOverride,
  springConfig,
  animate = true,
  entrance = true,
  panelStyle,
  backgroundColor = chartCssVars.tooltipBackground,
  interactive = false,
  container,
}: Omit<TooltipBoxProps, "visible" | "containerRef"> & {
  container: HTMLElement;
}) {
  const { tooltipBoxSpring } = useChartConfig();
  const effectiveSpring = springConfig ?? tooltipBoxSpring;

  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipWidthRef = useRef(180);
  const tooltipHeightRef = useRef(80);
  const [staticPosition, setStaticPosition] = useState({ left: x, top: y });

  const tw = tooltipWidthRef.current;
  const th = tooltipHeightRef.current;
  const {
    flip: shouldFlipX,
    left: targetX,
    top: targetY,
  } = placeTooltip(x, y, tw, th, containerWidth, containerHeight, offset);

  const animatedLeft = useSpring(targetX, effectiveSpring);
  const animatedTop = useSpring(targetY, effectiveSpring);

  if (animate && leftOverride === undefined) {
    animatedLeft.set(targetX);
  }
  if (animate && topOverride === undefined) {
    animatedTop.set(targetY);
  }

  useLayoutEffect(() => {
    if (!tooltipRef.current) {
      return;
    }
    const el = tooltipRef.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w > 0) {
      tooltipWidthRef.current = w;
    }
    if (h > 0) {
      tooltipHeightRef.current = h;
    }
    const w2 = tooltipWidthRef.current;
    const h2 = tooltipHeightRef.current;
    const { left: tx, top: ty } = placeTooltip(
      x,
      y,
      w2,
      h2,
      containerWidth,
      containerHeight,
      offset
    );
    if (!animate) {
      setStaticPosition({ left: tx, top: ty });
      return;
    }
    if (leftOverride === undefined) {
      animatedLeft.set(tx);
    }
    if (topOverride === undefined) {
      animatedTop.set(ty);
    }
  }, [
    x,
    y,
    containerWidth,
    containerHeight,
    offset,
    leftOverride,
    topOverride,
    animate,
    animatedLeft,
    animatedTop,
  ]);

  const prevFlipRef = useRef(shouldFlipX);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (prevFlipRef.current !== shouldFlipX) {
      setFlipKey((k) => k + 1);
      prevFlipRef.current = shouldFlipX;
    }
  }, [shouldFlipX]);

  const finalLeft = animate
    ? (leftOverride ?? animatedLeft)
    : staticPosition.left;
  const finalTop = animate ? (topOverride ?? animatedTop) : staticPosition.top;
  const isFlipped = flippedOverride ?? shouldFlipX;
  const transformOrigin = isFlipped ? "right top" : "left top";

  const panelClassName = cn(
    "min-w-[140px] overflow-hidden rounded-lg text-chart-tooltip-foreground shadow-lg",
    panelStyle?.backgroundColor === undefined &&
      backgroundColor === chartCssVars.tooltipBackground &&
      "bg-chart-tooltip-background",
    panelStyle?.backdropFilter === undefined && "backdrop-blur-md"
  );
  const panelStyleResolved = {
    transformOrigin,
    // LOCAL MODIFICATION: the panel has a 140px floor and no ceiling, so on a
    // ~360px phone a long bureau or nationality name could render it wider than
    // its own container and push it past the card's clipped edge. Capping it to
    // the container guarantees `placeTooltip` always has somewhere to put it.
    // (Re-apply after a re-vendor.)
    maxWidth: Math.max(140, containerWidth - offset * 2),
    ...(panelStyle?.backgroundColor === undefined && {
      backgroundColor,
    }),
    ...panelStyle,
  };

  // LOCAL MODIFICATION: see the `interactive` prop — a pinned panel has to
  // absorb its own taps rather than let them through to the chart underneath.
  // (Re-apply after a re-vendor.)
  const pointerEventsClass = interactive
    ? "pointer-events-auto cursor-pointer"
    : "pointer-events-none";
  const dismissOnTap = interactive
    ? (event: React.PointerEvent) => {
        event.stopPropagation();
        closeActivePin();
      }
    : undefined;

  if (!entrance) {
    return createPortal(
      <div
        className={cn(pointerEventsClass, "absolute z-50", className)}
        onPointerDown={dismissOnTap}
        ref={tooltipRef}
        style={{ left: staticPosition.left, top: staticPosition.top }}
      >
        <div className={panelClassName} style={panelStyleResolved}>
          {children}
        </div>
      </div>,
      container
    );
  }

  return createPortal(
    <motion.div
      animate={{ opacity: 1 }}
      className={cn(pointerEventsClass, "absolute z-50", className)}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onPointerDown={dismissOnTap}
      ref={tooltipRef}
      style={{ left: finalLeft, top: finalTop }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        animate={{ scale: 1, opacity: 1, x: 0 }}
        className={panelClassName}
        initial={{ scale: 0.85, opacity: 0, x: isFlipped ? 20 : -20 }}
        key={flipKey}
        style={panelStyleResolved}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {children}
      </motion.div>
    </motion.div>,
    container
  );
}

TooltipBox.displayName = "TooltipBox";

export default TooltipBox;
