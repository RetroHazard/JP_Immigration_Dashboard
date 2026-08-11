import { createRef } from 'react';

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { getPinnedId, resetPinRegistry } from '../../lib/tooltip-pin';
import { activationProps, type ChartTapMode, useTapPin } from '../useTapPin';

const mountTapPin = (enabled = true) => {
  const container = document.createElement('div');
  document.body.append(container);
  const containerRef = createRef<Element | null>() as React.RefObject<Element | null>;
  containerRef.current = container;
  const onDismiss = vi.fn();

  const view = renderHook(({ on }: { on: boolean }) => useTapPin({ enabled: on, containerRef, onDismiss }), { initialProps: { on: enabled } });
  return { ...view, container, onDismiss };
};

afterEach(() => {
  resetPinRegistry();
  document.body.innerHTML = '';
});

describe('useTapPin', () => {
  it('returns null on a hover device so call sites can branch on one value', () => {
    const { result } = mountTapPin(false);
    expect(result.current).toBeNull();
  });

  it('pins, then unpins the same datapoint', () => {
    const { result } = mountTapPin();

    let outcome: string | undefined;
    act(() => {
      outcome = result.current?.tap('point:3');
    });
    expect(outcome).toBe('pinned');
    expect(result.current?.pinned).toBe(true);
    expect(getPinnedId()).not.toBeNull();

    act(() => {
      outcome = result.current?.tap('point:3');
    });
    expect(outcome).toBe('unpinned');
    expect(result.current?.pinned).toBe(false);
    expect(getPinnedId()).toBeNull();
  });

  it('reports a move when a different datapoint is tapped', () => {
    const { result } = mountTapPin();

    act(() => {
      result.current?.tap('point:1');
    });
    let outcome: string | undefined;
    act(() => {
      outcome = result.current?.tap('point:2');
    });

    expect(outcome).toBe('moved');
    expect(result.current?.pinned).toBe(true);
  });

  it('clears the pin without asking the chart to dismiss', () => {
    const { result, onDismiss } = mountTapPin();

    act(() => {
      result.current?.tap('point:1');
    });
    act(() => result.current?.clear());

    expect(result.current?.pinned).toBe(false);
    expect(getPinnedId()).toBeNull();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('dismisses when another chart takes the pin', () => {
    const { result, onDismiss } = mountTapPin();
    const other = mountTapPin();

    act(() => {
      result.current?.tap('point:1');
    });
    act(() => {
      other.result.current?.tap('point:9');
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(result.current?.pinned).toBe(false);
    expect(other.result.current?.pinned).toBe(true);
  });

  it('releases the pin when the chart unmounts mid-pin', () => {
    const { result, unmount } = mountTapPin();
    act(() => {
      result.current?.tap('point:1');
    });
    expect(getPinnedId()).not.toBeNull();

    unmount();
    expect(getPinnedId()).toBeNull();
  });

  it('drops a live pin if the device switches to a mouse', () => {
    const { result, rerender, onDismiss } = mountTapPin();
    act(() => {
      result.current?.tap('point:1');
    });

    act(() => rerender({ on: false }));

    expect(result.current).toBeNull();
    expect(getPinnedId()).toBeNull();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('activationProps', () => {
  const noop = () => undefined;

  it('gives a hover device the enter/leave pair and no click', () => {
    const props = activationProps(null, 'k', noop, noop);
    expect(props.onMouseEnter).toBeTypeOf('function');
    expect(props.onMouseLeave).toBeTypeOf('function');
    expect(props.onClick).toBeUndefined();
  });

  it('gives a touch device only a click, so post-tap mouse events find no handler', () => {
    const tapMode: ChartTapMode = { tap: () => 'pinned', clear: noop, pinned: false };
    const props = activationProps(tapMode, 'k', noop, noop);
    expect(props.onClick).toBeTypeOf('function');
    expect(props.onMouseEnter).toBeUndefined();
    expect(props.onMouseLeave).toBeUndefined();
  });

  it('activates on pin/move and deactivates on unpin', () => {
    const activate = vi.fn();
    const deactivate = vi.fn();
    const stopPropagation = vi.fn();
    const event = { stopPropagation } as unknown as React.MouseEvent;

    const results: Array<'pinned' | 'moved' | 'unpinned'> = ['pinned', 'moved', 'unpinned'];
    for (const outcome of results) {
      const tapMode: ChartTapMode = { tap: () => outcome, clear: noop, pinned: false };
      activationProps(tapMode, 'k', activate, deactivate).onClick?.(event);
    }

    expect(activate).toHaveBeenCalledTimes(2);
    expect(deactivate).toHaveBeenCalledTimes(1);
    // Otherwise the chart background's dismiss handler would undo every tap.
    expect(stopPropagation).toHaveBeenCalledTimes(3);
  });
});
