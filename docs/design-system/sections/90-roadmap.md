# Roadmap: unifying Civic Glass

The order matters: repairs first because readers see them today, then the component consolidation, then the gaps. Each step names the Audit findings it closes. Values marked **candidate** came from a search and need a look in both themes before they ship.

## 1. Repair

1. **Register the chart text colors (A1).** Add to `@theme inline` in src/index.css:

   ```css
   --color-chart-label: var(--chart-label);
   --color-chart-tooltip-background: var(--chart-tooltip-background);
   --color-chart-tooltip-foreground: var(--chart-tooltip-foreground);
   --color-chart-tooltip-muted: var(--chart-tooltip-muted);
   ```

   Axis ticks move to #4d5160 / #b3b8c9 and tooltip labels to `muted-foreground`, restoring the label/value hierarchy. No component changes.

2. **Re-derive the light neutrals for the #eef0f4 ground (A2).** Dark stays as it is.

   | Token | Now | Proposed | Why |
   | --- | --- | --- | --- |
   | `muted` | #edeff3 | #e6e9ef | 1.07:1 against the ground and 1.16:1 against cards, so the tab track and hover fills show again |
   | `secondary` | #eef0f4 | #e6e9ef | stops matching the ground exactly |
   | `muted-foreground` | #6d7285 | #62677a | 4.92:1 on `background`, 5.33 on `card`, 4.62 on the new `muted` |
   | `chart-foreground` | #6d7285 | #62677a | follows `muted-foreground` |

   Then set the light `theme-color` (layout.tsx:56), the manifest `background_color` and the social-card template to #eef0f4.

3. **Make notices legible and stop nesting them (A3).** Write the notice body in `foreground` (14.4:1 on either tint), keep the hue for the icon and the bold lead-in, and add two tokens for that lead-in: `warning-strong` #8a4d00 (5.55:1 on its tint) and `destructive-strong` #b83232 (4.90:1), both equal to their base token in dark. A past-due estimate keeps the neutral result card and places the destructive notice below it.

4. **One focus ring (A4).** In `@layer base`, give `:focus-visible` a 2px solid `ring` outline with a 2px offset (5.53:1 light, 5.18:1 dark). In the five primitives, replace `focus-visible:ring-[3px] focus-visible:ring-ring/50` with `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`. Hand-built buttons inherit the base rule.

5. **Keep axis labels off the plot (A5).** Add `space-2` between the widest measured tick label and the first and last band when the chart computes its margins.

6. **Fit sunburst labels (A6).** Draw a label only when its arc and ring width fit the measured text, and ellipsize it otherwise; the hint line and tooltip already carry the full name.

## 2. Unify components

7. **One color per metric and category (B1, B14).** Put every series color in one module (for example `src/constants/seriesColors.ts`) and read it from tiles, charts, legends and tables:

   | Series | Token |
   | --- | --- |
   | Pending / carried over | `chart-1` (tile badge and bars) |
   | Received | `chart-2` |
   | Processed | `chart-3` |
   | Granted | `chart-3` |
   | Denied | `chart-8` (tile badge and sankey node) |
   | Other / withdrawn | `chart-4` |
   | Approval rate | `chart-7` (tile badge and line) |
   | Total applications | neutral badge (`muted` / `muted-foreground`) |
   | Application types, ACQ to PR | `chart-mix-1` to `chart-mix-6` in every view, after step 22 |
   | World regions | `chart-1` to `chart-6`, `chart-8` for Stateless (unchanged) |
   | Purpose-of-stay groups | `chart-mix-1` to `chart-mix-6` (unchanged) |
   | Ranked nationalities | `chart-1` to `chart-8` in rank order, never `chart-mix` |

   Granted and Processed share `chart-3` on purpose: they never appear in the same chart, and granted is most of what is processed. Pass `getNodeColor` to the Outcomes sankey instead of relying on its positional cycle, and list legends in this canonical order in every view.

8. **One segmented control (B2).** Standardize on the dataset switch's pill: `radius-full`, 12px text, 12 × 6px padding; selected is a `primary` fill with `primary-foreground`, unselected a `border` outline in `secondary-foreground` that fills with `muted` on hover. Build it on the vendored ToggleGroup (`type="single"`) for roving focus, and use it for the three in-chart view toggles. Full-width option rows stay for lists of choices in the settings drawer.

