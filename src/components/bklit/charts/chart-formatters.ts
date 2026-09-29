// LOCAL MODIFICATION: upstream hardcodes these formatters to "en-US". The
// exports keep their shape and identity and only the Intl instance behind them
// is swapped, so no Bklit consumer changes. LocaleProvider calls
// `setChartFormatterLocale` during render, ahead of any chart, so the first
// paint after a switch is already correct. (Re-apply after a re-vendor.)
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
 * Plain-ASCII scale + suffix, used only when ICU compact notation fails to
 * abbreviate at all (see `compactFmt`).
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
 * Japanese. Some ICU builds (it-IT on an older Chromium) return plain standard
 * notation ("200.000") for low hundred-thousands despite notation:'compact',
 * too wide for any axis margin. When the compact and standard forms coincide
 * for a value that should abbreviate, fall back to a hand-scaled form; working
 * locales never reach it.
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
// LOCAL ADDITION: upstream reserves a fixed 40px for y-axis tick labels, sized
// for English "1.2M". Other locales' compact forms are wider (de-DE "1,2 Mio."),
// so measure the widest plausible tick in the current locale, with 40px as the
// floor. (Re-apply after a re-vendor.)
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

/** Rendered text width, for surfaces sized against translated text (e.g. Sankey node labels). */
export const measureLabelWidth = (text: string, font?: string): number => {
  if (typeof document === "undefined") return text.length * 7;
  measureCanvas ??= document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");
  if (!ctx) return text.length * 7;
  ctx.font = font ?? AXIS_LABEL_FONT;
  return ctx.measureText(text).width;
};
