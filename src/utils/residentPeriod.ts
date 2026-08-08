// src/utils/residentPeriod.ts
// `2025-12` is a half-year label, not a month: the figure is a snapshot taken
// at the end of June or December. Formatting it through `formatters.monthYear`
// is what keeps "Dec 2025" / "2025年12月" in the reader's own locale instead of
// printing the raw key.
import type { Formatters } from '../i18n/formatters';

export const periodToDate = (period: string): Date => {
  const [year, month] = period.split('-');
  return new Date(Number(year), Number(month) - 1, 1);
};

export const formatPeriod = (period: string | null | undefined, formatters: Formatters): string =>
  period ? formatters.monthYear(periodToDate(period)) : '';
