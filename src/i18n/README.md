# Localization

Every user-visible string in the dashboard — text, ARIA labels, `title` and
`placeholder` attributes, chart legends, tooltips, table headers, empty and
error states — comes from a catalogue file in `locales/`. Adding a language
means writing one file. You do not need to touch a component.

## Adding a language

1. **Copy the template.** `locales/_template.ts` is every key in the catalogue,
   commented out, with the English text beside it. Copy it to
   `locales/<code>.ts`, using the two-letter code your language is normally
   written with (`ko`, `zh`, `vi`, `pt`), and rename the exported constant.

   ```ts
   import type { Dictionary } from '../types';

   export const ko: Dictionary = {
     'app.title': '일본 출입국 통계',
     // 'app.subtitle': 'Application processing and resident population statistics from e-Stat',
   };
   ```

   Uncomment a line and replace its value as you translate it. Leave the rest
   commented: an absent key falls back to English, which reads better than a
   blank space.

2. **Register it.** In `locales/index.ts`, import the file and add one entry:

   ```ts
   ko: { code: 'ko', nativeName: '한국어', intlTag: 'ko-KR', status: 'in-progress', dictionary: ko },
   ```

   `nativeName` is what the language switcher shows, written in that language.
   `intlTag` is the BCP 47 tag used for number, date, and plural formatting.
   `status` is covered below — start at `in-progress`.

3. **Check it.** `npx vitest run src/i18n` runs the catalogue tests described
   below, and `npx tsc --noEmit` catches any key that isn't real. The test run
   prints your coverage, e.g. `ko: 120/557 keys (21.5%) — 437 missing, in progress`.

You can translate as much or as little as you like — a partial file is safe to
ship. Anything you leave out falls back to English rather than rendering blank.

## Completeness, and what CI enforces

Each locale declares a `status` in the registry:

| Status | What CI does |
| --- | --- |
| `in-progress` | Reports coverage on every run. Never fails for missing keys. |
| `complete` | **Must** define every key English defines. Missing one fails the build. |

English is the ground truth and is always `complete`. Flip your own locale to
`complete` once it covers everything — from then on, any key added to English
that yours lacks turns CI red, which is what stops a finished translation from
quietly rotting as the app grows.

Completeness is measured per language, not key-for-key. Plural families are the
exception: English defines `period.months_one` and `period.months_other`, but
Japanese has a single plural category, so it owes only `_other` — 557 keys
rather than 563. You are never asked for a form your language doesn't use.

### After adding or removing an English key

Regenerate the template so the next translator gets an accurate list:

```
npm run i18n:template
```

A test compares the committed template against the English catalogue, so
forgetting this fails CI rather than going unnoticed.

Removing a key also means deleting it from all twelve locale files — CI rejects a
key English doesn't define — and grepping for stragglers, **including this file**:
catalogue keys quoted in documentation are checked by nothing.

