// Bar width and reveal-clip padding for ComposedChart's SeriesBar. Both are
// pure and both feed geometry that is otherwise only observable in a real
// browser layout, which is what makes them worth pinning here.
import { describe, expect, it } from 'vitest';

import { computeSeriesBarRevealClipPadding, computeSeriesBarWidth } from '../series-bar-layout';

describe('computeSeriesBarWidth', () => {
  const base = {
    innerWidth: 900,
    dataLength: 12,
    columnWidth: 60,
    composedMaxBarSize: 30,
    composedBarGap: 4,
  };

  it('gives a stacked column the whole slot, whatever the series count', () => {
    expect(computeSeriesBarWidth({ ...base, seriesCount: 5, stacked: true })).toBe(
      computeSeriesBarWidth({ ...base, seriesCount: 2, stacked: true })
    );
  });

  it('divides the slot between grouped bars', () => {
    expect(computeSeriesBarWidth({ ...base, seriesCount: 4, stacked: false })).toBeLessThan(
      computeSeriesBarWidth({ ...base, seriesCount: 1, stacked: false })
    );
  });

  it('honours maxBarSize', () => {
    expect(
      computeSeriesBarWidth({ ...base, composedMaxBarSize: 12, seriesCount: 1, stacked: true })
    ).toBe(12);
  });

  it('falls back to the plot width when the column has not been measured yet', () => {
    expect(
      computeSeriesBarWidth({ ...base, columnWidth: 0, seriesCount: 1, stacked: true })
    ).toBeGreaterThan(0);
  });

  it('never returns a bar too thin to see', () => {
    expect(
      computeSeriesBarWidth({
        innerWidth: 20,
        dataLength: 400,
        columnWidth: 0.2,
        seriesCount: 6,
        composedBarGap: 4,
        stacked: false,
      })
    ).toBeGreaterThanOrEqual(2);
  });
});

describe('computeSeriesBarRevealClipPadding', () => {
  it('pads to half the bar when stacked, whatever the series count', () => {
    expect(computeSeriesBarRevealClipPadding({ barWidth: 30, seriesCount: 5, stacked: true })).toBe(15);
    expect(computeSeriesBarRevealClipPadding({ barWidth: 30, seriesCount: 1, stacked: true })).toBe(15);
  });

  it('pads to the whole group when bars sit side by side', () => {
    expect(
      computeSeriesBarRevealClipPadding({ barWidth: 10, seriesCount: 3, gap: 4, stacked: false })
    ).toBe(19);
  });
});
