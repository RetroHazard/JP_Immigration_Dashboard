"use client";

import { motion, useSpring } from "motion/react";
import type { RefObject } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
   * LOCAL MODIFICATION: container-relative y of the touch that opened the
   * tooltip. When set, the panel is placed above it and horizontally centred
   * on `x`, instead of beside `x` at the top of the plot. On a phone the plot
   * is short enough that the vendored placement covers the data and the date
   * axis, and the finger sits on top of whatever is left.
   * (Re-apply after a re-vendor.)
   */
  anchorAboveY?: number;
}

/** LOCAL MODIFICATION: keep an above-the-finger panel on screen. */
const VIEWPORT_MARGIN = 8;

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

/**
 * LOCAL MODIFICATION: the touch placement — above the finger, centred on it.
 * It is clamped to the viewport rather than to the container, because the
 * container is only the plot area: on a phone that is ~170px tall against a
 * ~116px panel, so there is no room inside it and every ancestor up to the
 * card is `overflow: visible` anyway. If the finger is too near the top of
 * the screen for the panel to fit above it, it goes below instead — still off
 * the finger, which is the point. (Re-apply after a re-vendor.)
 */
function placeAboveTouch(
  x: number,
  y: number,
  w: number,
  h: number,
  containerWidth: number,
  offset: number,
  container: HTMLElement
) {
  const left = Math.max(offset, Math.min(x - w / 2, containerWidth - w - offset));
  const containerTop = container.getBoundingClientRect().top;
  const viewportHeight =
    typeof window === "undefined" ? Number.POSITIVE_INFINITY : window.innerHeight;
  const minTop = VIEWPORT_MARGIN - containerTop;
  const maxTop = viewportHeight - VIEWPORT_MARGIN - h - containerTop;

  const above = y - offset - h;
  if (above >= minTop) {
    return { flip: false, left, top: above };
  }
  const below = y + offset;
  if (below <= maxTop) {
    return { flip: false, left, top: below };
  }
  return { flip: false, left, top: Math.max(minTop, Math.min(above, maxTop)) };
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
  anchorAboveY,
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

  // LOCAL MODIFICATION: one entry point so the touch placement and the
  // vendored one stay interchangeable. (Re-apply after a re-vendor.)
  const place = (w: number, h: number) =>
    anchorAboveY === undefined
      ? placeTooltip(x, y, w, h, containerWidth, containerHeight, offset)
      : placeAboveTouch(x, anchorAboveY, w, h, containerWidth, offset, container);

  const tw = tooltipWidthRef.current;
  const th = tooltipHeightRef.current;
  const { flip: shouldFlipX, left: targetX, top: targetY } = place(tw, th);

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
    // LOCAL MODIFICATION: this second pass is the one that matters for the
    // touch placement — the first ran against the 180x80 defaults, and where
    // the panel goes depends on how tall it actually turned out to be.
    // (Re-apply after a re-vendor.)
    const { left: tx, top: ty } =
      anchorAboveY === undefined
        ? placeTooltip(x, y, w2, h2, containerWidth, containerHeight, offset)
        : placeAboveTouch(x, anchorAboveY, w2, h2, containerWidth, offset, container);
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
    // LOCAL MODIFICATION: re-place when the tap moves. (Re-apply after a re-vendor.)
    anchorAboveY,
    container,
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

  if (!entrance) {
    return createPortal(
      <div
        className={cn("pointer-events-none absolute z-50", className)}
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
      className={cn("pointer-events-none absolute z-50", className)}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
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
