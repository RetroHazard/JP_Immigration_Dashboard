// src/hooks/useTapPin.ts
// Per-chart half of tap-to-pin. The registry in `@/lib/tooltip-pin` knows which
// *chart* owns the page's single pin; this hook remembers which *datapoint*
// inside that chart is pinned, which is what makes "tap the same point again to
// close" work.
//
// The interaction is built on `onClick`, not on touch/pointer bookkeeping. The
// browser already tells a tap apart from a drag or a scroll — with the right
// slop for each platform — and withholds the click when the gesture turns into
// a scroll. It also means hover handlers can simply be left off on touch
// devices, which is what stops the synthesized mouse events a browser fires
// after `touchend` from re-opening or clearing a pinned tooltip.
'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

import type React from 'react';

import { acquirePin, releasePin } from '@/lib/tooltip-pin';

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
  // `close` identity even as the chart re-renders with new closures.
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const dismiss = useCallback(() => {
    setPinnedKey(null);
    onDismissRef.current();
  }, []);

  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

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
        close: () => dismissRef.current(),
      });
      return moved ? 'moved' : 'pinned';
    },
    [containerRef, enabled, id, pinnedKey]
  );

  // Unmounting mid-pin (a chart swap, a filter change) must not leave the
  // registry holding a dead owner and its listeners attached.
  useEffect(() => () => releasePin(id), [id]);

  // Switching to a mouse mid-session (a tablet gaining a trackpad) leaves a pin
  // with no way to dismiss it, since the tap handlers are about to detach.
  useEffect(() => {
    if (!enabled && pinnedKey !== null) {
      setPinnedKey(null);
      releasePin(id);
      onDismissRef.current();
    }
  }, [enabled, id, pinnedKey]);

  if (!enabled) return null;
  return { tap, clear, pinned: pinnedKey !== null };
}

type ActivationProps = {
  onClick?: React.MouseEventHandler;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

/**
 * The one-line swap that turns hover into tap at each call site. On a hover
 * device it returns the usual enter/leave pair; on a touch device it returns
 * only `onClick`, so the compatibility mouse events fired after a tap have
 * nothing to land on.
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
