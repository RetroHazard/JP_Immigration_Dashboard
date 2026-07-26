// src/i18n/en.ts
// English UI strings. The dictionary type is derived from this file; ja.ts
// provides overrides and falls back to English for untranslated keys.
export const en = {
  'app.title': 'Japan Immigration Statistics',
  'app.subtitle': 'Bureau processing data, updated daily from e-Stat',
  'app.skipToContent': 'Skip to content',
  'estimator.title': 'Processing Time Estimator',
  'footer.attribution': 'Official statistics provided by the Immigration Services Agency of Japan',
} as const;

export type DictionaryKey = keyof typeof en;
