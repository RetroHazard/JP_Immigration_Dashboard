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

  // LOCAL MODIFICATION: inputs are read through this ref, not the effect's deps.
  // The scales change identity on every y-domain tween frame; as deps they tore
  // the animation down before `onComplete` could release the snapshot. Read
  // live, the path morph and the domain tween compose.
  // (Re-apply after a re-vendor.)
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
    // LOCAL MODIFICATION: resync only while the signature is unchanged (the
    // scale moved, the data did not). This effect runs before the animation
    // effect in the same commit; on a data change it would overwrite the
    // transition's starting snapshot with the new target, and the morph would
    // snap. (Re-apply after a re-vendor.)
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
      // Stopping skips `onComplete`, the only other place the snapshot is
      // released; otherwise the path stays pinned to a stale scale's pixels.
      setAnimatedPoints(null);
    };
    // LOCAL MODIFICATION: deps match the body's guard (the signature); scales
    // and data are read live through `latestRef`. (Re-apply after a re-vendor.)
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
