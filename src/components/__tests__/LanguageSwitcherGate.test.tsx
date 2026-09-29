// The gate half of the switcher's contract: with LOCALE_SWITCHER_ENABLED off,
// nothing renders at all. The enabled half is LanguageSwitcher.test.tsx.
// Both mock the flag rather than read the shipped value, so the gate stays
// tested whatever the default; it is what lets an in-progress locale be held
// back.
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
