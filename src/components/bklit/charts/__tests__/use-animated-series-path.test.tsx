// Driven through the hook rather than a rendered chart, for the same reason as
// use-chart-interaction.test.tsx: visx lays out from real measurements jsdom
// can't produce, and the interesting logic is all in here anyway.
//
// What is under test is two animations running at once. Changing a filter swaps
// the data (starting a path morph) *and* moves the y-domain (starting a tween
// that hands every series a new y-scale on each frame). The path has to keep
// tracking the scale while that happens; when it stopped doing so, the line was
// left drawn against the domain the chart had before the change, while its
// tooltip dot — which is recomputed live — moved to the right place.
//
// `motion` is mocked because neither of its inputs is reachable otherwise: it
// caches reduced-motion at import (and this suite defaults it on, which
// short-circuits the branch under test), and its frame loop doesn't tick
// usefully in jsdom. Driving `onUpdate` by hand is also what makes "a frame
// ran, then the scale moved" expressible as a test at all.
import { curveLinear } from '@visx/curve';
import { scaleLinear, scaleTime } from '@visx/scale';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { computeSeriesPathPoints, seriesPathFromPoints } from '../series-path-utils';
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

  // The regression, stated directly: a y-domain tween must not tear down the
  // path morph. It used to, and because a teardown skips `onComplete` the path
  // was then left holding pixels from the old scale for good.
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