9. **One field label and one select look (B3).** Label every field with `eyebrow`, in the filter bar as in the estimator, and retire `label-field`. Keep native selects for the filter bar (a 202-item nationality list belongs to the platform picker) but give them the trigger's look: `control` type (14px medium), `control-height`, `radius-md`, `input` border, `shadow-xs`.

10. **One readout surface (B4).** Chart tooltips, the efficiency hover card, the treemap tooltip and the map info card all become: `popover` fill, 1px `border`, `radius-lg`, `shadow-soft-lg`, title in 12px medium, rows in `tooltip-value` with Inter tabular figures, no blur.

11. **One icon-button family (B5).** Add two sizes to the vendored Button and make both round: `icon` (`control-height`, 36px) for the header and filter bars in the outline variant, `icon-sm` (`icon-button-sm`, 28px) for panel headers in the ghost variant. Replace the hand-built versions, which then get the focus ring for free.

12. **Overlay surfaces by position (B6).** Anything floating above the page (dialog, popover, menu, tooltip, hover card) paints `popover`; anything docked to an edge (header, footer, sheets, the mobile bar) paints `card`. Change Dialog to `popover` and Sheet to `card`.

13. **Disabled is 50% (B7).** Use `opacity-disabled` everywhere. A hidden legend series keeps 35%, because hidden is not disabled.

14. **Radius from tokens only (B8).** `rounded-[10px]` becomes `rounded-md`, `rounded-[8px]` becomes `rounded-sm`, empty states take `radius-xl` like the cards they replace, and swatches take `radius-xs`.

15. **One shadow family (B9).** Redefine Tailwind's `--shadow-xs` to `--shadow-lg` inside `@theme` with the tinted `rgb(20 22 40 / …)` color, so the primitives inherit Civic Glass depth without edits; floating panels use `shadow-soft-lg`.

16. **One numeral voice (B10).** Replace `font-mono` with tabular Inter in Category Mix and Biggest Movers.

17. **Two chart text steps (B11).** 11px for in-plot annotation (sunburst labels, marker counts and dates, sankey values) and 12px for names and ticks (sankey node names move down from 13px). The gauge keeps its fluid sizes.

18. **One icon, one meaning (B12).** Biggest Movers takes TrendingUpDown, Origins Over Time takes ChartSpline, the Regional Map takes Map, and the changelog chip takes ScrollText. All four ship with lucide-react 1.27.

19. **Copy pass (B13).** Sentence case for labels and titles that are not names ("Immigration bureau", "Application type", "Compare with", "Select a bureau", "Application date", "Couldn't load the data", "Reload page"); "Loading immigration data…", "Loading dashboard…" and "Loading…" with the ellipsis character; "Link copied" for "Copied!"; drop the disclaimer's leading asterisk, which points at nothing. Update every locale, not only English.

