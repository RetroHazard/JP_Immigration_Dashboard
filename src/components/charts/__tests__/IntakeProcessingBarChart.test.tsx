// Policy markers are positioned by `xScale(date)` with no clamping and sit
// outside the reveal clip, so an event outside the plotted window would draw
// over the axis gutter or past the right edge rather than being hidden. The
// window filter is therefore the behaviour worth pinning down.
//
// The chart's SVG never renders here: ParentSize measures 0x0 under jsdom and
// the shell bails out below 10x10, so there are no marker circles to query.
// The screen-reader list is built from the same filtered array the markers
// are, which makes it the assertable projection of that array — the circles
// themselves are a browser check, not a unit-test one.
import { describe, expect, it } from 'vitest';

import { POLICY_EVENTS } from '../../../constants/policyEvents';
import type { ImmigrationData } from '../../../hooks/useImmigrationData';
import { en } from '../../../i18n/locales/en';
import { renderWithProviders } from '../../../test-utils';
import type { ChartRange } from '../../../utils/selectors';
import { IntakeProcessingBarChart } from '../IntakeProcessingBarChart';

/** Twelve nationwide months across 2025, so a trailing window can cut the year. */
const MONTHS = Array.from({ length: 12 }, (_, index) => `2025-${String(index + 1).padStart(2, '0')}`);

const data: ImmigrationData[] = MONTHS.flatMap((month) => [
  { month, bureau: '100000', type: '20', status: '102000', value: 500 },
  { month, bureau: '100000', type: '20', status: '103000', value: 300 },
  { month, bureau: '100000', type: '20', status: '300000', value: 400 },
]);

const renderChart = (range: ChartRange) =>
  renderWithProviders(<IntakeProcessingBarChart data={data} filters={{ bureau: 'all', type: 'all' }} range={range} />);

/** The sr-only list; one link per event that survived the window filter. */
const eventLinks = () => Array.from(document.querySelectorAll<HTMLAnchorElement>('nav a'));

const FEE_EVENT = en['policy.feeRevision2025.title']; // 2025-04
const MANAGER_EVENT = en['policy.businessManager2025.title']; // 2025-10

describe('IntakeProcessingBarChart policy markers', () => {
  it('lists the events whose month is plotted', () => {
    renderChart('all');
    const text = eventLinks().map((link) => link.textContent ?? '');

    expect(text.some((entry) => entry.includes(FEE_EVENT))).toBe(true);
    expect(text.some((entry) => entry.includes(MANAGER_EVENT))).toBe(true);
  });

  it('drops events that fall outside a trailing window', () => {
    // Trailing six months of 2025 is Jul–Dec: April's fee rise is out, the
    // October Business Manager change is still in.
    renderChart('6');
    const text = eventLinks().map((entry) => entry.textContent ?? '');

    expect(text.some((entry) => entry.includes(FEE_EVENT))).toBe(false);
    expect(text.some((entry) => entry.includes(MANAGER_EVENT))).toBe(true);
  });

  it('renders no event list when the plotted months hold no events', () => {
    const early: ImmigrationData[] = ['2021-01', '2021-02'].flatMap((month) => [
      { month, bureau: '100000', type: '20', status: '103000', value: 300 },
    ]);
    renderWithProviders(<IntakeProcessingBarChart data={early} filters={{ bureau: 'all', type: 'all' }} range="all" />);
    expect(eventLinks()).toHaveLength(0);
  });

  it('opens each source in a new tab without leaking the opener', () => {
    renderChart('all');
    const links = eventLinks();

    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.getAttribute('href')).toMatch(/^https:\/\//);
    }
  });
});

describe('POLICY_EVENTS', () => {
  it('dates every event to a month', () => {
    for (const event of POLICY_EVENTS) expect(event.period).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
  });

  it('cites an Immigration Services Agency page for every date', () => {
    for (const event of POLICY_EVENTS) expect(event.href).toMatch(/^https:\/\/www\.moj\.go\.jp\/isa\//);
  });

  it('keeps one catalogue entry per event', () => {
    const keys = POLICY_EVENTS.flatMap((event) => [event.titleKey, event.descriptionKey]);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) expect(en[key]).toBeTruthy();
  });
});
