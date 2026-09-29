// Render helper for component tests: `useLocale()` throws outside a provider,
// so tests use this rather than RTL's bare `render`. `locale` defaults to
// English, which the smoke tests' assertions read from.
import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';

import { TooltipProvider } from '@/components/ui/tooltip';

import { setMediaQuery } from '../vitest.setup';
import { COARSE_POINTER_QUERY, resetCoarsePointerCache } from './hooks/useCoarsePointer';
import { LOCALE_QUERY_PARAM } from './i18n/config';
import { LocaleProvider } from './i18n/LocaleContext';
import type { Locale } from './i18n/locales';

/**
 * Puts the test in touch mode, where chart tooltips are tap-to-pin rather than
 * hover. Call before rendering — `useCoarsePointer` memoizes its MediaQueryList
 * on first read, so the cache reset has to happen while nothing is subscribed.
 */
export const setCoarsePointer = (on: boolean): void => {
  resetCoarsePointerCache();
  setMediaQuery(COARSE_POINTER_QUERY, on);
};

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: Locale;
}

/**
 * The provider reads `?lang=` from `window.location` on mount, so tests pin a
 * locale there rather than through a test-only setter.
 */
const pinLocale = (locale: Locale) => {
  const url = new URL(window.location.href);
  url.searchParams.set(LOCALE_QUERY_PARAM, locale);
  window.history.replaceState(null, '', url);
};

export const renderWithProviders = (ui: ReactElement, { locale = 'en', ...options }: ProviderOptions = {}): RenderResult => {
  pinLocale(locale);
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <LocaleProvider>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </LocaleProvider>
  );
  return render(ui, { wrapper: Wrapper, ...options });
};

export * from '@testing-library/react';
