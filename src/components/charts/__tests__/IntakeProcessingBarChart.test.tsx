// The row builder carries all of this chart's arithmetic. It is tested on its
// own because visx sizes itself from a real layout, which jsdom cannot give it
// — a rendered chart proves nothing about the numbers (see the note at the top
// of CategoryMixTreemap.tap.test.tsx).
//
// Expected label text is read out of the English catalogue rather than
// repeated, so rewording a string doesn't break the test — only removing the
// key does.
//
// Policy markers are positioned by `xScale(date)` with no clamping and sit
// outside the reveal clip, so an event outside the plotted window would draw
// over the axis gutter or past the right edge. The window filter is therefore
// the behaviour worth pinning down, along with the rule that decides which
// markers may carry a link.
//
// The chart's SVG never renders here: ParentSize measures 0x0 under jsdom and
// the shell bails out below 10x10, so there are no marker circles to query.
// The event list is built from the same filtered array the markers are, which
// makes it the assertable projection of that array; the marker objects
// themselves are checked through the hook. The circles are a browser check.
import { describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';

import { POLICY_EVENTS, RESIDENT_EVENTS } from '../../../constants/policyEvents';
import { STATUS_CODES } from '../../../constants/statusCodes';
import type { ImmigrationData } from '../../../hooks/useImmigrationData';
import { en } from '../../../i18n/locales/en';
import { renderWithProviders, screen } from '../../../test-utils';
import type { ChartRange } from '../../../utils/selectors';
import { usePolicyMarkers } from '../../common/PolicyEventList';
import { buildIntakeRows, IntakeProcessingBarChart } from '../IntakeProcessingBarChart';

const NATIONWIDE = STATUS_CODES.NATIONWIDE_BUREAU;

interface MonthValues {
  pending: number;
  received: number;
  processed: number;
  granted: number;
  denied: number;
  other: number;
}

/** One month of the nationwide aggregate, as its six published status rows. */
const month = (m: string, values: MonthValues): ImmigrationData[] =>
  (
    [
      [STATUS_CODES.OLD_APPLICATIONS, values.pending],
      [STATUS_CODES.NEW_APPLICATIONS, values.received],
      [STATUS_CODES.PROCESSED, values.processed],
      [STATUS_CODES.GRANTED, values.granted],
      [STATUS_CODES.DENIED, values.denied],
      [STATUS_CODES.OTHER, values.other],
    ] as const
  ).map(([status, value]) => ({ month: m, bureau: NATIONWIDE, type: '20', status, value }));

const FILTERS = { bureau: 'all', type: '20' };

const rowsFor = (data: ImmigrationData[]) => buildIntakeRows(data, FILTERS, 'all');

const TWO_MONTHS = [
  ...month('2025-05', { pending: 400, received: 600, processed: 500, granted: 450, denied: 20, other: 30 }),
  ...month('2025-06', { pending: 500, received: 700, processed: 600, granted: 540, denied: 24, other: 36 }),
];

describe('buildIntakeRows', () => {
  it('emits one row per month in range, newest last', () => {
    const rows = rowsFor(TWO_MONTHS);
    expect(rows).toHaveLength(2);
    expect((rows[0]?.date as Date).getMonth()).toBe(4);
    expect((rows[1]?.date as Date).getMonth()).toBe(5);
  });

  // A key missing from a row makes SeriesBar skip that column outright, which
  // shows up as a hole in the stack rather than an error.
  it('gives every row all three plotted counts plus the rate', () => {
    for (const row of rowsFor(TWO_MONTHS)) {
      for (const key of ['pending', 'received', 'processed', 'approvalRate']) {
        expect(typeof row[key]).toBe('number');
      }
    }
  });

  it('sums each series from its own status row', () => {
    const [row] = rowsFor(TWO_MONTHS);
    expect(row).toMatchObject({ pending: 400, received: 600, processed: 500 });
  });

  // Granted feeds the rate but is not plotted, so it has no business being a
  // row property — a stray key would show up as a tooltip row.
  it('carries no key for a series the chart does not draw', () => {
    const [row] = rowsFor(TWO_MONTHS);
    for (const key of ['granted', 'denied', 'other']) {
      expect(row?.[key]).toBeUndefined();
    }
  });

  it('divides granted by the published processed total', () => {
    // 450 / 500, not 450 / (450 + 20 + 30) — the denominator is the 300000
    // row, matching the Outcomes gauge and the stats cards.
    expect(rowsFor(TWO_MONTHS)[0]?.approvalRate).toBe(90);
  });

  it('reads the published total even when the outcome rows do not add up to it', () => {
    const rows = rowsFor(month('2025-05', { pending: 0, received: 0, processed: 200, granted: 100, denied: 10, other: 10 }));
    expect(rows[0]?.approvalRate).toBe(50);
  });

  // NaN and Infinity are both `typeof "number"`, so Line would place either at
  // pixel 0 — a spike to the top of the plot rather than a gap.
  it('reports a finite zero rate for a month with nothing processed', () => {
    const rows = rowsFor(month('2025-05', { pending: 100, received: 50, processed: 0, granted: 0, denied: 0, other: 0 }));
    expect(rows[0]?.approvalRate).toBe(0);
    expect(Number.isFinite(rows[0]?.approvalRate as number)).toBe(true);
  });

  it('stays finite when bad data grants more than it processed', () => {
    const rows = rowsFor(month('2025-05', { pending: 0, received: 0, processed: 10, granted: 90, denied: 0, other: 0 }));
    expect(Number.isFinite(rows[0]?.approvalRate as number)).toBe(true);
  });

  it('returns nothing for an empty dataset', () => {
    expect(rowsFor([])).toEqual([]);
  });

  it('honours the bureau and type filters', () => {
    const data = [
      ...month('2025-05', { pending: 400, received: 600, processed: 500, granted: 450, denied: 20, other: 30 }),
      // A different application type the filter should exclude.
      { month: '2025-05', bureau: NATIONWIDE, status: STATUS_CODES.PROCESSED, type: '30', value: 9999 },
    ];
    expect(buildIntakeRows(data, FILTERS, 'all')[0]?.processed).toBe(500);
  });
});

describe('IntakeProcessingBarChart', () => {
  it('labels every series in the legend, including the rate', () => {
    renderWithProviders(<IntakeProcessingBarChart data={TWO_MONTHS} filters={FILTERS} range="all" />);
    const keys = ['metric.pending', 'metric.received', 'metric.processed', 'metric.approvalRate'] as const;
    for (const key of keys) {
      expect(screen.getByText(en[key])).toBeTruthy();
    }
  });

  it('describes the graphic to a screen reader', () => {
    renderWithProviders(<IntakeProcessingBarChart data={TWO_MONTHS} filters={FILTERS} range="all" />);
    expect(screen.getByRole('img', { name: en['charts.intake.aria'] })).toBeTruthy();
  });
});


/** Every month from 2022-01 to 2026-12, so `range="all"` plots the lot. */
const MONTHS = Array.from({ length: 5 * 12 }, (_, index) => {
  const year = 2022 + Math.floor(index / 12);
  return `${year}-${String((index % 12) + 1).padStart(2, '0')}`;
});

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
const MarkerProbe: React.FC<{ periods: string[] }> = ({ periods }) => {
  const { markers } = usePolicyMarkers(POLICY_EVENTS, periods);
  return (
    <ul>
      {markers.map((marker) => (
        <li key={marker.title} data-testid={marker.title} data-href={marker.href ?? ''} />
      ))}
    </ul>
  );
};

describe('marker links', () => {
  it('links a marker that is alone on its month', () => {
    renderWithProviders(<MarkerProbe periods={MONTHS} />);
    // April 2025 carries only the fee revision.
    expect(screen.getByTestId(en['policy.feeRevision2025.title']).getAttribute('data-href')).toMatch(/^https:\/\//);
  });

  it('leaves a shared month unlinked, so the tooltip shows no arrow it cannot follow', () => {
    renderWithProviders(<MarkerProbe periods={MONTHS} />);
    // October 2022 carries both the reopening and the certificate extension.
    expect(screen.getByTestId(en['policy.covidVisaFree.title']).getAttribute('data-href')).toBe('');
    expect(screen.getByTestId(en['policy.covidCoe.title']).getAttribute('data-href')).toBe('');
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
