// src/i18n/__tests__/plurals.test.tsx
// The plural families that replaced hand-rolled `day${n === 1 ? '' : 's'}`
// suffixes, exercised through the provider so the Intl.PluralRules wiring is
// covered rather than just the pure function.
import { describe, expect, it } from 'vitest';

import { renderWithProviders, screen } from '../../test-utils';
import { useLocale } from '../LocaleContext';
import type { Locale } from '../locales';
import type { PluralKey } from '../types';

const Probe: React.FC<{ family: PluralKey; counts: number[] }> = ({ family, counts }) => {
  const { tPlural } = useLocale();
  return (
    <ul>
      {counts.map((count) => (
        <li key={count} data-testid={`n${count}`}>
          {tPlural(family, count)}
        </li>
      ))}
    </ul>
  );
};

const render = (family: PluralKey, counts: number[], locale: Locale = 'en') =>
  renderWithProviders(<Probe family={family} counts={counts} />, { locale });

describe('English plural selection', () => {
  it('uses the singular at one and the plural elsewhere for periods', () => {
    render('period.months', [1, 6, 12]);
    expect(screen.getByTestId('n1').textContent).toBe('1 month');
    expect(screen.getByTestId('n6').textContent).toBe('6 months');
    expect(screen.getByTestId('n12').textContent).toBe('12 months');
  });

  it('handles the estimator uncertainty families', () => {
    render('estimator.uncertaintyDays', [1, 4]);
    expect(screen.getByTestId('n1').textContent).toBe('± 1 day');
    expect(screen.getByTestId('n4').textContent).toBe('± 4 days');
  });

  it('handles a sentence-length plural body', () => {
    render('estimator.basedOnMonths', [1, 6]);
    expect(screen.getByTestId('n1').textContent).toBe('based on 1 month of throughput');
    expect(screen.getByTestId('n6').textContent).toBe('based on 6 months of throughput');
  });
});

describe('Japanese plural selection', () => {
  it('resolves every count through the single "other" category', () => {
    // Japanese has one CLDR category, so ja.ts defines only `_other` and both
    // counts must land on it — never on the bare family name, and never on the
    // English `_one` member that `Intl.PluralRules` can't select here.
    render('period.months', [1, 6], 'ja');
    expect(screen.getByTestId('n1').textContent).toBe('1か月');
    expect(screen.getByTestId('n6').textContent).toBe('6か月');
    expect(screen.queryByText('period.months')).toBeNull();
  });
});
