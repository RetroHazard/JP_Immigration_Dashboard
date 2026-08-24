// Stack-group geometry for ComposedChart. These are the local modifications
// that let one x carry more than one stack, so the cases below are mostly
// "does a second stack leave the first one alone".
import { describe, expect, it } from 'vitest';

import {
  applyBarWidthRatio,
  computeComposedStackOffsets,
  computeSeriesBarRevealClipPadding,
  computeSeriesBarWidth,
  DEFAULT_STACK_ID,
  findStackPosition,
  groupBarKeysByStackId,
  MIN_RATIO_BAR_WIDTH,
  normalizeStackId,
} from '../series-bar-layout';

describe('normalizeStackId', () => {
  it('folds an absent or empty id onto the default stack', () => {
    expect(normalizeStackId(undefined)).toBe(DEFAULT_STACK_ID);
    expect(normalizeStackId('')).toBe(DEFAULT_STACK_ID);
    expect(normalizeStackId('outcome')).toBe('outcome');
  });
});

describe('groupBarKeysByStackId', () => {
  it('keeps child order inside a stack and first-appearance order across stacks', () => {
    const stacks = groupBarKeysByStackId(
      ['pending', 'received', 'granted', 'denied'],
      ['intake', 'intake', 'outcome', 'outcome']
    );
    expect(stacks.map((stack) => stack.keys)).toEqual([
      ['pending', 'received'],
      ['granted', 'denied'],
    ]);
  });

  it('collapses to one stack when no bar declares an id — upstream behaviour', () => {
    const stacks = groupBarKeysByStackId(['a', 'b', 'c'], []);
    expect(stacks).toEqual([{ keys: ['a', 'b', 'c'], widthRatio: 1, stackGap: undefined }]);
  });

  // Width and gap belong to the stack: segments rendering at different widths
  // would read as a staircase, and a gap applied to only some of them would
  // shift the rest off the baseline.
  it('takes width and gap from the bar that opens each stack, ignoring later ones', () => {
    const stacks = groupBarKeysByStackId(
      ['pending', 'granted', 'denied'],
      ['intake', 'outcome', 'outcome'],
      [undefined, 0.5, 0.9],
      [undefined, 0, 7]
    );
    expect(stacks[1]).toEqual({ keys: ['granted', 'denied'], widthRatio: 0.5, stackGap: 0 });
  });
});

describe('computeComposedStackOffsets', () => {
  const stacks = groupBarKeysByStackId(
    ['pending', 'received', 'granted', 'denied', 'other'],
    ['intake', 'intake', 'outcome', 'outcome', 'outcome']
  );

  it('restarts each stack at the baseline instead of continuing the previous one', () => {
    const [row] = [
      ...computeComposedStackOffsets(
        [{ pending: 100, received: 40, granted: 90, denied: 5, other: 5 }],
        stacks
      ).values(),
    ];
    expect(row?.get('pending')).toBe(0);
    expect(row?.get('received')).toBe(100);
    // The outcome stack sits on the baseline, not on top of the intake stack.
    expect(row?.get('granted')).toBe(0);
    expect(row?.get('denied')).toBe(90);
    expect(row?.get('other')).toBe(95);
  });

  it('treats a missing or non-numeric value as contributing nothing', () => {
    const [row] = [
      ...computeComposedStackOffsets([{ granted: 10, denied: null }], stacks).values(),
    ];
    expect(row?.get('denied')).toBe(10);
    expect(row?.get('other')).toBe(10);
  });
});

describe('findStackPosition', () => {
  const stacks = groupBarKeysByStackId(
    ['pending', 'received', 'granted', 'denied', 'other'],
    ['intake', 'intake', 'outcome', 'outcome', 'outcome'],
    [undefined, undefined, 0.5]
  );

  it('reports the position within the bar own stack, not across every bar', () => {
    // `granted` is the third bar in the chart but the first in its stack —
    // the difference is what keeps the outcome stack on the baseline.
    expect(findStackPosition(stacks, 'granted')).toMatchObject({ index: 0 });
    expect(findStackPosition(stacks, 'other')).toMatchObject({ index: 2 });
    expect(findStackPosition(stacks, 'received')).toMatchObject({ index: 1 });
  });

  it('carries the stack width so every segment renders the same', () => {
    expect(findStackPosition(stacks, 'other')?.stack.widthRatio).toBe(0.5);
    expect(findStackPosition(stacks, 'pending')?.stack.widthRatio).toBe(1);
  });

  it('returns null without stacks, or for a key no stack owns', () => {
    expect(findStackPosition(undefined, 'granted')).toBeNull();
    expect(findStackPosition(stacks, 'nope')).toBeNull();
  });
});

describe('applyBarWidthRatio', () => {
  it('leaves a full-width bar untouched', () => {
    expect(applyBarWidthRatio(30)).toBe(30);
    expect(applyBarWidthRatio(30, 1)).toBe(30);
  });

  it('insets the bar so it stays concentric with the one it sits in', () => {
    expect(applyBarWidthRatio(30, 0.5)).toBe(15);
  });

  it('floors a narrow inner bar rather than collapsing it to a hairline', () => {
    expect(applyBarWidthRatio(4, 0.5)).toBe(MIN_RATIO_BAR_WIDTH);
  });

  it('never widens past the bar it is inset into', () => {
    expect(applyBarWidthRatio(2, 0.5)).toBe(2);
  });
});

describe('computeSeriesBarWidth', () => {
  const base = {
    innerWidth: 900,
    dataLength: 12,
    columnWidth: 60,
    composedMaxBarSize: 30,
    composedBarGap: 4,
  };

  // Overlaid stacks share the column, so how many series exist cannot change
  // the column's bar width — only grouped (non-stacked) bars divide it.
  it('ignores the series count when stacked', () => {
    expect(computeSeriesBarWidth({ ...base, seriesCount: 5, stacked: true })).toBe(
      computeSeriesBarWidth({ ...base, seriesCount: 2, stacked: true })
    );
  });

  it('divides the column between grouped bars', () => {
    expect(
      computeSeriesBarWidth({ ...base, seriesCount: 4, stacked: false })
    ).toBeLessThan(computeSeriesBarWidth({ ...base, seriesCount: 1, stacked: false }));
  });
});

describe('computeSeriesBarRevealClipPadding', () => {
  // The clip pads to the widest bar at each x. An inset stack is a strict
  // subset of the outer one, so the outer half-width still covers it.
  it('pads to half the bar width when stacked, whatever the series count', () => {
    expect(computeSeriesBarRevealClipPadding({ barWidth: 30, seriesCount: 5, stacked: true })).toBe(15);
    expect(computeSeriesBarRevealClipPadding({ barWidth: 30, seriesCount: 1, stacked: true })).toBe(15);
  });

  it('pads to the whole group when bars are side by side', () => {
    expect(computeSeriesBarRevealClipPadding({ barWidth: 10, seriesCount: 3, gap: 4, stacked: false })).toBe(19);
  });
});
