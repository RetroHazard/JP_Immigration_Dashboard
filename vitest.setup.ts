// vitest.setup.ts — jsdom gaps the components rely on.
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library only auto-registers its cleanup when Vitest globals are on,
// and they aren't here — so without this, a file that renders in more than one
// test accumulates DOM and every query fails with "multiple elements found".
afterEach(cleanup);

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes('prefers-reduced-motion'), // reduce motion in tests
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      onchange: null,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
