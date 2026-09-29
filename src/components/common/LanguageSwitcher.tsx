// Renders nothing while LOCALE_SWITCHER_ENABLED (src/i18n/config.ts) is false;
// `?lang=` selects a locale regardless.
//
// Two shapes, one state: a stacked row list (the selection UI, reused by both
// popover triggers) and a popover that opens it from a compact trigger, either
// an icon button (desktop header) or a full-width row showing the current
// language (mobile settings drawer). Both triggers take the same space however
// many locales are registered; only the list grows.
'use client';

import { useState } from 'react';

import { ChevronDown, Languages } from 'lucide-react';
import type React from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { LOCALE_SWITCHER_ENABLED } from '../../i18n/config';
import { useLocale } from '../../i18n/LocaleContext';

interface LanguageSwitcherProps {
  variant?: 'rows' | 'popover';
  /** Only meaningful for variant="popover". 'icon' is the desktop header's compact
   *  circular button; 'row' is a full-width trigger matching the other settings-drawer
   *  rows (Theme, About), showing the current language and opening the same list. */
  trigger?: 'icon' | 'row';
}

const LanguageRows: React.FC<{ onSelect?: () => void; showHeading?: boolean }> = ({
  onSelect,
  showHeading = true,
}) => {
  const { locale, setLocale, availableLocales, t } = useLocale();
  const list = (
    <div className="flex flex-col gap-1.5">
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
  );

  if (!showHeading) return list;

  return (
    <section aria-label={t('nav.language')}>
      <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">{t('nav.language')}</h3>
      <div className="mt-2">{list}</div>
    </section>
  );
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'popover', trigger = 'icon' }) => {
  const { locale, availableLocales, t } = useLocale();
  const [open, setOpen] = useState(false);

  if (!LOCALE_SWITCHER_ENABLED) return null;

  if (variant === 'rows') {
    return <LanguageRows />;
  }

  if (trigger === 'row') {
    const currentName = availableLocales.find((entry) => entry.code === locale)?.nativeName ?? locale;
    return (
      <section aria-label={t('nav.language')}>
        <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('nav.language')}
        </h3>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="mt-2 flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-sm text-secondary-foreground transition-colors hover:bg-muted">
              <span className="flex items-center gap-2">
                <Languages className="size-4" aria-hidden="true" />
                {currentName}
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-3">
            <LanguageRows onSelect={() => setOpen(false)} showHeading={false} />
          </PopoverContent>
        </Popover>
      </section>
    );
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
