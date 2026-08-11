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
  // visx hands the render prop d3-geo's own `geoPath` instance, so `bounds` is
  // there alongside the call signature.
  // biome-ignore lint/suspicious/noExplicitAny: visx geo projection bundle
  path: ((geo: any) => string | null) & {
    // biome-ignore lint/suspicious/noExplicitAny: same
    bounds?: (geo: any) => [[number, number], [number, number]];
  };
  projection: (coords: [number, number]) => [number, number] | null | undefined;
}

/** A projected bounding box in user space. */
type Box = { x0: number; x1: number; y0: number; y1: number };

/**
 * Where the map has ink, as a coarse grid over the content box: for every cell,
 * the centre of the nearest cell that any geometry passes through.
 *
 * Bounding boxes can't answer this. Japan's box is a diagonal rectangle that is
 * mostly sea, and so is the box of an island prefecture like Nagasaki — zoomed
 * in you can sit well inside either and see nothing but water. The grid is
 * built from the projected coastline itself, so "is there map near here" costs
 * one array read.
 */
type Occupancy = {
  x0: number;
  y0: number;
  cell: number;
  cols: number;
  rows: number;
  /** Per cell, the index of the nearest occupied cell (-1 if the map is empty). */
  nearest: Int32Array;
};

/** Cells along the longer axis of the content box. */
const OCCUPANCY_STEPS = 96;

type ContentBounds = { outer: Box; occupancy: Occupancy | null };

/**
 * Fraction of the map (or of the viewport, whichever is smaller) that has to
 * stay on screen along each axis.
 *
 * Not an edge lock: the Japan projection deliberately leaves a gap at the top
 * and overflows the bottom, so "content must cover the viewport" is already
 * false at rest and would snap the map on the first drag. Measured across
 * 320-1400px viewports, both charts sit at 0.76 or better when untouched, so
 * 0.6 binds a runaway pan without ever moving a view the user hasn't moved.
 */
const PAN_MIN_VISIBLE = 0.6;

/**
 * How far off-centre the nearest feature is allowed to sit, as a fraction of
 * the viewport. At 0.25 the closest feature always reaches at least a quarter
 * of the way in from an edge, so there is something to look at wherever the
 * view lands.
 *
 * Measured against the viewport in *user* space, so it is slack at low zoom
 * (where the whole map is on screen anyway and the outer box does the work) and
 * only starts to bind once you are zoomed in far enough to lose the map.
 */
const CENTER_SLACK = 0.25;

/**
 * Slack for the scale comparison. `panThenScale` clamps its factor to exactly
 * `max / scaleX`, whose product can land a float hair above `max`; without the
 * slack that reads as out-of-range and the whole gesture frame is rejected.
 */
const SCALE_EPSILON = 1e-6;

/**
 * Clamp one axis of a translate so the transformed span [scale*c0 + t,
 * scale*c1 + t] keeps at least `PAN_MIN_VISIBLE` of itself inside [0, viewport].
 *
 * `overlap = min(end, viewport) - max(start, 0) >= keep` reduces to two linear
 * bounds on `t`, which is why this is a clamp rather than a search.
 */
function clampTranslate(
  translate: number,
  scale: number,
  c0: number,
  c1: number,
  viewport: number
): number {
  const keep = PAN_MIN_VISIBLE * Math.min(scale * (c1 - c0), viewport);
  const lower = keep - scale * c1;
  const upper = viewport - keep - scale * c0;
  // Unreachable for any fraction below 1, but a degenerate bbox shouldn't
  // produce a NaN-shaped window.
  if (lower > upper) {
    return (lower + upper) / 2;
  }
  return Math.min(Math.max(translate, lower), upper);
}

type Ring = { x: number; y: number }[];

/** Project a ring of [lon, lat] positions into user space. */
function projectRing(
  // biome-ignore lint/suspicious/noExplicitAny: GeoJSON types are complex
  positions: any,
  project: (coords: [number, number]) => [number, number] | null | undefined
): Ring {
  const ring: Ring = [];
  if (!Array.isArray(positions)) {
    return ring;
  }
  for (const position of positions) {
    if (!Array.isArray(position) || typeof position[0] !== "number") {
      continue;
    }
    const point = project(position as [number, number]);
    if (point && Number.isFinite(point[0]) && Number.isFinite(point[1])) {
      ring.push({ x: point[0], y: point[1] });
    }
  }
  return ring;
}

