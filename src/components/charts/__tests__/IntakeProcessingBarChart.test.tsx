// Policy markers are positioned by `xScale(date)` with no clamping and sit
// outside the reveal clip, so an event outside the plotted window would draw
// over the axis gutter or past the right edge. The window filter is therefore
// the behaviour worth pinning down, along with markers staying free of links.
//
// The chart's SVG never renders here: ParentSize measures 0x0 under jsdom and
// the shell bails out below 10x10, so there are no marker circles to query.
// The event list is built from the same filtered array the markers are, which
// makes it the assertable projection of that array; the marker objects
// themselves are checked through the hook. The circles are a browser check.
import { describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';

import { POLICY_EVENTS, type PolicyEvent, RESIDENT_EVENTS } from '../../../constants/policyEvents';
import type { ImmigrationData } from '../../../hooks/useImmigrationData';
import { en } from '../../../i18n/locales/en';
import { renderWithProviders, screen } from '../../../test-utils';
import type { ChartRange } from '../../../utils/selectors';
import { usePolicyMarkers } from '../../common/PolicyEventList';
import { IntakeProcessingBarChart } from '../IntakeProcessingBarChart';

/** Every month from 2022-01 to 2026-12, so `range="all"` plots the lot. */
const MONTHS = Array.from({ length: 5 * 12 }, (_, index) => {
  const year = 2022 + Math.floor(index / 12);
  return `${year}-${String((index % 12) + 1).padStart(2, '0')}`;
});

/** Every June and December the residents table publishes, 2012-12 onward. */
const RESIDENT_PERIODS = Array.from({ length: 14 }, (_, index) => 2012 + index).flatMap((year) => [
  `${year}-06`,
  `${year}-12`,
]);

const rows = (months: string[]): ImmigrationData[] =>
  months.flatMap((month) => [
    { month, bureau: '100000', type: '20', status: '102000', value: 500 },
    { month, bureau: '100000', type: '20', status: '103000', value: 300 },
    { month, bureau: '100000', type: '20', status: '300000', value: 400 },
  ]);

const renderChart = (range: ChartRange, months: string[] = MONTHS) =>
  renderWithProviders(
    <IntakeProcessingBarChart data={rows(months)} filters={{ bureau: 'all', type: 'all' }} range={range} />
  );

const listLinks = () => Array.from(document.querySelectorAll<HTMLAnchorElement>('a[rel="noopener noreferrer"]'));
const expand = () => fireEvent.click(screen.getByRole('button', { name: en['policy.eventsShow'] }));

describe('policy event list', () => {
  it('stays collapsed until asked for', () => {
    renderChart('all');

    expect(screen.getByRole('button', { name: en['policy.eventsShow'] })).toBeTruthy();
    expect(listLinks()).toHaveLength(0);
  });

  it('lists one labelled source per event once expanded', () => {
    renderChart('all');
    expand();

    const links = listLinks();
    expect(links.length).toBe(POLICY_EVENTS.filter((event) => MONTHS.includes(event.period)).length);
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.textContent?.trim()).toBeTruthy();
    }
    expect(links.some((link) => link.textContent?.includes(en['policy.feeRevision2025.title']))).toBe(true);
  });

  it('drops events outside the plotted window', () => {
    // Trailing twelve months is 2026, so April 2025's fee rise is out and
    // June 2026's residence card is in.
    renderChart('12');
    expand();
    const text = listLinks().map((link) => link.textContent ?? '');

    expect(text.some((entry) => entry.includes(en['policy.feeRevision2025.title']))).toBe(false);
    expect(text.some((entry) => entry.includes(en['policy.residenceCard2026.title']))).toBe(true);
  });

  it('renders nothing when the plotted months hold no events', () => {
    renderChart('all', ['2021-01', '2021-02']);
    expect(screen.queryByRole('button', { name: en['policy.eventsShow'] })).toBeNull();
  });
});

/** Exercises the hook directly: the marker objects never reach the DOM here. */
const MarkerProbe: React.FC<{ events: readonly PolicyEvent[]; periods: string[] }> = ({ events, periods }) => {
  const { markers } = usePolicyMarkers(events, periods);
  return (
    <ul>
      {markers.map((marker) => (
        <li key={marker.title} data-testid={marker.title} data-href={marker.href ?? ''} />
      ))}
    </ul>
  );
};

describe('marker links', () => {
  // Markers are annotation, not navigation. Making only the unshared ones
  // clickable meant two identical circles behaved differently with nothing to
  // say which was which, so none of them link now — and because the tooltip
  // derives its clickable arrow from `onClick || href`, keeping href off is
  // also what stops that arrow coming back.
  it.each([
    ['processing', POLICY_EVENTS, MONTHS],
    ['residents', RESIDENT_EVENTS, RESIDENT_PERIODS],
  ])('leaves every %s marker unlinked', (_name, events, periods) => {
    renderWithProviders(<MarkerProbe events={events} periods={periods} />);

    const rendered = document.querySelectorAll('li[data-testid]');
    expect(rendered.length).toBeGreaterThan(0);
    for (const node of rendered) expect(node.getAttribute('data-href')).toBe('');
  });
});

describe('event data', () => {
  const all = [...POLICY_EVENTS, ...RESIDENT_EVENTS];

  it('dates every event to a month', () => {
    for (const event of all) expect(event.period).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
  });

  it('cites an official government page for every date', () => {
    for (const event of all) {
      expect(event.href).toMatch(/^https:\/\/www\.(moj|mofa|e-stat)\.go\.jp\//);
    }
  });

  it('keeps one catalogue entry per event', () => {
    const keys = all.flatMap((event) => [event.titleKey, event.descriptionKey]);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) expect(en[key]).toBeTruthy();
  });

  it('pins resident events to a published half-year', () => {
    // The residents table publishes each June and December only, and an event
    // on any other month would silently never render.
    for (const event of RESIDENT_EVENTS) expect(event.period).toMatch(/-(06|12)$/);
  });
});
