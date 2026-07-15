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

### Application Architecture

```mermaid
graph TB
    subgraph "Build-Time (GitHub Actions)"
        ESTAT["e-Stat API"]
        FETCH["Fetch & Validate"]
        STATS["stats.json"]
        BUILD["Next.js Build"]
        DEPLOY["GitHub Pages"]
        
        ESTAT -->|Daily| FETCH
        FETCH -->|Process| STATS
        STATS -->|Reference| BUILD
        BUILD -->|Deploy| DEPLOY
    end
    
    subgraph "Browser (Runtime)"
        USER["User"]
        APP["React App"]
        LOAD["Load stats.json"]
        RENDER["Render Components"]
        
        USER -->|Interact| APP
        APP -->|Fetch| LOAD
        LOAD -->|Process| RENDER
    end
    
    DEPLOY -->|Serve| APP
```

### Application Runtime Flow

```mermaid
graph LR
    DATA["📊 stats.json<br/>Raw Data"] 
    HOOK["🪝 useImmigrationData<br/>Load & Parse"]
    FILTER["🔍 useFilteredData<br/>Filter by Selection"]
    CALC["⚙️ Chart Calculations<br/>Aggregate & Normalize"]
    VIZ["📈 Visualization<br/>Chart.js / Nivo"]
    
    DATA --> HOOK
    HOOK --> FILTER
    FILTER --> CALC
    CALC --> VIZ
```

## Data Flow

### 1. Initial Page Load

```mermaid
sequenceDiagram
    participant User
    participant React
    participant Hook as useImmigrationData
    participant JSON as stats.json
    participant State
    participant Charts
    
    User->>React: Visit dashboard
    activate React
    React->>Hook: Mount & call hook
    activate Hook
    Hook->>JSON: Fetch data
    activate JSON
    JSON-->>Hook: Return JSON
    deactivate JSON
    Hook->>State: Parse & store
    deactivate Hook
    React->>Charts: Render with data
    activate Charts
    Charts-->>User: Display charts
    deactivate Charts
    deactivate React
```

### 2. User Interaction (Filter Selection)

```mermaid
sequenceDiagram
    participant User
    participant FilterPanel
    participant State
    participant useFilteredData
    participant Charts
    
    User->>FilterPanel: Click bureau filter
    FilterPanel->>State: Update selectedBureaus
    State->>useFilteredData: Re-run memo
    activate useFilteredData
    useFilteredData->>useFilteredData: Filter data
    useFilteredData-->>State: Return filtered data
    deactivate useFilteredData
    State->>Charts: Pass filtered data
    Charts->>Charts: Re-render
    Charts-->>User: Updated visualizations
```

### 3. Chart Rendering

```mermaid
graph TD
    FILTERED["Filtered Data<br/>Bureau + Status"]
    STACK["StackedBarChart<br/>Group by month"]
    LINE["MultiLineChart<br/>Group by date"]
    RING["RingChart<br/>Sum by category"]
    BUBBLE["BubbleChart<br/>Calc ratios"]
    RADAR["RadarChart<br/>Normalize"]
    MAP["ChoroplethMap<br/>Aggregate by pref"]
    
    FILTERED --> STACK
    FILTERED --> LINE
    FILTERED --> RING
    FILTERED --> BUBBLE
    FILTERED --> RADAR
    FILTERED --> MAP
    
    STACK -.->|Render| VIZ1["Chart.js"]
    LINE -.->|Render| VIZ2["Chart.js"]
    RING -.->|Render| VIZ3["Nivo"]
    BUBBLE -.->|Render| VIZ4["Chart.js"]
    RADAR -.->|Render| VIZ5["Chart.js"]
    MAP -.->|Render| VIZ6["react-simple-maps"]
```

## Component Architecture

### Component Hierarchy

