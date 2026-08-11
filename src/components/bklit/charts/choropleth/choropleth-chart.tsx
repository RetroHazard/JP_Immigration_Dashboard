"use client";

import { localPoint } from "@visx/event";
import { Mercator } from "@visx/geo";
import { ParentSize } from "@visx/responsive";
import type { GenericWheelEvent, Scale, TransformMatrix } from "@visx/zoom";
import { Zoom } from "@visx/zoom";
import type { FeatureCollection, Geometry } from "geojson";
import type { Transition } from "motion/react";
import React, {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import {
  type ChoroplethFeature,
  type ChoroplethFeatureProperties,
  ChoroplethInteractionShell,
  ChoroplethStableProvider,
  ChoroplethZoomContext,
  type Margin,
  useChoroplethInteraction,
  type ZoomInstance,
} from "./choropleth-context";
import { ChoroplethFeature as ChoroplethFeatureLayer } from "./choropleth-feature";
import { ChoroplethGraticule as ChoroplethGraticuleLayer } from "./choropleth-graticule";
import { ChoroplethTooltip as ChoroplethTooltipLayer } from "./choropleth-tooltip";

export interface ChoroplethChartProps {
  /** GeoJSON FeatureCollection data */
  data: FeatureCollection<Geometry, ChoroplethFeatureProperties>;
  /** Chart margins */
  margin?: Partial<Margin>;
  /** Animation duration in milliseconds. Default: 800 */
  animationDuration?: number;
  /** Motion enter transition (spring or cubic-bezier tween). */
  enterTransition?: Transition;
  /** Signature of motion URL state — triggers enter replay when it changes. */
  revealSignature?: string;
  /** Aspect ratio as "width / height". Default: "16 / 9" */
  aspectRatio?: string;
  /** Projection scale. A function receives the inner width so responsive
   *  region-fit scales are possible (local extension). If not provided,
   *  auto-calculated based on width (world fit). */
  scale?: number | ((innerWidth: number) => number);
  /** Center coordinates [longitude, latitude]. Default: [0, 20] */
  center?: [number, number];
  /** Translate offset [x, y]. If not provided, auto-calculated to center */
  translate?: [number, number];
  /** Enable zoom and pan. Default: false */
  zoomEnabled?: boolean;
  /** Minimum zoom scale. Default: 0.5 */
  zoomMin?: number;
  /** Maximum zoom scale. Default: 4 */
  zoomMax?: number;
  /** Initial zoom transform */
  initialZoom?: TransformMatrix;
  /** Additional class name for the container */
  className?: string;
  /** Child components (ChoroplethFeature, ChoroplethGraticule, ChoroplethTooltip) */
  children: ReactNode;
}

const DEFAULT_MARGIN: Margin = { top: 0, right: 0, bottom: 0, left: 0 };

// Known SVG component displayNames
const SVG_COMPONENT_NAMES = new Set([
  "ChoroplethFeature",
  "ChoroplethGraticule",
  "ChoroplethTooltip",
]);

const SVG_COMPONENT_TYPES = new Set([
  ChoroplethFeatureLayer,
  ChoroplethGraticuleLayer,
  ChoroplethTooltipLayer,
]);

function resolveComponentType(type: unknown): unknown {
  if (
    typeof type === "object" &&
    type !== null &&
    "type" in type &&
    (type as { type?: unknown }).type
  ) {
    return (type as { type: unknown }).type;
  }
  return type;
}

function getComponentDisplayName(type: unknown): string | null {
  if (typeof type === "function") {
    const fn = type as { displayName?: string; name?: string };
    return fn.displayName ?? fn.name ?? null;
  }
  if (typeof type === "object" && type !== null) {
    const wrapped = type as {
      displayName?: string;
      type?: { displayName?: string; name?: string };
    };
    if (wrapped.displayName) {
      return wrapped.displayName;
    }
    const inner = wrapped.type;
    if (typeof inner === "function") {
      const innerFn = inner as { displayName?: string; name?: string };
      return innerFn.displayName ?? innerFn.name ?? null;
    }
  }
  return null;
}

function isChoroplethSvgChild(type: unknown): boolean {
  if (SVG_COMPONENT_TYPES.has(type as never)) {
    return true;
  }
  const resolved = resolveComponentType(type);
  if (resolved !== type && SVG_COMPONENT_TYPES.has(resolved as never)) {
    return true;
  }
  const displayName = getComponentDisplayName(type);
  return displayName !== null && SVG_COMPONENT_NAMES.has(displayName);
}

// HTML elements that should render in overlay layer
const HTML_ELEMENTS = new Set(["div", "span", "button", "p", "a"]);

// Separate children into SVG and overlay layers
function separateChildren(children: ReactNode): {
  svgChildren: React.ReactNode[];
  overlayChildren: React.ReactNode[];
} {
  const childArray = React.Children.toArray(children);
  const svgChildren: React.ReactNode[] = [];
  const overlayChildren: React.ReactNode[] = [];

  for (const child of childArray) {
    if (!React.isValidElement(child)) {
      svgChildren.push(child);
      continue;
    }

    if (isChoroplethSvgChild(child.type)) {
      svgChildren.push(child);
    } else if (typeof child.type === "string") {
      if (HTML_ELEMENTS.has(child.type)) {
        overlayChildren.push(child);
      } else {
        svgChildren.push(child);
      }
    } else {
      overlayChildren.push(child);
    }
  }

  return { svgChildren, overlayChildren };
}

const DEFAULT_INITIAL_ZOOM: TransformMatrix = {
  scaleX: 1,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
  skewX: 0,
  skewY: 0,
};

interface MercatorRenderProps {
  // biome-ignore lint/suspicious/noExplicitAny: visx geo projection bundle
  path: (geo: any) => string | null;
  projection: (coords: [number, number]) => [number, number] | null | undefined;
}

interface ChoroplethMercatorContentProps {
  mercator: MercatorRenderProps;
  data: FeatureCollection<Geometry, ChoroplethFeatureProperties>;
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  margin: Margin;
  animationDuration: number;
  enterTransition?: Transition;
  revealEpoch: number;
  isLoaded: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  svgChildren: React.ReactNode[];
  overlayChildren: React.ReactNode[];
  zoomEnabled: boolean;
  zoomMin: number;
  zoomMax: number;
  initialZoom: TransformMatrix;
}

/** Module-level so <Zoom> doesn't see a new callback identity every render. */
function wheelDelta(event: GenericWheelEvent): Scale {
  const zoomScale = event.deltaY > 0 ? 0.95 : 1.05;
  return { scaleX: zoomScale, scaleY: zoomScale };
}

const ChoroplethZoomProvider = memo(function ChoroplethZoomProvider({
  zoom,
  children,
}: {
  zoom: ZoomInstance<SVGSVGElement> | null;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ zoom }), [zoom]);
  return (
    <ChoroplethZoomContext.Provider value={value}>
      {children}
    </ChoroplethZoomContext.Provider>
  );
});

