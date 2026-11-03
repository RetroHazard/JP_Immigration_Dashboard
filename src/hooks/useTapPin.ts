// Per-chart half of tap-to-pin. The registry in `@/lib/tooltip-pin` knows which
// *chart* owns the page's single pin; this hook remembers which *datapoint*
// inside that chart is pinned, so tapping the same point again closes it.
//
// Built on `onClick`, not touch/pointer bookkeeping: the browser already tells
// a tap from a drag or scroll and withholds the click on a scroll. Hover
// handlers are left off on touch devices so the synthesized mouse events after
// `touchend` can't reopen or clear a pinned tooltip.
'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import type React from 'react';

import { acquirePin, getPinnedId, releasePin } from '@/lib/tooltip-pin';

export type TapResult = 'pinned' | 'moved' | 'unpinned' | 'ignored';

export interface ChartTapMode {
  /** Toggles/moves the pin. The caller applies its own state from the result. */
  tap: (key: string) => TapResult;
  /** Drops the pin without going through a tap (data changed, background tap). */
  clear: () => void;
  pinned: boolean;
}

interface UseTapPinOptions {
  /** Usually `useCoarsePointer()`. */
  enabled: boolean;
  /** Taps inside this element belong to the chart; outside dismisses. */
  containerRef: React.RefObject<Element | null>;
  /** Clears the chart's own tooltip state. */
  onDismiss: () => void;
}

/**
 * Returns `null` on hover devices so call sites need one falsy check rather
 * than threading a boolean alongside the handle.
 */
export function useTapPin({ enabled, containerRef, onDismiss }: UseTapPinOptions): ChartTapMode | null {
  const id = useId();
  const [pinnedKey, setPinnedKey] = useState<string | null>(null);

  // Kept in a ref so the PinRegistration passed to the registry has a stable
  // `close` identity even as the chart re-renders with new closures. Synced in
  // a layout effect, ahead of any passive effect or event that could read it.
  const onDismissRef = useRef(onDismiss);
  useLayoutEffect(() => {
    onDismissRef.current = onDismiss;
  });

  const dismiss = useCallback(() => {
    setPinnedKey(null);
    onDismissRef.current();
  }, []);

  const clear = useCallback(() => {
    setPinnedKey(null);
    releasePin(id);
  }, [id]);

  const tap = useCallback(
    (key: string): TapResult => {
      if (!enabled) return 'ignored';
      if (pinnedKey === key) {
        setPinnedKey(null);
        releasePin(id);
        return 'unpinned';
      }
      const moved = pinnedKey !== null;
      setPinnedKey(key);
      acquirePin({
        id,
        getElement: () => containerRef.current,
        close: dismiss,
      });
      return moved ? 'moved' : 'pinned';
    },
    [containerRef, dismiss, enabled, id, pinnedKey]
  );

  // Unmounting mid-pin (a chart swap, a filter change) must not leave the
  // registry holding a dead owner and its listeners attached.
  useEffect(() => () => releasePin(id), [id]);

  // Switching to a mouse mid-session (a tablet gaining a trackpad) leaves a pin
  // with no way to dismiss it, since the tap handlers are about to detach. The
  // pinned key resets during render; the registry and the chart's tooltip are
  // external, so they are released in an effect. The registry holds this
  // chart's id exactly while a key is pinned, so it says whether one was live.
  if (!enabled && pinnedKey !== null) setPinnedKey(null);
  useEffect(() => {
    if (enabled || getPinnedId() !== id) return;
    releasePin(id);
    onDismissRef.current();
  }, [enabled, id]);

  if (!enabled) return null;
  return { tap, clear, pinned: pinnedKey !== null };
}

type ActivationProps = {
  onClick?: React.MouseEventHandler;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

/**
 * Swaps hover for tap at each call site: the enter/leave pair on a hover
 * device, only `onClick` on a touch device.
 */
export function activationProps(tapMode: ChartTapMode | null, key: string, activate: () => void, deactivate: () => void): ActivationProps {
  if (!tapMode) {
    return { onMouseEnter: activate, onMouseLeave: deactivate };
  }
  return {
    onClick: (event) => {
      // Otherwise the chart background's "tapped empty space" handler would
      // also fire and immediately undo this.
      event.stopPropagation();
      const result = tapMode.tap(key);
      if (result === 'unpinned') {
        deactivate();
      } else if (result !== 'ignored') {
        activate();
      }
    },
  };
}
