# Japan Immigration Statistics Dashboard
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/releases)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Build and Deploy to GitHub Pages](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/build.yaml/badge.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/build.yaml) [![Data Watcher](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/watcher.yaml/badge.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/watcher.yaml)

## Overview
A Next.js-based dashboard for visualizing and analyzing application processing statistics at Japan's Regional
Immigration Bureaus. The dashboard provides estimates and visual analytics for application processing
times across different immigration bureaus using a combination of predictive averages and confirmed statistics
reported by the Immigration Services Agency of Japan.

---

## :rocket: Quick Start

### View the Dashboard
Visit the live dashboard at **https://dashboard.retrohazard.jp**

### Develop Locally

```bash
# Clone and setup
git clone https://github.com/RetroHazard/JP_Immigration_Dashboard.git
cd JP_Immigration_Dashboard
npm install

# Start development server
npm run dev
# Open http://localhost:3000
```

For detailed setup instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).

### Documentation
- **[DEVELOPMENT.md](DEVELOPMENT.md)** — Complete development guide (setup, running locally, troubleshooting)
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Technical architecture and design patterns
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — Contribution guidelines and development workflow
- **[CHANGELOG.md](CHANGELOG.md)** — Version history and release notes

---

## :sparkles: Features

### :bar_chart: Data Visualization
Seven interactive charts, each answering a specific question about the data, with per-chart filtering
(bureau and/or application type, where relevant) and a configurable time range.

#### **Intake & Processing**
- **Purpose:** Applications carried over and newly received each month, against the volume the bureaus completed.
- **Features:**
  - Stacked bars for carried-over + newly received applications, with completed volume as a line on the same axis
  - Filterable by bureau and application type
  - Bureau-to-bureau comparison view
  - Configurable time range (6/12/24/36 months, or all)

#### **Application Types**
- **Purpose:** Monthly new submissions broken down by application type.
- **Features:**
  - Click a legend entry to toggle a type's series; the axis rescales to the visible set
  - Filterable by bureau
  - Bureau-to-bureau comparison view
  - Configurable time range

#### **Outcomes**
- **Purpose:** Where applications end up — granted, denied, or otherwise resolved.
- **Features:**
  - Sankey flow from application type into outcome, with an approval-rate gauge for the same selection
  - Filterable by bureau and application type
  - Configurable time range, including a latest-month view

#### **Bureau Share**
- **Purpose:** Each bureau's share of total intake.
- **Features:**
  - Donut chart of the top bureaus by volume, with an explicit "Other" fold for the long tail
  - Filterable by application type
  - Configurable cumulative time range

#### **Category Mix**
- **Purpose:** Every bureau's application-type composition, side by side.
- **Features:**
  - Zoomable hierarchical treemap — click a category to zoom into its bureau breakdown, click the background (or `Esc`) to zoom back out
  - Filterable by bureau
  - Configurable cumulative time range

#### **Processing Efficiency**
- **Purpose:** Completion rate against intake volume, per bureau.
- **Features:**
  - Purpose-built bubble chart: bubble size shows processed volume, position shows intake vs. completion rate
  - Filterable by bureau and application type
  - Configurable cumulative time range

#### **Regional Map**
- **Purpose:** Geographic service coverage and density across Japan.
- **Features:**
  - Interactive choropleth of Japan at the prefectural level, shaded by population density (Statistics Bureau of Japan estimates)
  - Bureau and airport office markers with location-specific tooltips
  - Built-in zoom and pan

---

### :mag: Dynamic Filtering
- Per-chart filter availability (bureau, application type) — only the filters that apply to the active chart are enabled
- One-click filter reset
- Bureau-to-bureau comparison view for charts that support it, hidden below the `md` breakpoint where a side-by-side layout has no room
- Statistics summary on charts
- On-chart series pruning (Application Types legend toggles)

---

### :clock2: Processing Time Estimator
- Smart Estimation Panel:
  - Collapsible sidebar on desktop (collapses to a full-height rail), a bottom sheet on mobile
  - Queue position tracking
  - Historical processing rate analysis (rolling 6-month average)
  - Predictive modeling with a step-by-step calculation breakdown rendered in LaTeX (KaTeX)
    - Inline tooltip reference w/ variable explanations
  - One-click reset
  - Shareable permalink for a filled-out estimate (bureau, application type, and date)
  - Past-due notifications

---

