// src/hooks/useMediaQuery.ts
import { useSyncExternalStore } from 'react';

/**
 * Live match state for a CSS media query. False on the server and before
 * hydration, so anything that depends on it settles one render after mount.
 */
export const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (notify) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', notify);
      return () => mediaQuery.removeEventListener('change', notify);
    },
    () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches,
    () => false
  );
