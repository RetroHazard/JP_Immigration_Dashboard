// src/i18n/__tests__/useDomainLabels.test.tsx
// The domain constants carry codes only, so a missing catalogue key would show
// up as the raw code ('101460' instead of 'Osaka') rather than as a crash.
// These assert the join actually resolves, in both locales.
import { describe, expect, it } from 'vitest';

import { bureauOptions } from '../../constants/bureauOptions';
import { japanPrefectures } from '../../constants/japanPrefectures';
import { renderWithProviders, screen } from '../../test-utils';
import type { Locale } from '../locales';
import {
  useApplicationOptions,
  useBureauLabel,
  useBureauOptions,
  useNonAirportBureaus,
  usePrefectures,
} from '../useDomainLabels';

const Probe: React.FC = () => {
  const bureaus = useBureauOptions();
  const bureauLabel = useBureauLabel();
  const nonAirport = useNonAirportBureaus();
  const types = useApplicationOptions();
  const prefectures = usePrefectures();

  // Any name that failed to resolve comes back as its own code.
  const unresolved = [
    ...bureaus.filter((bureau) => bureau.label === bureau.value || bureau.short === bureau.value).map((b) => b.value),
    ...types.filter((type) => type.label === type.value).map((t) => t.value),
    ...prefectures.filter((prefecture) => prefecture.name === String(prefecture.id)).map((p) => String(p.id)),
  ];

  return (
    <ul>
      <li data-testid="osaka">{bureauLabel('101460')}</li>
      <li data-testid="unknown">{bureauLabel('999999')}</li>
      <li data-testid="counts">{`${bureaus.length}/${nonAirport.length}/${types.length}/${prefectures.length}`}</li>
      <li data-testid="unresolved">{unresolved.join(',')}</li>
    </ul>
  );
};

const renderProbe = (locale: Locale) => renderWithProviders(<Probe />, { locale });

describe('domain label hooks', () => {
  it('resolves every bureau, type, and prefecture name in English', () => {
    renderProbe('en');
    expect(screen.getByTestId('unresolved').textContent).toBe('');
    expect(screen.getByTestId('osaka').textContent).toBe('Osaka');
  });

  it('keeps the code when a bureau is unknown', () => {
    renderProbe('en');
    expect(screen.getByTestId('unknown').textContent).toBe('999999');
  });

  it('preserves the option counts the constants define', () => {
    renderProbe('en');
    expect(screen.getByTestId('counts').textContent).toBe(`${bureauOptions.length}/11/7/${japanPrefectures.length}`);
  });

  it('falls back to English rather than a raw code for untranslated keys', () => {
    renderProbe('ja');
    // ja.ts covers only a handful of keys so far; the rest must fall through to
    // English, never to the bare identifier.
    expect(screen.getByTestId('unresolved').textContent).toBe('');
  });
});
