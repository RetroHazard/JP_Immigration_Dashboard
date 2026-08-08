// src/i18n/__tests__/useResidentLabels.test.tsx
// Nationality and continent names are resolved from ICU before the catalogue,
// so what needs asserting here is different from the other domain hooks: that
// the ISO/M49 codes actually resolve, that the rows with no such identity fall
// through to their catalogue entry, and that neither path ever leaks a bare
// code into the UI. The continents need covering on both paths — ICU names
// them under vitest but not in every browser, so only the fallback is load-
// bearing in Chrome.
import { afterEach, describe, expect, it, vi } from 'vitest';

import { nationalities } from '../../constants/nationalities';
import { residenceStatuses } from '../../constants/residenceStatuses';
import { renderWithProviders, screen } from '../../test-utils';
import type { Locale } from '../locales';
import {
  useNationalityLabel,
  useNationalityOptions,
  useRegionOptions,
  useResidenceStatusOptions,
  useStatusGroupOptions,
} from '../useDomainLabels';

const Probe: React.FC = () => {
  const label = useNationalityLabel();
  const options = useNationalityOptions();
  const regions = useRegionOptions();
  const statuses = useResidenceStatusOptions();
  const groups = useStatusGroupOptions();

  // Anything that failed to resolve comes back as its own code.
  const unresolved = [
    ...options.filter((option) => option.name === option.value).map((option) => option.value),
    ...regions.filter((region) => region.label === region.value).map((region) => region.value),
    ...statuses.filter((status) => status.label === status.value).map((status) => status.value),
    ...groups.filter((group) => group.label === group.value).map((group) => group.value),
  ];

  return (
    <ul>
      <li data-testid="china">{label('1230')}</li>
      <li data-testid="kosovo">{label('2200')}</li>
      <li data-testid="chosen">{label('1120')}</li>
      <li data-testid="stateless">{label('7000')}</li>
      <li data-testid="unknown">{label('9999')}</li>
      <li data-testid="asia">{regions[0].label}</li>
      <li data-testid="northAmerica">{regions[3].label}</li>
      <li data-testid="counts">{`${options.length}/${regions.length}/${statuses.length}/${groups.length}`}</li>
      <li data-testid="unresolved">{unresolved.join(',')}</li>
      <li data-testid="sorted">{String(options.map((o) => o.name).every((name, i, all) => i === 0 || all[i - 1].localeCompare(name) <= 0))}</li>
    </ul>
  );
};

const renderProbe = (locale: Locale) => renderWithProviders(<Probe />, { locale });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('resident label hooks', () => {
  it('resolves every nationality, region, status and group in English', () => {
    renderProbe('en');
    expect(screen.getByTestId('unresolved').textContent).toBe('');
    expect(screen.getByTestId('china').textContent).toBe('China');
  });

  it('names the continents from their M49 codes', () => {
    renderProbe('en');
    expect(screen.getByTestId('asia').textContent).toBe('Asia');
    // e-Stat's 北アメリカ spans Central America and the Caribbean, so it is
    // M49 003 — "North America", not 021's "Northern America".
    expect(screen.getByTestId('northAmerica').textContent).toBe('North America');
  });

  it('resolves Kosovo, which has no ISO-assigned code, through XK', () => {
    renderProbe('en');
    expect(screen.getByTestId('kosovo').textContent).toBe('Kosovo');
  });

  it('falls back to the catalogue for rows with no ISO identity', () => {
    renderProbe('en');
    // 朝鮮 is a registration category, not the DPRK, so it deliberately has no
    // ISO code and must not be resolved to one.
    expect(screen.getByTestId('chosen').textContent).toBe('Korea (Chosen)');
    expect(screen.getByTestId('stateless').textContent).toBe('Stateless');
  });

  it('shows the code rather than nothing for an unknown nationality', () => {
    renderProbe('en');
    expect(screen.getByTestId('unknown').textContent).toBe('nationality.9999');
  });

  it('offers every nationality except the nested 「うち」 rows', () => {
    renderProbe('en');
    const selectable = nationalities.filter((nationality) => !nationality.isSubset).length;
    expect(screen.getByTestId('counts').textContent).toBe(`${selectable}/7/${residenceStatuses.length}/6`);
  });

  it('sorts the nationality list by localized name', () => {
    renderProbe('en');
    expect(screen.getByTestId('sorted').textContent).toBe('true');
  });

  it('translates names into the active locale', () => {
    renderProbe('ja');
    expect(screen.getByTestId('china').textContent).toBe('中国');
    expect(screen.getByTestId('asia').textContent).toBe('アジア');
    expect(screen.getByTestId('stateless').textContent).toBe('無国籍');
  });

  it('names the continents on an engine with no M49 display names', () => {
    // The regression behind the `region.1000` labels: Chrome and Edge ship
    // Intl.DisplayNames but no macro-region data, so `.of('142')` returns
    // '142' rather than throwing. Node and Firefox resolve it, which is why
    // the assertions above pass under vitest while the browser showed keys.
    vi.spyOn(Intl, 'DisplayNames').mockImplementation(
      () => ({ of: (code: string) => code }) as unknown as Intl.DisplayNames
    );
    renderProbe('en');
    expect(screen.getByTestId('asia').textContent).toBe('Asia');
    expect(screen.getByTestId('northAmerica').textContent).toBe('North America');
    expect(screen.getByTestId('stateless').textContent).toBe('Stateless');
  });

  it('degrades to the catalogue when Intl.DisplayNames is unavailable', () => {
    // An engine without region display names must not take the page down —
    // the five hand-written names still resolve and the rest show their code.
    vi.spyOn(Intl, 'DisplayNames').mockImplementation(() => {
      throw new Error('unsupported');
    });
    renderProbe('en');
    expect(screen.getByTestId('stateless').textContent).toBe('Stateless');
    expect(screen.getByTestId('china').textContent).toBe('nationality.1230');
  });
});
