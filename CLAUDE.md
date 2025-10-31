# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js/React dashboard visualizing Japan's immigration bureau application processing statistics. The application displays interactive charts and provides processing time estimates using data from Japan's Immigration Services Agency via the e-Stat API.

**Live Site:** https://dashboard.retrohazard.jp

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack (includes build info generation)
- `npm run build` - Create production build (includes build info generation)
- `npm start` - Build and serve production build locally
- `npm run lint` - Run ESLint for code quality checks

### Testing Commands
- `npm test` - Run all tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Testing Notes
- Test files use `.test.ts` or `.test.tsx` extension
- Mock data available in `src/__mocks__/` directory
- Use `@testing-library/react` for component testing
- Coverage collected from `src/**/*.{ts,tsx}` excluding `src/app/**`

### Important Notes
- All build/dev commands automatically run `react-build-info` first to generate build metadata
- The production build outputs to `build/` directory (not the Next.js default `.next/`)
- `npm install` automatically runs `lockfile-shaker` via postinstall hook (skipped during CI)

## Architecture Overview

### Data Flow Architecture

1. **Data Source**: Immigration statistics from e-Stat API stored in `public/datastore/statData.json`
2. **Data Loading**: `loadLocalData.ts` fetches the static JSON file
3. **Data Correction**: `correctBureauAggregates.ts` deaggregates regional bureau statistics
4. **Data Transformation**: `dataTransform.ts` converts e-Stat format to internal `ImmigrationData` structure
5. **State Management**: `useImmigrationData` hook provides data to components
6. **Visualization**: Chart components consume filtered data

### Critical Data Deaggregation System

The e-Stat data includes aggregate "管内" (regional) bureaus that contain statistics for multiple branch offices. To prevent double-counting, `correctBureauAggregates.ts` implements a non-mutating correction system:

- **Aggregate Bureaus** (defined in `bureauOptions.ts` with `children` array):
  - Shinagawa (101170): Contains Yokohama, Narita Airport, Haneda Airport
  - Osaka (101460): Contains Kansai Airport, Kobe
  - Nagoya (101350): Contains Chubu Airport
  - Fukuoka (101720): Contains Naha

- **Correction Logic**: For aggregate bureaus, `getCorrectedValue()` subtracts all branch office values from the regional total to get the actual main office statistics

- **Performance**: Uses memoized O(1) lookups with coordinate-based indexing

### Key Data Structures

**ImmigrationData** (internal format):
```typescript
{
  month: string;              // "YYYY-MM" format
  bureau: BureauCode;         // Typed bureau code (e.g., "101170")
  type: ApplicationTypeCode;  // Typed application code (e.g., "20" for Extension)
  value: number;              // Count (deaggregated if applicable)
  status: StatusCode;         // Typed status code: "100000" (carried over), "103000" (new), "300000" (processed)
}
```

**Type Safety**: All code fields use compile-time validated types from:
- `src/constants/bureauCodes.ts` - BureauCode type with 16 bureau codes
- `src/constants/applicationTypes.ts` - ApplicationTypeCode type with 6 application types
- `src/constants/statusCodes.ts` - StatusCode type with 7 status codes

### Application Types
Defined in `applicationOptions.ts`:
- `10`: Status Acquisition
- `20`: Extension of Stay
- `30`: Change of Status
- `40`: Permission for Activities
- `50`: Re-entry
- `60`: Permanent Residence

### Bureau Codes and Hierarchy
Defined in `bureauOptions.ts`:
- Each bureau has a code, label, short name, GPS coordinates, and color scheme
- Airports use semi-transparent backgrounds to distinguish from main bureaus
- Bureau colors derived from their prefecture's flag colors

### Processing Time Estimation Algorithm

Located in `calculateEstimates.ts`, the estimation system:

1. **Uses Rolling 6-Month Average**: Always calculates daily processing/intake rates from the most recent 6 months
2. **Queue Position Calculation**:
   - Determines carried-over applications from previous month
   - Estimates applications received/processed up to the application date
   - Calculates initial queue position
3. **Progress Tracking**: Subtracts confirmed and estimated processed applications since submission
4. **Prediction**: Projects completion date based on remaining queue position and daily processing rate
5. **Handles Missing Data**: Simulates monthly queues when actual data unavailable using daily rates

Key variables (exposed in `modelVariables`):
- `C_prev`: Previous month carryover
- `N_app`: New applications by submission date
- `P_app`: Processed applications by submission date
- `R_daily`: Daily processing rate
- `Q_app`: Queue position at application
- `Q_pos`: Current queue position

