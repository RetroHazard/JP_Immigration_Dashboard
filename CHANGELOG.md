# Changelog

All notable changes to the Japan Immigration Bureaus Statistics Dashboard are documented in this file, grouped by month. The dashboard's header shows the currently deployed version.

## 2026-07

### Added

- **v0.6.2**: Added a Changelog modal, opened from the version link in the header, sourced from this file.

### Fixed

- Corrected an issue where aggregate bureaus (Osaka, Fukuoka, Nagoya, Shinagawa) could briefly report inflated processing figures when a branch office (e.g. Kobe) hadn't yet published its data for a period — that period is now treated as unpublished instead of silently "correcting" itself a day later. ([#44](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/44))

## 2026-06

### Changed

- Upgraded Next.js to 15.5.19 and PostCSS to 8.5.15, resolving Dependabot alerts and hardening the development server. ([#42](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/42))

## 2026-03

### Fixed

- Fixed the automated Data Watcher workflow so a run more than 7 days after the last one no longer mistakes an expired GitHub Actions cache for "new data" and triggers a spurious rebuild; the watcher now runs daily instead of only the 23rd–28th. ([#41](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/41))

## 2026-02

### Added

- Environment-aware logger that suppresses console output in production builds. ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

### Changed

- **v0.6.1** released with the changes below.
- Migrated tooltip implementations from Tippy.js to FloatingUI across all components for better TypeScript support, active maintenance, and performance. ([#39](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/39))
- Refactored for type safety by enabling `noImplicitAny`, extracted `ThemeContext`, `DesktopLayout`/`MobileLayout` components, and an `ErrorBoundary`; centralized data filtering and memoized chart options for performance. ([#36](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/36))
- Updated the README with Automated Data Updates, Architecture & Code Quality, and expanded Contributing sections. ([#38](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/38))

### Fixed

- Filter selection now respects each chart's supported filter types instead of leaking filters to charts that don't support them. ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

### Security

- Pinned `d3-color` to `^3.1.0` to address [CVE-2024-41235](https://github.com/advisories/GHSA-36jr-mh4h-2g58). ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

## 2025-12

### Added

- Automated the Data Watcher GitHub Actions workflow with a daily schedule during the e-Stat release window, clearer success/failure handling, and a cache-refresh step to avoid cache expiration between runs. ([#33](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/33))

## 2025-10

### Changed

- **v0.5.2**: Renamed the Tokyo bureau to Shinagawa for clarity, added the Kobe Branch Office as its own entity (previously folded into Osaka's totals), and refreshed prefectural population statistics for 2024.

### Fixed

- **v0.5.1**: Corrected duplicated application figures in the Tokyo, Osaka, Nagoya, and Fukuoka bureaus caused by aggregated e-Stat data that hadn't previously been accounted for. ([#31](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/31))

## 2025-05

### Changed

- **v0.4.4**: Renamed estimation variables for consistency (`predictedProcessed` → `estimatedProcessed`, `P_proc` → `E_proc`), switched average processing rates to a rolling most-recent-6-months window, and refreshed related documentation. ([#28](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/28))
- **v0.4.5**: Verbiage updates.

## 2025-04

### Added

- **v0.4.1**: Migrated the project from Create React App to Next.js and began the conversion to TypeScript. ([#23](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/23))

### Fixed

- **v0.4.2**: Simplified the estimation formula, removing redundant `Q_adj`/`Delta_net` variables and an unintended loop that produced abnormal results when application dates shifted across a month boundary. ([#25](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/25))
- **v0.4.3**: Fixed `confirmedProcessed` not being excluded from the estimated-processed pool, which caused double-counting.

## 2025-03

### Changed

- **v0.3.2** patch release and Data Watcher workflow maintenance.

## 2025-02

### Added

- **v0.3.1**: Introduced an advanced calculation model with hybrid real/predictive estimates and UTC-normalized daily estimation, new charts (Bureau Performance Bubble, Monthly Radar, Category Submissions Line), and an interactive choropleth map of Japan. ([#21](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/21))

### Changed

- Replaced basic tooltips with Tippy.js and added KaTeX-powered formula tooltips.

## 2025-01

### Added

- Initial public releases, v0.1.0 through v0.2.2: core dashboard with bar chart and estimation card, collapsible estimation panel with LaTeX-rendered formulas, mobile-first responsive design, dark mode, and a build version/date display baked in at build time. ([#10](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/10))

### Fixed

- **v0.1.2**: The Estimation Card no longer returns early with no details shown when an application's completion date is already past due. ([#5](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/5))
