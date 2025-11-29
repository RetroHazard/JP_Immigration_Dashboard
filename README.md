# Japan Immigration Statistics Dashboard
[![Build and Deploy to GitHub Pages](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/build.yaml/badge.svg)](https://github.com/RetroHazard/JP_Immigration_Dashboard/actions/workflows/build.yaml)

## Overview
A React-based dashboard for visualizing and analyzing application processing statistics at Japan's Regional 
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
- `Node.js` – Runtime
- `TypeScript` – Type-safe JavaScript with strict mode enabled
- `Next.js` – Framework (Static Site Generation)
- `React` – Library
- `Chart.js` – Data Visualization (Charts)
- `react-simple-maps` - Data Visualization (Maps)
- `Tippy.js` – Tooltips
- `Tailwind CSS` – Styling
- `Iconify` – UI Icons
- `KaTeX` – LaTeX Typesetting

### Performance:
- `Web Workers` – Background data transformation
- `IndexedDB` – Client-side caching layer
- `Code Splitting` – On-demand component loading

### DevOps:
- `GitHub Actions` – CI/CD Automation

### Hosting:
- `GitHub Pages` – Static Site Hosting

### Tooling:
- `WebStorm` – IDE
- `Prettier` – Code Formatter
- `ESLint` – Linter (zero warnings)
- `@next/bundle-analyzer` – Bundle size analysis

### Testing:
- `Jest` – Test Runner
- `React Testing Library` – Component Testing
- `@testing-library/jest-dom` – DOM Matchers
- `ts-jest` – TypeScript Support
- `tsd` – Type-level Testing

---

## :chart_with_upwards_trend: Data Processing

### Data Deaggregation:
- Regional Immigration Bureaus (denominated as **出入国在留管理局管内**) are aggregate representations of all data sources in the region; Special Branch Offices which are also responsible for processing are individually noted in the e-Stat data.
- To account for this, aggregated data is restructured within the Regional Bureau dataset at runtime. This allows for a more accurate representation of the regional bureau's overall processing capacity and prevents unintentional duplication of data.
####
    - Within the Original Dataset:
        - Tokyo Regional Immigration Bureau (東京出入国在留管理局管内) is inclusive of Shinagawa, Yokohama, Narita Airport, and Haneda Airport.
          - Yokohama's Branch is responsible for the Kanagawa area.
          - The statistics provided for Yokohama, Narita, and Haneda, are removed from the Tokyo Regional Bureau, so that each can be represented uniquely.
          - Tokyo Regional Immigration Bureau is now represented as 'Shinagawa' in the UI. 

        - Nagoya Regional Immigration Bureau (名古屋出入国在留管理局管内) is inclusive of Nagoya, and Chubu Airport.
          - The statistics provided for Chubu Airport are removed from the Nagoya Regional Bureau, so that each can be represented uniquely.
        
        - Osaka Regional Immigration Bureau (大阪出入国在留管理局管内) is inclusive of Osaka, Kobe, and Kansai Airport.
          - Kobe's Branch is responsible for the Hyogo area.
          - The statistics provided for Kobe and Kansai Airport are removed from the Osaka Regional Bureau, so that each can be represented uniquely.
        
        - Fukuoka Regional Immigration Bureau (福岡出入国在留管理局管内) is inclusive of Fukuoka, and Naha.
          - Naha's Branch is responsible for the Okinawa area.
          - The statistics provided for Naha are removed from the Fukuoka Regional Bureau, so that each can be represented uniquely.
####

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

## :rocket: Performance Optimization

### Hybrid Optimization Strategy
This application implements a two-tier performance optimization combining Web Workers and IndexedDB caching for optimal performance across all visit types.

#### Architecture Overview

**First Visit Flow:**
1. Data loaded from static JSON file (4.09 MB e-Stat data)
2. IndexedDB cache check (cache miss on first visit)
3. Web Worker processes data transformation in background thread
4. Main thread remains responsive during processing
5. Transformed data cached in IndexedDB with 24-hour TTL
6. Data rendered in UI

**Repeat Visit Flow:**
1. IndexedDB returns cached transformed data instantly (<50ms)
2. Skip network fetch and transformation entirely
3. Immediate rendering

#### Performance Metrics

**First Visit:**
- Lighthouse Performance Score: **71**
- Total Blocking Time: **210ms** (50% reduction from baseline)
- First Load JS: **102 kB** (gzipped)
- Main thread stays responsive during data processing

**Repeat Visit (within 24 hours):**
- Lighthouse Performance Score: **95+**
- Total Blocking Time: **~0ms**
- Load Time: **<50ms** (instant from cache)

#### Key Optimizations

**Code Splitting:**
- All 6 chart components lazy-loaded on demand
- Reduces initial bundle size
- Charts load only when user switches tabs

**Background Processing:**
- Web Worker handles data transformation
- 4.09 MB JSON parsing off main thread
- Fallback to synchronous processing for SSR/older browsers

**Client-Side Caching:**
- IndexedDB stores transformed data (24-hour TTL)
- Eliminates network requests on repeat visits
- Automatic cache invalidation

**Resource Optimization:**
- Preconnect/DNS prefetch for external resources
- Tree-shaken Chart.js imports
- O(1) Map-based lookups for bureau data
- Memoized data extraction with custom hooks


---

## :white_check_mark: Testing & Quality Assurance

### Test Coverage
This project maintains comprehensive test coverage for all critical functionality:

- **315 passing tests** across utilities, hooks, and components
- **35.46% overall coverage** with critical paths at 99%+ coverage
- **Automated testing** via GitHub Actions CI/CD pipeline

#### Coverage Breakdown
- **Utils Module**: 99.44% coverage (173 tests)
  - Data transformation and bureau deaggregation
  - Processing time estimation algorithms
  - Data loading and validation
- **Hooks Module**: 90.9% coverage (32 tests)
  - State management and data fetching
- **Components Module**: 100% coverage for key components (110 tests)
  - FilterPanel, EstimationCard, StatsSummary

### Type Safety
The project leverages TypeScript's type system for compile-time safety:

- **Typed constants** for all immigration codes (bureau, application type, status)
- **Strict interfaces** with `BureauCode`, `ApplicationTypeCode`, `StatusCode` types
- **IntelliSense support** for all code values with IDE autocomplete
- **Compile-time validation** catches invalid codes during development

### Type-Level Testing
The project includes comprehensive type-level tests using `tsd`:

- **Compile-time validation** of TypeScript type definitions
- **Type safety verification** for ImmigrationData, BureauOption, and e-Stat types
- **Constant validation** ensures typed constants match their declared types
- **125+ type assertions** covering all critical type definitions

For detailed testing documentation, see [`docs/TESTING.md`](docs/TESTING.md).

---

## :file_folder: Data Source
This project uses official statistics provided by the Immigration Services Agency of Japan.
Data acquisition is performed via the [e-Stat API](https://www.e-stat.go.jp/).

---

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss proposed changes.