## Component Structure

### Main Layout
- `App.tsx`: Main layout with responsive mobile/desktop views, theme toggle, chart tabs
- `app/layout.tsx`: Next.js app router layout with metadata
- `app/[[...slug]]/page.tsx` & `client.tsx`: Catch-all route for SPA

### Chart Components (in `components/charts/`)
- `IntakeProcessingBarChart.tsx`: Stacked bar showing carried/new/processed applications
- `CategorySubmissionsLineChart.tsx`: Multi-line chart of submission trends by type
- `BureauDistributionRingChart.tsx`: Doughnut chart showing workload distribution
- `BureauPerformanceBubbleChart.tsx`: Bubble chart for intake vs processing efficiency
- `MonthlyRadarChart.tsx`: Radar chart showing category distributions
- `GeographicDistributionChart.tsx`: Choropleth map with prefecture density and bureau markers

All charts registered in `ChartComponents.tsx` with icon, filter config, and component reference.

### Key Components
- `EstimationCard.tsx`: Processing time estimator with expandable/drawer variants
- `FilterPanel.tsx`: Bureau and application type filters
- `StatsSummary.tsx`: Summary badges showing latest statistics
- `FormulaTooltip.tsx`: LaTeX-rendered tooltips for estimation formulas (uses KaTeX)
- `ErrorBoundary.tsx`: Production error handling with dev mode error details

### Custom Hooks
- `useImmigrationData`: Main data loading and state management hook
- `useChartMonthRange`: Shared month range selection logic for charts (eliminates ~90 lines of duplication)

### Type Definitions
- `src/types/bureau.ts`: Shared BureauOption interface
- Status codes, bureau codes, and application type codes defined as constants (not magic strings)

## Important Patterns

### Static Site Generation
- Configured as SPA with `output: 'export'` in `next.config.ts`
- All data loaded client-side from static JSON
- Deployed to GitHub Pages via GitHub Actions

### Theme System
- Uses Tailwind CSS with dark mode classes
- Theme preference stored in localStorage
- Falls back to system preference on first load

### Filter System
- Charts define their own filter requirements via `filters` config
- `FilterPanel` dynamically shows/hides bureau and app type dropdowns
- Filters passed down from `App.tsx` state

### Error Handling
- `ErrorBoundary` components wrap all major UI sections (charts, EstimationCard, StatsSummary)
- Development mode shows detailed error stack traces
- Production mode shows user-friendly fallback UI with retry button
- Optional error callback prop for future error reporting service integration

### Code Quality Practices
- When writing tests for this project, use Jest with React Testing Library
- Whenever making visual style changes, use TailwindCSS
- Provide full Tailwind class names including dark mode variants (e.g., `bg-blue-500 dark:bg-blue-600`)
- Never use runtime string manipulation for Tailwind classes (breaks purging)

## Data Maintenance

### Updating Statistics
The e-Stat data is cached and validated in the GitHub Actions workflow (`.github/workflows/build.yaml`):
- Data cached using `actions/cache@v4` with hash-based key
- Validation checks JSON structure and required nested objects
- Fresh data fetched if cache invalid or missing
- Requires `ESTAT_APP_ID` secret for API access

### Bureau Configuration Changes
When modifying bureau relationships (adding/removing branches):
1. Update `bureauOptions.ts` `children` arrays
2. The correction system in `correctBureauAggregates.ts` automatically adapts via `AGGREGATE_MAPPING`
3. No changes needed to data transformation logic

## Deployment

- **Platform**: GitHub Pages
- **Trigger**: Manual workflow dispatch
- **Domain**: Custom domain via CNAME (dashboard.retrohazard.jp)
- **Build**: Next.js static export with SPA configuration
- **Secrets Required**: `ESTAT_APP_ID`, `GA_MEASUREMENT_ID`

The build workflow:
1. Installs dependencies with `npm ci`
2. Runs lockfile-shaker
3. Creates/validates cached e-Stat data
4. Builds project with `npm run build`
5. Uploads build artifact
6. Deploys to GitHub Pages

## Test Coverage Status

### Current Coverage: 35.46% overall (315 tests)
- **Utils Module:** 99.44% coverage (173 tests) ✅
- **Hooks Module:** 90.9% coverage (32 tests) ✅
- **Components Module:** 110 tests ✅
  - FilterPanel: 100% coverage (27 tests)
  - EstimationCard: 100% coverage (45 tests)
  - StatsSummary: 100% coverage (38 tests)
  - Chart components: Not tested (optional - data transformation already covered)

All critical business logic is fully tested.