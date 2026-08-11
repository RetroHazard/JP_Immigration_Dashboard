// Tap-to-pin behaviour of the crosshair charts, driven through the hook rather
// than a rendered chart: visx lays out from real measurements that jsdom can't
// produce, and the interesting logic is all in here anyway.
import { createRef } from 'react';
import { scaleLinear, scaleTime } from '@visx/scale';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { resetCoarsePointerCache } from '../../../../hooks/useCoarsePointer';
import { resetPinRegistry } from '../../../../lib/tooltip-pin';
import { setCoarsePointer } from '../../../../test-utils';
import type { LineConfig } from '../chart-context';
import { useChartInteraction } from '../use-chart-interaction';

const data = Array.from({ length: 5 }, (_, i) => ({ date: new Date(2026, 0, 1 + i), value: (i + 1) * 10 }));

const xAccessor = (d: Record<string, unknown>) => d.date as Date;
const lines: LineConfig[] = [{ dataKey: 'value', stroke: '#000', strokeWidth: 2 }];
const margin = { top: 0, right: 0, bottom: 0, left: 0 };

// The real one is a d3 bisector; this is the same contract over sorted dates.
const bisectDate = (rows: Record<string, unknown>[], date: Date, lo: number) => {
  let index = lo;
  while (index < rows.length && xAccessor(rows[index]).getTime() < date.getTime()) index += 1;
  return index;
};

const xScale = scaleTime<number>({ domain: [data[0].date, data[4].date], range: [0, 400] });
const yScale = scaleLinear<number>({ domain: [0, 50], range: [200, 0] });

/**
 * `getChartX` runs visx's `localPoint`, which bails unless the object is a real
 * Event or carries a real `nativeEvent`. jsdom has no `createSVGPoint`, so visx
 * takes its bounding-box fallback — and jsdom reports a zero rect, which makes
 * the local x equal `clientX`. That is exactly what these assertions assume.
 *
 * The underlying event type is immaterial: these tests invoke the handlers
 * directly, so one object stands in for a click, a move or a press.
 */
const mouseAt = (clientX: number) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.append(g);
  document.body.append(svg);
  const nativeEvent = new MouseEvent('click', { clientX, clientY: 100, bubbles: true });
  return { currentTarget: g, target: g, clientX, clientY: 100, nativeEvent } as unknown as React.MouseEvent<SVGGElement>;
};

/** The hover path batches into a rAF, so its assertions need a frame first. */
const flushFrame = async () => {
  await act(async () => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  });
};

const mount = (coarse: boolean) => {
  setCoarsePointer(coarse);
  const container = document.createElement('div');
  document.body.append(container);
  const containerRef = createRef<HTMLDivElement | null>() as React.RefObject<HTMLDivElement | null>;
  containerRef.current = container;

  return renderHook(() =>
    useChartInteraction({
      bisectDate,
      canInteract: true,
      containerRef,
      data,
      lines,
      margin,
      xAccessor,
      xScale,
      yScale,
      yScales: {},
    })
  );
};

afterEach(() => {
  resetPinRegistry();
  resetCoarsePointerCache();
  document.body.innerHTML = '';
});

describe('hover devices are unaffected', () => {
  it('keeps the mouse handlers and attaches no click', () => {
    const { result } = mount(false);
    const handlers = result.current.interactionHandlers;

    expect(handlers.onMouseMove).toBeTypeOf('function');
    expect(handlers.onMouseLeave).toBeTypeOf('function');
    expect(handlers.onMouseDown).toBeTypeOf('function');
    expect(handlers.onMouseUp).toBeTypeOf('function');
    expect(handlers.onClick).toBeUndefined();
    expect(result.current.isTapMode).toBe(false);
  });

  it('keeps touch-action none, which the drag-selection path relies on', () => {
    const { result } = mount(false);
    expect(result.current.interactionStyle.touchAction).toBe('none');
  });
});

