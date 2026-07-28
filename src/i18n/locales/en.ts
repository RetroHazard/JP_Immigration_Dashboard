// src/i18n/locales/en.ts
// English UI strings — the source of truth for the whole catalogue. Every
// other locale is a partial override of this file, and `DictionaryKey` is
// derived from it, so `tsc --noEmit` flags any key that is referenced in the
// app but not defined here.
//
// Conventions (see src/i18n/README.md):
// - Keys are dot-namespaced, grouped by the surface they appear on.
// - `{placeholder}` slots are substituted at render time; a translation must
//   use the same set of placeholders as the English string.
// - A `_one` / `_other` suffix pair marks a plural family, addressed by its
//   base name through `tPlural`. Underscores are reserved for that purpose.
export const en = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': 'Japan Immigration Statistics',
  'app.subtitle': 'Bureau processing data from e-Stat, updated with each release',
  'app.skipToContent': 'Skip to content',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': 'Processing Time Estimator',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': 'Official statistics provided by the Immigration Services Agency of Japan',
} as const;
