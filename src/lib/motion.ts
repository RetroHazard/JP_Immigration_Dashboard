// src/lib/motion.ts
// The single Anime.js v4 integration point. Every animation in the app goes
// through here so prefers-reduced-motion is honored in exactly one place.
'use client';

import { useEffect, useRef } from 'react';

import { animate, createScope } from 'animejs';

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Runs `builder` inside an Anime.js scope rooted at the returned ref.
 * Selectors used in the builder only match inside that root. The whole scope
 * is skipped under prefers-reduced-motion and reverted on cleanup.
 */
export function useAnimeScope<T extends HTMLElement = HTMLDivElement>(builder: () => void, deps: unknown[] = []) {
  const root = useRef<T>(null);
  useEffect(() => {
    if (!root.current || prefersReducedMotion()) return;
    const scope = createScope({ root: root.current }).add(() => builder());
    return () => {
      scope.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return root;
}

/**
 * Animated number: counts from the previously shown value to `target`,
 * writing through `format`. Falls back to a static value under
 * prefers-reduced-motion.
 */
export function useCountUp(target: number, format: (value: number) => string) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      shown.current = target;
      el.textContent = format(target);
      return;
    }
    const state = { value: shown.current };
    const animation = animate(state, {
      value: target,
      duration: 800,
      ease: 'out(3)',
      onUpdate: () => {
        shown.current = state.value;
        el.textContent = format(state.value);
      },
    });
    return () => {
      animation.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return ref;
}
