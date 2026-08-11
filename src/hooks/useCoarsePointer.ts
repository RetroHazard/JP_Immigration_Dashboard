// src/hooks/useCoarsePointer.ts
// The single place the app asks "is this a touch device?". Charts use it to
// switch tooltips from hover to tap-to-pin.
//
// The query is about the *pointer*, not the viewport: a desktop window dragged
// narrow still has a mouse and should keep hover tooltips, while a large tablet
// has no hover at all. `(hover: none)` alone would catch some stylus setups, so
// it is paired with `(pointer: coarse)` to mean "primary input is a finger".
//
// Known limitation: a touchscreen laptop reports false here and stays in hover
// mode. That is the pre-existing behaviour, and there is no media query that
// distinguishes "has a touchscreen" from "is being touched right now".
'use client';

import { useSyncExternalStore } from 'react';

export const COARSE_POINTER_QUERY = '(hover: none) and (pointer: coarse)';

/**
 * One MediaQueryList for the whole app rather than one per hook call: the
 * treemap subscribes from ~90 tiles and the choropleth from ~47 features, and
 * each MQL carries its own listener list in the browser.
 */
let mediaQuery: MediaQueryList | null | undefined;

const getMediaQuery = (): MediaQueryList | null => {
  if (mediaQuery === undefined) {
    mediaQuery = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(COARSE_POINTER_QUERY) : null;
  }
  return mediaQuery;
};

const subscribe = (onChange: () => void): (() => void) => {
  const query = getMediaQuery();
  if (!query) return () => undefined;
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

// Must return a primitive: useSyncExternalStore re-renders forever if the
// snapshot is a fresh object each call.
const getSnapshot = (): boolean => getMediaQuery()?.matches ?? false;

// The page is prerendered by `output: 'export'`, so this runs for real even
// though App itself is loaded with `ssr: false`. Hover is the safe default —
// it matches the markup a desktop visitor gets and avoids a tap-mode flash.
const getServerSnapshot = (): boolean => false;

/** Imperative read for non-React code paths, mirroring `prefersReducedMotion()`. */
export const isCoarsePointer = (): boolean => getSnapshot();

/** Reactive: re-renders the caller when the primary pointer changes. */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Test-only. The module memoizes its MediaQueryList on first read, so a test
 * that swaps `window.matchMedia` needs to drop the cached one.
 */
export function resetCoarsePointerCache(): void {
  mediaQuery = undefined;
}
