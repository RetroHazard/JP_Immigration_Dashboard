// src/components/__tests__/LanguageSwitcherGate.test.tsx
// The gate half of the switcher's contract: with LOCALE_SWITCHER_ENABLED off,
// nothing renders at all. Its counterpart — that the control works with the
// flag on — is LanguageSwitcher.test.tsx.
//
// Both files mock the flag rather than reading the shipped value, so neither
// silently stops testing anything the day the default changes. It shipped
// `false` while Japanese was a stub and `true` once Japanese was complete; the
// gate itself has to keep working either way, because that is what lets a
// future in-progress locale be held back.
import { describe, expect, it, vi } from 'vitest';

import type * as ConfigModule from '../../i18n/config';
import { renderWithProviders } from '../../test-utils';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

vi.mock('../../i18n/config', async (importOriginal) => ({
  ...(await importOriginal<typeof ConfigModule>()),
  LOCALE_SWITCHER_ENABLED: false,
}));

describe('LanguageSwitcher, while gated off', () => {
  it('renders nothing at all', () => {
    const { container } = renderWithProviders(<LanguageSwitcher />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing in the drawer variant either', () => {
    const { container } = renderWithProviders(<LanguageSwitcher variant="rows" />);
    expect(container.innerHTML).toBe('');
  });
});
