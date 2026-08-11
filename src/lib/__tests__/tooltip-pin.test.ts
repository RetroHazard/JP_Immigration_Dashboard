// Covers the tap-to-pin registry, which holds all the ordering rules that have
// no visual feedback loop to catch them: one pin at a time, and the four ways a
// pin gets dismissed from outside the chart that opened it.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { acquirePin, closeActivePin, getPinnedId, PIN_SCROLL_DISMISS_PX, PIN_SCROLL_GRACE_MS, releasePin, resetPinRegistry } from '../tooltip-pin';

const makeChart = (id: string) => {
  const element = document.createElement('div');
  document.body.append(element);
  const close = vi.fn();
  return { id, element, close, registration: { id, getElement: () => element, close } };
};

/** The registry reads scroll position off `window`, which jsdom keeps at 0. */
const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true });
  document.dispatchEvent(new Event('scroll'));
};

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
  vi.spyOn(performance, 'now').mockReturnValue(0);
});

afterEach(() => {
  resetPinRegistry();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('one pin at a time', () => {
  it('closes the previous holder when another chart pins', () => {
    const a = makeChart('a');
    const b = makeChart('b');

    acquirePin(a.registration);
    expect(getPinnedId()).toBe('a');

    acquirePin(b.registration);
    expect(a.close).toHaveBeenCalledTimes(1);
    expect(b.close).not.toHaveBeenCalled();
    expect(getPinnedId()).toBe('b');
  });

  it('does not re-close a chart that pins a second datapoint', () => {
    const a = makeChart('a');
    acquirePin(a.registration);
    acquirePin(a.registration);
    expect(a.close).not.toHaveBeenCalled();
    expect(getPinnedId()).toBe('a');
  });

  it('ignores a release from a chart that no longer holds the pin', () => {
    const a = makeChart('a');
    const b = makeChart('b');
    acquirePin(a.registration);
    acquirePin(b.registration);

    // A late cleanup from the displaced chart, e.g. a StrictMode double-unmount.
    releasePin('a');
    expect(getPinnedId()).toBe('b');
  });
});

describe('outside-tap dismissal', () => {
  it('closes on a pointerdown outside the owning chart', () => {
    const a = makeChart('a');
    acquirePin(a.registration);

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(a.close).toHaveBeenCalledTimes(1);
    expect(getPinnedId()).toBeNull();
  });

  it('leaves a pointerdown inside the chart to the chart itself', () => {
    const a = makeChart('a');
    const child = document.createElement('span');
    a.element.append(child);
    acquirePin(a.registration);

    child.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(a.close).not.toHaveBeenCalled();
    expect(getPinnedId()).toBe('a');
  });
});

describe('scroll dismissal', () => {
  it('ignores the scroll burst that follows a tap', () => {
    const a = makeChart('a');
    acquirePin(a.registration);

    // iOS URL-bar collapse: a large scroll, but inside the grace window.
    vi.mocked(performance.now).mockReturnValue(PIN_SCROLL_GRACE_MS - 1);
    scrollTo(500);
    expect(a.close).not.toHaveBeenCalled();
  });

  it('ignores a scroll shorter than the dismiss threshold', () => {
    const a = makeChart('a');
    acquirePin(a.registration);

    vi.mocked(performance.now).mockReturnValue(PIN_SCROLL_GRACE_MS + 100);
    scrollTo(PIN_SCROLL_DISMISS_PX);
    expect(a.close).not.toHaveBeenCalled();
  });

  it('closes on a real scroll past both thresholds', () => {
    const a = makeChart('a');
    acquirePin(a.registration);

    vi.mocked(performance.now).mockReturnValue(PIN_SCROLL_GRACE_MS + 100);
    scrollTo(PIN_SCROLL_DISMISS_PX + 1);
    expect(a.close).toHaveBeenCalledTimes(1);
    expect(getPinnedId()).toBeNull();
  });
});

describe('keyboard and page lifecycle', () => {
  it('closes on Escape', () => {
    const a = makeChart('a');
    acquirePin(a.registration);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(a.close).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys', () => {
    const a = makeChart('a');
    acquirePin(a.registration);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(a.close).not.toHaveBeenCalled();
  });

  it('closes when the page is hidden', () => {
    const a = makeChart('a');
    acquirePin(a.registration);

    document.dispatchEvent(new Event('visibilitychange'));
    expect(a.close).toHaveBeenCalledTimes(1);
  });
});

describe('listener lifecycle', () => {
  it('attaches nothing until something is pinned, and detaches on release', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const a = makeChart('a');

    expect(add).not.toHaveBeenCalled();

    acquirePin(a.registration);
    expect(add).toHaveBeenCalled();

    releasePin('a');
    expect(remove).toHaveBeenCalled();

    // Nothing is pinned, so a stray outside tap must not reach the old owner.
    a.close.mockClear();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(a.close).not.toHaveBeenCalled();
  });

  it('closeActivePin notifies the owner and clears the pin', () => {
    const a = makeChart('a');
    acquirePin(a.registration);

    closeActivePin();
    expect(a.close).toHaveBeenCalledTimes(1);
    expect(getPinnedId()).toBeNull();

    // Idempotent: a second call has nothing to close.
    closeActivePin();
    expect(a.close).toHaveBeenCalledTimes(1);
  });

  it('releasePin does not notify the owner', () => {
    const a = makeChart('a');
    acquirePin(a.registration);

    releasePin('a');
    expect(a.close).not.toHaveBeenCalled();
    expect(getPinnedId()).toBeNull();
  });
});
