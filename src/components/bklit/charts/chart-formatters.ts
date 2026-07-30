// LOCAL MODIFICATION to the vendored Bklit library.
//
// Upstream these are four Intl singletons hardcoded to "en-US", imported
// directly by around ten chart files — so they drive every axis tick and
// tooltip date in the app, and would ignore a locale switch entirely.
//
// The export shape is unchanged (`shortDateFmt.format(...)`, `intFmt(...)`),
// so no Bklit consumer needs touching: the exported objects are stable and
// only the Intl instance behind them is swapped. LocaleProvider calls
// `setChartFormatterLocale` during render, ahead of any chart, so the first
// paint after a switch is already correct.
//
// `scripts/vendor-bklit.mjs` would overwrite this file — re-apply the change
// after a re-vendor. That script is manual and runs in neither CI nor the
// build, so nothing reverts it silently.
const DATE_OPTIONS = { month: "short", day: "numeric" } as const;
const WEEKDAY_OPTIONS = { weekday: "short", month: "short", day: "numeric" } as const;
const TIME_OPTIONS = {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
} as const;

let locale = "en-US";
let shortDate = new Intl.DateTimeFormat(locale, DATE_OPTIONS);
let weekdayDate = new Intl.DateTimeFormat(locale, WEEKDAY_OPTIONS);
let hmsTime = new Intl.DateTimeFormat(locale, TIME_OPTIONS);
let integer = new Intl.NumberFormat(locale);
let compact = new Intl.NumberFormat(locale, {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Rebuilds the formatters for a new locale. A no-op if unchanged. */
export const setChartFormatterLocale = (next: string): void => {
  if (next === locale) return;
  locale = next;
  shortDate = new Intl.DateTimeFormat(locale, DATE_OPTIONS);
  weekdayDate = new Intl.DateTimeFormat(locale, WEEKDAY_OPTIONS);
  hmsTime = new Intl.DateTimeFormat(locale, TIME_OPTIONS);
  integer = new Intl.NumberFormat(locale);
  compact = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
};

export const shortDateFmt = {
  format: (value: Date | number) => shortDate.format(value),
};

export const weekdayDateFmt = {
  format: (value: Date | number) => weekdayDate.format(value),
};

export const hmsTimeFmt = {
  format: (value: Date | number) => hmsTime.format(value),
};

export const intFmt = (value: number) => integer.format(value);

/** Abbreviated form for cramped axis labels — "200K" in English, "20万" in Japanese. */
export const compactFmt = (value: number) => compact.format(value);

/** The locale the chart formatters are currently bound to. */
export const chartFormatterLocale = (): string => locale;
