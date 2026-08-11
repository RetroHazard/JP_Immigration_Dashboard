// vitest.setup.ts — jsdom gaps the components rely on.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Testing Library only auto-registers its cleanup when Vitest globals are on,
// and they aren't here — so without this, a file that renders in more than one
// test accumulates DOM and every query fails with "multiple elements found".
afterEach(cleanup);

// --- matchMedia ---------------------------------------------------------
// jsdom has no matchMedia at all. The previous stub returned a fresh object
// with no-op listeners on every call, which is enough for a one-shot
// `.matches` read but not for anything that subscribes: `useCoarsePointer`
// uses `useSyncExternalStore`, so a stub that never calls its listener can
// never report a change. This one keeps a real listener registry and lets a
// test flip a query.
const mediaOverrides = new Map<string, boolean>();
const mediaListeners = new Map<string, Set<() => void>>();

// Unchanged default, so no existing test shifts behaviour: reduced motion is
// on, and every other query — including the coarse-pointer one — is off.
const defaultMatches = (query: string): boolean => query.includes('prefers-reduced-motion');

/** Sets a query's result and notifies anything subscribed to it. */
export function setMediaQuery(query: string, matches: boolean): void {
  mediaOverrides.set(query, matches);
  mediaListeners.get(query)?.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
  window.matchMedia = (query: string): MediaQueryList => {
    const listeners = mediaListeners.get(query) ?? new Set<() => void>();
    mediaListeners.set(query, listeners);
    return {
      get matches() {
        return mediaOverrides.get(query) ?? defaultMatches(query);
      },
      media: query,
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
      addListener: (listener: () => void) => listeners.add(listener),
      removeListener: (listener: () => void) => listeners.delete(listener),
      onchange: null,
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  };
}

afterEach(() => {
  mediaOverrides.clear();
});

// --- ResizeObserver -----------------------------------------------------
// jsdom doesn't implement it, and the charts size themselves from it. Without
// a stub they measure 0 wide, which for the treemap means every tile renders
// with `pointerEvents: 'none'` and no interaction test can click anything.
// The reported box is arbitrary but has to be big enough to lay out.
const OBSERVED_WIDTH = 800;
const OBSERVED_HEIGHT = 430;

if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class {
    private readonly callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element) {
      const contentRect = { x: 0, y: 0, top: 0, left: 0, right: OBSERVED_WIDTH, bottom: OBSERVED_HEIGHT, width: OBSERVED_WIDTH, height: OBSERVED_HEIGHT } as DOMRectReadOnly;
      this.callback([{ target, contentRect } as ResizeObserverEntry], this as unknown as ResizeObserver);
    }

    unobserve() {}

    disconnect() {}
  };
}