The counts quoted under [Current state](#current-state) are worth re-running while
you're here; nothing enforces them:

```
grep -c "^  '" src/i18n/locales/en.ts
```

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

## Names that come in three widths

Bureaus and application types each carry `.label`, `.short`, and `.compact`,
because the interface asks for the same name in places with very different room:

| Key | Where it renders | Budget |
| --- | --- | --- |
| `bureau.101210` | filter options, map hover card, data-table row labels and cells, the chart announcement (which is also the table's caption), CSV exports | room to spare |
| `bureau.101210.compact` | efficiency-chart label column, ring-chart legend, treemap tile | ~92px, truncates |
| `bureau.101210.short` | nothing today; an IATA-style code — leave it Latin | 3 characters |
| `appType.20` | filter options, estimator, tooltips | room to spare |
| `appType.20.compact` | the Sankey's narrow layout, below 500px | ~90px, **no truncation** |
| `appType.20.short` | stat-tile subtitle, treemap tooltip title | ~3 characters |

Translate each width to fit its own budget rather than repeating the full name
three times. Japanese is the worked example: `bureau.101210` is the full
official 東京出入国在留管理局横浜支局, but `.compact` is just 横浜 — without that,
every Tokyo-area office truncates to the same 「東京出入国在留」 and the efficiency
chart stops being able to tell them apart. `appType.*.short` is the reverse
case: English uses `EXT`, but a Latin abbreviation means nothing to a Japanese
reader, so ja uses 更新 instead of copying the code.

Nothing truncates the Sankey's `.compact` labels — an over-long one is drawn
straight off the edge of the chart.

## What isn't translated, and why

- **CSV exports** keep English column headers, row labels, and comment header
  regardless of the interface language, so spreadsheets and scripts built
  against them keep working. `src/utils/chartTableCsv.ts` pins this by
  resolving every label through a translator bound to an empty dictionary,
  which falls through to the English catalogue.
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
| `locales/_template.ts` | Generated starting point for a new language. Not a locale, and not registered. |
| `locales/index.ts` | The registry. One entry per language, carrying its `status`; everything else reads from here. |
| `translate.ts` | Lookup, `{placeholder}` interpolation, plural selection. No React — unit tested directly. |
| `formatters.ts` | Locale-bound number, decimal, percent, and date formatting. |
| `LocaleContext.tsx` | `useLocale()` → `{ t, tPlural, formatters, locale, setLocale, availableLocales }`. |
| `useDomainLabels.ts` | Joins identity-only constants (bureau codes, application types, prefectures, the chart registry) to their catalogue text. |
| `T.tsx` | For the few sentences that wrap a link or emphasis mid-clause. |
| `config.ts` | `LOCALE_SWITCHER_ENABLED`, plus the storage and query-param keys. |

Four files under `components/bklit/charts/` are locally modified so chart axis
ticks and tooltips follow the locale too: `chart-formatters.ts`,
`chart-stat-flow.tsx`, `y-axis.tsx`, and `sankey/sankey-tooltip.tsx` (its row
labels take `valueLabel` / `linkLabel` props rather than the upstream hardcoded
"Sessions" and "Flow"). A re-vendor would overwrite them; each carries a
`LOCAL MODIFICATION` comment at the point of change.

Two of those changes came out of translating Japanese rather than extracting
English: `chart-stat-flow.tsx` also passes `locales` to `NumberFlow` (without
it the animated value silently reverted to the browser's locale once the
animation library loaded), and `y-axis.tsx` marks tick labels
`whitespace-nowrap` (`100万` is wide enough to break across two lines in a 40px
axis margin).

Locale detection runs `?lang=` → `localStorage` → browser language → English.
The browser step is gated on `LOCALE_SWITCHER_ENABLED`: while the switcher is
hidden, auto-detecting a language would strand its speakers in a
mostly-English dashboard with no way back.

## Using the catalogue from a component

```tsx
const { t, tPlural, formatters } = useLocale();

t('filters.reset');                                  // plain
t('a11y.showingChart', { chart, bureau });           // interpolated
tPlural('period.months', 6);                         // plural, count injected
formatters.number(12345);                            // 12,345 / 12,345
formatters.decimal(112.706, 2);                      // 112.71 / 112,71
formatters.percent(75);                              // 75.0%
formatters.mediumDate(date);                         // Sep 22, 2026 / 2026年9月22日
```

Two ESLint rules keep new hardcoded text out: `react/jsx-no-literals` catches
text children, and a `no-restricted-syntax` rule catches string literals in
`aria-label`, `title`, `placeholder`, and `alt`.

## Current state

563 keys, covering the whole interface, in twelve languages all marked
`complete`. English, French, German, Italian, Portuguese, Spanish, and
Tagalog (`fil-PH`) all inflect for plural count, so they cover the full 563
— Tagalog's CLDR `one` rule matches a count of 0 as well as 1, unlike the
others' "exactly 1." Japanese, Korean, Chinese (`zh-CN` and `zh-TW`), and
Vietnamese have a single CLDR plural category and owe only the `_other`
member of each pair, 557 keys.

Those two numbers go stale the moment a key is added, and nothing enforces
them — the catalogue tests check keys, never counts. `npx vitest run src/i18n`
prints the real figure per locale; trust that over this paragraph.

**The language switcher is on** (`LOCALE_SWITCHER_ENABLED` in `config.ts`),
which also turns on browser-language detection — the two are one flag precisely
because auto-detecting a language is only safe while the visitor can switch
back. A locale still at `in-progress` is safe to register and offer: it renders
what it has and falls back to English for the rest.

### Two checks coverage can't make

Counting keys proves a locale isn't *missing* anything. It can't tell whether a
key that is present was ever actually translated — a value copied over from
English satisfies every count. So each locale also gets:

- **Nothing left sitting at its English value.** An exact match with the
  English source is an oversight rather than a decision.
- **Every prose value written in the language's own script.** This catches what
  the equality check misses: a line edited just enough to differ from English
  while still being English. Registered per locale in `SCRIPT_OF`, so a
  language whose script overlaps Latin simply opts out.

Both skip values that are Latin on purpose — `nav.version`, `bureau.*.short`,
`appType.*.short`, `map.areaValue`, `map.densityValue` — listed in
`LATIN_BY_DESIGN`, and both apply to whatever a locale defines, so an
`in-progress` file is held to the same standard on the part it has finished.

The equality check has one further, narrower exemption: `prefecture.*` and the
bare `bureau.<code>` keys (plus their `.compact` siblings) are Japanese proper
nouns, and every Latin-script locale romanizes them the same way English does
— "Hokkaido" is "Hokkaido" in French too, and so is a city-only bureau's
`.compact` form, which is never anything but its own name. That's a correct
translation, not a leftover, so a locale without a `SCRIPT_OF` entry is
allowed to leave them matching English. A locale with its own script gets no
such pass and is still held to translating them (北海道, not "Hokkaido") — the
script check enforces that directly, since these keys stay in its
`translatable` set regardless.
