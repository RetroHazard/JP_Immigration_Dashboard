// The site's mark, the hinomaru the favicon, PWA icons and og image use,
// drawn inline so the header doesn't fetch a raster. The rounded field and
// hairline border live inside the SVG, since rounding the <svg> box with CSS
// wouldn't clip the painted field. The flag keeps its colors in both themes;
// only the outline reads from the theme.

export function JapanFlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 24" className={className} aria-hidden="true">
      <rect x="0.5" y="0.5" width="35" height="23" rx="4.5" fill="#ffffff" stroke="var(--border)" />
      {/* Official proportions: the disc's diameter is 3/5 of the hoist. */}
      <circle cx="18" cy="12" r="7.2" fill="#bc002d" />
    </svg>
  );
}
