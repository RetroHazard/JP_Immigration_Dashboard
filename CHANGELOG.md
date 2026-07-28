# Changelog

All notable user-facing changes to the Japan Immigration Bureaus Statistics Dashboard are documented in this file, grouped by month. The dashboard's header shows the currently deployed version.

## 2026-07

### Added

- **Localization foundation**: every string in the interface is now translatable —
  - Text, ARIA labels, chart legends and tooltips, table headers, and empty and error states all come from a single catalogue file per language, so adding a language means writing one file rather than editing components. A partial translation is safe to ship: anything left out falls back to English instead of rendering blank
  - Numbers, percentages, and dates follow the chosen language, including chart axis ticks and tooltips, and counted phrases ("6 months", "± 3 days") use real plural rules rather than an English "s"
  - The language switcher is rebuilt but stays hidden until a language is actually translated — Japanese is still only a handful of strings. `?lang=ja` continues to work for testing
  - Contributors can add a language without touching the app: see `src/i18n/README.md`
- **v1.1.0**: Refinements on top of the Civic Glass redesign —
  - Processing Efficiency swapped to a ranked lollipop chart — bureaus ordered by completion rate, stem weight carrying intake volume, against a nationwide-rate guide line
  - A global airport toggle in the filter bar: one click removes the airport branch offices (Narita, Haneda, Kansai, Chubu) from every chart, stat, and table — nationwide totals shrink accordingly instead of quietly still counting them, and the toggle's icon crosses out while engaged
  - Chart tab bar collapsed to icons, with the active tab expanding to show its label, so it never needs horizontal scrolling
- **v1.0.0**: Civic Glass — a complete visual and technical redesign, marking the dashboard's first official production release —
  - Rebuilt on Tailwind CSS v4, shadcn/ui, and a vendored Bklit chart library, with a new design system, dark mode carried through every surface, and Anime.js-driven motion (a single reduced-motion chokepoint for accessibility)
  - Single unified dashboard shell with labeled chart tabs and shareable URL state for filters, chart selection, and the estimator
  - Two new charts — Outcomes (Sankey flow into granted/denied/other, plus an approval-rate gauge) and Processing Efficiency (bubble chart) — alongside a rebuilt interactive Regional Map and a per-bureau Category Mix view
  - Bureau-to-bureau comparison mode with side-by-side charts
  - Reworked Processing Time Estimator: collapsible on desktop, a bottom sheet on mobile, a reset button, a LaTeX-rendered formula breakdown, and a shareable permalink for a filled-out estimate
  - Mobile-first pass: a no-scroll summary card mosaic and a settings drawer for theme, language, and the changelog
  - A full data table + CSV export alternative to every chart, plus an accessibility pass (keyboard navigation, screen-reader labels)
  - An i18n scaffold (currently English/Japanese) to support additional languages going forward
- **v0.8.0**: Added a Changelog modal, opened from the version link in the header.
- **v0.7.0**: Added a permalink button to the Processing Time Estimator —
  - Share a filled-out estimate (bureau, application type, and date) via a copyable link
  - Opening a permalink automatically expands the estimator with those filters pre-filled
  ([#45](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/45))

### Changed

- The estimator's completion date now follows the chosen language's date order (English reads "Sep 22, 2026" where it previously read "22 Sep 2026") — the old form was assembled by hand and couldn't reorder for languages that need a different one.
- **v1.1.0**: Hid the language switcher — the Japanese translation only covers a handful of strings so far, and full localization is planned as its own initiative rather than something to expose partially in the meantime.
- Updated prefectural population data on the Regional Map to the Statistics Bureau of Japan's official October 1, 2024 estimates. ([#52](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/52))

### Fixed

- **v1.1.2**: The Outcomes Sankey chart's tooltip labelled application counts "Sessions" — a leftover from the chart library's web-analytics defaults — instead of "Applications".
- **v1.1.1**: The Processing Efficiency chart clamped its axis at 100%, so bureaus clearing backlog above 100% all pinned to the right edge at the same position — the axis now scales past 100% to fit the highest rate. ([#57](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/57))
- **v1.1.0**: Layout and estimator fixes —
  - The formula breakdown listed its steps in reverse — the final calculation was shown first, ahead of the values it depends on
  - The filter bar's controls wrapped and crowded each other at the layout widths where the estimator sidebar narrows the panel
  - The outcomes Sankey chart's layout broke down on narrow and mobile viewports
- Fixed aggregate bureaus (Osaka, Fukuoka, Nagoya, Shinagawa) briefly showing inflated processing-time estimates when a branch office's data hadn't been published yet for the period. ([#44](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/44))

## 2026-02

### Added

- Added a friendly error screen instead of a blank page if the app hits an unexpected error. ([#36](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/36))

### Changed

- Improved tooltips: added touch support on mobile, and map tooltips now follow the cursor. ([#39](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/39))

### Fixed

- Fixed the intake/processing bar chart's Y-axis scaling when overlaying processed applications. ([#37](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/37))
- Filter selections now only apply to charts that actually support them, instead of leaking to charts they shouldn't affect. ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

## 2025-10

### Changed

- **v0.5.2**: Renamed the Tokyo bureau to Shinagawa for clarity, and added the Kobe Branch Office as its own entity instead of folding it into Osaka's totals.
- Refreshed prefectural population statistics with 2024 data.

### Fixed

- **v0.5.1**: Fixed duplicated application figures in the Tokyo, Osaka, Nagoya, and Fukuoka bureaus, caused by e-Stat publishing branch totals that were already counted in the parent bureau's figures. ([#31](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/31))

## 2025-05

### Changed

- **v0.4.4**: Average processing-rate estimates now use the most recent 6 months of data, for better accuracy. ([#28](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/28))
- Reintroduced the formula/calculation details for applications already past their estimated completion date.

## 2025-04

### Fixed

- **v0.4.2**: Simplified the estimation formula, fixing abnormal results that could occur when an application date shifted across a month boundary. ([#25](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/25))
- **v0.4.3**: Fixed a double-counting bug in the processed-applications estimate.

## 2025-03

### Fixed

- **v0.3.2**: Fixed a discrepancy between the estimated completion date shown and the formula details displayed for the same application.

## 2025-02

### Added

- **v0.3.1**: A large feature release —
  - Refined the calculation model for more accurate monthly and daily estimates
  - Added four new charts: Bureau Distribution Ring, Bureau Performance Bubble, Monthly Radar, and Category Submissions
  - Added an interactive choropleth map of Japan for visualizing bureau and prefecture data
  - Rendered formulas with LaTeX for readability
  - Upgraded tooltips, including formula explanations
  - Improved accessibility for screen readers
  ([#21](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/21))

## 2025-01

### Added

- Initial launch: application-intake bar chart, Estimation Card, Filter Panel, and Stats Summary, with a collapsible details pane showing the underlying formula.
- **v0.2.1**: Mobile-first responsive design and dark mode —
  - Mobile-friendly layout with native breakpoints
  - Dark mode with a toggle switch
  - Drawer-style Estimation Card and tooltips on mobile
  ([#10](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/10))
- **v0.2.2**: Follow-up UI polish.

### Fixed

- **v0.1.1**: Added guidance text for the month picker on Safari (macOS), which didn't natively support that input type at the time; fixed the displayed "Last Updated" date so it reflects the actual build instead of updating every time the page loads.
- **v0.1.2**: The Estimation Card no longer shows no details when an application's completion date is already past due. ([#5](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/5))
