// src/i18n/LocaleContext.tsx
// Lightweight locale runtime — no routing framework, which is what the static
// export (`output: 'export'`) allows: there is no server to negotiate a locale
// and no middleware to redirect, so detection and switching are client-side.
//
// Detection order is `?lang=` → localStorage → browser language → English,
// with the browser step gated behind LOCALE_SWITCHER_ENABLED (see config.ts).
// `<html lang>` is kept in sync so assistive technology follows the switch.
'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { setChartFormatterLocale } from '../components/bklit/charts/chart-formatters';
import { DEFAULT_LOCALE, LOCALE_QUERY_PARAM, LOCALE_STORAGE_KEY, LOCALE_SWITCHER_ENABLED } from './config';
import type { Formatters } from './formatters';
import { createFormatters } from './formatters';
import type { Locale, LocaleMeta } from './locales';
import { isLocale, LOCALE_CODES, LOCALES } from './locales';
import { translate, translatePlural } from './translate';
import type { DictionaryKey, PluralKey, TParams } from './types';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Look up a string, substituting any `{placeholder}` params. */
  t: (key: DictionaryKey, params?: TParams) => string;
  /** Look up a plural family by its base key; `count` is injected as a param. */
  tPlural: (key: PluralKey, count: number, params?: TParams) => string;
  formatters: Formatters;
  availableLocales: readonly LocaleMeta[];
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const readStoredLocale = (): Locale | null => {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    // Storage can throw in private browsing modes; detection falls through.
    return null;
  }
};

/** Registry codes by lowercased tag, so `zh-cn` and `zh-CN` both resolve. */
const CANONICAL_BY_TAG = new Map<string, Locale>(LOCALE_CODES.map((code) => [code.toLowerCase(), code]));

// Each browser tag tries its exact form before its base language, in the
// user's preference order. Truncating every tag to the base first meant a
// region-keyed catalogue could never be detected: `zh-CN` became `zh`, which
// is no registry code, so a Chinese browser got English despite a complete
// zh-CN catalogue — and the CN/TW distinction went with it.
const readBrowserLocale = (): Locale | null => {
  for (const tag of navigator.languages ?? []) {
    const lower = tag.toLowerCase();
    const match = CANONICAL_BY_TAG.get(lower) ?? CANONICAL_BY_TAG.get(lower.split('-')[0]);
    if (match) return match;
  }
  return null;
};

const detectLocale = (): Locale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const fromUrl = new URLSearchParams(window.location.search).get(LOCALE_QUERY_PARAM);
  if (isLocale(fromUrl)) return fromUrl;
  return readStoredLocale() ?? (LOCALE_SWITCHER_ENABLED ? readBrowserLocale() : null) ?? DEFAULT_LOCALE;
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  // Detection runs post-mount: the export is prerendered as English and the
  // app itself is `ssr: false`, so there is no hydration mismatch to manage.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // A locale that can't be persisted still applies for this session.
    }
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const { dictionary, intlTag } = LOCALES[locale];
    const pluralRules = new Intl.PluralRules(intlTag);
    // The vendored chart library reads its Intl formatters from module state
    // rather than through props, so point them at this locale before any
    // chart renders — otherwise the first paint after a switch keeps the old
    // axis ticks and tooltip dates.
    setChartFormatterLocale(intlTag);
    return {
      locale,
      setLocale,
      t: (key, params) => translate(dictionary, key, params),
      tPlural: (key, count, params) => translatePlural(dictionary, pluralRules, key as string, count, params),
      formatters: createFormatters(intlTag),
      availableLocales: LOCALE_CODES.map((code) => LOCALES[code]),
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
};
