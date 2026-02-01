# Japan Immigration Statistics Dashboard
[![Version](https://img.shields.io/badge/version-0.5.6-blue.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build and Deploy to GitHub Pages](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/build.yaml/badge.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/build.yaml) [![Data Watcher](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/watcher.yaml/badge.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/watcher.yaml)

## Overview
A Next.js-based dashboard for visualizing and analyzing application processing statistics at Japan's Regional
Immigration Bureaus. The dashboard provides estimates and visual analytics for application processing
times across different immigration bureaus using a combination of predictive averages and confirmed statistics
reported by the Immigration Services Agency of Japan.

---

## :sparkles: Features

### :bar_chart: Data Visualization
This project offers a suite of interactive and configurable charts to analyze data trends and distributions. 
Each chart is designed to provide clear insights while allowing flexibility through filters and customization.

#### **Stacked Bar Chart**
- **Purpose:** Represents intake and processing trends.
- **Features:**
  - Displays:
    - Previously received applications
    - Newly received applications
    - Processed applications per month
  - Filterable by bureau and application type
  - Indexed tooltips for detailed viewing
  - Configurable time range display

#### **Multi-Line Chart**
- **Purpose:** Represents submission trends.
- **Features:**
  - Tracks all category types
  - Filterable by individual bureaus
  - Exclude specific application types via UI
  - Indexed tooltips for detailed viewing
  - Configurable time range display

#### **Ring Chart**
- **Purpose:** Represents distribution of workload.
- **Features:**
  - Visualizes load distribution by application type
  - Exclude specific bureaus via UI
  - Configurable cumulative time range display

#### **Bubble Chart**
- **Purpose:** Measure processing efficiency.
- **Features:**
  - Visualizes monthly intake vs. processing rates
  - Normalized bubble sizes for large datasets
  - Filterable by bureau and application type
  - Clear, concise tooltips
  - Configurable cumulative time range display

#### **Radar Chart**
- **Purpose:** Highlight category spread.
- **Features:**
  - Visualize category distributions
  - Filterable by individual bureaus
  - Configurable cumulative time range display

#### **Choropleth Map**
- **Purpose:** Show service density.
- **Features:**
  - Interactive, topographical map of Japan, at a Prefectural level
  - Prefectures colored based on Service Bureau and overall Density rating
  - Prefecture tooltips with vital statistics
  - Bureau/Airport markers placed via GPS coordinates
  - Bureau tooltips with Service Area statistics

---

### :mag: Dynamic Filtering
- Dynamic filter availability:
  - Immigration bureau selection
  - Application type selection
- Statistics summary on charts
- On-chart series pruning for better insights

---

### :clock2: Processing Time Estimator
- Smart Estimation Panel:
  - Collapsible interface
  - Queue position tracking
  - Historical processing rate analysis
  - Predictive modeling with detailed calculation formulas
    - Tooltip reference /w variable explanations
  - Past-due notifications

---

### :pencil: Summary Badges
- Effortlessly reference the most recent data points
- Filterable by Immigration Bureau and Application Type
- Responsive tooltips for mobile users

---

### :iphone: Responsive Design
- Mobile-friendly with adaptive breakpoints
- Fluid layout for all screen sizes
- Responsive user interface with light/dark mode support

---

## :hammer_and_wrench: Tech Stack

### Frontend:
- `Next.js` – React Framework with static export
- `React` – UI Library
- `TypeScript` – Type-safe JavaScript
- `Chart.js` – Data Visualization (Charts)
- `@nivo/treemap` – Hierarchical Visualizations
- `react-simple-maps` – Geographic Visualizations
- `d3-scale` – Data scaling utilities
- `Tippy.js` – Tooltips
- `KaTeX` – Mathematical Notation Rendering
- `Tailwind CSS` – Utility-first Styling
- `@iconify/react` – Icon Components

### DevOps & Automation:
- `GitHub Actions` – CI/CD Automation
- `Data Watcher Workflow` – Automated e-Stat data monitoring
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
- To account for this, aggregated data is restructured within the Regional Bureau dataset at runtime. This allows for a more accurate representation of the regional bureau's overall processing capacity and prevents unintentional duplication of data.
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
- **Type Safety:** Full TypeScript implementation with `noImplicitAny` enabled
- **Centralized Filtering:** Shared `useFilteredData` hook for consistent data operations
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
- **Strict Type Safety:** Enabled `noImplicitAny` for comprehensive type checking
- **Custom Type Definitions:** Explicit types for all immigration data structures
- **Zero `any` Usage:** Complete elimination of implicit and explicit `any` types

### Code Organization
- **Shared Hooks:** Centralized data manipulation (`useFilteredData`, `useImmigrationData`)
- **Context Providers:** Theme management with localStorage persistence and system preference fallback
- **Error Boundaries:** Application-level error catching with graceful user feedback
- **Logger Utility:** Environment-aware logging (development-only verbose logs)

### Performance Optimizations
- **React Memoization:** `useMemo` and `useCallback` for expensive calculations
- **Lazy Loading:** Dynamic imports for heavy dependencies (KaTeX ~100KB)
- **Single-Pass Filtering:** Centralized filtering eliminates duplicate operations across 6 chart components
- **Pre-computed Data:** Color scales and static configurations calculated once at mount

### Build Configuration
- **Static Export:** Next.js configured for SPA output (`output: 'export'`)
- **Custom Build Directory:** Outputs to `build/` for GitHub Pages compatibility
- **Build Metadata:** Automatic version and timestamp injection via `react-build-info`

---

## :handshake: Contributing

Contributions are welcome! Here's how to get started:

### Before Contributing
1. Check existing [issues](https://github.com/RetroHazard/JP_Immigration_Dashboard/issues) and [pull requests](https://github.com/RetroHazard/JP_Immigration_Dashboard/pulls)
2. For major changes, open an issue first to discuss your proposal
3. Fork the repository and create a feature branch from `main`

### Development Guidelines
- Follow existing code style (Prettier + ESLint configured)
- Write TypeScript with proper types (no `any` types allowed)
- Test your changes across different screen sizes (mobile + desktop)
- Ensure all ESLint checks pass (`npm run lint`)
- Update documentation if adding new features or changing behavior

### Pull Request Process
1. Ensure your code builds successfully (`npm run build`)
2. Update the README.md if your changes affect documentation
3. Provide clear, descriptive commit messages
4. Reference any related issues in your PR description
5. Be responsive to code review feedback

### Code of Conduct
Be respectful, constructive, and collaborative. We're all here to improve immigration data accessibility.

---

## :page_facing_up: License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Copyright (c) 2025 Alexander Bracken**

---

## :pray: Acknowledgments

- **Data Source:** Japan Immigration Services Agency via [e-Stat](https://www.e-stat.go.jp/)
- **Hosting:** GitHub Pages
- **Built with:** Next.js, React, TypeScript, and the open-source community