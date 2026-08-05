// src/components/__tests__/LanguageSwitcher.test.tsx
// The switcher's enabled half: every registered locale offered, the active one
// marked, and a click that both switches and persists. The flag is mocked on
// rather than read, so this keeps testing the control itself even as the
// shipped default changes; the gated-off half is LanguageSwitcherGate.test.tsx.
//
// The default variant is a compact popover trigger (a 475px-wide row of all
// seven native names was crowding the header before it, see
// DashboardShell.tsx) — so these tests open it before asserting on the
// locale list, the same way a visitor would.
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
  it('offers every registered locale by its own name', async () => {
    renderWithProviders(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole('button'));
    for (const code of Object.keys(LOCALES) as (keyof typeof LOCALES)[]) {
      expect(await screen.findByText(LOCALES[code].nativeName)).toBeTruthy();
    }
  });

  it('marks the active locale as pressed', async () => {
    renderWithProviders(<LanguageSwitcher />, { locale: 'ja' });
    fireEvent.click(screen.getByRole('button'));
    expect((await screen.findByText(LOCALES.ja.nativeName)).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(LOCALES.en.nativeName).getAttribute('aria-pressed')).toBe('false');
  });

  it('switches the locale, persists the choice, and closes the popover', async () => {
    window.localStorage.clear();
    renderWithProviders(<LanguageSwitcher />, { locale: 'en' });
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(await screen.findByText(LOCALES.ja.nativeName));
    expect(window.localStorage.getItem('locale')).toBe('ja');
    expect(screen.queryByText(LOCALES.ja.nativeName)).toBeNull();
  });

  it('labels the row variant for the settings drawer', () => {
    renderWithProviders(<LanguageSwitcher variant="rows" />);
    expect(screen.getByRole('region', { name: en['nav.language'] })).toBeTruthy();
  });
});