describe('clicking a hover chart leaves its tooltip alone', () => {
  it('survives a press and release that never travels', async () => {
    // Regression: mousedown used to clear outright, on the assumption that
    // every press was the start of a range drag.
    const { result } = mount(false);

    act(() => result.current.interactionHandlers.onMouseMove?.(mouseAt(205)));
    await flushFrame();
    expect(result.current.tooltipData?.index).toBe(2);

    act(() => result.current.interactionHandlers.onMouseDown?.(mouseAt(205)));
    act(() => result.current.interactionHandlers.onMouseUp?.());

    expect(result.current.tooltipData?.index).toBe(2);
    expect(result.current.selection).toBeNull();
  });

  it('keeps tracking the cursor while a held button stays under the threshold', async () => {
    const { result } = mount(false);

    act(() => result.current.interactionHandlers.onMouseMove?.(mouseAt(205)));
    await flushFrame();
    act(() => result.current.interactionHandlers.onMouseDown?.(mouseAt(205)));
    act(() => result.current.interactionHandlers.onMouseMove?.(mouseAt(207)));
    await flushFrame();

    expect(result.current.tooltipData).not.toBeNull();
    expect(result.current.selection).toBeNull();
  });

  it('still starts a range drag once the cursor travels', async () => {
    const { result } = mount(false);

    act(() => result.current.interactionHandlers.onMouseMove?.(mouseAt(100)));
    await flushFrame();
    expect(result.current.tooltipData).not.toBeNull();

    act(() => result.current.interactionHandlers.onMouseDown?.(mouseAt(100)));
    act(() => result.current.interactionHandlers.onMouseMove?.(mouseAt(300)));

    expect(result.current.tooltipData).toBeNull();
    expect(result.current.selection?.active).toBe(true);
    expect(result.current.selection?.startX).toBe(100);
    expect(result.current.selection?.endX).toBe(300);
  });

  it('goes back to hovering after a drag is released', async () => {
    const { result } = mount(false);

    act(() => result.current.interactionHandlers.onMouseDown?.(mouseAt(100)));
    act(() => result.current.interactionHandlers.onMouseMove?.(mouseAt(300)));
    act(() => result.current.interactionHandlers.onMouseUp?.());
    expect(result.current.selection).toBeNull();

    act(() => result.current.interactionHandlers.onMouseMove?.(mouseAt(305)));
    await flushFrame();

    expect(result.current.tooltipData).not.toBeNull();
    expect(result.current.selection).toBeNull();
  });
});

describe('touch devices tap to pin', () => {
  it('attaches only a click, so post-tap mouse events find no handler', () => {
    const { result } = mount(true);
    const handlers = result.current.interactionHandlers;

    expect(handlers.onClick).toBeTypeOf('function');
    expect(handlers.onMouseMove).toBeUndefined();
    expect(handlers.onMouseLeave).toBeUndefined();
    // onMouseDown arms a range drag — attached, it would fight the pin.
    expect(handlers.onMouseDown).toBeUndefined();
    expect(result.current.isTapMode).toBe(true);
  });

  it('lets the page scroll over the plot area', () => {
    const { result } = mount(true);
    expect(result.current.interactionStyle.touchAction).toBe('manipulation');
  });

  it('pins a datapoint, then closes it when tapped again', () => {
    const { result } = mount(true);

    act(() => result.current.interactionHandlers.onClick?.(mouseAt(0)));
    expect(result.current.tooltipData).not.toBeNull();
    expect(result.current.pinned).toBe(true);

    act(() => result.current.interactionHandlers.onClick?.(mouseAt(0)));
    expect(result.current.tooltipData).toBeNull();
    expect(result.current.pinned).toBe(false);
  });

  it('moves the pin to a different datapoint', () => {
    const { result } = mount(true);

    act(() => result.current.interactionHandlers.onClick?.(mouseAt(0)));
    const first = result.current.tooltipData?.index;

    act(() => result.current.interactionHandlers.onClick?.(mouseAt(400)));
    expect(result.current.tooltipData?.index).not.toBe(first);
    expect(result.current.pinned).toBe(true);
  });

  it('re-opens a datapoint that was previously unpinned', () => {
    // Regression: the scheduler's dedupe key survives a clear, so without
    // commitTooltipNow the second pin on the same point is swallowed.
    const { result } = mount(true);

    act(() => result.current.interactionHandlers.onClick?.(mouseAt(0)));
    act(() => result.current.interactionHandlers.onClick?.(mouseAt(0)));
    expect(result.current.tooltipData).toBeNull();

    act(() => result.current.interactionHandlers.onClick?.(mouseAt(0)));
    expect(result.current.tooltipData).not.toBeNull();
  });

  it('dismisses on a tap outside the chart', () => {
    const { result } = mount(true);
    act(() => result.current.interactionHandlers.onClick?.(mouseAt(0)));
    expect(result.current.pinned).toBe(true);

    act(() => {
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    });
    expect(result.current.tooltipData).toBeNull();
    expect(result.current.pinned).toBe(false);
  });

  it('dismisses on Escape', () => {
    const { result } = mount(true);
    act(() => result.current.interactionHandlers.onClick?.(mouseAt(0)));

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(result.current.tooltipData).toBeNull();
  });

  it('dismissTap clears a pin from the chart margins', () => {
    const { result } = mount(true);
    act(() => result.current.interactionHandlers.onClick?.(mouseAt(0)));
    expect(result.current.pinned).toBe(true);

    act(() => result.current.dismissTap());
    expect(result.current.tooltipData).toBeNull();
    expect(result.current.pinned).toBe(false);
  });
});

describe('data sanity', () => {
  it('resolves the nearest datapoint to the tap', () => {
    const { result } = mount(true);
    // 400px maps the 4-day domain, so ~100px per day.
    act(() => result.current.interactionHandlers.onClick?.(mouseAt(205)));
    expect(result.current.tooltipData?.index).toBe(2);
    expect(xAccessor(result.current.tooltipData?.point ?? {}).getTime()).toBe(data[2].date.getTime());
  });
});
