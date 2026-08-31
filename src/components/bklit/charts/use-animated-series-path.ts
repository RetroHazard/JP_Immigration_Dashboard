"use client";

import { animate, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LINE_LOADING_PULSE_EASE } from "./line-loading-timing";
import {
  computeSeriesPathPoints,
  interpolateSeriesPathPoints,
  type SeriesPathPoint,
  seriesPathFromPoints,
  seriesPathTransitionSignature,
} from "./series-path-utils";

// biome-ignore lint/suspicious/noExplicitAny: d3 curve factory type
type CurveFactory = any;

export interface UseAnimatedSeriesPathOptions {
  renderData: Record<string, unknown>[];
  xAccessor: (datum: Record<string, unknown>) => Date;
  xScale: (value: Date) => number | undefined;
  yScale: (value: number) => number | undefined;
  dataKey: string;
  curve: CurveFactory;
  chartPhase: string;
  durationMs: number;
  innerWidth: number;
  enabled: boolean;
}

export function useAnimatedSeriesPath({
  renderData,
  xAccessor,
  xScale,
  yScale,
  dataKey,
  curve,
  chartPhase,
  durationMs,
  innerWidth,
  enabled,
}: UseAnimatedSeriesPathOptions) {
  const reducedMotion = useReducedMotion();
  const [animatedPoints, setAnimatedPoints] = useState<
    SeriesPathPoint[] | null
  >(null);
  const displayedPointsRef = useRef<SeriesPathPoint[] | null>(null);
  const animatingRef = useRef(false);

  // LOCAL MODIFICATION: the transition reads its inputs through this ref rather
  // than closing over them. `xScale` / `yScale` change identity on every
  // y-domain tween frame, and having them in the effect's deps tore the
  // animation down mid-flight — the body then early-returned on the unchanged
  // signature, so `onComplete` never ran and `animatedPoints` was stranded
  // holding pixels from the scale the chart had before the change. Reading them
  // live is also what recomputing the target every frame was always for: the
  // path morph and the domain tween compose, so the line follows the axis as it
  // rescales instead of racing it. (Re-apply after a re-vendor.)
  const latestRef = useRef({ renderData, xAccessor, xScale, yScale, dataKey });
  latestRef.current = { renderData, xAccessor, xScale, yScale, dataKey };

  const computeLatestPoints = useCallback(() => {
    const live = latestRef.current;
    return computeSeriesPathPoints(
      live.renderData,
      live.xAccessor,
      live.xScale,
      live.yScale,
      live.dataKey
    );
  }, []);

  const xScaleDomain = useMemo(() => {
    const scaleWithDomain = xScale as { domain?: () => [Date, Date] };
    return scaleWithDomain.domain?.() ?? [new Date(0), new Date(0)];
  }, [xScale]);

  const transitionSignature = useMemo(
    () =>
      seriesPathTransitionSignature({
        renderData,
        xAccessor,
        dataKey,
        innerWidth,
        xDomainMin: xScaleDomain[0]?.getTime?.() ?? 0,
        xDomainMax: xScaleDomain[1]?.getTime?.() ?? 0,
      }),
    [renderData, xAccessor, dataKey, innerWidth, xScaleDomain]
  );

  const targetPoints = useMemo(
    () =>
      computeSeriesPathPoints(renderData, xAccessor, xScale, yScale, dataKey),
    [renderData, xAccessor, xScale, yScale, dataKey]
  );

  const prevTransitionSignatureRef = useRef(transitionSignature);

  useEffect(() => {
    // LOCAL MODIFICATION: resync only while the signature is unchanged — i.e.
    // the scale moved but the data did not, so no transition is coming. This
    // effect runs before the animation effect in the same commit, and without
    // the guard a data change had the new target written over the previous
    // frame's points before the transition read them as its starting snapshot:
    // the "morph" then interpolated the new path onto itself, a snap. The
    // animation effect updates prevTransitionSignatureRef, so the guard opens
    // again once the transition has started. (Re-apply after a re-vendor.)
    if (
      !animatingRef.current &&
      prevTransitionSignatureRef.current === transitionSignature
    ) {
      displayedPointsRef.current = targetPoints;
    }
  }, [targetPoints, transitionSignature]);

  useEffect(() => {
    const shouldAnimate =
      enabled &&
      !reducedMotion &&
      chartPhase === "ready" &&
      durationMs > 0 &&
      latestRef.current.renderData.length > 0;

    if (!shouldAnimate) {
      animatingRef.current = false;
      setAnimatedPoints(null);
      displayedPointsRef.current = computeLatestPoints();
      prevTransitionSignatureRef.current = transitionSignature;
      return;
    }

    if (prevTransitionSignatureRef.current === transitionSignature) {
      return;
    }
    prevTransitionSignatureRef.current = transitionSignature;

    const fromPoints = displayedPointsRef.current ?? computeLatestPoints();
    if (fromPoints.length === 0) {
      displayedPointsRef.current = computeLatestPoints();
      return;
    }

    animatingRef.current = true;
    const fromSnapshot = fromPoints;

    const control = animate(0, 1, {
      duration: durationMs / 1000,
      ease: [...LINE_LOADING_PULSE_EASE],
      onUpdate: (progress) => {
        const next = interpolateSeriesPathPoints(
          fromSnapshot,
          computeLatestPoints(),
          progress
        );
        displayedPointsRef.current = next;
        setAnimatedPoints(next);
      },
      onComplete: () => {
        animatingRef.current = false;
        displayedPointsRef.current = computeLatestPoints();
        setAnimatedPoints(null);
      },
    });

    return () => {
      control.stop();
      animatingRef.current = false;
      // Stopping skips `onComplete`, which is the only other place the snapshot
      // is released. Without this, an interrupted animation pins the path to
      // pixels from a scale that has since moved.
      setAnimatedPoints(null);
    };
    // LOCAL MODIFICATION: deps match the guard the body already applies — the
    // signature is what decides whether there is work to do. Listing the scales
    // and data here re-ran (and so tore down) the animation on every tween
    // frame; they are read live through `latestRef` instead.
    // (Re-apply after a re-vendor.)
  }, [
    transitionSignature,
    chartPhase,
    durationMs,
    enabled,
    reducedMotion,
    computeLatestPoints,
  ]);

  const activePoints = animatedPoints ?? targetPoints;
  const pathD = useMemo(
    () => seriesPathFromPoints(activePoints, curve),
    [activePoints, curve]
  );

  return {
    pathD,
    isPathAnimating: animatedPoints != null,
  };
}