20. **One mark (B15).** Regenerate logo192/512, both touch icons and the favicon from the JapanFlagIcon geometry (#bc002d on #ffffff with the hairline), rebuild og.png from the template with the hinomaru, Inter and the #eef0f4 ground, and set the manifest `theme_color` to the ground so the installed app matches the page.

## 3. Fill the gaps

21. **Tokenize bureau colors (C1).** Move the eleven regional colors into CSS custom properties with authored dark values, delete `visibleBureauColor` and the unused `background` fields, and update ARCHITECTURE.md:763. Values reaching 3:1 on the card while keeping each hue:

   | Bureau | Light | Dark |
   | --- | --- | --- |
   | Sapporo | #2f304e | #63647a (was #484963, 2.03:1) |
   | Sendai | #00594c | #247065 (was #00594c, 2.13:1) |
   | Osaka | #33419a | #545faa (was #33419a, 1.99:1) |
   | Takamatsu | #556b2f | #576c31 (was #556b2f, 2.97:1) |
   | Yokohama | #f56000 (was #ff6400, 2.82:1) | #ff6400 |
   | Kobe | #6194c7 (was #6499cd, 2.86:1) | #6499cd |

   Shinagawa, Nagoya, Hiroshima, Fukuoka and Naha already pass in both themes.

22. **CVD-safe hierarchy palette (C2). Candidate.** A lightness-spread version of `chart-mix` that keeps each hue family and clears 3.1:1 on the card. Its closest pair under any simulated deficiency is ΔE 14.5 in light and 13.4 in dark, up from 1.4 and 1.1.

   | Token | Light now → candidate | Dark now → candidate |
   | --- | --- | --- |
   | `chart-mix-1` (work, ACQ) | #48819e → #4e94a6 | #6fa8c6 → #5089a6 |
   | `chart-mix-2` (training, EXT) | #4f56d3 → #291b99 | #7b81e8 → #5c5ec2 |
   | `chart-mix-3` (study, CHG) | #2e7bd6 → #1a60ba | #5b9ce8 → #acd1fe |
   | `chart-mix-4` (family, ACT) | #15948f → #014442 | #2fb3ad → #36b8b2 |
   | `chart-mix-5` (residency, RET) | #b84f8e → #b44475 | #d67ab0 → #a24776 |
   | `chart-mix-6` (other, PR) | #8a4fc8 → #917afa | #ab7ae0 → #b687ef |

   It also separates `chart-mix-2` from `primary`. For the categorical set, a light candidate for `chart-6` to `chart-8` (#005500, #3e2a96, #d1373a) lifts its worst pair from ΔE 4.7 to 8.2. In dark the first five already collide (aqua and magenta at ΔE 3.5 for deuteranopes), so re-check the dark steps of `chart-1` to `chart-5` before extending the set.

23. **Put World Origins on the sequential ramp (C3).** Map its five bins to `chart-scale-01` to `chart-scale-05` and draw its legend from the same tokens.

24. **Type roles in code (C4).** Add `@utility` classes for the named styles (`eyebrow`, `display-figure`, `title-section`, `micro`) so each role is written once, give `text-xxs` its own line height (`--text-xxs--line-height: 1.5`), and reset the eyebrow's letter-spacing under `:lang(ja)`, `:lang(zh)` and `:lang(ko)`.

25. **Size tokens (C5).** Add `--spacing-control: 2.25rem`, `--spacing-control-sm: 2rem` and `--spacing-icon-button-sm: 1.75rem` to `@theme`, which makes `h-control`, `size-icon-button-sm` and friends available as utilities.

26. **Per-language CJK fonts (C6).** LocaleProvider already sets `lang` on `<html>`. Key a font-family rule on it for Simplified Chinese, Traditional Chinese and Korean, preferring the platform's faces (PingFang, Microsoft YaHei or JhengHei, Apple SD Gothic Neo, Malgun Gothic) or self-hosted Noto Sans SC, TC and KR subsets, so Han characters take the reader's own forms.

27. **Tables for the residents views (C7).** Give each Resident Population view a table model and CSV, as the processing views have: period by group or region, period by nationality, region and country by group, status by count, country by residents, nationality by change.

28. **Remove dead weight (C8).** Delete the 35 unused `@utility` classes and `.floating-tooltip`. Adopt ToggleGroup (step 8) and the Button icon sizes (step 11), then decide on Badge, Card, Label, Separator, Skeleton and Toggle: use them or remove them. Drop the `tailwindConfig` line from `.prettierrc`; `tailwindStylesheet` already points at src/index.css.

29. **Latent fixes (C9, C10).** Use `text-destructive-foreground` in the Button and Badge destructive variants, and change the gauge label's `text-[length:…]` classes to color classes. Both are vendored files, so record each change in the vendoring ledger.

## 4. Guardrails

- **A theme-registration test.** Scan `src` for `(text|bg|border|fill|stroke|outline|ring)-<name>` utilities and fail when `<name>` has no `--color-<name>` in `@theme`. It would have caught A1.
- **A contrast test.** Check every text pair named in the token notes in both themes, at 4.5:1 for text and 3:1 for graphics and focus. It would have caught A2 and A3 when v1.6.3 moved the ground.
- **A class lint.** Reject arbitrary radius and font-size values (`rounded-[…px]`, `text-[…px]`) and hex colors in `className` outside `src/components/icons`.
