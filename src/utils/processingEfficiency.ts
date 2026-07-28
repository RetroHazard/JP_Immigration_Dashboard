// src/utils/processingEfficiency.ts
// Shared derivation for the Processing Efficiency views (the registered
// quadrant scatter and the swap-ready lollipop): one point per bureau with
// received/processed volume and completion rate over the selected period,
// colored with the bureau flag palette (matching the Regional Map; airport
// branch offices render as tints of their parent region).

import { bureauOptions } from '../constants/bureauOptions';
import { STATUS_CODES } from '../constants/statusCodes';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { tintToward, visibleBureauColor } from './bureauColors';
import type { ChartRange } from './selectors';
import { breakdownScopeFromFilter, bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from './selectors';

export interface EfficiencyPoint {
  code: string;
  label: string;
  color: string;
  /** Full-strength parent color for the dashed satellite outline */
  outline: string;
  isAirport: boolean;
  received: number;
  processed: number;
  rate: number;
}

export interface EfficiencyFilters {
  bureau: string;
  type: string;
}

// Bureau flag colors (same regional identity encoding as the map)
const bureauColor = new Map(
  bureauOptions.filter((bureau) => bureau.border).map((bureau) => [bureau.value, bureau.border as string])
);

// Branch office -> parent bureau (airports inherit their region's color)
const parentOf = new Map<string, string>();
for (const bureau of bureauOptions) {
  for (const child of bureau.children ?? []) parentOf.set(child, bureau.value);
}

/** Airports render as a tint of their parent region's flag color. */
const colorsFor = (code: string, isAirport: boolean, isDarkMode: boolean): { color: string; outline: string } => {
  const own = visibleBureauColor(bureauColor.get(code) ?? 'var(--chart-1)', isDarkMode);
  if (!isAirport) return { color: own, outline: own };
  const parent = visibleBureauColor(bureauColor.get(parentOf.get(code) ?? '') ?? own, isDarkMode);
  return { color: tintToward(parent, 0.45), outline: parent };
};

export function computeEfficiencyPoints(
  data: ImmigrationData[],
  filters: EfficiencyFilters,
  range: ChartRange,
  isDarkMode: boolean,
  /** Resolves a bureau code to its display name — supplied by the caller,
   *  since names come from the locale catalogue and this is not a component. */
  bureauLabel: (code: string) => string
): EfficiencyPoint[] {
  const months = monthsForRange(getAllMonths(data), range);
  const rows = selectData(data, {
    scope: breakdownScopeFromFilter(filters.bureau),
    type: filters.type,
  }).filter((entry) => months.includes(entry.month));

  return bureauOptions
    .filter((bureau) => bureau.value !== 'all')
    .map((bureau) => {
      const bureauRows = rows.filter((entry) => entry.bureau === bureau.value);
      const received = bureauRows.reduce(
        (sum, entry) => (entry.status === STATUS_CODES.NEW_APPLICATIONS ? sum + entry.value : sum),
        0
      );
      const processed = bureauRows.reduce(
        (sum, entry) => (entry.status === STATUS_CODES.PROCESSED ? sum + entry.value : sum),
        0
      );
      const { color, outline } = colorsFor(bureau.value, bureau.isAirport, isDarkMode);
      return {
        code: bureau.value,
        label: bureauLabel(bureau.value),
        color,
        outline,
        isAirport: bureau.isAirport,
        received,
        processed,
        rate: received > 0 ? (processed / received) * 100 : 0,
      };
    })
    .filter((point) => point.received > 0);
}

/** Official nationwide completion rate over the same period, or null when the aggregate row has no intake. */
export function nationwideCompletionRate(
  data: ImmigrationData[],
  filters: EfficiencyFilters,
  range: ChartRange
): number | null {
  const months = monthsForRange(getAllMonths(data), range);
  const rows = selectData(data, { scope: bureauScopeFromFilter('all'), type: filters.type }).filter((entry) =>
    months.includes(entry.month)
  );
  const received = rows.reduce(
    (sum, entry) => (entry.status === STATUS_CODES.NEW_APPLICATIONS ? sum + entry.value : sum),
    0
  );
  const processed = rows.reduce((sum, entry) => (entry.status === STATUS_CODES.PROCESSED ? sum + entry.value : sum), 0);
  return received > 0 ? (processed / received) * 100 : null;
}

export const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length / 2;
  return sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[mid - 1] + sorted[mid]) / 2;
};