### :pencil: Stats Summary
- At-a-glance totals for the current filter selection: total applications, pending, granted, denied, and approval rate
- Month-over-month delta and a miniature sparkline trend per metric
- Filterable by Immigration Bureau and Application Type
- Adaptive layout — a single row on desktop, a no-scroll mosaic on mobile that never requires horizontal scrolling
- Responsive tooltips for mobile users

---

### :clipboard: Data Table & Export
- Collapsible monthly data table for the current chart selection — also serves as an accessible text alternative to the SVG charts
- One-click CSV export

---

### :globe_with_meridians: Multi-Language Support
- English and Japanese today, switchable from the header (desktop) or the mobile settings drawer
- Structured to add further languages without layout changes

---

### :iphone: Responsive Design
- Mobile-friendly with adaptive breakpoints
- Fluid layout for all screen sizes — no horizontal scrolling anywhere, including the stats summary row
- Mobile settings drawer for theme, language, and the in-app changelog, which live inline in the header on desktop
- Responsive user interface with light/dark mode support

---

## :hammer_and_wrench: Tech Stack

### Frontend:
- `Next.js 15` – React framework with static export
- `React 19` – UI library
- `TypeScript` (strict) – Type-safe JavaScript
- `Tailwind CSS v4` – Utility-first styling with a CSS-variable design-token system ("Civic Glass")
- `shadcn/ui` (vendored) – Radix-based UI primitives (tabs, dialog, sheet, select, tooltip)
- `Bklit UI` (vendored, MIT) – visx-based chart components (line, composed, pie, sunburst, radar, sankey, gauge, choropleth)
- `visx` / `d3` – Chart internals and the custom bubble chart
- `Anime.js v4` – Motion layer (entrances, count-ups, chart transitions) with a single reduced-motion chokepoint
- `nuqs` – URL state (chart tab, filters, time range, compare mode are all shareable links)
- `next-themes` – Flash-free dark/light theme on static export
- `KaTeX` – Mathematical notation rendering in the estimator
- `Lucide` – Icon system
- `Fontsource` – Self-hosted Inter Variable + Noto Sans JP Variable

### DevOps & Automation:
- `GitHub Actions` – CI (lint, typecheck, tests, fixture build) and deploy automation
- `Data Watcher Workflow` – Automated e-Stat data monitoring
- `Build-time data transform` – e-Stat payload flattened and bureau-corrected once at build (~10x smaller client payload)
- `react-build-info` – Build metadata generation

### Hosting:
- `GitHub Pages` – Static SPA Hosting

### Development Tools:
- `Claude Code` – AI-assisted code review and refactoring
- `ESLint` – Code Linting with TypeScript support
- `Prettier` – Code Formatting
- `lockfile-shaker` – Package-lock optimization

---

## :robot: Automated Data Updates

The dashboard automatically monitors and updates immigration statistics from the e-Stat API:

### Data Watcher Workflow
- **Schedule:** Runs daily at 10:05 AM JST from the 23rd-28th of each month
- **Detection:** Compares `SURVEY_DATE` in e-Stat API responses to detect new data releases
- **Auto-Build:** Automatically triggers build and deployment when new data is detected
- **Cache Management:** Maintains efficient GitHub Actions cache, automatically cleaning old entries
- **Smart Scheduling:** Targets e-Stat's typical release window (25th of each month, weekdays only)

---

## :chart_with_upwards_trend: Data Processing

