// Driven through the hook rather than a rendered chart: visx lays out from real
// measurements jsdom can't produce. Under test are two animations at once: a
// filter change swaps the data (a path morph) and moves the y-domain (a tween
// that hands every series a new y-scale each frame), and the path must keep
// tracking the scale throughout.
//
// `motion` is mocked: it caches reduced-motion at import (this suite defaults it
// on, which short-circuits the branch under test) and its frame loop doesn't
// tick in jsdom. Driving `onUpdate` by hand lets a test say "a frame ran, then
// the scale moved".
import { curveLinear } from '@visx/curve';
import { scaleLinear, scaleTime } from '@visx/scale';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  computeSeriesPathPoints,
  interpolateSeriesPathPoints,
  seriesPathFromPoints,
} from '../series-path-utils';
import { useAnimatedSeriesPath } from '../use-animated-series-path';

interface FakeAnimation {
  onUpdate: (progress: number) => void;
  onComplete: () => void;
  stopped: boolean;
}

const motionState = vi.hoisted(() => ({ animations: [] as FakeAnimation[] }));

vi.mock('motion/react', () => ({
  useReducedMotion: () => false,
  animate: (
    _from: number,
    _to: number,
    options: { onUpdate: (progress: number) => void; onComplete: () => void }
  ) => {
    const animation: FakeAnimation = {
      onUpdate: options.onUpdate,
      onComplete: options.onComplete,
      stopped: false,
    };
    motionState.animations.push(animation);
    return {
      stop: () => {
        animation.stopped = true;
      },
    };
  },
}));

const xAccessor = (d: Record<string, unknown>) => d.date as Date;
const rows = (values: number[]) =>
  values.map((value, index) => ({ date: new Date(2026, 0, 1 + index), value }));

const xScale = scaleTime<number>({
  domain: [new Date(2026, 0, 1), new Date(2026, 0, 5)],
  range: [0, 400],
});

// visx scales are callable but typed as objects; the hook wants a plain fn.
type YScale = (value: number) => number | undefined;

/** Same pixel range throughout, so only the domain can move the path. */
const scaleTo = (max: number) =>
  scaleLinear<number>({ domain: [0, max], range: [200, 0] }) as unknown as YScale;

const expectedPath = (data: Record<string, unknown>[], yScale: YScale) =>
  seriesPathFromPoints(
    computeSeriesPathPoints(data, xAccessor, xScale, yScale, 'value'),
    curveLinear
  );

interface Props {
  renderData: Record<string, unknown>[];
  yScale: YScale;
}

const setup = (initialProps: Props) =>
  renderHook(
    ({ renderData, yScale }: Props) =>
      useAnimatedSeriesPath({
        chartPhase: 'ready',
        curve: curveLinear,
        dataKey: 'value',
        durationMs: 500,
        enabled: true,
        innerWidth: 400,
        renderData,
        xAccessor,
        xScale,
        yScale,
      }),
    { initialProps }
  );

const BEFORE = rows([100, 200, 300]);
const AFTER = rows([5, 10, 15]);

/** The one animation started by the data change. */
const running = (): FakeAnimation => {
  expect(motionState.animations).toHaveLength(1);
  return motionState.animations[0] as FakeAnimation;
};

describe('useAnimatedSeriesPath', () => {
  beforeEach(() => {
    motionState.animations.length = 0;
  });

  it('paths against the scale it is given', () => {
    const big = scaleTo(1000);
    const { result } = setup({ renderData: BEFORE, yScale: big });
    expect(result.current.pathD).toBe(expectedPath(BEFORE, big));
  });

  it('starts a transition when the data changes, and not before', () => {
    const big = scaleTo(1000);
    const { rerender } = setup({ renderData: BEFORE, yScale: big });
    expect(motionState.animations).toHaveLength(0);
    rerender({ renderData: AFTER, yScale: big });
    expect(motionState.animations).toHaveLength(1);
  });

  // Observed mid-flight: at progress 1 the interpolator returns the target
  // verbatim, so a hook that snapped to the new path would pass any end-state
  // test. Also pins the from-snapshot, which the resync effect must not
  // overwrite with the new target in the same commit.
  it('morphs through the frames rather than snapping to the target', () => {
    const big = scaleTo(1000);
    const { result, rerender } = setup({ renderData: BEFORE, yScale: big });
    rerender({ renderData: AFTER, yScale: big });
    const animation = running();

    act(() => animation.onUpdate(0.4));

    const from = computeSeriesPathPoints(BEFORE, xAccessor, xScale, big, 'value');
    const to = computeSeriesPathPoints(AFTER, xAccessor, xScale, big, 'value');
    const blended = seriesPathFromPoints(interpolateSeriesPathPoints(from, to, 0.4), curveLinear);
    expect(result.current.pathD).toBe(blended);
    expect(result.current.pathD).not.toBe(expectedPath(BEFORE, big));
    expect(result.current.pathD).not.toBe(expectedPath(AFTER, big));
  });

  // A y-domain tween must not tear down the path morph: a teardown skips
  // `onComplete`, leaving the path holding pixels from the old scale for good.
  it('survives the y-scale changing mid-transition', () => {
    const { rerender } = setup({ renderData: BEFORE, yScale: scaleTo(1000) });
    rerender({ renderData: AFTER, yScale: scaleTo(1000) });
    const animation = running();

    act(() => animation.onUpdate(0.4));
    rerender({ renderData: AFTER, yScale: scaleTo(20) });

    expect(animation.stopped).toBe(false);
    expect(motionState.animations).toHaveLength(1);
  });

  it('redraws against the new scale on the next frame', () => {
    const small = scaleTo(20);
    const { result, rerender } = setup({ renderData: BEFORE, yScale: scaleTo(1000) });
    rerender({ renderData: AFTER, yScale: scaleTo(1000) });
    const animation = running();

    act(() => animation.onUpdate(0.4));
    rerender({ renderData: AFTER, yScale: small });
    // A frame after the domain moved: the morph reads its inputs live, so it
    // now interpolates towards the path under the *current* scale.
    act(() => animation.onUpdate(1));

    expect(result.current.pathD).toBe(expectedPath(AFTER, small));
    expect(result.current.pathD).not.toBe(expectedPath(AFTER, scaleTo(1000)));
  });

  it('settles on the current scale when the transition completes', () => {
    const small = scaleTo(20);
    const { result, rerender } = setup({ renderData: BEFORE, yScale: scaleTo(1000) });
    rerender({ renderData: AFTER, yScale: scaleTo(1000) });
    const animation = running();

    act(() => animation.onUpdate(0.4));
    rerender({ renderData: AFTER, yScale: small });
    act(() => animation.onComplete());

    expect(result.current.isPathAnimating).toBe(false);
    expect(result.current.pathD).toBe(expectedPath(AFTER, small));
  });

  it('reports no path for an empty series rather than throwing', () => {
    const { result } = setup({ renderData: [], yScale: scaleTo(1000) });
    expect(result.current.pathD).toBe('');
  });
});
