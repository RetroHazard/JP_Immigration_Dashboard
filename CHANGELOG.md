# Changelog

All notable changes to the Japan Immigration Bureaus Statistics Dashboard are documented in this file, grouped by month. The dashboard's header shows the currently deployed version.

## 2026-07

### Added

- **v0.6.2**: Changelog modal, opened from the version link in the header, sourced from this file.

### Fixed

- Fixed aggregate bureaus (Osaka, Fukuoka, Nagoya, Shinagawa) briefly reporting inflated processing figures when a branch office's data lagged ([#44](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/44))
  - `getCorrectedValue` now flags a period as incomplete when any branch office (e.g. Kobe) hasn't published yet
  - `transformData` skips incomplete periods instead of falling back to the inflated raw total
  - Added Vitest regression tests for the aggregation fix
  - Added a characterization test for the estimator's separate, legitimate sensitivity to newly published rates

## 2026-06

### Changed

- Upgraded `next` 15.5.11 → 15.5.19 and `postcss` 8.5.6 → 8.5.15 ([#42](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/42))
  - Resolved 16 Dependabot alerts on Next.js and 1 on PostCSS
  - Synced `@next/third-parties`, `eslint-config-next`, and `@next/eslint-plugin-next` to match
  - Triaged remaining Next.js CVEs as non-applicable, since the static export has no server runtime in production
  - Dismissed transitive dev-only advisories (`lodash`, `flatted`, `minimatch`, `picomatch`) with no upstream fix available

## 2026-03

### Fixed

- Fixed spurious rebuilds caused by Data Watcher cache expiration ([#41](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/41))
  - The 23rd–28th schedule left a ~25-day gap between runs that reliably exceeded the 7-day cache TTL
  - Switched the schedule to run daily, eliminating the gap
  - A cache miss now routes through the no-changes path instead of falsely triggering a build
  - Cache-refresh key switched from hash-based to date-based (`estat-data-YYYYMMDD`), with a cleanup step

## 2026-02

### Added

- Environment-aware logger that suppresses console output in production builds (`src/utils/logger.ts`) ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

### Changed

- **v0.6.1** released with the changes below.
- Refactored for type safety and architecture ([#36](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/36), [#37](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/37))
  - Enabled TypeScript's `noImplicitAny` and replaced all explicit `any` types
  - Extracted `ThemeContext`, `DesktopLayout`, `MobileLayout`, and `ActiveChart` out of `App.tsx`
  - Added an `ErrorBoundary`
  - Centralized data filtering into a shared hook instead of filtering per-chart
  - Memoized chart options, lazy-loaded KaTeX, and pre-calculated prefecture colors
  - Added proper `fetch` cleanup via `AbortController`
  - Introduced `STATUS_CODES` and a shared `StatCard` component
  - Fixed the bar chart's Y-axis scaling for the dual-axis overlay
- Overhauled the README ([#38](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/38))
  - Added an Automated Data Updates section
  - Added an Architecture & Code Quality section
  - Expanded the Contributing guidelines
  - Added License and Acknowledgments sections
  - Documented the full tech stack, including the use of Claude Code
- Migrated tooltips from Tippy.js to FloatingUI ([#39](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/39))
  - Added reusable `useTooltip` and `useFollowCursorTooltip` hooks
  - Migrated `StatCard` tooltips, with mobile touch support
  - Migrated the choropleth map's prefecture/bureau tooltips to follow-cursor behavior
  - Migrated `FormulaTooltip` to a singleton pattern
  - Removed the `@tippyjs/react` dependency

### Fixed

- Filter selection now respects each chart's supported filter types ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

### Security

- Pinned `d3-color` to `^3.1.0` for [CVE-2024-41235](https://github.com/advisories/GHSA-36jr-mh4h-2g58) ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

## 2025-12

### Added

- Automated the Data Watcher GitHub Actions workflow ([#33](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/33))
  - Added a daily cron schedule during the e-Stat release window
  - "No changes" no longer fails the workflow run
  - Added UTC/JST execution timestamps and a step summary
  - Added a cache-refresh step to prevent TTL expiration during quiet periods

## 2025-10

### Changed

- **v0.5.2**: Bureau and prefectural data refinements
  - Renamed the Tokyo bureau to Shinagawa for clarity
  - Added the Kobe Branch Office as its own distinct entity
  - Refreshed prefectural population metrics with 2024 statistics

### Fixed

- **v0.5.1**: Fixed duplicated application figures in the Tokyo, Osaka, Nagoya, and Fukuoka bureaus ([#31](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/31))
  - e-Stat branch-office totals were already folded into their parent bureau's published figures
  - Added `correctBureauAggregates.ts` to deaggregate the values
  - Reported by a Reddit user (u/TheBipolarTurtle)

## 2025-05

### Changed

- **v0.4.4**: Estimation logic and naming cleanup ([#28](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/28))
  - Renamed `predictedProcessed` → `estimatedProcessed` and `P_proc` → `E_proc`
  - Removed the deprecated `minMonths`/`maxBackwardMonths` constants
  - Average processing rates now use a rolling window of the most recent 6 months
  - Reworked carryover calculation logic to use status code `100000`
  - Reintroduced the formula/calculation display for past-due applications
- **v0.4.5**: Verbiage-only patch

## 2025-04

### Added

- **v0.4.1**: Migrated the project from Create React App to Next.js ([#23](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/23))
  - Began converting the codebase to TypeScript
  - Introduced the `src/app/[[...slug]]` route structure, replacing `index.html`/`index.js`
  - Added a new reusable `LoadingSpinner` component
  - Removed deprecated CRA-era files
  - Moved the e-Stat API ID into an environment variable

### Fixed

- **v0.4.2**: Simplified the estimation formula ([#25](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/25))
  - Removed the redundant `Q_adj`/`Delta_net` variables inherited from the original prototype
  - Removed an unintended loop that caused abnormal results at month boundaries
  - Estimates now follow a more linear, predictable pattern
- **v0.4.3**: Fixed `confirmedProcessed` not being excluded from the estimated-processed pool, which caused double-counting

## 2025-03

### Changed

- **v0.3.2** patch release
- Data Watcher workflow maintenance

## 2025-02

### Added

- **v0.3.1**: Advanced Calculation Model and Data Visualization ([#21](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/21))
  - Refined monthly/daily estimate logic with UTC normalization
  - Introduced a hybrid model blending real data with predictive averages
  - Added `totalProcessed`/`totalDays` metrics
  - Rendered formulas with LaTeX for readability
  - Added `BureauDistributionRingChart`, `BureauPerformanceBubbleChart`, `MonthlyRadarChart`, and `CategorySubmissionsLineChart`
  - Added an interactive choropleth map of Japan (`react-simple-maps` + `japan.topo.json`)
  - Added reusable `FilterInput` and `FormulaTooltip` components
  - Replaced basic tooltips with Tippy.js; added KaTeX-powered formula tooltips
  - Added an hourly e-Stat polling workflow with caching
  - Hardened the build workflow's permissions and error handling
  - Added aria-labels for screen-reader accessibility

### Changed

- Consolidated helper functions and removed deprecated/unused code

## 2025-01

### Added

- Initial dashboard: stacked bar chart, Estimation Card, Filter Panel, and Stats Summary
  - Backed by an e-Stat data pipeline and a GitHub Actions build/deploy workflow
  - Added calculation logic accounting for queue position and applications processed to date
  - Added a collapsible Estimation Card with a details pane showing the underlying formula
  - Added additional predictive logic and chart view options
  - Moved processed-application data onto a second y-axis on the bar chart
- **v0.1.3**: Build-time version/build-date display baked into the header
  - Added a README status badge
- Added issue templates, an MIT `LICENSE`, and a `FUNDING.yml`
- **v0.2.1**: Responsive design and dark mode ([#10](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/10))
  - Mobile-first responsive design using Tailwind's native breakpoints
  - Dark mode support with a toggle switch
  - Drawer variant of the Estimation Card for mobile
  - Tooltips for mobile StatCards
  - Google Analytics traffic tag
  - Extracted shared styles into dedicated CSS files
  - Integrated Prettier with the Tailwind plugin
- **v0.2.2**: Follow-up UI polish across `index.html`, `EstimationCard`, `StatsSummary`, and global styles

### Fixed

- **v0.1.1**: Safari month-input placeholder text
  - "Last Updated" now bakes in at build time instead of updating on every page render
- **v0.1.2**: The Estimation Card no longer returns early with no details shown when a completion date is already past due ([#5](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/5))