### Data Acquisition:
- **Source:** Official statistics from Japan Immigration Services Agency via [e-Stat API](https://www.e-stat.go.jp/)
- **Automation:** Scheduled monitoring and fetching via GitHub Actions workflows
- **Validation:** Multi-stage validation including:
  - HTTP response status checking
  - JSON structure validation using `jq`
  - Required field verification (`GET_STATS_DATA.STATISTICAL_DATA`)
  - Data freshness checks via `SURVEY_DATE` comparison
- **Caching:** GitHub Actions cache for optimal performance and API rate limiting
- **Error Handling:** Comprehensive failure detection with workflow notifications

### Data Deaggregation:
- Regional Immigration Bureaus (denominated as **出入国在留管理局管内**) are aggregate representations of all data sources in the region; Special Branch Offices which are also responsible for processing are individually noted in the e-Stat data.
- To account for this, aggregated data is restructured within the Regional Bureau dataset once at build time (`scripts/transform-data.mts`), before the client ever loads it. This allows for a more accurate representation of the regional bureau's overall processing capacity and prevents unintentional duplication of data.
####
    - Within the Original Dataset:
        - Tokyo Regional Immigration Bureau (東京出入国在留管理局管内) is inclusive of Shinagawa, Yokohama, Narita Airport, and Haneda Airport.
          - Yokohama's Branch is responsible for the Kanagawa area.
          - The statistics provided for Yokohama, Narita, and Haneda, are removed from the Tokyo Regional Bureau, so that each can be represented uniquely.
        
        - Nagoya Regional Immigration Bureau (名古屋出入国在留管理局管内) is inclusive of Nagoya, and Chubu Airport.
          - The statistics provided for Chubu Airport are removed from the Nagoya Regional Bureau, so that each can be represented uniquely.
        
        - Osaka Regional Immigration Bureau (大阪出入国在留管理局管内) is inclusive of Osaka, Kobe, and Kansai Airport.
          - Kobe's Branch is responsible for the Hyogo area.
          - The statistics provided for Kobe and Kansai Airport are removed from the Osaka Regional Bureau, so that each can be represented uniquely.
        
        - Fukuoka Regional Immigration Bureau (福岡出入国在留管理局管内) is inclusive of Fukuoka, and Naha.
          - Naha's Branch is responsible for the Okinawa area.
          - The statistics provided for Naha are removed from the Fukuoka Regional Bureau, so that each can be represented uniquely.
####

### Runtime Processing:
- **Type Safety:** Full TypeScript implementation in strict mode
- **Centralized Filtering:** Shared `selectData` selector (`src/utils/selectors.ts`), explicit about bureau scope (nationwide, a single bureau, or a per-bureau breakdown) instead of overloading a single "all" value
- **Performance Optimization:**
  - Memoized calculations to prevent unnecessary re-renders
  - Lazy loading of KaTeX library for mathematical formulas
  - Pre-calculated prefecture color scales for map rendering
- **Status Code Constants:** Type-safe constants for all data categorization

### Prediction Model:
- Predicts original queue position based on the average daily rate during the month of application.
- Simulates progression through queue based on a combination of confirmed counts and recent output levels.
- Uses a rolling average (6 months) for dynamic processing calculation.
- Predicts data for months that are yet to be published, using historical data.

### Calculations:
- Application processing rates
- Application intake rates
- Queue position tracking
- Completion date estimation
- Trend analysis

---

## :building_construction: Architecture & Code Quality

### TypeScript Implementation
- **Strict Type Safety:** `strict: true` enabled for comprehensive type checking
- **Custom Type Definitions:** Explicit types for all immigration data structures
- **Zero `any` Usage:** Complete elimination of implicit and explicit `any` types

### Code Organization
- **Shared Hooks & Selectors:** `useImmigrationData` for fetching, `selectData` (`src/utils/selectors.ts`) for consistent, bureau-scope-aware filtering
- **Context Providers:** Theme (via `next-themes`) and locale providers, both with persistence and system-preference fallback
- **Error Boundaries:** Application-level error catching with graceful user feedback
- **Logger Utility:** Environment-aware logging (development-only verbose logs)

### Performance Optimizations
- **React Memoization:** `useMemo` and `useCallback` for expensive calculations
- **Lazy Loading:** Dynamic imports for heavy dependencies (KaTeX ~100KB)
- **Single-Pass Filtering:** Centralized filtering eliminates duplicate operations across all 7 chart components
- **Pre-computed Data:** Color scales and static configurations calculated once at mount

### Build Configuration
- **Static Export:** Next.js configured for SPA output (`output: 'export'`)
- **Custom Build Directory:** Outputs to `build/` for GitHub Pages compatibility
- **Build Metadata:** Automatic version and timestamp injection via `react-build-info`

---

## :handshake: Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Complete contribution guidelines
- Development workflow
- Coding standards and best practices
- Testing requirements
- Pull request process

For questions or to discuss major changes, open an [issue](https://github.com/RetroHazard/JP_Immigration_Dashboard/issues) or [discussion](https://github.com/RetroHazard/JP_Immigration_Dashboard/discussions).

---

## :page_facing_up: License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Alexander Bracken**

---

## :pray: Acknowledgments

- **Data Source:** Japan Immigration Services Agency via [e-Stat](https://www.e-stat.go.jp/)
- **Hosting:** GitHub Pages
- **Built with:** Next.js, React, TypeScript, and the open-source community
