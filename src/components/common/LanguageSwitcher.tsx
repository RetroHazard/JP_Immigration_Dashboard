// src/components/common/LanguageSwitcher.tsx
// Rebuilt from the control that was pulled in v1.1.0, and still gated: it
// renders nothing while LOCALE_SWITCHER_ENABLED is false (see
// src/i18n/config.ts). The extraction work is done, but offering the switch
// before a locale is actually translated is what got the original pulled.
// `?lang=` remains the way to exercise a locale meanwhile.
//
// Two shapes, one state: a segmented control in the desktop header, and a
// stacked row list in the mobile settings drawer. Rows rather than a row of
// pills so a fourth and fifth language slot in without a layout change.
'use client';

import type React from 'react';

import { LOCALE_SWITCHER_ENABLED } from '../../i18n/config';
import { useLocale } from '../../i18n/LocaleContext';

interface LanguageSwitcherProps {
  variant?: 'segmented' | 'rows';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'segmented' }) => {
  const { locale, setLocale, availableLocales, t } = useLocale();

  if (!LOCALE_SWITCHER_ENABLED) return null;

  if (variant === 'rows') {
    return (
      <section aria-label={t('nav.language')}>
        <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">{t('nav.language')}</h3>
        <div className="mt-2 flex flex-col gap-1.5">
          {availableLocales.map((entry) => {
            const isActive = entry.code === locale;
            return (
              <button
                key={entry.code}
                lang={entry.code}
                onClick={() => setLocale(entry.code as typeof locale)}
                aria-pressed={isActive}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'border-primary/40 bg-primary/10 font-semibold text-primary'
                    : 'border-border text-secondary-foreground hover:bg-muted'
                }`}
              >
                {entry.nativeName}
                <span className="text-xxs uppercase tracking-wider text-muted-foreground">{entry.code}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div
      role="group"
      aria-label={t('nav.language')}
      className="hidden items-center gap-0.5 rounded-full border border-border p-0.5 sm:flex"
    >
      {availableLocales.map((entry) => {
        const isActive = entry.code === locale;
        return (
          <button
            key={entry.code}
            lang={entry.code}
            onClick={() => setLocale(entry.code as typeof locale)}
            aria-pressed={isActive}
            className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
              isActive
                ? 'bg-primary font-semibold text-primary-foreground'
                : 'text-secondary-foreground hover:bg-muted'
            }`}
          >
            {entry.nativeName}
          </button>
        );
      })}
    </div>
  );
};
