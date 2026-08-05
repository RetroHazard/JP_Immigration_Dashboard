// src/components/common/LanguageSwitcher.tsx
// Rebuilt from the control that was pulled in v1.1.0, and still gated: it
// renders nothing while LOCALE_SWITCHER_ENABLED is false (see
// src/i18n/config.ts). The extraction work is done, but offering the switch
// before a locale is actually translated is what got the original pulled.
// `?lang=` remains the way to exercise a locale meanwhile.
//
// Two shapes, one state: a stacked row list (used standalone in the mobile
// settings drawer, and reused inside the desktop popover below) and a
// compact icon trigger that opens that same list in a popover.
//
// The desktop header used to render every locale's native name side by side
// in one non-shrinking pill. That was fine at two or three locales; at seven
// it was a ~475px-wide row competing with the app title for header space,
// visibly crowding it from the 640px breakpoint up in every locale, English
// included. The rows variant already scaled to more languages without a
// layout change (that was the point of building it as rows, not pills) — the
// popover trigger below just gives the desktop header the same affordance at
// a fixed, icon-sized cost instead of growing with the locale count.
'use client';

import { useState } from 'react';

import { Languages } from 'lucide-react';
import type React from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { LOCALE_SWITCHER_ENABLED } from '../../i18n/config';
import { useLocale } from '../../i18n/LocaleContext';

interface LanguageSwitcherProps {
  variant?: 'rows' | 'popover';
  /** Called after a locale is picked — the popover variant uses this to close itself. */
  onSelect?: () => void;
}

const LanguageRows: React.FC<{ onSelect?: () => void }> = ({ onSelect }) => {
  const { locale, setLocale, availableLocales, t } = useLocale();
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
              onClick={() => {
                setLocale(entry.code as typeof locale);
                onSelect?.();
              }}
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
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'popover' }) => {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);

  if (!LOCALE_SWITCHER_ENABLED) return null;

  if (variant === 'rows') {
    return <LanguageRows />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={t('nav.language')}
          className="hidden size-9 items-center justify-center rounded-full border border-border text-secondary-foreground transition-colors hover:bg-muted sm:flex"
        >
          <Languages className="size-4" aria-hidden="true" />
          <span className="sr-only">{locale}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <LanguageRows onSelect={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};