/** Twice the shoelace area — sign and halving don't matter for a comparison. */
function ringArea(ring: Ring): number {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i] as { x: number; y: number };
    const b = ring[j] as { x: number; y: number };
    sum += (b.x + a.x) * (b.y - a.y);
  }
  return Math.abs(sum);
}

/**
 * The outer ring of each feature's largest polygon — its main landmass.
 *
 * Anchoring to *any* geometry is too weak: Tokyo owns islets 1,700km out in the
 * Pacific, so "there is map nearby" can be satisfied by a speck too small to
 * see, and the card still reads as empty. One landmass per feature keeps every
 * prefecture reachable while making a view of open sea unreachable.
 */
function mainLandmasses(
  features: FeatureCollection<Geometry, ChoroplethFeatureProperties>["features"],
  project: (coords: [number, number]) => [number, number] | null | undefined
): Ring[] {
  const rings: Ring[] = [];

  const collect = (geometry: Geometry | null | undefined): void => {
    if (!geometry) {
      return;
    }
    if (geometry.type === "GeometryCollection") {
      for (const inner of geometry.geometries) {
        collect(inner);
      }
      return;
    }
    // Only areal geometry has a landmass to speak of.
    const polygons =
      geometry.type === "Polygon"
        ? [geometry.coordinates]
        : geometry.type === "MultiPolygon"
          ? geometry.coordinates
          : [];

    let largest: Ring | null = null;
    let largestArea = 0;
    for (const polygon of polygons) {
      const ring = projectRing(polygon[0], project);
      if (ring.length < 3) {
        continue;
      }
      const area = ringArea(ring);
      if (area > largestArea) {
        largestArea = area;
        largest = ring;
      }
    }
    if (largest) {
      rings.push(largest);
    }
  };

  for (const feature of features) {
    collect(feature.geometry);
  }
  return rings;
}

/**
 * Mark the cells the geometry passes through, then flood outwards so every cell
 * knows its nearest occupied neighbour. One multi-source BFS over a few thousand
 * cells, run once per projection rather than per frame.
 */
