// src/lib/tooltip-pin.ts
// Enforces "at most one pinned chart tooltip on the page" and owns the ways a
// pin gets dismissed from outside the chart that opened it.
//
// A module singleton rather than a React context: the invariant is
// document-scoped and so are the listeners, so a provider would only wrap this
// same state while imposing a mounting requirement on every vendored chart and
// on every test wrapper. Vitest gives each test file a fresh module registry;
// `resetPinRegistry()` covers isolation within a file.
'use client';

export interface PinRegistration {
  /** Stable per chart instance. */
  id: string;
  /** Taps inside this element are the chart's own business, not a dismissal. */
  getElement: () => Element | null;
  /** Clears the owning chart's tooltip state. */
  close: () => void;
}

/**
 * iOS fires `scroll` from URL-bar collapse and rubber-band settle in the
 * moments after a tap near the viewport edge. Without a grace window and a
 * minimum distance, a tooltip pinned near the bottom of the page would appear
 * never to open at all.
 */
export const PIN_SCROLL_GRACE_MS = 150;
export const PIN_SCROLL_DISMISS_PX = 24;

let active: PinRegistration | null = null;
let pinnedAt = 0;
let pinnedScrollY = 0;
let listening = false;

const currentScrollY = (): number => (typeof window === 'undefined' ? 0 : window.scrollY);

const now = (): number => (typeof performance === 'undefined' ? 0 : performance.now());

const handlePointerDown = (event: Event) => {
  const target = event.target;
  // Inside the owning chart: its own click handler decides whether this is a
  // toggle, a move, or a dismissal. Deciding here would pre-empt it.
  if (active && target instanceof Node && active.getElement()?.contains(target)) {
    return;
  }
  closeActivePin();
};

const handleScroll = () => {
  if (now() - pinnedAt <= PIN_SCROLL_GRACE_MS) return;
  if (Math.abs(currentScrollY() - pinnedScrollY) <= PIN_SCROLL_DISMISS_PX) return;
  closeActivePin();
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeActivePin();
};

const handleHide = () => closeActivePin();

const startListening = () => {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  // Capture on pointerdown so the dismissal decision lands before the tapped
  // chart's own click: tapping chart B while A is pinned must close A first.
  document.addEventListener('pointerdown', handlePointerDown, true);
  // Capture on scroll too — it does not bubble, and the dashboard has inner
  // scroll containers.
  document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('visibilitychange', handleHide);
  window.addEventListener('pagehide', handleHide);
};

const stopListening = () => {
  if (!listening || typeof document === 'undefined') return;
  listening = false;
  document.removeEventListener('pointerdown', handlePointerDown, true);
  document.removeEventListener('scroll', handleScroll, { capture: true });
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('visibilitychange', handleHide);
  window.removeEventListener('pagehide', handleHide);
};

/** Claims the page-wide pin, closing whichever chart held it. */
export function acquirePin(registration: PinRegistration): void {
  if (active && active.id !== registration.id) {
    const previous = active;
    active = null;
    previous.close();
  }
  active = registration;
  pinnedAt = now();
  pinnedScrollY = currentScrollY();
  startListening();
}

/**
 * Releases the pin if `id` still holds it. A no-op otherwise, so a StrictMode
 * double-unmount or a late cleanup cannot dismiss another chart's tooltip.
 */
export function releasePin(id: string): void {
  if (active?.id !== id) return;
  active = null;
  stopListening();
}

/** Releases the pin *and* tells the owner to clear its tooltip. */
export function closeActivePin(): void {
  const previous = active;
  if (!previous) return;
  active = null;
  stopListening();
  previous.close();
}

export function getPinnedId(): string | null {
  return active?.id ?? null;
}

/** Test-only: drops the pin without notifying its owner. */
export function resetPinRegistry(): void {
  active = null;
  pinnedAt = 0;
  pinnedScrollY = 0;
  stopListening();
}