```mermaid
graph TD
    APP["🏠 Page<br/>page.tsx"]
    
    APP --> LAYOUT["📐 Layout<br/>Header + Footer"]
    APP --> ERROR["🚨 ErrorBoundary<br/>Error Catching"]
    APP --> THEME["🎨 ThemeProvider<br/>Light/Dark Mode"]
    APP --> FILTER["🔍 FilterPanel<br/>Bureau & Status"]
    APP --> STATS["📊 StatsBadge<br/>Summary Stats"]
    APP --> CHARTS["📈 Charts Container"]
    APP --> ESTIMATOR["⏱️ ProcessingTimeEstimator<br/>Queue Predictor"]
    
    CHARTS --> STACKED["📊 StackedBarChart"]
    CHARTS --> MULTILINE["📈 MultiLineChart"]
    CHARTS --> RING["🍩 RingChart"]
    CHARTS --> BUBBLE["🫧 BubbleChart"]
    CHARTS --> RADAR["🔷 RadarChart"]
    CHARTS --> MAP["🗾 ChoroplethMap"]
    
    style APP fill:#4CAF50,color:#fff
    style LAYOUT fill:#2196F3,color:#fff
    style ERROR fill:#F44336,color:#fff
    style THEME fill:#FF9800,color:#fff
    style FILTER fill:#9C27B0,color:#fff
    style CHARTS fill:#00BCD4,color:#fff
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

### State Architecture

```mermaid
graph TD
    PAGE["Page Component<br/>Main State Hub"]
    
    DATA["🗄️ immigrationData<br/>Raw dataset<br/>from stats.json"]
    
    FILTERS["🔍 Filters<br/>selectedBureaus[]<br/>selectedStatuses[]"]
    
    THEME["🎨 ThemeContext<br/>theme: light|dark<br/>persisted to localStorage"]
    
    ESTIMATOR["⏱️ Estimator<br/>bureau, status, date<br/>in URL params"]
    
    UI["UI State<br/>loading, error"]
    
    PAGE --> DATA
    PAGE --> FILTERS
    PAGE --> THEME
    PAGE --> ESTIMATOR
    PAGE --> UI
    
    DATA -->|memo| FILTERED["🔄 useFilteredData<br/>Apply filters"]
    FILTERS -->|trigger| FILTERED
    FILTERED -->|passed to| CHARTS["6 Chart Components"]
    
    style PAGE fill:#4CAF50,color:#fff
    style DATA fill:#2196F3,color:#fff
    style FILTERS fill:#9C27B0,color:#fff
    style THEME fill:#FF9800,color:#fff
    style CHARTS fill:#00BCD4,color:#fff
```

### Why No Redux/Zustand?

**Design Decision:** React's built-in state + hooks is sufficient because:

1. **Simple Data Flow** — Unidirectional: Data → Filter → Calculate → Render
2. **Localized Updates** — Most state changes are isolated to a few components
3. **Performance** — Memoization (`useMemo`, `useCallback`) is sufficient
4. **Reduced Complexity** — Smaller learning curve for contributors
5. **Bundle Size** — No additional dependency overhead

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

### 2. Data Processing Pipeline

```mermaid
graph LR
    FETCH["📥 Fetch stats.json<br/>useImmigrationData"]
    PARSE["🔍 Parse JSON<br/>Validate structure"]
    DEAGG["➖ Deaggregate<br/>Split branches from<br/>regional bureaus"]
    FILTER["🔑 Apply Filters<br/>useFilteredData<br/>Bureau + Status"]
    CACHE["💾 Memoize<br/>useMemo hook<br/>prevent re-calc"]
    
    FETCH --> PARSE
    PARSE --> DEAGG
    DEAGG --> FILTER
    FILTER --> CACHE
    
    CACHE -->|to charts| STACKED["StackedBarChart<br/>Group by month"]
    CACHE -->|to charts| LINE["MultiLineChart<br/>Group by date"]
    CACHE -->|to charts| RING["RingChart<br/>Sum & %"]
    CACHE -->|to charts| BUBBLE["BubbleChart<br/>Calc ratios"]
    CACHE -->|to charts| RADAR["RadarChart<br/>Normalize"]
    CACHE -->|to charts| MAP["ChoroplethMap<br/>Agg by pref"]
```

### 3. Data Deaggregation

Some bureaus (Tokyo, Osaka, Nagoya, Fukuoka) are **aggregates** that include branch office data from e-Stat:

```mermaid
graph TD
    TOKYO["🏛️ Tokyo Bureau<br/>Aggregate"]
    TOKYO_RAW["Includes:<br/>Tokyo + Shinagawa<br/>+ Yokohama<br/>+ Narita<br/>+ Haneda"]
    
    SHINAGAWA["🏢 Shinagawa<br/>Separate"]
    YOKOHAMA["🏢 Yokohama<br/>Separate"]
    NARITA["✈️ Narita Airport<br/>Separate"]
    HANEDA["✈️ Haneda Airport<br/>Separate"]
    
    DEAGG["➖ Deaggregate<br/>Subtract branch counts<br/>from aggregate"]
    
    TOKYO --> TOKYO_RAW
    TOKYO_RAW --> DEAGG
    DEAGG --> SHINAGAWA
    DEAGG --> YOKOHAMA
    DEAGG --> NARITA
    DEAGG --> HANEDA
    
    RESULT["✅ Result: 7 unique entities<br/>No double-counting"]
    SHINAGAWA --> RESULT
    YOKOHAMA --> RESULT
    NARITA --> RESULT
    HANEDA --> RESULT
