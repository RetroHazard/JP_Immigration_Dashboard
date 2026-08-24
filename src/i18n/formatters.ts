// src/i18n/formatters.ts
// Locale-bound number and date formatting. Everything the UI formats goes
// through here so a locale switch reaches the axis ticks and tooltips as well
// as the prose — previously every call site hardcoded 'en-US' or relied on the
// browser locale, which disagreed with the rest of the page.
export interface Formatters {
  /** Grouped integer, e.g. "12,345". */
  number: (value: number) => string;
  /**
   * Fixed-precision decimal, e.g. "112.71" / "112,71". `number` won't do for a
   * rate - it leaves ICU's default of up to three fraction digits in place -
   * and `toFixed` hardcodes a `.`, which is wrong for half the catalogue.
   */
  decimal: (value: number, digits?: number) => string;
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

/**
 * Scale + suffix used only when the ICU compact formatter fails to abbreviate
 * at all (see `compactNumber` below) — deliberately plain ASCII, since this
 * path only runs when the locale's own abbreviation is unavailable. Mirrors
 * the identical guard in bklit/charts/chart-formatters.ts.
 */
const FALLBACK_ABBREVIATIONS: readonly [threshold: number, suffix: string][] = [
  [1_000_000_000, 'B'],
  [1_000_000, 'M'],
  [1_000, 'K'],
];

const build = (intlTag: string): Formatters => {
  const number = new Intl.NumberFormat(intlTag);
  const compact = new Intl.NumberFormat(intlTag, { notation: 'compact', maximumFractionDigits: 1 });
  const standard = new Intl.NumberFormat(intlTag);
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

  // Same shape as the percent cache, for the same reason.
  const decimalByDigits = new Map<number, Intl.NumberFormat>();
  const decimalFor = (digits: number) => {
    let formatter = decimalByDigits.get(digits);
    if (!formatter) {
      formatter = new Intl.NumberFormat(intlTag, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
      decimalByDigits.set(digits, formatter);
    }
    return formatter;
  };

  const abbreviateFallback = (value: number): string => {
    const [threshold, suffix] = FALLBACK_ABBREVIATIONS.find(([t]) => Math.abs(value) >= t) ?? [1, ''];
    const mantissa = new Intl.NumberFormat(intlTag, { maximumFractionDigits: 1 }).format(value / threshold);
    return `${mantissa}${suffix}`;
  };

  // Some ICU builds (observed: it-IT on an older bundled Chromium) silently
  // fail to abbreviate values in the low hundred-thousands even with
  // notation:'compact', returning the exact same string as fully-grouped
  // standard notation. When that happens, fall back to a hand-scaled form
  // rather than trust the broken ICU output for that value — locales whose
  // compact notation works correctly (the common case) are unaffected.
  const compactNumber = (value: number): string => {
    const primary = compact.format(value);
    if (Math.abs(value) >= 100_000 && primary === standard.format(value)) {
      return abbreviateFallback(value);
    }
    return primary;
  };

  return {
    number: (value) => number.format(value),
    decimal: (value, digits = 2) => decimalFor(digits).format(value),
    compactNumber,
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
