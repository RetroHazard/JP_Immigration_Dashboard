# Changelog

All notable user-facing changes to the Japan Immigration Bureaus Statistics Dashboard are documented in this file, grouped by month. The dashboard's header shows the currently deployed version.

## 2026-07

### Added

- **v0.8.0**: Added a Changelog modal, opened from the version link in the header.
- **v0.7.0**: Added a permalink button to the Processing Time Estimator —
  - Share a filled-out estimate (bureau, application type, and date) via a copyable link
  - Opening a permalink automatically expands the estimator with those filters pre-filled
  ([#45](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/45))

### Fixed

- Fixed aggregate bureaus (Osaka, Fukuoka, Nagoya, Shinagawa) briefly showing inflated processing-time estimates when a branch office's data hadn't been published yet for the period. ([#44](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/44))

## 2026-02

### Added

- Added a friendly error screen instead of a blank page if the app hits an unexpected error. ([#36](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/36))

### Changed

- Improved tooltips: added touch support on mobile, and map tooltips now follow the cursor. ([#39](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/39))

### Fixed

- Fixed the intake/processing bar chart's Y-axis scaling when overlaying processed applications. ([#37](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/37))
- Filter selections now only apply to charts that actually support them, instead of leaking to charts they shouldn't affect. ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

### Security

- Patched a known vulnerability ([CVE-2024-41235](https://github.com/advisories/GHSA-36jr-mh4h-2g58)) in a charting dependency. ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

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