```

**Code Location:** `src/utils/data-processing.ts` → `deaggregateData()`

### 4. Filtering & Memoization

```mermaid
stateDiagram-v2
    [*] --> RAW: Raw Data Loaded
    
    RAW --> LISTEN: Listen for<br/>Filter Changes
    
    LISTEN --> SHOULD_UPDATE: selectedBureaus<br/>or selectedStatuses<br/>changed?
    
    SHOULD_UPDATE --> |YES| FILTER: Apply Filters<br/>useFilteredData
    SHOULD_UPDATE --> |NO| CACHE: Return cached<br/>result from useMemo
    
    FILTER --> MEMOIZE: Save to memo
    MEMOIZE --> CACHE
    
    CACHE --> DIST: Distribute to<br/>6 chart components
    DIST --> [*]
```

### 5. Estimation Model

For processing time prediction:

```mermaid
graph TD
    INPUT["📝 User Input<br/>Bureau + Status<br/>+ Submission Date"]
    
    HIST["📊 Historical Data<br/>Last 6 months<br/>processing rates"]
    
    RATE["⚙️ Calculate Rate<br/>Avg daily processing<br/>for this bureau/status"]
    
    QUEUE["🔢 Estimate Queue<br/>Position at<br/>submission date"]
    
    PROJECT["📈 Project Timeline<br/>Through current<br/>month's rate"]
    
    OUTPUT["📅 Output<br/>Estimated completion<br/>date + confidence"]
    
    LATEX["🔬 Render Formula<br/>KaTeX math<br/>notation"]
    
    INPUT --> HIST
    HIST --> RATE
    RATE --> QUEUE
    QUEUE --> PROJECT
    PROJECT --> OUTPUT
    OUTPUT --> LATEX
    
    style INPUT fill:#4CAF50,color:#fff
    style OUTPUT fill:#2196F3,color:#fff
    style LATEX fill:#FF9800,color:#fff
```

**Code Location:** `src/utils/estimation.ts`

## Performance Optimizations

### Optimization Strategies

```mermaid
graph TD
    PERF["⚡ Performance Strategies"]
    
    PERF --> MEMO["📌 Memoization<br/>useMemo/useCallback"]
    PERF --> LAZY["📦 Lazy Loading<br/>Dynamic imports"]
    PERF --> SINGLE["🔄 Single-Pass Filtering<br/>One filter, 6 charts"]
    PERF --> PRECOMP["⚙️ Pre-computed Values<br/>Calc once at mount"]
    PERF --> BUILD["🔨 Production Build<br/>Minified & tree-shaken"]
    
    MEMO --> EXAMPLE1["Prevent re-filtering<br/>on every render"]
    LAZY --> EXAMPLE2["KaTeX ~100KB<br/>loaded on demand"]
    SINGLE --> EXAMPLE3["useFilteredData<br/>called once"]
    PRECOMP --> EXAMPLE4["Color scales<br/>calculated once"]
    BUILD --> EXAMPLE5["JS ~150KB gzipped<br/>Fast delivery"]
    
    style PERF fill:#4CAF50,color:#fff
    style MEMO fill:#2196F3,color:#fff
    style LAZY fill:#2196F3,color:#fff
    style SINGLE fill:#2196F3,color:#fff
    style PRECOMP fill:#2196F3,color:#fff
    style BUILD fill:#2196F3,color:#fff
```

### Memoization Example

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

### Lazy Loading Example

```typescript
// KaTeX is ~100KB, loaded dynamically
const KaTeX = dynamic(() => import('react-katex'));
```

### Single-Pass Filtering

All charts use the same filtered dataset:
- One call to `useFilteredData`
- Avoid filtering 6 different times
- Distribute to 6 chart components via props

### Pre-Computed Values

```typescript
// Calculated at component mount, not on every render
const prefectureColors = usePrefectureColors(data);
```

## Type Safety

### Type Safety Strategy

```mermaid
graph TD
    TSCONFIG["TypeScript Config<br/>Strict Mode"]
    NOANY["❌ NO any types<br/>Explicit types only"]
    TYPES["📋 Custom Types<br/>interfaces & enums"]
    COMPILE["🔍 Compile Check<br/>tsc --noEmit"]
    RUNTIME["✅ Runtime Safe<br/>No type errors"]
    
    TSCONFIG --> NOANY
    NOANY --> TYPES
    TYPES --> COMPILE
    COMPILE --> RUNTIME
    
    TYPES --> TYPEFILES["File Organization"]
    TYPEFILES --> TF1["src/constants/types.ts<br/>Shared interfaces"]
    TYPEFILES --> TF2["src/constants/bureaus.ts<br/>Bureau types"]
    TYPEFILES --> TF3["src/constants/statuses.ts<br/>Status codes"]
    
    style TSCONFIG fill:#4CAF50,color:#fff
    style NOANY fill:#F44336,color:#fff
    style RUNTIME fill:#2196F3,color:#fff
```

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

### Zero `any` Policy Example

```typescript
// Define explicit types
interface ImmigrationData {
  date: string
  bureau: string
  status: StatusCode
  count: number
  category: string
  averageProcessingDays: number
}

