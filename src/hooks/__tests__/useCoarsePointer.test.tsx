import { afterEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { setMediaQuery } from '../../../vitest.setup';
import { COARSE_POINTER_QUERY, isCoarsePointer, resetCoarsePointerCache, useCoarsePointer } from '../useCoarsePointer';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  resetCoarsePointerCache();
});

describe('useCoarsePointer', () => {
  it('defaults to false, so a mouse keeps hover tooltips', () => {
    resetCoarsePointerCache();
    const { result } = renderHook(() => useCoarsePointer());
    expect(result.current).toBe(false);
  });

  it('reports true when the pointer is coarse', () => {
    resetCoarsePointerCache();
    setMediaQuery(COARSE_POINTER_QUERY, true);
    const { result } = renderHook(() => useCoarsePointer());
    expect(result.current).toBe(true);
  });

  it('re-renders when the primary pointer changes mid-session', () => {
    resetCoarsePointerCache();
    const { result } = renderHook(() => useCoarsePointer());
    expect(result.current).toBe(false);

    act(() => setMediaQuery(COARSE_POINTER_QUERY, true));
    expect(result.current).toBe(true);

    act(() => setMediaQuery(COARSE_POINTER_QUERY, false));
    expect(result.current).toBe(false);
  });

  it('falls back to hover when matchMedia is unavailable', () => {
    // @ts-expect-error — deleting the API is exactly the case under test.
    delete window.matchMedia;
    resetCoarsePointerCache();

    const { result } = renderHook(() => useCoarsePointer());
    expect(result.current).toBe(false);
    expect(isCoarsePointer()).toBe(false);
  });
});
