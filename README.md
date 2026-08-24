# Japan Immigration Statistics Dashboard
[![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/releases)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Deploy](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/deploy.yaml/badge.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/deploy.yaml) [![Verify](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/verify.yaml/badge.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/verify.yaml) [![Data Watcher](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/watcher.yaml/badge.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/watcher.yaml)

## Overview
A Next.js-based dashboard for visualizing and analyzing Japan's immigration statistics, published by the
Immigration Services Agency of Japan. Two independent datasets sit behind a single switch: **Application
Processing**, which provides estimates and visual analytics for application processing times across Japan's
Regional Immigration Bureaus using a combination of predictive averages and confirmed statistics; and
**Resident Population**, which visualizes who actually lives in Japan and on what visa, by nationality and
residence status over time.

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
Thirteen interactive charts across two datasets, each answering a specific question about the data, with
per-chart filtering and a configurable time range.

#### Application Processing
Seven charts, filterable by bureau and/or application type where relevant.

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
  - Ranked lollipop: bureaus sorted by completion rate, with stem weight carrying intake volume and a dashed guide at the nationwide rate
  - Hover card (rows are also keyboard-focusable) with each bureau's received/processed/completion figures
  - Filterable by bureau and application type
  - Configurable cumulative time range

#### **Regional Map**
- **Purpose:** Geographic service coverage and density across Japan.
- **Features:**
  - Interactive choropleth of Japan at the prefectural level, shaded by population density (Statistics Bureau of Japan estimates)
  - Bureau and airport office markers with location-specific tooltips
  - Built-in zoom and pan

#### Resident Population
Six charts answering a different question from the rest of the dashboard: not how fast applications are
processed, but who actually lives in Japan and on what visa — 202 nationalities across 43 residence statuses
(rolled up into 6 purpose-of-stay groups), every half-year since December 2012. Filterable by world region
and/or nationality where relevant, with a region-to-nationality cascade; charts either sum over a time window
or show a single half-yearly snapshot, picked with the same range control.

#### **Population Growth**
- **Purpose:** How the total resident population has grown over time, and who's driving it.
- **Features:**
  - Stacked bars of total residents per half-year since 2012, toggleable between purpose-of-stay and world-region breakdowns
  - Event markers for policy changes and the COVID-19 dip
  - Filterable by region and nationality

#### **Origins Over Time**
- **Purpose:** How the largest nationalities have trended across the whole period.
- **Features:**
  - Line chart of the largest nationalities or status groups over time
  - Filterable by region and status group

#### **Resident Flows**
- **Purpose:** How nationality and residence status cross-tabulate, for a single point in time.
- **Features:**
  - Three-column sankey: world region → country → purpose-of-stay group
  - Top-N country selection with an "other" bucket for the long tail
  - Snapshot period picker; filterable by region, nationality, and status group

#### **Residence Status Mix**
- **Purpose:** A nationality's visas broken down by purpose of stay, for a single point in time.
- **Features:**
  - Sunburst: purpose-of-stay groups as the inner ring, individual statuses as the outer, click to zoom
  - Snapshot period picker; filterable by region and nationality

#### **World Origins**
- **Purpose:** Where residents come from, geographically.
- **Features:**
  - World map shaded by resident count on a log scale
  - Snapshot period picker; filterable by region and status group

#### **Biggest Movers**
- **Purpose:** Which nationalities gained or lost the most residents between two points in time.
- **Features:**
  - Diverging bar chart of the largest gains and losses between range endpoints
  - Configurable time range (3/5/10 years, or all); filterable by region and status group

---

### :mag: Dynamic Filtering
- Per-chart filter availability (bureau, application type) — only the filters that apply to the active chart are enabled
- Global airport toggle — a one-click filter that removes the airport branch offices (Narita, Haneda, Kansai, Chubu) from every chart, stat, and table, subtracting their volumes from the nationwide totals rather than merely hiding them
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
    - Five dependency-ordered steps: throughput baseline, queue at application, processed since application, queue position and remaining days, completion offset and spread
    - Every derived value shows its own working, and shows the branch the estimate actually took where the model has more than one
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

### :globe_with_meridians: Localization *(12 languages)*
- Every string in the interface — text, ARIA labels, chart legends, tooltips, table headers, empty and error states — comes from a single catalogue file per language, so **adding a language means writing one file** and touching no components (see [`src/i18n/README.md`](src/i18n/README.md))
- Numbers, percentages, and dates follow the active locale, including chart axis ticks and tooltips; counted phrases use real plural rules rather than an English "s"
- A partial translation is safe to ship: anything a language leaves out falls back to English rather than rendering blank
- **Chinese (Simplified and Traditional), English, French, German, Italian, Japanese, Korean, Portuguese, Spanish, Tagalog, and Vietnamese are all complete** — Japanese, Korean, and Chinese write bureau and prefecture names in their own script rather than a romanization; Portuguese follows European usage (pt-PT) rather than Brazilian. The language switcher is live in the header and the mobile settings drawer, and a visitor whose browser asks for one of these lands on it
- Bureaus and application types each carry three widths (`.label`, `.compact`, `.short`) so an office's full official name can appear where there's room without collapsing the dense charts, where several offices would otherwise truncate to the same prefix

---

### :iphone: Responsive Design
- Mobile-friendly with adaptive breakpoints
- Fluid layout for all screen sizes — no horizontal scrolling anywhere, including the stats summary row
- Mobile settings drawer for language, theme, and the in-app changelog, which live inline in the header on desktop
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
- `visx` – Used internally by the vendored Bklit charts (not by the two hand-rolled custom charts, Category Mix Treemap and Processing Efficiency, which use no charting library / `d3-scale` respectively)
- `Anime.js v4` – App-level motion layer (entrances, count-ups, chart transitions) with a single reduced-motion chokepoint (`src/lib/motion.ts`); the vendored Bklit charts animate internally via `motion` (motion/react) instead, with their own independent reduced-motion handling
- `@number-flow/react` – Animated number counters inside the Bklit charts' gauge/ring/pie centers (StatCard uses its own Anime.js-based `useCountUp` instead)
- `nuqs` – URL state (chart tab, filters, time range, compare mode are all shareable links)
- `next-themes` – Flash-free dark/light theme on static export
- `KaTeX` – Mathematical notation rendering in the estimator
- `Lucide` – Icon system
- `Fontsource` – Self-hosted Inter Variable + Noto Sans JP Variable
- `@next/third-parties` (Google Analytics) – Loaded only when a `GA_MEASUREMENT_ID` is configured at build time

### DevOps & Automation:
- `GitHub Actions` – CI (lockfile check, lint, typecheck, tests, fixture build) and deploy automation, sharing one reusable `verify.yaml` so pull requests and publishes run identical checks
- `Continuous deployment` – Pushes to `main` that touch the site (source, assets, build config, changelog) publish to GitHub Pages automatically; documentation-only commits do not
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
- **Schedule:** Runs daily at 10:05 AM JST, year-round — not just around the expected release window, so it also catches retroactive corrections e-Stat occasionally publishes mid-month
- **Probe, don't download:** Each run asks e-Stat for a single row per table, which returns the table's `SURVEY_DATE` in a couple of kilobytes. On a normal day that is the whole run — the full payloads, hundreds of thousands of rows, are downloaded only once something has actually moved
- **Detection:** Compares each table's `SURVEY_DATE` against the baseline recorded when it was last published, to detect new or corrected releases
- **Every table, one run:** Every source table is checked on each run and any one of them moving triggers a deploy — at which point all of them are re-downloaded together. They share a single cache entry, so a deploy can never pair a fresh copy of one with a stale copy of another
- **Conditional Publish:** A build and deploy is only triggered when a `SURVEY_DATE` has actually changed — most daily runs find nothing new and exit without publishing anything. When it does change, the watcher calls the deploy workflow directly, so the check and the publish are one linked run
- **Cache Management:** The watcher owns the e-Stat cache, saving under a key derived from the payloads' content hash and pruning superseded entries; the deploy only reads it. Reading the cache daily is also what keeps it from being evicted
- **Dataset-driven:** The tables come from a single manifest (`scripts/datasets.mjs`). Adding one is a manifest entry plus a transform — no workflow changes

---

## :chart_with_upwards_trend: Data Processing

### Data Sources:

Two independent e-Stat tables, published by the Japan Immigration Services Agency, each with its own dashboard behind the **Application Processing / Resident Population** switch:

| | Application Processing | Resident Population |
|---|---|---|
| e-Stat table | `0003449073` | `0004019020` (在留外国人統計 表01) |
| Measures | applications received and processed | people resident, at a point in time |
| Dimensions | bureau × application type × status | nationality/region × residence status |
| Cadence | monthly | half-yearly (半期), each June and December |
| Coverage | rolling | 2012-12 onward |

They share no dimension, which is why they are separate views rather than combined ones: nothing in the residents table can be broken down by bureau, and nothing in the processing table can be broken down by nationality.

### Data Acquisition:
- **Source:** Official statistics from Japan Immigration Services Agency via [e-Stat API](https://www.e-stat.go.jp/)
- **Pagination:** `getStatsData` caps a response at 100,000 rows and reports the continuation offset as `RESULT_INF.NEXT_KEY`. The residents table is roughly twice that, so `scripts/fetch-estat-data.mjs` pages until `NEXT_KEY` is gone, merges, and asserts the merged row count against `TOTAL_NUMBER` — a short read otherwise arrives as a valid, complete-looking payload holding half the table
- **Automation:** Scheduled monitoring and fetching via GitHub Actions workflows, running the same script a developer runs locally
- **Validation:** Multi-stage validation including:
  - HTTP response status checking, with a bounded retry budget
  - Required field verification (`GET_STATS_DATA.STATISTICAL_DATA`), since the API reports errors as a 200 carrying an error envelope
  - Merged row count asserted against `RESULT_INF.TOTAL_NUMBER`, re-checked at build time before the transform runs
  - Data freshness checks via `SURVEY_DATE` comparison, which fails loudly rather than reading a missing field as "no change"
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

### Residents Data Corrections:

The Resident Population table needs three corrections of its own, all applied once at build time (`scripts/transform-data.mts`):

- **Residence-status parentage.** e-Stat publishes the 技能実習 (Technical Intern Training) sub-statuses with `@parentCode 1260` — 特定技能合計, Specified Skilled Worker. Taking that at face value roughly triples one category and empties the other. The five 身分・地位 statuses (永住者, 日本人の配偶者等, 永住者の配偶者等, 定住者, 特別永住者) carry no parent at all. The corrected hierarchy is declared in `src/constants/residenceStatuses.ts` rather than read from the payload.
- **Nested 「うち」 rows.** うち中国〔香港〕/〔その他〕 and うち英国〔香港〕 are contained in their parent country's figure and would double-count if summed, so they are dropped. 韓国・朝鮮 looks like the same case but is not: it is the pre-2015 combined Korea series, and its periods do not overlap 韓国/朝鮮. It is kept, and the time-series views fold the three back into one line so the 2015 recategorization doesn't read as half a million people leaving.
- **Rollups and zeros.** Every 総数/合計 row is the sum of its own children and is recomputed client-side instead of shipped; e-Stat emits a row per (status, nationality) pair whether or not anyone holds it, and about 60% are zero. Dropping both takes ~191,000 rows to ~42,000. `verifyResidentTotals` then re-adds the kept leaves on **both** axes and compares them against e-Stat's own published totals — a mismatch means the classification has drifted and would produce a chart that looks fine and is quietly wrong, so it fails the build.

Country and continent names are not translated by hand: `src/constants/nationalities.ts` carries ISO 3166-1 codes (and UN M49 codes for the six continents), and `Intl.DisplayNames` resolves them per locale. Only the five rows with no such identity — 朝鮮, 韓国・朝鮮, セルビア・モンテネグロ, ユーゴスラヴィア, 無国籍 — have catalogue entries.
        
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
- **Zero `any` Usage in App Code:** No implicit or explicit `any` in `src/` outside the vendored Bklit library, which retains a handful of internal `any`s (with upstream lint-ignore comments) carried over from its own source

### Code Organization
- **Shared Hooks & Selectors:** `useImmigrationData` for fetching, `selectData` (`src/utils/selectors.ts`) for consistent, bureau-scope-aware filtering
- **Context Providers:** Theme (via `next-themes`) and locale providers, both with persistence; the locale provider also carries the translation and formatting API (`t`, `tPlural`, `formatters`)
- **Error Boundaries:** Application-level error catching with graceful user feedback
- **Logger Utility:** Environment-aware logging (development-only verbose logs)

### Performance Optimizations
- **React Memoization:** `useMemo` and `useCallback` for expensive calculations
- **Lazy Loading:** Dynamic imports for heavy dependencies (KaTeX ~100KB)
- **Single-Pass Filtering:** Centralized filtering eliminates duplicate operations across all 13 chart components in both datasets
- **Pre-computed Data:** Color scales and static configurations calculated once at mount

### Build Configuration
- **Static Export:** Next.js configured for SPA output (`output: 'export'`)
- **Custom Build Directory:** Outputs to `build/` for GitHub Pages compatibility
- **Custom Domain:** `public/CNAME` is committed, so the static export always carries the domain into the published artifact
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
