export function computeSeriesBarWidth(input: {
  innerWidth: number;
  dataLength: number;
  columnWidth: number;
  seriesCount: number;
  composedBarSize?: number;
  composedMaxBarSize?: number;
  composedBarGap?: number;
  stacked?: boolean;
}): number {
  const {
    innerWidth,
    dataLength,
    columnWidth,
    seriesCount,
    composedBarSize,
    composedMaxBarSize,
    composedBarGap = 4,
    stacked = false,
  } = input;

  const gap = composedBarGap;
  const groupCount = stacked ? 1 : Math.max(1, seriesCount);
  let slot = columnWidth;
  if (slot <= 0) {
    slot = dataLength < 2 ? innerWidth : innerWidth / (dataLength - 1);
  }

  let width =
    composedBarSize ??
    Math.min(slot * 0.88, composedMaxBarSize ?? Number.POSITIVE_INFINITY);
  if (composedMaxBarSize != null) {
    width = Math.min(width, composedMaxBarSize);
  }
  if (groupCount > 1) {
    const maxGroup = slot * 0.92;
    const needed = groupCount * width + (groupCount - 1) * gap;
    if (needed > maxGroup && maxGroup > 0) {
      width = Math.max(4, (maxGroup - (groupCount - 1) * gap) / groupCount);
    }
  }

  return Math.max(2, width);
}

/** Half-width of the bar group at each x — used to pad reveal clips. */
export function computeSeriesBarRevealClipPadding(input: {
  barWidth: number;
  seriesCount: number;
  gap?: number;
  stacked?: boolean;
}): number {
  const { barWidth, seriesCount, gap = 4, stacked = false } = input;

  if (stacked || seriesCount <= 1) {
    return Math.ceil(barWidth / 2);
  }

  const groupWidth = seriesCount * barWidth + (seriesCount - 1) * gap;
  return Math.ceil(groupWidth / 2);
}

// LOCAL MODIFICATION: everything below the two upstream width helpers supports
// more than one stack at each x. Upstream `ComposedChart` has a single
// chart-level `stacked` flag, so every `SeriesBar` shared one running total;
// these let bars declare a `stackId` and stack only against their own group.
// (Re-apply after a re-vendor.)

/** Stack a `SeriesBar` joins when it declares no `stackId`. */
export const DEFAULT_STACK_ID = "default";

export function normalizeStackId(stackId?: string): string {
  return stackId == null || stackId === "" ? DEFAULT_STACK_ID : stackId;
}

/** One stack's bars, in child order, and the width every bar in it renders at. */
export interface ComposedBarStack {
  keys: string[];
  /** Fraction of the column's bar width. See `applyBarWidthRatio`. */
  widthRatio: number;
}

/**
 * Bar dataKeys grouped by stack, each group in child order and the groups
 * themselves in first-appearance order. `dataKeys[i]` belongs to `stackIds[i]`
 * and declares `widthRatios[i]`.
 *
 * Width is a property of the stack, not of the bar: segments that disagreed
 * would render as a staircase rather than a stack, so the first bar to open a
 * stack sets the width for all of them.
 */
export function groupBarKeysByStackId(
  dataKeys: string[],
  stackIds: string[],
  widthRatios: (number | undefined)[] = []
): ComposedBarStack[] {
  const groups = new Map<string, ComposedBarStack>();
  for (let i = 0; i < dataKeys.length; i++) {
    const key = dataKeys[i];
    if (key === undefined) {
      continue;
    }
    const stackId = normalizeStackId(stackIds[i]);
    const bucket = groups.get(stackId);
    if (bucket) {
      bucket.keys.push(key);
    } else {
      groups.set(stackId, { keys: [key], widthRatio: widthRatios[i] ?? 1 });
    }
  }
  return [...groups.values()];
}

/**
 * Per-row cumulative offsets, restarting at zero for each stack. Keyed by
 * dataKey, so the returned shape is the one `SeriesBar` already reads.
 */
export function computeComposedStackOffsets(
  data: Record<string, unknown>[],
  barStacks: ComposedBarStack[]
): Map<number, Map<string, number>> {
  const offsets = new Map<number, Map<string, number>>();
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row) {
      continue;
    }
    const rowOffsets = new Map<string, number>();
    for (const stack of barStacks) {
      let cumulative = 0;
      for (const key of stack.keys) {
        rowOffsets.set(key, cumulative);
        const value = row[key];
        if (typeof value === "number") {
          cumulative += value;
        }
      }
    }
    offsets.set(i, rowOffsets);
  }
  return offsets;
}

/** The stack a dataKey belongs to, and where it sits inside it. */
export function findStackPosition(
  barStacks: ComposedBarStack[] | undefined,
  dataKey: string
): { stack: ComposedBarStack; index: number } | null {
  if (!barStacks) {
    return null;
  }
  for (const stack of barStacks) {
    const index = stack.keys.indexOf(dataKey);
    if (index !== -1) {
      return { stack, index };
    }
  }
  return null;
}

/**
 * Width of one bar once its `widthRatio` is applied. The floor keeps an inner
 * bullet bar visible on a narrow column rather than collapsing it to a hairline.
 */
export const MIN_RATIO_BAR_WIDTH = 3;

export function applyBarWidthRatio(barWidth: number, widthRatio = 1): number {
  if (widthRatio >= 1) {
    return barWidth;
  }
  const scaled = barWidth * Math.max(0, widthRatio);
  return Math.max(Math.min(barWidth, MIN_RATIO_BAR_WIDTH), scaled);
}
