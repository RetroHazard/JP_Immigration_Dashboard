// src/i18n/formatters.ts
// Locale-bound number and date formatting. Everything the UI formats goes
// through here so a locale switch reaches the axis ticks and tooltips as well
// as the prose — previously every call site hardcoded 'en-US' or relied on the
// browser locale, which disagreed with the rest of the page.
export interface Formatters {
  /** Grouped integer, e.g. "12,345". */
  number: (value: number) => string;
  /** Abbreviated integer for cramped chart labels, e.g. "12K" / "1.2万". */
  compactNumber: (value: number) => string;
  /** Takes a 0-100 percentage (the shape the app carries), not a 0-1 ratio. */
  percent: (value: number, digits?: number) => string;
  /** "Jun 2025" — the data-coverage and axis form. */
  monthYear: (date: Date) => string;
  /** "22 Sep 2026" — the estimator result form. */
  mediumDate: (date: Date) => string;
  /** "22 September 2026" — the footer build-date form. */
  longDate: (date: Date) => string;
}

const cache = new Map<string, Formatters>();

const build = (intlTag: string): Formatters => {
  const number = new Intl.NumberFormat(intlTag);
  const compact = new Intl.NumberFormat(intlTag, { notation: 'compact', maximumFractionDigits: 1 });
  const monthYear = new Intl.DateTimeFormat(intlTag, { month: 'short', year: 'numeric' });
  const mediumDate = new Intl.DateTimeFormat(intlTag, { day: 'numeric', month: 'short', year: 'numeric' });
  const longDate = new Intl.DateTimeFormat(intlTag, { day: 'numeric', month: 'long', year: 'numeric' });

  // Percent formatters vary by decimal places; build each shape once.
  const percentByDigits = new Map<number, Intl.NumberFormat>();
  const percentFor = (digits: number) => {
    let formatter = percentByDigits.get(digits);
    if (!formatter) {
      formatter = new Intl.NumberFormat(intlTag, {
        style: 'percent',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
      percentByDigits.set(digits, formatter);
    }
    return formatter;
  };

  return {
    number: (value) => number.format(value),
    compactNumber: (value) => compact.format(value),
    percent: (value, digits = 1) => percentFor(digits).format(value / 100),
    monthYear: (date) => monthYear.format(date),
    mediumDate: (date) => mediumDate.format(date),
    longDate: (date) => longDate.format(date),
  };
};

/** Memoized per locale — `Intl` constructors are comparatively expensive. */
export const createFormatters = (intlTag: string): Formatters => {
  let formatters = cache.get(intlTag);
  if (!formatters) {
    formatters = build(intlTag);
    cache.set(intlTag, formatters);
  }
  return formatters;
};