/** Midpoint of two touches, in screen coordinates. */
function touchMidpoint(touches: TouchList) {
  const [a, b] = [touches[0], touches[1]];
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}

function touchDistance(touches: TouchList) {
  const [a, b] = [touches[0], touches[1]];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

/**
 * Compose a screen-space pan then a scale about `origin` onto `matrix`.
 *
 * `factor` is clamped so the result always lands inside [min, max]: visx's
 * constrain rejects an out-of-range matrix wholesale, which would silently
 * desync the caller's running gesture matrix from the committed state.
 */
function panThenScale(
  matrix: TransformMatrix,
  pan: { x: number; y: number },
  factor: number,
  origin: { x: number; y: number },
  min: number,
  max: number
): TransformMatrix {
  const clamped = Math.min(
    Math.max(factor, min / matrix.scaleX),
    max / matrix.scaleX
  );
  const translateX = matrix.translateX + pan.x;
  const translateY = matrix.translateY + pan.y;
  return {
    ...matrix,
    scaleX: matrix.scaleX * clamped,
    scaleY: matrix.scaleY * clamped,
    translateX: origin.x + (translateX - origin.x) * clamped,
    translateY: origin.y + (translateY - origin.y) * clamped,
  };
}

const ChoroplethSvg = memo(function ChoroplethSvg({
  height,
  width,
  svgChildren,
  zoom,
  zoomMin,
  zoomMax,
}: {
  height: number;
  width: number;
  svgChildren: React.ReactNode[];
  zoom?: ZoomInstance<SVGSVGElement>;
  zoomMin: number;
  zoomMax: number;
}) {
  const { setHoveredFeatureIndex, setTooltipData } = useChoroplethInteraction();
  const svgRef = useRef<SVGSVGElement>(null);

  // Native listeners below fire outside React's render cycle, so they read the
  // live zoom instance from a ref rather than a captured closure.
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const handleMouseLeave = useCallback(() => {
    setHoveredFeatureIndex(null);
    setTooltipData(null);
    zoomRef.current?.dragEnd();
  }, [setHoveredFeatureIndex, setTooltipData]);

  const handleBackgroundClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      // A tap on empty ocean dismisses the tooltip; taps on a feature are
      // handled by the feature layer and stop propagating before they land here.
      if (event.target === event.currentTarget) {
        setHoveredFeatureIndex(null);
        setTooltipData(null);
      }
    },
    [setHoveredFeatureIndex, setTooltipData]
  );

  // Wheel and two-finger gestures need non-passive listeners so preventDefault
  // works; React's synthetic touchmove is passive, hence the manual wiring.
  useEffect(() => {
    const node = svgRef.current;
    if (!node) {
      return;
    }

    // The running matrix for the current gesture. Several touchmove events can
    // land between two React renders, so `zoom.transformMatrix` (a render-time
    // snapshot) goes stale mid-gesture and each move would compose against the
    // same base, the later one clobbering the earlier. Composing against our
    // own accumulator keeps the gesture independent of render timing.
    let pinch: {
      distance: number;
      midpoint: { x: number; y: number };
      matrix: TransformMatrix;
    } | null = null;

    const beginPinch = (event: TouchEvent, matrix: TransformMatrix) => ({
      distance: touchDistance(event.touches),
      midpoint: touchMidpoint(event.touches),
      matrix,
    });

    const onWheel = (event: WheelEvent) => {
      zoomRef.current?.handleWheel(event);
    };

    const onTouchStart = (event: TouchEvent) => {
      // One finger belongs to the page: `touch-action: pan-y` lets the
      // dashboard scroll straight through the map. Only two fingers drive it.
      const instance = zoomRef.current;
      if (!instance || event.touches.length < 2) {
        pinch = null;
        return;
      }
      event.preventDefault();
      pinch = beginPinch(event, instance.transformMatrix);
    };

    const onTouchMove = (event: TouchEvent) => {
      const instance = zoomRef.current;
      if (!instance || !pinch || event.touches.length < 2) {
        return;
      }
      event.preventDefault();

      const distance = touchDistance(event.touches);
      const midpoint = touchMidpoint(event.touches);
      const pan = {
        x: midpoint.x - pinch.midpoint.x,
        y: midpoint.y - pinch.midpoint.y,
      };
      const factor = pinch.distance > 0 ? distance / pinch.distance : 1;
      const origin = localPoint(node, event) ?? { x: width / 2, y: height / 2 };

      const matrix = panThenScale(
        pinch.matrix,
        pan,
        factor,
        origin,
        zoomMin,
        zoomMax
      );
      instance.setTransformMatrix(matrix);
      pinch = { distance, midpoint, matrix };
    };

    const onTouchEnd = (event: TouchEvent) => {
      const instance = zoomRef.current;
      pinch =
        instance && event.touches.length >= 2
          ? // A finger lifted from a 3+ touch: restart from where we are.
            beginPinch(event, pinch?.matrix ?? instance.transformMatrix)
          : null;
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    node.addEventListener("touchstart", onTouchStart, { passive: false });
    node.addEventListener("touchmove", onTouchMove, { passive: false });
    node.addEventListener("touchend", onTouchEnd);
    node.addEventListener("touchcancel", onTouchEnd);
    return () => {
      node.removeEventListener("wheel", onWheel);
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
      node.removeEventListener("touchend", onTouchEnd);
      node.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [height, width, zoomMin, zoomMax]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: SVG canvas is the pan surface
    <svg
      aria-hidden="true"
      height={height}
      onClick={handleBackgroundClick}
      onMouseDown={zoom?.dragStart}
      onMouseLeave={handleMouseLeave}
      onMouseMove={zoom?.dragMove}
      onMouseUp={zoom?.dragEnd}
      ref={svgRef}
      style={{
        contain: "layout style paint",
        cursor: zoom?.isDragging ? "grabbing" : "grab",
        // Vertical page scroll passes through; the map answers to two fingers.
        touchAction: zoom ? "pan-y" : undefined,
      }}
      width={width}
    >
      <g
        style={{
          transition: zoom?.isDragging ? "none" : "transform 0.18s ease-out",
          willChange: "transform",
        }}
        transform={zoom ? zoom.toString() : undefined}
      >
        {svgChildren}
      </g>
    </svg>
  );
});

const ChoroplethMercatorContent = memo(function ChoroplethMercatorContent({
  mercator,
  data,
  width,
  height,
  innerWidth,
  innerHeight,
  margin,
  animationDuration,
  enterTransition,
  revealEpoch,
  isLoaded,
  containerRef,
  svgChildren,
  overlayChildren,
  zoomEnabled,
  zoomMin,
  zoomMax,
  initialZoom,
}: ChoroplethMercatorContentProps) {
  // Projecting every vertex is by far the most expensive thing this chart does
  // (the Japan topology is ~21k points across 47 features). It depends only on
  // the projection and the data — never on the zoom transform, which is applied
  // as an SVG transform on a wrapper <g> below. Keeping this above <Zoom> is
  // what stops it from re-running on every pan/pinch frame.
  const featurePaths = useMemo(
    () =>
      data.features.map((feature) => mercator.path(feature) ?? null) as (
        | string
        | null
      )[],
    [data, mercator]
  );

  const pathGenerator = useCallback(
    (feature: ChoroplethFeature) => mercator.path(feature) ?? undefined,
    [mercator]
  );

  const rawPathGenerator = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: GeoJSON types are complex
    (geo: any) => mercator.path(geo),
    [mercator]
  );

  const projectPoint = useCallback(
    (coords: [number, number]): [number, number] | null => {
      const projected = mercator.projection(coords);
      if (!projected) {
        return null;
      }
      return projected as [number, number];
    },
    [mercator]
  );

  const stableValue = useMemo(
    () => ({
      features: data.features,
      featureCollection: data,
      featurePaths,
      pathGenerator,
      rawPathGenerator,
      projectPoint,
      width,
      height,
      innerWidth,
      innerHeight,
      margin,
      containerRef,
      isLoaded,
      animationDuration,
      enterTransition,
      revealEpoch,
    }),
    [
      animationDuration,
      containerRef,
      data,
      enterTransition,
      featurePaths,
      height,
      innerHeight,
      innerWidth,
      isLoaded,
      margin,
      pathGenerator,
      projectPoint,
      rawPathGenerator,
      revealEpoch,
      width,
    ]
  );

  // <Zoom> lives *below* the provider on purpose: its transform changes on
  // every gesture frame, and anything rendered above it is spared that churn.
  // The feature layer sits in `svgChildren`, whose element identities never
  // change here, so React skips it entirely while panning — only the <g>
  // transform, and the zoom-context consumers (tooltip, markers), update.
  const canvas = (zoom: ZoomInstance<SVGSVGElement> | null) => (
    <ChoroplethZoomProvider zoom={zoom}>
      <ChoroplethSvg
        height={height}
        svgChildren={svgChildren}
        width={width}
        zoom={zoom ?? undefined}
        zoomMax={zoomMax}
        zoomMin={zoomMin}
      />
      {overlayChildren}
    </ChoroplethZoomProvider>
  );

  return (
    <ChoroplethStableProvider value={stableValue}>
      <ChoroplethInteractionShell>
        <div className="relative h-full w-full" ref={containerRef}>
          {zoomEnabled ? (
            <Zoom<SVGSVGElement>
              height={height}
              initialTransformMatrix={initialZoom}
              scaleXMax={zoomMax}
              scaleXMin={zoomMin}
              scaleYMax={zoomMax}
              scaleYMin={zoomMin}
              wheelDelta={wheelDelta}
              width={width}
            >
              {(zoom) => canvas(zoom)}
            </Zoom>
          ) : (
            canvas(null)
          )}
        </div>
      </ChoroplethInteractionShell>
    </ChoroplethStableProvider>
  );
});

function ChoroplethChartInner({
  data,
  width,
  height,
  margin,
  animationDuration,
  enterTransition,
  revealSignature = "",
  scale: scaleProp,
  center,
  translate: translateProp,
  zoomEnabled,
  zoomMin,
  zoomMax,
  initialZoom,
  children,
}: {
  data: FeatureCollection<Geometry, ChoroplethFeatureProperties>;
  width: number;
  height: number;
  margin: Margin;
  animationDuration: number;
  enterTransition?: Transition;
  revealSignature?: string;
  scale?: number | ((innerWidth: number) => number);
  center: [number, number];
  translate?: [number, number];
  zoomEnabled: boolean;
  zoomMin: number;
  zoomMax: number;
  initialZoom: TransformMatrix;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [revealEpoch, setRevealEpoch] = useState(0);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const scale = typeof scaleProp === 'function' ? scaleProp(innerWidth) : (scaleProp ?? (innerWidth / 630) * 100);

  const translate = translateProp ?? [
    innerWidth / 2 + margin.left,
    innerHeight / 2 + margin.top + 50,
  ];

  const { svgChildren, overlayChildren } = useMemo(
    () => separateChildren(children),
    [children]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: revealSignature
  useEffect(() => {
    setRevealEpoch((n) => n + 1);
    setIsLoaded(false);
    const timeout = setTimeout(() => {
      setIsLoaded(true);
    }, animationDuration);
    return () => clearTimeout(timeout);
  }, [animationDuration, revealSignature]);

  if (width < 10 || height < 10) {
    return null;
  }

  const mercatorContentProps = {
    animationDuration,
    containerRef,
    data,
    enterTransition,
    height,
    initialZoom,
    innerHeight,
    innerWidth,
    isLoaded,
    margin,
    overlayChildren,
    revealEpoch,
    svgChildren,
    width,
    zoomEnabled,
    zoomMax,
    zoomMin,
  };

  return (
    <Mercator
      center={center}
      data={data.features}
      scale={scale}
      translate={translate as [number, number]}
    >
      {(mercator) => (
        <ChoroplethMercatorContent {...mercatorContentProps} mercator={mercator} />
      )}
    </Mercator>
  );
}

export function ChoroplethChart({
  data,
  margin: marginProp,
  animationDuration = 800,
  enterTransition,
  revealSignature,
  aspectRatio = "16 / 9",
  scale,
  center = [0, 20],
  translate,
  zoomEnabled = false,
  zoomMin = 0.5,
  zoomMax = 4,
  initialZoom = DEFAULT_INITIAL_ZOOM,
  className = "",
  children,
}: ChoroplethChartProps) {
  // A fresh object here would flow into the stable context's dep list and
  // defeat every memo boundary below it.
  const margin = useMemo(
    () => ({ ...DEFAULT_MARGIN, ...marginProp }),
    [marginProp?.top, marginProp?.right, marginProp?.bottom, marginProp?.left]
  );

  return (
    <div className={cn("relative w-full", className)} style={{ aspectRatio }}>
      <ParentSize debounceTime={10}>
        {({ width, height }) =>
          width > 0 && height > 0 ? (
            <ChoroplethChartInner
              animationDuration={animationDuration}
              center={center}
              data={data}
              enterTransition={enterTransition}
              height={height}
              initialZoom={initialZoom}
              margin={margin}
              revealSignature={revealSignature}
              scale={scale}
              translate={translate}
              width={width}
              zoomEnabled={zoomEnabled}
              zoomMax={zoomMax}
              zoomMin={zoomMin}
            >
              {children}
            </ChoroplethChartInner>
          ) : null
        }
      </ParentSize>
    </div>
  );
}

ChoroplethChart.displayName = "ChoroplethChart";

export default ChoroplethChart;
