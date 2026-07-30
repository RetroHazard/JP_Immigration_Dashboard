// src/components/__tests__/LanguageSwitcher.test.tsx
// The switcher is built but gated off, so the thing worth pinning is that the
// gate actually holds — and that the control works when it's opened, so
// flipping the flag isn't a leap of faith.
import { describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';

import type * as ConfigModule from '../../i18n/config';
import { LOCALES } from '../../i18n/locales';
import { en } from '../../i18n/locales/en';
import { renderWithProviders, screen } from '../../test-utils';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

vi.mock('../../i18n/config', async (importOriginal) => ({
  ...(await importOriginal<typeof ConfigModule>()),
  LOCALE_SWITCHER_ENABLED: true,
}));

describe('LanguageSwitcher, once enabled', () => {
  it('offers every registered locale by its own name', () => {
    renderWithProviders(<LanguageSwitcher />);
    for (const code of Object.keys(LOCALES) as (keyof typeof LOCALES)[]) {
      expect(screen.getByText(LOCALES[code].nativeName)).toBeTruthy();
    }
  });

  it('marks the active locale as pressed', () => {
    renderWithProviders(<LanguageSwitcher />, { locale: 'ja' });
    expect(screen.getByText(LOCALES.ja.nativeName).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(LOCALES.en.nativeName).getAttribute('aria-pressed')).toBe('false');
  });

  it('switches the locale and persists the choice', () => {
    window.localStorage.clear();
    renderWithProviders(<LanguageSwitcher />, { locale: 'en' });
    fireEvent.click(screen.getByText(LOCALES.ja.nativeName));
    expect(screen.getByText(LOCALES.ja.nativeName).getAttribute('aria-pressed')).toBe('true');
    expect(window.localStorage.getItem('locale')).toBe('ja');
  });

  it('labels the row variant for the settings drawer', () => {
    renderWithProviders(<LanguageSwitcher variant="rows" />);
    expect(screen.getByRole('region', { name: en['nav.language'] })).toBeTruthy();
  });
});
