// src/i18n/LocaleContext.tsx
// Lightweight locale scaffold (no routing framework - plays nicely with the
// static export). The language switcher is temporarily hidden from the UI
// (full-coverage localization is a future initiative), so locale detection
// no longer follows the browser language - that would silently drop
// Japanese-language visitors into a dashboard that's only translated in a
// handful of spots, with no switcher left to get back to English. The
// ?lang= param remains as an explicit, deliberate override for testing.
// <html lang> stays in sync.
'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { type DictionaryKey, en } from './en';
import { ja } from './ja';

export type Locale = 'en' | 'ja';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: DictionaryKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const detectLocale = (): Locale => {
  if (typeof window === 'undefined') return 'en';
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl === 'ja' || fromUrl === 'en') return fromUrl;
  return 'en';
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem('locale', next);
  }, []);

  const t = useCallback((key: DictionaryKey) => (locale === 'ja' ? (ja[key] ?? en[key]) : en[key]), [locale]);

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
};