function buildOccupancy(
  outer: Box,
  features: FeatureCollection<Geometry, ChoroplethFeatureProperties>["features"],
  project: (coords: [number, number]) => [number, number] | null | undefined
): Occupancy | null {
  const width = outer.x1 - outer.x0;
  const height = outer.y1 - outer.y0;
  const cell = Math.max(width, height) / OCCUPANCY_STEPS;
  if (!(cell > 0)) {
    return null;
  }
  const cols = Math.max(1, Math.ceil(width / cell) + 1);
  const rows = Math.max(1, Math.ceil(height / cell) + 1);
  const total = cols * rows;

  const nearest = new Int32Array(total).fill(-1);
  const queue: number[] = [];
  const mark = (x: number, y: number) => {
    const col = Math.min(
      cols - 1,
      Math.max(0, Math.floor((x - outer.x0) / cell))
    );
    const row = Math.min(
      rows - 1,
      Math.max(0, Math.floor((y - outer.y0) / cell))
    );
    const index = row * cols + col;
    if (nearest[index] === -1) {
      nearest[index] = index;
      queue.push(index);
    }
  };

  const rings = mainLandmasses(features, project);

  // The outline, so an island thinner than a cell still registers...
  for (const ring of rings) {
    for (const point of ring) {
      mark(point.x, point.y);
    }
  }

  // ...and the interior, by scanline. Without this a big island is a hollow
  // outline, and zoomed in far enough the middle of Hokkaido counts as "no map
  // nearby" — the one place you would most want to be able to look at.
  const crossings: number[][] = Array.from({ length: rows }, () => []);
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[j] as { x: number; y: number };
      const b = ring[i] as { x: number; y: number };
      if (a.y === b.y) {
        continue;
      }
      const top = Math.min(a.y, b.y);
      const bottom = Math.max(a.y, b.y);
      const first = Math.max(0, Math.ceil((top - outer.y0) / cell - 0.5));
      const last = Math.min(rows - 1, Math.floor((bottom - outer.y0) / cell - 0.5));
      for (let row = first; row <= last; row++) {
        const y = outer.y0 + (row + 0.5) * cell;
        if (y < top || y >= bottom) {
          continue;
        }
        (crossings[row] as number[]).push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
      }
    }
  }
  for (let row = 0; row < rows; row++) {
    const xs = (crossings[row] as number[]).sort((p, q) => p - q);
    const y = outer.y0 + (row + 0.5) * cell;
    for (let i = 0; i + 1 < xs.length; i += 2) {
      // Cells whose centre falls between this pair of crossings.
      const from = Math.max(
        0,
        Math.ceil(((xs[i] as number) - outer.x0) / cell - 0.5)
      );
      const to = Math.min(
        cols - 1,
        Math.floor(((xs[i + 1] as number) - outer.x0) / cell - 0.5)
      );
      for (let col = from; col <= to; col++) {
        mark(outer.x0 + (col + 0.5) * cell, y);
      }
    }
  }
  if (queue.length === 0) {
    return null;
  }

  for (let head = 0; head < queue.length; head++) {
    const index = queue[head] as number;
    const source = nearest[index] as number;
    const col = index % cols;
    const row = (index - col) / cols;
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nc = col + (dc as number);
      const nr = row + (dr as number);
      if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) {
        continue;
      }
      const neighbour = nr * cols + nc;
      if (nearest[neighbour] === -1) {
        nearest[neighbour] = source;
        queue.push(neighbour);
      }
    }
  }

  return { x0: outer.x0, y0: outer.y0, cell, cols, rows, nearest };
}

/** Centre of the nearest cell the map actually passes through. */
function nearestInked(
  occupancy: Occupancy,
  x: number,
  y: number
): { x: number; y: number } | null {
  const { x0, y0, cell, cols, rows, nearest } = occupancy;
  const col = Math.min(cols - 1, Math.max(0, Math.floor((x - x0) / cell)));
  const row = Math.min(rows - 1, Math.max(0, Math.floor((y - y0) / cell)));
  const index = nearest[row * cols + col] ?? -1;
  if (index < 0) {
    return null;
  }
  const ic = index % cols;
  const ir = (index - ic) / cols;
  return { x: x0 + (ic + 0.5) * cell, y: y0 + (ir + 0.5) * cell };
}

type Constrain = (
  next: TransformMatrix,
  prev: TransformMatrix
) => TransformMatrix;

/**
 * Supplying `constrain` replaces visx's scale check outright rather than adding
 * to it, so this has to enforce the zoom range as well as the pan bound.
 */
