# Audit: gaps and inconsistencies

What the codebase does measured against the rules in this system, audited at v1.6.3 (commit 8d6d85e). Findings marked **measured** were checked in a Tailwind build or in the running app; contrast figures are WCAG 2 ratios computed from the token values. Parts fixed since are marked **Fixed in v1.6.4**. IDs are referenced from the Roadmap.

## Defects: visible now, fix first

**A1. Chart text colors compile to nothing (measured).** `text-chart-label`, `text-chart-tooltip-foreground`, `text-chart-tooltip-muted`, `border-chart-tooltip-muted` and `bg-chart-tooltip-background` are used in eight vendored chart files, but `@theme inline` (src/index.css:173) registers only `--color-chart-1` to `--color-chart-8`. A Tailwind build emits no rule for any of them. In the running app, axis ticks render in `foreground` (rgb 25 26 31) instead of `chart-label` (#4d5160), the gauge caption likewise, and tooltip series labels render at full ink, identical to their values. Files: x-axis.tsx:80, y-axis.tsx:167, bar-x-axis.tsx:60, chart-stat-flow.tsx:134, tooltip-content.tsx:24/39/43, tooltip-box.tsx:257, chart-markers.tsx:41–85.

**A2. The v1.6.3 surface change was not carried through the neutral ramp.** `background` moved from #f6f7f9 to #eef0f4 and `card` from #ffffff to #f8f9fc, and nothing else moved with them. In light:
- `secondary` (#eef0f4) is now identical to `background`, and `muted` (#edeff3) is 1.01:1 against it. The chart-tab track, which sits on the ground (DashboardShell.tsx:559), has disappeared, and `hover:bg-muted` does nothing on ground-level controls.
- **Fixed in v1.6.4:** `muted-foreground` was 4.19:1 on `background` and 4.15:1 on `muted`, below AA; it is now #62677a, at 4.92:1 and 4.88:1. Inactive tab labels (60% `foreground` on `muted`) are still 4.35:1.
- The browser `theme-color` (layout.tsx:56), the manifest `background_color` (manifest.webmanifest:9) and the social-card template (og-template.html:5) still use the old #f6f7f9.

**A3. Notice text misses AA, and the past-due card stacks two tints (measured).** The estimator's notices set 12px `warning` or `destructive` text on their own 10% tint (EstimationCard.tsx:372, 384): 4.41:1 for warning in light. When an estimate is past due, both notices sit inside a card that is itself warning-tinted (line 356), which drops them to 3.89:1 and 4.03:1 and puts a red box inside an amber one. **Fixed in v1.6.4:** `destructive` is now #bf3434, which lifts the red notice from 3.97:1 to 4.57:1 on its own tint; the warning notice and the nesting remain.

**A4. Focus is inconsistent and the primitives' ring misses 3:1.** Button, Badge, Select, Tabs and Toggle draw `ring-[3px] ring-ring/50` (ui/button.tsx:8, badge.tsx:8, select.tsx:40, tabs.tsx:67, toggle.tsx:10); half-strength indigo is 2.13:1 on `card` in light and 2.23:1 in dark. Most hand-built buttons (header icons, filter icons, pills, disclosures, drawer rows) declare no focus style and show the browser default. Only SeriesLegend and the Regional Map markers use a solid 2px `ring` outline, which is 5.5:1.

**A5. Axis labels overlap the plot (measured).** On Intake & Processing, at 1440px and at 390px, left tick labels ("400K", "200K") overlap the first bar and right-axis labels ("40%", "20%") overlap the last (see the Screens group). The margin is sized to fit the widest label but leaves no gap to the first and last bands.

**A6. Sunburst labels overflow the ring.** Residence-status names are drawn along the arc at 11px with no fit check (ResidenceStatusSunburst.tsx:137), so a long status ("Engineer / Specialist in Humanities / International Services") runs outside the chart.

## Inconsistencies: one job, several answers

**B1. A metric or category changes color between views.** No shared map exists, so each chart picks its own:
- Pending is `chart-1` blue in Intake & Processing (IntakeProcessingBarChart.tsx:58) and a `chart-4` yellow badge on its tile (StatCard.tsx:15). The approval rate is a `chart-7` line and a gray tile.
- **Fixed in v1.6.5:** the Outcomes sankey colored nodes by position, cycling five colors (sankey-node.tsx:402), so Granted came out `chart-2` orange and Denied `chart-3` aqua beside an aqua Granted badge and a red Denied one, and with all types shown Permanent Residence wrapped round to Status Acquisition's `chart-1`. It now passes `getNodeColor` to its nodes and links: Granted `chart-3`, Denied `chart-8`, Other `chart-4`, and each type its `chart-mix` hue. The Denied badge moved from `destructive` to `chart-8` to match.
- An application type has two assignments: `chart-1` to `chart-6` in Application Types, and `chart-mix-1` to `chart-mix-6` in Category Mix and Outcomes (`applicationTypeColor`, applicationOptions.ts).
- The Granted tile pairs a `chart-3` aqua badge with a `success` green delta.

**B2. Three segmented controls.** The dataset switch is a bordered pill, rounded-full, 12px with 12 × 6px padding (DashboardShell.tsx:541). The in-chart view toggles are borderless, `radius-md`, 8 × 4px padding (PopulationGrowthChart.tsx:136, NationalityTrendChart.tsx:131, NationalityMoversChart.tsx:107). The settings drawer's theme choice is a pair of tinted option rows (DashboardShell.tsx:367). The vendored ToggleGroup is unused.

**B3. One field, two labels and two selects on the same screen.** The filter bar labels the bureau field "Immigration Bureau" in 16px semibold (FilterInput.tsx:52, fluid variant); the estimator beside it labels the same field as a 12px uppercase eyebrow (EstimationCard.tsx:311). Filter selects are native, 16px semibold; the period picker is a Radix Select at 14px regular (PeriodSelector.tsx).

**B4. Four data-readout surfaces.**

| Readout | Fill | Border | Radius | Shadow | Figures |
| --- | --- | --- | --- | --- | --- |
| Chart tooltip (tooltip-box.tsx:257) | `popover` | none | 12px | `shadow-lg` + blur | Inter |
| Efficiency hover card (EfficiencyHoverCard.tsx:27) | `popover` | `border` | 10px (arbitrary) | `shadow-soft-lg` | Inter |
| Treemap tooltip (CategoryMixTreemap.tsx:535) | `card` | `border` | 12px | `shadow-soft` | mono |
| Map info card (GeographicDistributionChart.tsx:142) | `popover` at 95% | `border` | 12px | `shadow-soft-lg` + blur | Inter |

The inverted UI tooltip (ui/tooltip.tsx) is a different role and can stay as it is.

**B5. Three icon-button shapes.** The header uses 36px round outline buttons (DashboardShell.tsx:330, 337, 348). The filter bar uses 36px squares with `radius-lg` (FilterPanel.tsx:99, 119), except the residents filter bar, which uses `radius-md` (ResidentFilterPanel.tsx:98). The estimator header uses 28px round ghost buttons (EstimationCard.tsx:115, 251). None of them is the vendored `Button size="icon"`.

**B6. Overlays disagree on their surface.** Dialog and Sheet paint `background` (ui/dialog.tsx:64, ui/sheet.tsx:63), a step darker than the cards under the scrim; Popover and Select menus paint `popover`. The mobile estimator sheet holds a `card` panel inside a `background` sheet.

**B7. Three disabled opacities.** 50% on primitives and filter selects, 40% on hand-built buttons and the unavailable dataset pill (FilterPanel.tsx:119, ResidentFilterPanel.tsx:98, EstimationCard.tsx:251, DashboardShell.tsx:541), and 35% for a hidden legend series.

**B8. Radius drift.** Arbitrary values duplicate tokens: `rounded-[10px]` is `radius-md` (EfficiencyHoverCard.tsx:27) and `rounded-[8px]` is `radius-sm` (ProcessingEfficiencyLollipop.tsx:193). Empty states use `radius-xl` (StatsSummary.tsx:83) and `radius-lg` (EstimationCard.tsx:346). Legend swatches use 3px corners, map-legend swatches 2px.

**B9. Two shadow families.** Civic Glass defines the tinted `shadow-soft` and `shadow-soft-lg`; the primitives use Tailwind's neutral `shadow-xs` to `shadow-lg`.

**B10. Two numeral voices.** Category Mix and Biggest Movers set figures in the mono stack (CategoryMixTreemap.tsx:427, 517, 542; NationalityMoversChart.tsx:153). Every other figure is Inter with tabular numerals.

**B11. Chart text sizes.** Live SVG text uses 10, 11 and 13px plus two fluid sizes beside 12px HTML ticks (see Data visualization).

**B12. Icon meanings collide.** Scale is both the Biggest Movers tab (ChartComponents.tsx:289) and the legislation policy marker (PolicyEventList.tsx:25), and both appear together on the residents dataset. LineChart is the tab icon of Application Types and of Origins Over Time (ChartComponents.tsx:158, 244). Globe2 (an earth) stands for the Japan prefecture map. The version chip's History icon and the reset buttons' RotateCcw are both counter-clockwise arrows, visible at the same time.

**B13. Copy casing and punctuation.** Title Case labels ("Immigration Bureau", "Application Type", "Compare With", "Select Bureau", "Application Date") and error titles ("Error Loading Data", "Reload Page") sit beside sentence-case labels ("Time range", "Estimated completion"). Loading strings use three periods ("Crunching Immigration Data...", "Loading Dashboard...", "Loading..."). "Copied!" is the catalogue's only exclamation mark (en.ts:18, 19, 54–56, 141, 405, 410, 416).

**B14. Legend order changes between views.** The residence-status sunburst lists the six groups by size; Population Growth lists them in canonical order.

**B15. The mark exists in three versions.** The header SVG is a #bc002d disc on #ffffff (JapanFlagIcon.tsx). The PWA and touch icons are #ed1b2f on #eeeeee (public/logo512.png, apple-touch-icon.png), although the component's comment says they match. The social card still shows the retired indigo "JP" monogram, set in Segoe UI on the old ground (scripts/og-template.html, public/og.png). The manifest's `theme_color` is indigo while the page's `theme-color` is the neutral ground.

## Gaps: things the system does not define yet

**C1. Bureau colors live outside the tokens.** Fifteen rgba pairs in bureauOptions.ts, with dark values derived at runtime by a luminance clamp (bureauColors.ts). The clamp misses its own goal: in dark, Osaka is 1.99:1 against the card, Sapporo 2.03, Sendai 2.13 and Takamatsu 2.97; in light, Yokohama is 2.82 and Kobe 2.86. The `background` half of each entry is never read, yet ARCHITECTURE.md:763 still documents it. This system records the rendered values as `bureau-*`.

**C2. Palettes beyond the first five are not checked for color-vision deficiency.** `chart-mix` pairs collapse to ΔE 1.1–1.6; `chart-6` and `chart-7` collide with `chart-2` and `chart-1` (see Data visualization). `chart-mix-2` is the same value as `primary`.

**C3. The sequential ramp is unused.** World Origins builds its own ramp by mixing `chart-1` into transparency (OriginChoroplethChart.tsx:119), and its low steps sink into the dark card.

**C4. No type roles in code.** index.css defines sizes only. Roles exist as repeated class strings: an uppercase, tracked label is written out by hand in ten places across seven files, with two letter-spacings (0.05em, and 0.025em in the changelog), and `text-xxs` has no line height of its own.

**C5. No size tokens.** Three control heights and three icon-button sizes, each written by hand.

**C6. One CJK font for every CJK locale.** Noto Sans JP renders Chinese Han characters in Japanese forms, and Korean falls through to a system font. There are no `:lang()` rules, and the eyebrow's letter-spacing applies to CJK text.

**C7. Resident Population charts have no text alternative.** No data table or CSV (DashboardShell.tsx:646), where every processing chart has one.

**C8. Dead weight.** Seven of the fifteen vendored primitives are unused (Badge, Card, Label, Separator, Skeleton, Toggle, ToggleGroup) while their jobs are hand-built. Thirty-five of the 52 legacy `@utility` classes in index.css have no user (the `stat-*`, `mobile-drawer-*`, `clip-*tapered*` and `theme-toggle*` families, among others), plus the `.floating-tooltip` layer class. Two swap-ready charts are not mounted. `.prettierrc` points `tailwindConfig` at a tailwind.config.ts that does not exist.

**C9. Latent: destructive variants ignore their token.** The vendored Button and Badge destructive variants use literal white text (3.23:1 on dark `destructive`) instead of `destructive-foreground` (ui/button.tsx, ui/badge.tsx). Unused in the app today.

**C10. Latent: a color written into font-size.** `text-[length:var(--chart-foreground-muted)]` in gauge-label-layout.tsx:58 and 65 declares a color variable as a font size. The mounted gauge takes another path.