// Use in functions with type annotations
function processData(data: ImmigrationData[]): ProcessedData[] {
  // Compiler error if data structure doesn't match
  return data.map(item => ({
    // ...
  }));
}
```

## Design Patterns

### Patterns Used in the Project

```mermaid
graph TD
    PATTERNS["🎨 Design Patterns"]
    
    PATTERNS --> HOOKS["🪝 Custom Hooks"]
    PATTERNS --> COMP["🧩 Component Composition"]
    PATTERNS --> ERROR["🚨 Error Boundaries"]
    PATTERNS --> MEMO["📌 Memoization"]
    
    HOOKS --> H1["useImmigrationData<br/>Data fetching"]
    HOOKS --> H2["useFilteredData<br/>Filter logic"]
    HOOKS --> H3["useTheme<br/>Theme context"]
    
    COMP --> C1["Data Processing"]
    COMP --> C2["Calculations"]
    COMP --> C3["Visualization"]
    COMP --> C4["Interaction"]
    
    ERROR --> E1["Top-level wrapper<br/>Catches render errors"]
    ERROR --> E2["Graceful fallback<br/>User-friendly message"]
    
    MEMO --> M1["useMemo<br/>Expensive calculations"]
    MEMO --> M2["useCallback<br/>Function references"]
    
    style PATTERNS fill:#4CAF50,color:#fff
    style HOOKS fill:#2196F3,color:#fff
    style COMP fill:#9C27B0,color:#fff
    style ERROR fill:#F44336,color:#fff
    style MEMO fill:#FF9800,color:#fff
```

### Custom Hooks

**useImmigrationData** — Fetches and parses data
```typescript
const data = useImmigrationData();
```

**useFilteredData** — Applies filtering logic
```typescript
const filtered = useFilteredData(data, selectedBureaus, selectedStatuses);
```

**useTheme** — Theme management via Context
```typescript
const { theme, toggleTheme } = useTheme();
```

### Component Composition

Charts follow a consistent pattern:

```
Raw Data
    ↓
[Filter] — Apply bureau/status filters
    ↓
[Calculate] — Chart-specific aggregations
    ↓
[Normalize] — Scale and format for visualization
    ↓
[Render] — Use Chart.js/Nivo/react-simple-maps
    ↓
[Interact] — Handle tooltips and events
```

### Error Boundaries

```mermaid
graph TD
    APP["App Component"]
    BOUNDARY["ErrorBoundary<br/>Top-level wrapper"]
    CHILDREN["Child Components"]
    ERROR["Error occurs<br/>in child component"]
    FALLBACK["❌ Error Fallback<br/>User-friendly message"]
    
    APP --> BOUNDARY
    BOUNDARY --> CHILDREN
    CHILDREN -->|error| ERROR
    ERROR -->|caught| BOUNDARY
    BOUNDARY --> FALLBACK
    
    style BOUNDARY fill:#F44336,color:#fff
    style FALLBACK fill:#FFC107,color:#000
```

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

### Decision Matrix

```mermaid
graph TD
    STATIC["🌍 Static Export<br/>Next.js output: export"]
    STATIC_PROS["✅ Simplicity<br/>✅ Fast CDN<br/>✅ No server<br/>✅ Free hosting"]
    
    TS["🔍 TypeScript Everywhere<br/>Strict mode enabled"]
    TS_PROS["✅ IDE support<br/>✅ Compile-time errors<br/>✅ Safe refactoring<br/>✅ Self-documenting"]
    
    STATE["📦 React Hooks Only<br/>No Redux/Zustand"]
    STATE_PROS["✅ Simple flow<br/>✅ Low learning curve<br/>✅ Small bundle<br/>✅ Sufficient performance"]
    
    CHARTS["📊 Chart.js<br/>Over D3.js"]
    CHARTS_PROS["✅ Simple API<br/>✅ Built-in charts<br/>✅ Less code<br/>✅ Good performance"]
    
    NIVO["🌳 Nivo TreeMap<br/>For hierarchical data"]
    NIVO_PROS["✅ Purpose-built<br/>✅ Mobile-ready<br/>✅ Interactive<br/>✅ Less boilerplate"]
    
    STATIC --> STATIC_PROS
    TS --> TS_PROS
    STATE --> STATE_PROS
    CHARTS --> CHARTS_PROS
    NIVO --> NIVO_PROS
    
    style STATIC fill:#4CAF50,color:#fff
    style TS fill:#2196F3,color:#fff
    style STATE fill:#9C27B0,color:#fff
    style CHARTS fill:#FF9800,color:#fff
    style NIVO fill:#00BCD4,color:#fff
```

### Why Static Export?

- **Simplicity** — No backend server needed
- **Performance** — Fast CDN delivery via GitHub Pages
- **Reliability** — No server downtime risk
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
