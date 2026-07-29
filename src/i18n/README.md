# Localization

Every user-visible string in the dashboard — text, ARIA labels, `title` and
`placeholder` attributes, chart legends, tooltips, table headers, empty and
error states — comes from a catalogue file in `locales/`. Adding a language
means writing one file. You do not need to touch a component.

## Adding a language

1. **Copy the English catalogue.** `locales/en.ts` is the source of truth and
   the only complete file. Copy it to `locales/<code>.ts`, using the two-letter
   code your language is normally written with (`ko`, `zh`, `vi`, `pt`).

2. **Change the header and the type.** Translations are `Dictionary`, not
   `as const`:

   ```ts
   import type { Dictionary } from '../types';

   export const ko: Dictionary = {
     'app.title': '일본 출입국 통계',
     // …
   };
   ```

3. **Register it.** In `locales/index.ts`, import the file and add one entry:

   ```ts
   ko: { code: 'ko', nativeName: '한국어', intlTag: 'ko-KR', dictionary: ko },
   ```

   `nativeName` is what the language switcher shows, written in that language.
   `intlTag` is the BCP 47 tag used for number, date, and plural formatting.

4. **Check it.** `npx vitest run src/i18n` runs the catalogue tests described
   below, and `npx tsc --noEmit` catches any key that isn't real.

You can translate as much or as little as you like — a partial file is safe to
ship. Anything you leave out falls back to English rather than rendering blank.

## Rules a catalogue file must follow

These are enforced by `__tests__/catalogue.test.ts`, so a mistake fails the
build rather than reaching a reader.

- **Only keys that exist in English.** A key English doesn't define is almost
  always a typo, and would never be read.
- **No empty values.** Delete the line instead — it falls back to English.
- **Keep every `{placeholder}`.** `'{bureau} ({type})'` must still contain both
  `{bureau}` and `{type}`; you can reorder them freely, and often should. A
  placeholder you drop leaves a hole in the sentence.
- **Underscores are reserved for plurals.** See below.

## Plurals

Languages disagree about counting, so counted phrases are written as a family
of keys, one per [CLDR plural category][cldr], and the right member is chosen
at runtime by `Intl.PluralRules`:

```ts
'period.months_one': '{count} month',
'period.months_other': '{count} months',
```

English needs `_one` and `_other`. Japanese, Korean, and Chinese have a single
category and need only `_other`. Russian and Polish need `_one`, `_few`, and
`_many` as well — add whichever your language actually uses; anything missing
falls back to `_other`.

Never build a plural by hand (`{count} 개월` plus an "s" somewhere). The
`_other` member alone is a perfectly good translation for a language that
doesn't inflect.

[cldr]: https://cldr.unicode.org/index/cldr-spec/plural-rules

## What isn't translated, and why

- **CSV exports** keep English column headers regardless of the interface
  language, so spreadsheets and scripts built against them keep working.
- **The changelog** (`CHANGELOG.md`, shown in the in-app modal) is editorial
  release-note prose rather than interface text.
- **Page metadata** (`meta.*`) is emitted once at build time. The dashboard is
  a static export with no server to negotiate a locale, so the `<title>` and
  social-card text are English for everyone until the app grows per-locale
  routes. `public/manifest.webmanifest` is English for the same reason, and
  duplicates `meta.*` rather than reading it, because it's a static JSON file.
- **Proper nouns** — "e-Stat", "RetroHazard", the "JP" logo mark — are
  allow-listed in `eslint.config.mjs` and stay as they are.

## How it fits together

| File | Role |
| --- | --- |
| `locales/en.ts` | Source of truth. `DictionaryKey` is derived from it, so `tsc` rejects a key that isn't defined. |
| `locales/<code>.ts` | Partial override. Missing keys fall back to English. |
| `locales/index.ts` | The registry. One entry per language; everything else reads from here. |
| `translate.ts` | Lookup, `{placeholder}` interpolation, plural selection. No React — unit tested directly. |
| `formatters.ts` | Locale-bound number, percent, and date formatting. |
| `LocaleContext.tsx` | `useLocale()` → `{ t, tPlural, formatters, locale, setLocale, availableLocales }`. |
| `useDomainLabels.ts` | Joins identity-only constants (bureau codes, application types, prefectures, the chart registry) to their catalogue text. |
| `T.tsx` | For the few sentences that wrap a link or emphasis mid-clause. |
| `config.ts` | `LOCALE_SWITCHER_ENABLED`, plus the storage and query-param keys. |

Four files under `components/bklit/charts/` are locally modified so chart axis
ticks and tooltips follow the locale too: `chart-formatters.ts`,
`chart-stat-flow.tsx`, `y-axis.tsx`, and `sankey/sankey-tooltip.tsx` (its row
labels take `valueLabel` / `linkLabel` props rather than the upstream
hardcoded "Sessions" and "Flow"). A re-vendor would overwrite them.

Locale detection runs `?lang=` → `localStorage` → browser language → English.
The browser step is gated on `LOCALE_SWITCHER_ENABLED`: while the switcher is
hidden, auto-detecting a language would strand its speakers in a
mostly-English dashboard with no way back.

## Using the catalogue from a component

```tsx
const { t, tPlural, formatters } = useLocale();

t('filters.reset');                                  // plain
t('table.caption', { bureau: bureauLabel(code) });   // interpolated
tPlural('period.months', 6);                         // plural, count injected
formatters.number(12345);                            // 12,345 / 12,345
formatters.percent(75);                              // 75.0%
formatters.mediumDate(date);                         // Sep 22, 2026 / 2026年9月22日
```

Two ESLint rules keep new hardcoded text out: `react/jsx-no-literals` catches
text children, and a `no-restricted-syntax` rule catches string literals in
`aria-label`, `title`, `placeholder`, and `alt`.

## Current state

The extraction is complete — 314 keys, covering the whole interface. Japanese
is a stub of five strings, and **the language switcher is deliberately hidden**
(`LOCALE_SWITCHER_ENABLED` in `config.ts`). Offering the switch before a
language is actually translated is what got the original switcher pulled in
v1.1.0. Turn the flag on once a locale has meaningful coverage; `?lang=ja`
works regardless, for testing and for translators checking their work.
