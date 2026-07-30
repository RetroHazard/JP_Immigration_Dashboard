// src/utils/categoryMixTree.ts
// Shared hierarchy for the Category Mix views: all applications → application
// type → bureau, built from new submissions in the selected window. Used by
// the sunburst (active) and the zoomable treemap (registry-ready alternate).
import { applicationOptions } from '../constants/applicationOptions';
import { bureauOptions } from '../constants/bureauOptions';
import { STATUS_CODES } from '../constants/statusCodes';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import type { ChartRange } from './selectors';
import { breakdownScopeFromFilter, getAllMonths, monthsForRange, selectData } from './selectors';

export interface MixLeaf {
  /** Bureau code. The bureau's display name used to live here, which made the
   *  treemap's animation keys change with the UI language. */
  code: string;
  value: number;
}

export interface MixCategory {
  /** Application type code ('10'…'60') */
  key: string;
  /** Category hue from the --chart-mix-* palette, stable per type */
  color: string;
  value: number;
  /** Bureaus with volume in this category, sorted descending */
  children: MixLeaf[];
}

export interface MixTree {
  total: number;
  categories: MixCategory[];
}

/** Bureau tints step from the parent hue toward the card surface by rank. */
export const mixLeafColor = (categoryColor: string, rank: number): string =>
  `color-mix(in oklab, ${categoryColor}, var(--card) ${Math.min(16 + rank * 7, 72)}%)`;

export const buildCategoryMixTree = (
  data: ImmigrationData[],
  filters: { bureau: string; type: string },
  range: ChartRange
): MixTree => {
  const months = monthsForRange(getAllMonths(data), range);
  const rows = selectData(data, {
    scope: breakdownScopeFromFilter(filters.bureau),
    status: STATUS_CODES.NEW_APPLICATIONS,
  }).filter((entry) => months.includes(entry.month));

  const categories = applicationOptions
    .filter((option) => option.value !== 'all')
    .map((option, typeIndex) => {
      const children = bureauOptions
        .filter((bureau) => bureau.value !== 'all')
        .map((bureau) => ({
          code: bureau.value,
          value: rows.reduce(
            (sum, entry) => (entry.bureau === bureau.value && entry.type === option.value ? sum + entry.value : sum),
            0
          ),
        }))
        .filter((leaf) => leaf.value > 0)
        .sort((a, b) => b.value - a.value);

      return {
        key: option.value,
        color: `var(--chart-mix-${typeIndex + 1})`,
        value: children.reduce((sum, leaf) => sum + leaf.value, 0),
        children,
      };
    })
    .filter((category) => category.value > 0)
    .sort((a, b) => b.value - a.value);

  return { total: categories.reduce((sum, category) => sum + category.value, 0), categories };
};
