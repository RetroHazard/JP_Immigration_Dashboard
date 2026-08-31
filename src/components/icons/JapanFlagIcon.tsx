// src/components/icons/JapanFlagIcon.tsx
// The site's own mark — the hinomaru the favicon, PWA icons and og image
// already use — drawn inline so the header doesn't fetch a raster for a
// 36px glyph. The rounded field and its hairline border live inside the
// SVG: rounding the <svg> box with CSS wouldn't clip the painted field,
// and the flag keeps its real colors in both themes (a flag doesn't
// re-tint for dark mode), so only the outline reads from the theme.

export function JapanFlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 24" className={className} aria-hidden="true">
      <rect x="0.5" y="0.5" width="35" height="23" rx="4.5" fill="#ffffff" stroke="var(--border)" />
      {/* Official proportions: the disc's diameter is 3/5 of the hoist. */}
      <circle cx="18" cy="12" r="7.2" fill="#bc002d" />
    </svg>
  );
}
