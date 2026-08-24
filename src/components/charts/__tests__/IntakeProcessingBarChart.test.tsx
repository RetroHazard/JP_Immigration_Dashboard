// The row builder carries all of this chart's arithmetic. It is tested on its
// own because visx sizes itself from a real layout, which jsdom cannot give it
// — a rendered chart proves nothing about the numbers (see the note at the top
// of CategoryMixTreemap.tap.test.tsx).
//
// Expected label text is read out of the English catalogue rather than
// repeated, so rewording a string doesn't break the test — only removing the
// key does.
import { describe, expect, it } from 'vitest';

import { STATUS_CODES } from '../../../constants/statusCodes';
import type { ImmigrationData } from '../../../hooks/useImmigrationData';
import { en } from '../../../i18n/locales/en';
import { renderWithProviders, screen } from '../../../test-utils';
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
