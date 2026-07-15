# Changelog

All notable changes to the Japan Immigration Bureaus Statistics Dashboard are documented in this file, grouped by month. The dashboard's header shows the currently deployed version.

## 2026-07

### Added

- **v0.6.2**: Added a Changelog modal, opened from the version link in the header, sourced from this file.

### Fixed

- Corrected an issue where aggregate bureaus (Osaka, Fukuoka, Nagoya, Shinagawa) could briefly report inflated processing figures when a branch office (e.g. Kobe) hadn't yet published its data for a period. `getCorrectedValue` now flags a period as incomplete when any branch is missing, and `transformData` skips that data point entirely rather than falling back to the inflated raw total — the month is treated as "not yet published" instead of silently "correcting" itself a day later. Added Vitest regression tests for the aggregation fix and a characterization test documenting the estimator's separate, legitimate sensitivity to newly published monthly rates. ([#44](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/44))

## 2026-06

### Changed

- Upgraded `next` from 15.5.11 → 15.5.19 (resolving 16 Dependabot alerts) and `postcss` from 8.5.6 → 8.5.15, syncing `@next/third-parties`, `eslint-config-next`, and `@next/eslint-plugin-next` to match. Triaged the remaining Next.js CVEs (middleware bypass, server-component DoS, image-optimization/SSRF issues) as non-applicable since the project builds via `output: 'export'` — a static SPA with no Next.js server runtime in production — and dismissed several transitive dev-only advisories (`lodash` via `@nivo/treemap`, `flatted`, `minimatch`, `picomatch`) with no available upstream fix. ([#42](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/42))

## 2026-03

### Fixed

- Fixed the automated Data Watcher workflow so a run more than 7 days after the last one no longer mistakes an expired GitHub Actions cache for "new data" and triggers a spurious rebuild. The root cause was the 23rd–28th schedule leaving a ~25-day gap between runs that reliably exceeded the 7-day cache TTL, so a missing `prev-` file on the first run of the month was misread as a change. The schedule now runs daily (eliminating the gap and catching mid-month e-Stat corrections), a cache miss now routes through the no-changes path (`changes_detected=false`) instead of falsely triggering a build, and the cache-refresh step switched from a hash-based key to a date-based key (`estat-data-YYYYMMDD`) with a cleanup step so refreshes always create a fresh entry instead of silently no-oping. ([#41](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/41))

## 2026-02

### Added

- Environment-aware logger (`src/utils/logger.ts`) that suppresses console output in production builds. ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

### Changed

- **v0.6.1** released with the changes below.
- Sizeable code-quality and architecture refactor: enabled TypeScript's `noImplicitAny` and replaced all explicit `any` types with proper types; extracted theme handling into a `ThemeContext`, extracted `DesktopLayout`, `MobileLayout`, and `ActiveChart` components out of `App.tsx` (which shrank from 209 lines of markup to a thin composition layer), and added an `ErrorBoundary`; centralized data filtering into a shared hook instead of filtering per-chart, memoized chart options, lazy-loaded KaTeX, and pre-calculated prefecture colors for the choropleth map; added proper `fetch` cleanup via `AbortController`; introduced `STATUS_CODES` and a shared `StatCard` component. Also fixed the bar chart's Y-axis scaling for the dual-axis (processed/queued) overlay. ([#36](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/36), [#37](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/37))
- Overhauled the README: added an Automated Data Updates section, an Architecture & Code Quality section, expanded Contributing guidelines, License/Acknowledgments sections, and documented the full tech stack including the use of Claude Code for AI-assisted development. ([#38](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/38))
- Migrated all tooltip implementations from Tippy.js to FloatingUI (`@floating-ui/react`) for better TypeScript support, active maintenance, and performance. Added reusable `useTooltip` and `useFollowCursorTooltip` hooks; migrated `StatCard` tooltips (with mobile touch support), the `GeographicDistributionChart` prefecture/bureau map markers (follow-cursor behavior), and `FormulaTooltip` (using a singleton pattern for variable explanations); updated associated CSS and removed the Tippy-specific dependency and styles. ([#39](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/39))

### Fixed

- Filter selection now respects each chart's supported filter types, instead of leaking a bureau/type filter to charts that don't support it. ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

### Security

- Pinned `d3-color` to `^3.1.0` to address [CVE-2024-41235](https://github.com/advisories/GHSA-36jr-mh4h-2g58). ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

## 2025-12

### Added

- Automated the Data Watcher GitHub Actions workflow: added a daily cron schedule (`5 1 23-28 * *`, 1:05 AM UTC / 10:05 AM JST) targeting the 25th e-Stat release date with buffer days for weekends/holidays; used `continue-on-error` plus an explicit "mark workflow as successful" step so a "no changes" result no longer fails the run; added UTC/JST execution timestamps, a previous-vs-current `SURVEY_DATE` comparison, and a GitHub Actions step summary; and added a cache-refresh step to prevent the 7-day cache TTL from expiring during quiet periods. ([#33](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/33))

## 2025-10

### Changed

- **v0.5.2**: Renamed the Tokyo bureau to Shinagawa for clarity (since Yokohama is also a branch of Tokyo's Regional Office), added the Kobe Branch Office as its own distinct entity rather than folding it into Osaka's totals, and refreshed prefectural population metrics using 2024 statistics.

### Fixed

- **v0.5.1**: Corrected duplicated application figures in the Tokyo, Osaka, Nagoya, and Fukuoka bureaus, caused by e-Stat publishing branch-office totals that were already aggregated into their parent regional bureau's figures without it being accounted for. Added a new `correctBureauAggregates.ts` utility to deaggregate these values where necessary, validated against a random sample of months and conditions on e-Stat. Reported by a Reddit user (u/TheBipolarTurtle). ([#31](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/31))

## 2025-05

### Changed

- **v0.4.4**: Renamed estimation variables for consistency (`predictedProcessed` → `estimatedProcessed`, `P_proc` → `E_proc`), removed the deprecated `minMonths`/`maxBackwardMonths` constants, and switched average processing-rate calculations to a rolling window of the most recent 6 months of available data for more accurate estimates on bureaus with significant backlogs. Reworked carryover calculation logic to use status code `100000` for totals, replaced "historical" with "available" in tooltip/UI copy for clarity, reintroduced the formula/calculation display for past-due applications, and added the missing `@types/react-katex` devDependency. ([#28](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/28))
- **v0.4.5**: Verbiage-only patch.

## 2025-04

### Added

- **v0.4.1**: Migrated the project from Create React App to Next.js and began converting the codebase to TypeScript. Introduced the `src/app/[[...slug]]` route structure (`layout.tsx`, `client.tsx`, `page.tsx`) replacing the old `index.html`/`index.js` entrypoints, a new reusable `LoadingSpinner` component, and a new `.eslintrc.js`. Renamed `tailwind.config.js` to `.ts`, added `next.config.ts`, moved the e-Stat API ID to an environment variable in the build workflow, restructured image/icon asset locations, and removed deprecated CRA-era files (`manifest.json`, the old `BureauDistributionTreemap` component, etc.). Also fixed a formula calculation/display discrepancy and tooltip/legend issues in charts uncovered during the migration. ([#23](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/23))

### Fixed

- **v0.4.2**: Simplified the estimation formula by removing the redundant `Q_adj`/`Delta_net` variables inherited from the original prototype, folding their purpose directly into the `C_prev` calculation, and removing an unintended loop in the adjustment calculations that produced abnormal results when application dates shifted across a month boundary — estimates now follow a more linear, predictable pattern. ([#25](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/25))
- **v0.4.3**: Fixed `confirmedProcessed` not being excluded from the `estimatedProcessed` pool, which was causing double-counting.

## 2025-03

### Changed

- **v0.3.2** patch release, alongside Data Watcher workflow maintenance (`watcher.yaml` updated twice).

## 2025-02

### Added

- **v0.3.1** — a large feature release:
  - **Advanced calculation model**: refined monthly/daily estimate logic with UTC normalization, a hybrid system blending real data with predictive averages, new `totalProcessed`/`totalDays` metrics, and LaTeX-rendered formulas for readability.
  - **New charts**: `BureauDistributionRingChart`, `BureauPerformanceBubbleChart`, `MonthlyRadarChart`, and `CategorySubmissionsLineChart`, plus an interactive choropleth map of Japan (`GeographicDistributionChart`, built on `react-simple-maps` with a new `japan.topo.json` topology dataset) for visualizing prefectural and bureau data.
  - **UI**: redesigned Estimation Cards with dynamic rendering and better responsiveness, a unified layout with collapsible panels, and new reusable `FilterInput` and `FormulaTooltip` components.
  - **Tooltips**: replaced native/basic tooltips with Tippy.js, and added KaTeX-powered tooltips for formula explanations.
  - **Workflows**: added a new `watcher.yaml` for hourly e-Stat API polling with caching and automatic cleanup, plus least-privilege permissions, JSON validation, and error-handling hardening in the build workflow.
  - **Accessibility**: added aria-labels to buttons/links for screen-reader support toward Lighthouse audit compliance.
  - Downgraded React/ReactDOM to v18 for KaTeX compatibility.

### Changed

- Consolidated helper functions, removed deprecated logic and unused variables, and reformatted the codebase with Prettier.

## 2025-01

### Added

- Initial public release, building up to **v0.1.0**: the original Create React App-based dashboard with a stacked bar chart, Estimation Card, Filter Panel, and Stats Summary, backed by an e-Stat data pipeline and a GitHub Actions build/deploy workflow. Early iteration added calculation logic accounting for queue position and total applications processed to date, a collapsible Estimation Card with a details pane showing the underlying formula (with independently toggleable filter/detail visibility), additional predictive logic and chart view options, and moved processed-application data onto a second y-axis on the bar chart to visualize it as a share of the existing application pool.
- **v0.1.3**: Build-time version/build-date display (via the new `react-build-info` package) baked into the header, and a README status badge.
- Issue templates, an MIT `LICENSE`, and a `FUNDING.yml`.
- **v0.2.1**: A comprehensive UI overhaul — mobile-first responsive design using Tailwind's native breakpoints, dark mode support with a toggle switch, a drawer variant of the Estimation Card for mobile, tooltips for mobile StatCards, and a Google Analytics tag for traffic analytics. Extracted common styles into dedicated CSS files, removed duplicate classes and deprecated media queries, moved estimation calculation logic into a dedicated utility file, and integrated Prettier with the Tailwind plugin for consistent formatting. ([#10](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/10))
- **v0.2.2**: Follow-up UI polish across `index.html`, `EstimationCard`, `StatsSummary`, and global styles.

### Fixed

- **v0.1.1**: Added placeholder text to the month input as a temporary guide for Safari (macOS) users, since that browser doesn't natively support the `month` input type at this time; and fixed "Last Updated" in the nav bar so it bakes in at build time instead of incorrectly updating on every page render.
- **v0.1.2**: The Estimation Card no longer returns early with no details shown when an application's completion date is already past due. ([#5](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/5))
