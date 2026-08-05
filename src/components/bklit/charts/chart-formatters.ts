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
let standard = new Intl.NumberFormat(locale);

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
  standard = new Intl.NumberFormat(locale);
  marginCache.clear();
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

/**
 * Scale + suffix used only when the ICU compact formatter fails to abbreviate
 * at all (see `compactFmt` below) — deliberately plain ASCII, since this path
 * only runs when the locale's own abbreviation is unavailable.
 */
const FALLBACK_ABBREVIATIONS: readonly [threshold: number, suffix: string][] = [
  [1_000_000_000, "B"],
  [1_000_000, "M"],
  [1_000, "K"],
];

const abbreviateFallback = (value: number): string => {
  const [threshold, suffix] = FALLBACK_ABBREVIATIONS.find(([t]) => Math.abs(value) >= t) ?? [1, ""];
  const mantissa = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value / threshold);
  return `${mantissa}${suffix}`;
};

/**
 * Abbreviated form for cramped axis labels — "200K" in English, "20万" in
 * Japanese. Some ICU builds (observed: it-IT on an older bundled Chromium)
 * silently fail to abbreviate values in the low hundred-thousands even with
 * notation:'compact', returning the exact same string as fully-grouped
 * standard notation ("200.000", not "200K"/"2 hlk"/etc). That's wide enough
 * to defeat the axis margin no matter how generously it's sized below, so
 * when the compact and standard forms are identical for a value that should
 * have been abbreviated, fall back to a hand-scaled form rather than trust
 * the broken ICU output for that one value. Locales whose compact notation
 * works correctly (the common case) are completely unaffected — the compact
 * and standard forms only coincide when compact notation had zero effect.
 */
export const compactFmt = (value: number): string => {
  const primary = compact.format(value);
  if (Math.abs(value) >= 100_000 && primary === standard.format(value)) {
    return abbreviateFallback(value);
  }
  return primary;
};

/** The locale the chart formatters are currently bound to. */
export const chartFormatterLocale = (): string => locale;

// ─────────────────────── Locale-aware axis margin ───────────────────────
// LOCAL ADDITION (not upstream Bklit): the vendored y-axis strip reserves a
// fixed pixel width for its tick labels, sized against English forms like
// "1.2M". Non-English compact notation is often wider — de-DE "1,2 Mio.",
// it-IT "1,2 Mln", pt-PT/es-ES "1,2 mil" — and a fixed 40px margin either
// clips those (if the surrounding overflow isn't visible) or crowds them
// against the plot area. Rather than hand-tune a per-locale constant, measure
// the actual rendered width of the widest plausible tick for the *current*
// locale and size the margin to fit it, falling back to the original 40px
// for anything narrower. Re-apply after a re-vendor.
const AXIS_LABEL_FONT =
  '12px -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Hiragino Sans", "Yu Gothic UI", sans-serif';
const AXIS_MARGIN_MIN = 40; // the original fixed value; also the floor
const AXIS_MARGIN_MAX = 92; // guards against runaway width from extreme values
const AXIS_LABEL_PADDING = 16; // clears y-axis.tsx's own paddingRight (8px) plus a little breathing room

let measureCanvas: HTMLCanvasElement | null = null;

const measureTextWidth = (text: string): number => {
  // SSR / no canvas support: fall back to a rough glyph-count estimate so the
  // server-rendered margin is in the right ballpark before hydration.
  if (typeof document === "undefined") return text.length * 7;
  measureCanvas ??= document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");
  if (!ctx) return text.length * 7;
  ctx.font = AXIS_LABEL_FONT;
  return ctx.measureText(text).width;
};

const marginCache = new Map<string, number>();

/**
 * Left/right axis margin sized for the widest plausible compact-number tick
 * in the current locale. This dataset's y-domains land in the low millions,
 * so 9,999,999's compact form is a safe upper bound — the margin has to be
 * picked before the y-scale (and therefore the real tick values) exist.
 */
export const estimateAxisMarginLeft = (): number => {
  const cached = marginCache.get(locale);
  if (cached !== undefined) return cached;
  const widest = compactFmt(9_999_999);
  const width = measureTextWidth(widest);
  const value = Math.min(AXIS_MARGIN_MAX, Math.max(AXIS_MARGIN_MIN, Math.ceil(width) + AXIS_LABEL_PADDING));
  marginCache.set(locale, value);
  return value;
};

/** Exported for other chart surfaces (e.g. the Sankey's node-label margins) that need to size themselves against real translated text rather than a guessed constant. */
export const measureLabelWidth = (text: string, font?: string): number => {
  if (typeof document === "undefined") return text.length * 7;
  measureCanvas ??= document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");
  if (!ctx) return text.length * 7;
  ctx.font = font ?? AXIS_LABEL_FONT;
  return ctx.measureText(text).width;
};
