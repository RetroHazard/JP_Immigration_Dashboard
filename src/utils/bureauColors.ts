// src/utils/bureauColors.ts
// Helpers for the bureau flag palette. The flag colors in bureauOptions are
// single light-mode values; like every other color in the design system they
// need per-theme steps ("dark mode is a selection, not an inversion"), so
// visibleBureauColor keeps each hue but clamps its luminance into a band
// that stays readable against the active theme's surfaces (Naha's black and
// Sapporo's near-black navy vanish on dark cards otherwise).

const parseRgb = (rgba: string): [number, number, number] | null => {
  const match = /rgba?\(([^)]+)\)/.exec(rgba);
  if (!match) return null;
  const [r, g, b] = match[1].split(',').map((channel) => Number(channel.trim()));
  return [r, g, b];
};

const luminance = ([r, g, b]: [number, number, number]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const mix = (channels: [number, number, number], toward: number, amount: number): [number, number, number] =>
  channels.map((channel) => Math.round(channel + (toward - channel) * amount)) as [number, number, number];

/** Replace the alpha of an rgb()/rgba() string. */
export const withAlpha = (rgba: string, alpha: number): string => {
  const channels = parseRgb(rgba);
  if (!channels) return rgba;
  return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`;
};

/** Mix an rgba() color toward white, keeping it recognizably the same hue. */
export const tintToward = (rgba: string, amount: number): string => {
  const channels = parseRgb(rgba);
  if (!channels) return rgba;
  const [r, g, b] = mix(channels, 255, amount);
  return `rgba(${r}, ${g}, ${b}, 1)`;
};

/**
 * Theme-adapted flag color: hues stay put, but very dark colors lift toward
 * white in dark mode and very light ones sink toward black in light mode,
 * proportionally to how far outside the visible band they sit.
 */
export const visibleBureauColor = (rgba: string, isDarkMode: boolean): string => {
  const channels = parseRgb(rgba);
  if (!channels) return rgba;
  const lum = luminance(channels);

  if (isDarkMode && lum < 0.25) {
    const amount = ((0.25 - lum) / 0.25) * 0.55;
    const [r, g, b] = mix(channels, 255, amount);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  }
  if (!isDarkMode && lum > 0.82) {
    const amount = ((lum - 0.82) / 0.18) * 0.6;
    const [r, g, b] = mix(channels, 0, amount);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  }
  return rgba;
};
