// src/test-utils.tsx
// Render helper for component tests. Anything that calls `useLocale()` throws
// outside a provider, so tests go through this rather than RTL's bare
// `render`. `locale` lets a test assert on a specific catalogue; it defaults
// to English, which is what the assertions in the smoke tests read from.
import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';

import { TooltipProvider } from '@/components/ui/tooltip';

import { LOCALE_QUERY_PARAM } from './i18n/config';
import { LocaleProvider } from './i18n/LocaleContext';
import type { Locale } from './i18n/locales';

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: Locale;
}

/**
 * The provider reads `?lang=` from `window.location` on mount, which is also
 * the cleanest way for a test to pin a locale without exporting test-only
 * setters from the provider itself.
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