function makeConstrain(
  bounds: ContentBounds,
  width: number,
  height: number,
  zoomMin: number,
  zoomMax: number
): Constrain {
  return (next, prev) => {
    const outOfRange =
      next.scaleX > zoomMax + SCALE_EPSILON ||
      next.scaleX < zoomMin - SCALE_EPSILON ||
      next.scaleY > zoomMax + SCALE_EPSILON ||
      next.scaleY < zoomMin - SCALE_EPSILON;
    // Rejecting wholesale is visx's own behaviour for a scale it won't accept.
    if (outOfRange) {
      return prev;
    }

    // Keep ink near the middle of the view first...
    let { translateX, translateY } = next;
    if (bounds.occupancy) {
      const cx = (width / 2 - translateX) / next.scaleX;
      const cy = (height / 2 - translateY) / next.scaleY;
      const inked = nearestInked(bounds.occupancy, cx, cy);
      if (inked) {
        const limitX = (CENTER_SLACK * width) / next.scaleX;
        const limitY = (CENTER_SLACK * height) / next.scaleY;
        const centreX =
          inked.x + Math.min(Math.max(cx - inked.x, -limitX), limitX);
        const centreY =
          inked.y + Math.min(Math.max(cy - inked.y, -limitY), limitY);
        translateX = width / 2 - centreX * next.scaleX;
        translateY = height / 2 - centreY * next.scaleY;
      }
    }

    // ...then hold the map itself inside the box. The two rules bind at
    // opposite ends of the zoom range, so whichever isn't doing the work here
    // passes its input straight through.
    return {
      ...next,
      translateX: clampTranslate(
        translateX,
        next.scaleX,
        bounds.outer.x0,
        bounds.outer.x1,
        width
      ),
      translateY: clampTranslate(
        translateY,
        next.scaleY,
        bounds.outer.y0,
        bounds.outer.y1,
        height
      ),
    };
  };
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
  constrain,
}: {
  height: number;
  width: number;
  svgChildren: React.ReactNode[];
  zoom?: ZoomInstance<SVGSVGElement>;
  zoomMin: number;
  zoomMax: number;
  constrain?: Constrain;
}) {
  const {
    setHoveredFeatureIndex,
    setTooltipData,
    // LOCAL MODIFICATION: tap-to-pin. (Re-apply after a re-vendor.)
    tapMode,
  } = useChoroplethInteraction();
  const svgRef = useRef<SVGSVGElement>(null);

  // Native listeners below fire outside React's render cycle, so they read the
  // live zoom instance from a ref rather than a captured closure.
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const constrainRef = useRef(constrain);
  constrainRef.current = constrain;

  const handleMouseLeave = useCallback(() => {
    // LOCAL MODIFICATION: on a coarse pointer this only ends a drag. Clearing
    // the tooltip here as well would let the mouse events synthesized after a
    // tap dismiss the pin the tap just set. (Re-apply after a re-vendor.)
    if (!tapMode) {
      setHoveredFeatureIndex(null);
      setTooltipData(null);
    }
    zoomRef.current?.dragEnd();
  }, [setHoveredFeatureIndex, setTooltipData, tapMode]);

  const handleBackgroundClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      // A tap on empty ocean dismisses the tooltip; taps on a feature are
      // handled by the feature layer and stop propagating before they land here.
      if (event.target === event.currentTarget) {
        // LOCAL MODIFICATION: release the page-wide pin too, or the registry
        // keeps a dead owner and its listeners. (Re-apply after a re-vendor.)
        tapMode?.clear();
        setHoveredFeatureIndex(null);
        setTooltipData(null);
      }
    },
    [setHoveredFeatureIndex, setTooltipData, tapMode]
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

      const proposed = panThenScale(
        pinch.matrix,
        pan,
        factor,
        origin,
        zoomMin,
        zoomMax
      );
      // Store what the chart will actually commit, not what we asked for: past
      // the pan bound the two diverge, and an accumulator that kept running off
      // into the clamped region would leave the reverse pan dead until it caught
      // back up.
      const matrix = constrainRef.current?.(proposed, pinch.matrix) ?? proposed;
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

  // Where the projected geometry actually sits, which is what the pan bound is
  // measured against — the drawn map rarely fills the canvas exactly.
  const contentBounds = useMemo<ContentBounds | null>(() => {
    const measure = mercator.path.bounds;
    if (typeof measure !== "function") {
      return null;
    }
    // biome-ignore lint/suspicious/noExplicitAny: GeoJSON types are complex
    const boxOf = (geo: any): Box | null => {
      try {
        const [[x0, y0], [x1, y1]] = measure(geo);
        return [x0, y0, x1, y1].every(Number.isFinite) && x1 > x0 && y1 > y0
          ? { x0, x1, y0, y1 }
          : null;
      } catch {
        return null;
      }
    };

    const outer = boxOf(data);
    if (!outer) {
      // An empty or degenerate collection has no bounds to speak of; the chart
      // falls back to visx's scale-only constraint.
      return null;
    }
    return {
      outer,
      occupancy: buildOccupancy(outer, data.features, mercator.projection),
    };
  }, [data, mercator]);

  const constrain = useMemo(
    () =>
      contentBounds
        ? makeConstrain(contentBounds, width, height, zoomMin, zoomMax)
        : undefined,
    [contentBounds, width, height, zoomMin, zoomMax]
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
        constrain={constrain}
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
              constrain={constrain}
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
