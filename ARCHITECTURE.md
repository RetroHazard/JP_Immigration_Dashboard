# Architecture Guide

Overview of the Japan Immigration Statistics Dashboard's architecture, design patterns, and key components.

## Table of Contents

- [High-Level Overview](#high-level-overview)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Data Processing Pipeline](#data-processing-pipeline)
- [Performance Optimizations](#performance-optimizations)
- [Type Safety](#type-safety)
- [Design Patterns](#design-patterns)
- [File Organization Philosophy](#file-organization-philosophy)

## High-Level Overview

The dashboard is a **static single-page application (SPA)** built with Next.js that runs entirely in the browser. It processes and visualizes immigration statistics from the Japanese e-Stat API.

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (Client-Side)                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐    ┌──────────────────────┐      │
│  │  React App      │    │  public/data/        │      │
│  │  (src/)         │───→│  stats.json          │      │
│  └─────────────────┘    └──────────────────────┘      │
│         │                                              │
│         ├──→ Filter Panel (User Interaction)           │
│         ├──→ 6 Chart Components (Visualization)        │
│         ├──→ Processing Time Estimator                 │
│         └──→ Statistics Summary                        │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Build-Time (GitHub Actions)                            │
├─────────────────────────────────────────────────────────┤
│  1. e-Stat API → Fetch latest data                     │
│  2. Data Validation & Processing                       │
│  3. Update stats.json                                  │
│  4. Next.js Build → Static HTML/JS/CSS                │
│  5. Deploy to GitHub Pages                             │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Data Loading

```
User visits dashboard
        ↓
React app mounts
        ↓
useImmigrationData hook runs
        ↓
Fetches public/data/stats.json
        ↓
Parses and stores in component state
        ↓
Component re-renders with data
```

### 2. User Interaction

```
User selects filters (bureau, application type)
        ↓
State updates (via FilterPanel)
        ↓
useFilteredData hook re-runs
        ↓
Filters dataset based on selections
        ↓
Charts re-render with filtered data
```

### 3. Calculations

```
Filtered data enters chart component
        ↓
Chart-specific calculations (sum, average, etc.)
        ↓
Visualization libraries (Chart.js, Nivo, etc.) render
        ↓
User sees interactive charts
```

## Component Architecture

### Hierarchical Structure

```
App
├── Layout (Header, Footer)
├── ErrorBoundary
├── ThemeProvider (Dark/Light Mode)
├── FilterPanel
├── StatsBadge (Summary)
├── Charts Container
│   ├── StackedBarChart
│   ├── MultiLineChart
│   ├── RingChart
│   ├── BubbleChart
│   ├── RadarChart
│   └── ChoroplethMap
└── ProcessingTimeEstimator
```

### Key Components

#### **Page Component** (`src/app/[[...slug]]/page.tsx`)

The root component that:
- Initializes the app layout
- Fetches immigration data
- Manages filter state
- Coordinates all child components
- Handles URL parameters for estimator permalinks

#### **FilterPanel** (`src/components/common/FilterPanel.tsx`)

Controls for filtering data:
- Bureau selection (multi-select)
- Application type selection (multi-select)
- Dynamically updates based on available data
- Filters are applied across all connected charts

#### **Chart Components** (`src/components/charts/`)

Six independent visualization components:

| Component | Library | Purpose |
|-----------|---------|---------|
| StackedBarChart | Chart.js | Intake/Processing trends |
| MultiLineChart | Chart.js | Submission trends over time |
| RingChart | Nivo | Application type distribution |
| BubbleChart | Chart.js | Intake vs. Processing efficiency |
| RadarChart | Chart.js | Category spread by bureau |
| ChoroplethMap | react-simple-maps | Geographic distribution |

Each chart:
- Receives pre-filtered data as props
- Manages its own visualization state
- Is self-contained and reusable

#### **ProcessingTimeEstimator** (`src/components/common/ProcessingTimeEstimator.tsx`)

Interactive queue position estimator:
- Accepts user input (bureau, application type, submission date)
- Calls estimation functions
- Displays detailed calculations with KaTeX formulas
- Generates shareable permalinks

#### **StatsBadge** (`src/components/common/StatsBadge.tsx`)

Summary statistics display:
- Shows key metrics (last updated, bureau data points)
- Updates based on filters
- Responsive layout for mobile

### Layout Components

#### **Header** (`src/components/layouts/Header.tsx`)
- Navigation and branding
- Version display (clickable for changelog)
- Dark/light mode toggle

#### **Footer** (`src/components/layouts/Footer.tsx`)
- Attribution and links
- Data source credit (e-Stat)

#### **ErrorBoundary** (`src/components/common/ErrorBoundary.tsx`)
- Catches React errors
- Displays user-friendly error message
- Prevents blank page on crash

## State Management

### Context API for Theme

```typescript
// ThemeContext provides dark/light mode state
{
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

// Persisted to localStorage
// Falls back to system preference (prefers-color-scheme)
```

### Component-Level State

The main page component manages:

```typescript
interface AppState {
  immigrationData: ImmigrationData[] | null
  selectedBureaus: string[]
  selectedStatuses: string[]
  estimatorParams: {
    bureau: string
    status: string
    date: Date
  }
  loading: boolean
  error: Error | null
}
```

### No Redux or Complex State Management

**Design Decision:** The app uses React's built-in state and hooks because:
1. Data flow is unidirectional (top-down)
2. Most state is derived from filters + raw data
3. Performance is sufficient without memoization middleware
4. Simpler codebase to maintain and understand

## Data Processing Pipeline

### 1. Raw Data Structure

```json
{
  "data": [
    {
      "date": "2026-07-01",
      "bureau": "Tokyo",
      "status": "PROCESSING",
      "count": 1234,
      "category": "Work Visa",
      "averageProcessingDays": 45
    }
  ]
}
```

### 2. Data Deaggregation

Some bureaus (Tokyo, Osaka, Nagoya, Fukuoka) are aggregates that include branch office data. At runtime:

1. Identify aggregate bureaus
2. Subtract branch office data from the aggregate
3. Preserve branch offices as separate entities
4. Result: Accurate per-bureau representation

**Code:** `src/utils/data-processing.ts` → `deaggregateData()`

### 3. Filtering

`useFilteredData` hook applies:
- Bureau filter (exclude unselected bureaus)
- Status/Category filter (exclude unselected types)
- Results in memo-ized filtered dataset

### 4. Chart-Specific Calculations

Each chart performs its own calculations:

| Chart | Calculation |
|-------|------------|
| StackedBarChart | Group by month, sum by status |
| MultiLineChart | Group by date, aggregate by category |
| RingChart | Sum by category, calculate percentages |
| BubbleChart | Calculate intake/processing ratios |
| RadarChart | Normalize by max value |
| ChoroplethMap | Aggregate by prefecture |

### 5. Estimation Model

For processing time prediction:

```
Input: bureau + status + submission date
   ↓
1. Get historical daily rate (last 6 months average)
   ↓
2. Calculate estimated queue position at submission date
   ↓
3. Project through current month's processing rate
   ↓
4. Output: Estimated completion date + confidence
```

**Code:** `src/utils/estimation.ts`

## Performance Optimizations

### Memoization

```typescript
// Prevent unnecessary re-calculations
const filteredData = useMemo(() => {
  return rawData.filter(...);
}, [rawData, selectedFilters]);

// Prevent unnecessary re-renders of child components
const memoizedCallback = useCallback(() => {
  handleFilter(value);
}, [value]);
```

### Lazy Loading

Heavy dependencies loaded only when needed:

```typescript
// KaTeX is ~100KB, loaded dynamically
const KaTeX = dynamic(() => import('react-katex'));
```

### Single-Pass Filtering

All charts use the same filtered dataset:
- Avoid filtering 6 different times
- One call to `useFilteredData`
- Distribute to 6 chart components

### Pre-Computed Values

Color scales and constants calculated once:

```typescript
// Calculated at component mount, not on every render
const prefectureColors = usePrefectureColors(data);
```

### Production Build

```bash
npm run build
```

Outputs optimized files:
- Minified JavaScript (~150KB gzipped)
- Tree-shaken unused code
- Static site (no server overhead)
- Fast GitHub Pages CDN delivery

## Type Safety

### Strict TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Zero `any` Policy

**No implicit `any`** — All types explicitly defined:

```typescript
// Define types for all data structures
interface ImmigrationData {
  date: string
  bureau: string
  status: StatusCode
  count: number
  category: string
  averageProcessingDays: number
}

// Use in functions
function processData(data: ImmigrationData[]): ProcessedData[] {
  // ...
}
```

### Custom Type Definitions

- **src/constants/types.ts** — Shared interfaces
- **src/constants/bureaus.ts** — Bureau constants with types
- **src/constants/statuses.ts** — Status codes with types

## Design Patterns

### Custom Hooks

**useImmigrationData** — Data fetching
```typescript
const data = useImmigrationData();
```

**useFilteredData** — Filtering logic
```typescript
const filtered = useFilteredData(data, selectedBureaus, selectedStatuses);
```

**useTheme** — Theme management
```typescript
const { theme, toggleTheme } = useTheme();
```

### Render Props (Minimal)

Most components use direct props, not render props, to keep the codebase simple.

### Composition

Charts are composed of:
1. **Data Processing** — Filter and transform
2. **Calculation** — Compute chart-specific metrics
3. **Visualization** — Render using library
4. **Interaction** — Handle user events

### Error Boundaries

Top-level `ErrorBoundary` catches:
- Rendering errors in child components
- Broken dependencies
- Type errors at runtime

## File Organization Philosophy

### Principle: Colocate Related Code

```
components/
├── charts/
│   ├── StackedBarChart.tsx        # Component + styling
│   ├── StackedBarChart.test.tsx    # Tests for this chart
│   └── hooks/
│       └── useChartData.ts         # Chart-specific hook
```

### Principle: Shared Code in Utils/Hooks

Code used by multiple components goes to:
- `src/hooks/` — Shared React hooks
- `src/utils/` — Pure utility functions
- `src/constants/` — Constants and types

### Principle: Minimal Abstraction

No unnecessary abstractions. A function isn't extracted until it's:
1. Shared by multiple components
2. Complex enough to warrant testing
3. Likely to change independently

## Key Architectural Decisions

### Why Static Export?

- **Simplicity** — No backend server needed
- **Performance** — Fast CDN delivery via GitHub Pages
- **Reliability** — No server downtime
- **Cost** — Free hosting on GitHub Pages

### Why TypeScript Everywhere?

- **Developer Experience** — IDE auto-complete and type hints
- **Bug Prevention** — Catch errors at compile-time
- **Refactoring Safety** — Type changes caught globally
- **Documentation** — Types serve as inline documentation

### Why No State Management Library?

- **Unnecessary Complexity** — Simple unidirectional data flow
- **Learning Curve** — Easier for new contributors
- **Bundle Size** — No Redux/Zustand overhead
- **Performance** — React's built-in state is sufficient

### Why Chart.js over D3?

- **Simpler API** — Easier to implement and maintain
- **Good for Common Charts** — Stacked bars, lines, radar, bubble
- **Less Code** — D3 requires more boilerplate
- **Performance** — Efficient rendering for our use case

### Why Nivo for TreeMap?

- **Specialized** — Purpose-built for hierarchical data
- **Responsive** — Handles mobile automatically
- **Interactive** — Built-in tooltips and interactions
- **Less Code** — Compared to building from scratch

## Testing Strategy

### Unit Tests for Logic

```typescript
// Test pure functions
test('calculateAverageProcessingRate calculates correctly', () => {
  const data = [/* ... */];
  const result = calculateAverageProcessingRate(data);
  expect(result).toBe(expectedValue);
});
```

### Integration Tests for Components

```typescript
// Test component behavior
test('FilterPanel filters data when selection changes', () => {
  render(<FilterPanel {...props} />);
  userEvent.click(screen.getByLabelText('Tokyo'));
  expect(onFilterChange).toHaveBeenCalled();
});
```

### No E2E Tests Currently

**Reason:** Difficult to test in CI without real data, and most logic is unit-testable.

## Future Architecture Improvements

1. **Testing** — Increase test coverage for edge cases
2. **Performance** — Monitor Core Web Vitals, optimize if needed
3. **Accessibility** — More ARIA labels and keyboard navigation
4. **Documentation** — Inline code comments for complex logic
5. **Caching** — Service Worker for offline support

## Glossary

- **Bureau** — Regional Immigration Bureau (e.g., Tokyo, Osaka)
- **Status** — Application processing status (e.g., "Processing", "Approved")
- **Aggregate Bureau** — Bureau with branch offices (data includes branches)
- **Branch Office** — Sub-bureau reporting separately (e.g., Yokohama under Tokyo)
- **e-Stat** — Official Japanese statistics API
- **SURVEY_DATE** — Date of data collection in e-Stat

---

For questions about specific components or design decisions, check the code comments or open a [GitHub discussion](https://github.com/RetroHazard/JP_Immigration_Dashboard/discussions).
