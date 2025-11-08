# JP Immigration Dashboard - Issues & Technical Debt

This document tracks identified code quality issues, technical debt, and optimization opportunities discovered during code review.

**Last Updated:** 2025-11-01 (Added Lighthouse performance issues - LCP 4.5s)

---

## Table of Contents

- [🔴 High Priority Issues](#-high-priority-issues)
- [🟡 Medium Priority Issues](#-medium-priority-issues)
- [🟢 Low Priority / Style Issues](#-low-priority--style-issues)
- [📊 Performance Optimizations](#-performance-optimizations)
- [🧪 Testing & Quality](#-testing--quality)
- [Summary Statistics](#summary-statistics)

---

## 🔴 High Priority Issues

### 1. TypeScript Strict Mode Disabled ✅ COMPLETE

**Status:** ✅ **Fully Implemented** (November 2025)

**Implementation:**
- Enabled `"strict": true` in tsconfig.json
- Resolved all 147 TypeScript strict mode errors across 20+ files
- Created comprehensive type definitions for third-party libraries
- All 343 tests passing, production build verified

**Files Modified:**
- `tsconfig.json` - Enabled strict mode
- `src/types/react-simple-maps.d.ts` (new - 75 lines) - Custom type declarations
- `src/types/jest-dom.d.ts` (new - 2 lines) - Testing library types
- `src/hooks/useDataMetadata.ts` - Made generic with proper type constraints
- `src/App.tsx` - Added null coalescing for all data props
- `src/app/layout.tsx` - Fixed env variable null safety
- `src/components/charts/CategorySubmissionsLineChart.tsx` - Fixed state initialization types
- `src/components/charts/IntakeProcessingBarChart.tsx` - Added Chart.js types for callbacks
- `src/components/charts/IntakeProcessingLineChart.tsx` - Fixed state initialization types
- `src/components/charts/BureauDistributionRingChart.tsx` - Used proper Chart.js types
- `src/components/charts/GeographicDistributionChart.tsx` - Fixed color calculation, coordinates handling
- `src/components/FilterPanel.tsx` - Removed `as any` cast
- `src/hooks/useImmigrationData.ts` - Improved error handling with type guards
- `src/utils/loadLocalData.ts` - Changed return type to `Promise<EStatResponse | null>`
- `src/utils/correctBureauAggregates.ts` - Fixed type assertions with proper type guard
- `src/utils/dataTransform.ts` - Fixed undefined value access with nullish coalescing
- `src/__mocks__/mockImmigrationData.ts` - Added proper type imports
- `src/__mocks__/mockEStatData.ts` - Enhanced with comprehensive EStatResponse fields

**Error Resolution Progress:**
- Started: 147 TypeScript strict mode errors
- Phase 1: 147 → 51 errors (65% reduction) - Fixed production code
- Phase 2: 51 → 0 errors (100% reduction) - Fixed test mocks and remaining issues
- **Final: 0 errors, 100% resolved**

**Key Fixes:**

Null Safety:
```typescript
// Before: Potential null reference errors
<FilterPanel data={data} />

// After: Safe null handling
<FilterPanel data={data ?? []} />
```

Type Guards and Error Handling:
```typescript
// Before: Implicit any in catch
catch (error: any) {
  setError(error.message);
}

// After: Proper type narrowing
catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  setError(message);
}
```

Chart.js Type Safety:
```typescript
// Before: Untyped callbacks
afterBuildTicks: (axis) => { ... }
label: (context) => { ... }

// After: Fully typed
import type { Scale, TooltipItem } from 'chart.js';
afterBuildTicks: (axis: Scale) => { ... }
label: (context: TooltipItem<'bar'>) => { ... }
```

react-simple-maps Type Definitions:
```typescript
// Created custom type declarations
export interface Geography {
  type: string;
  properties: GeoProperties;
  geometry: unknown;
  rsmKey: string;
}
```

**Benefits:**
- ✅ Full TypeScript strict mode enforcement
- ✅ `strictNullChecks` - null/undefined errors caught at compile time
- ✅ `noImplicitAny` - no implicit any types allowed
- ✅ `strictFunctionTypes` - function type checking enforced
- ✅ `strictPropertyInitialization` - class properties validated
- ✅ Better IDE autocomplete and IntelliSense
- ✅ Safer refactoring with comprehensive type checking
- ✅ All 343 tests passing, zero regressions
- ✅ Clean production build verified

**Priority:** High ✅
**Effort:** Medium ✅

---

### 2. Excessive Use of `any` Type ✅ COMPLETE

**Status:** ✅ **Fully Implemented** (November 2025)

**Implementation:**
- Created comprehensive e-Stat API type definitions in `src/types/estat.ts`
- Defined EStatResponse, EStatValue, ClassObj, and 10+ related interfaces
- All e-Stat API structures fully documented with JSDoc comments
- Eliminated 10+ production `any` types across 14 files
- **Eliminated 58+ test `any` types across 9 test files** ✅ **NEW**

**Production Files Modified (14 files):**
- `src/types/estat.ts` (new - 174 lines) - Complete e-Stat API type definitions
- `src/utils/loadLocalData.ts` - Changed `Promise<any>` → `Promise<EStatResponse | null>`
- `src/utils/correctBureauAggregates.ts` - Fixed type assertions with proper type guard
- `src/utils/dataTransform.ts` - Removed explicit `any` casts, used proper EStatValue types
- `src/hooks/useImmigrationData.ts` - Changed `error: any` → `error: unknown` with type guards
- `src/hooks/useDataMetadata.ts` - Made generic to accept any data with month field
- `src/components/FilterPanel.tsx` - Removed `as any` cast
- `src/components/charts/BureauDistributionRingChart.tsx` - Used Chart.js types
- `src/components/charts/BureauPerformanceBubbleChart.tsx` - Used Chart.js types
- `src/components/charts/CategorySubmissionsLineChart.tsx` - Used Chart.js types
- `src/components/charts/IntakeProcessingLineChart.tsx` - Used Chart.js types
- `src/components/charts/MonthlyRadarChart.tsx` - Used Chart.js types
- `src/components/charts/GeographicDistributionChart.tsx` - Defined proper interfaces

**Test Files Modified (9 files):**
- `src/utils/getBureauData.test.ts` - 28 `any` → `BureauOption` types
- `src/utils/calculateEstimates.test.ts` - 2 `any` → `ImmigrationData[]` types
- `src/utils/dataTransform.test.ts` - 2 `any` → `EStatResponse` types
- `src/hooks/useDataMetadata.test.ts` - 4 `any` → `ImmigrationData[]` types
- `src/hooks/useImmigrationData.test.ts` - 1 `any` → `EStatResponse` type
- `src/components/StatsSummary.test.tsx` - 4 `any` → typed React component props
- `src/components/EstimationCard.test.tsx` - 8 `any` → typed mock component interfaces
- `src/components/FilterPanel.test.tsx` - 9 `any` → typed mock component props

**Chart.js Type Safety:**
```typescript
// Before: No type safety
callbacks: {
  label: (context: any) => { ... }
}

// After: Full type safety
import type { TooltipItem } from 'chart.js';
callbacks: {
  label: (context: TooltipItem<'line'>) => { ... }
}
```

**Error Handling Improvements:**
```typescript
// Before: Loses type information
catch (error: any) {
  setError(error.message);
}

// After: Proper type checking
catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  setError(message);
}
```

**Test Mock Type Safety:**
```typescript
// Before: Mock components with any types
jest.mock('@tippyjs/react', () => {
  return function Tippy({ children, content }: any) { ... }
});
jest.mock('./common/FilterInput', () => ({
  FilterInput: ({ label, value, onChange }: any) => { ... }
}));

// After: Fully typed mock components
jest.mock('@tippyjs/react', () => {
  return function Tippy({ children, content }: {
    children: React.ReactNode;
    content: React.ReactNode
  }) { ... }
});
jest.mock('./common/FilterInput', () => ({
  FilterInput: ({ label, value, onChange }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options?: { value: string; label: string }[];
  }) => { ... }
}));

// Intentionally invalid test data
null as unknown as ImmigrationData[]  // Explicit type coercion
```

**Benefits:**
- ✅ Eliminated 68+ `any` types across 23 files (14 production + 9 test)
- ✅ Zero ESLint warnings for `@typescript-eslint/no-explicit-any`
- ✅ Improved compile-time type safety for production and test code
- ✅ Better IDE autocomplete and IntelliSense in all files
- ✅ TypeScript catches more errors at compile time
- ✅ Safer refactoring with comprehensive type checking
- ✅ All 343 tests passing, zero regressions
- ✅ Clean production build with no warnings
- ✅ Consistent type patterns in test mocks

**Priority:** High ✅
**Effort:** Medium ✅

---

### 3. Magic Strings Throughout Codebase ✅ COMPLETE

**Status:** ✅ **Fully Implemented** (October 2025)

**Implementation:**
- Created `src/constants/statusCodes.ts` with STATUS_CODES constants and StatusCode type
- Created `src/constants/bureauCodes.ts` with BUREAU_CODES constants and BureauCode type
- Created `src/constants/applicationTypes.ts` with APPLICATION_TYPE_CODES constants and ApplicationTypeCode type
- Updated all production code to use constants instead of magic strings
- **Updated `ImmigrationData` interface to use typed constants instead of plain strings**
- All 315 tests passing after migration

**Files Modified:**
- `src/constants/statusCodes.ts` (new - 28 lines)
- `src/constants/bureauCodes.ts` (new - 59 lines)
- `src/constants/applicationTypes.ts` (new - 31 lines)
- `src/hooks/useImmigrationData.ts` (**interface now fully typed with BureauCode, ApplicationTypeCode, StatusCode**)
- `src/utils/dataTransform.ts` (added type assertions for bureau, type, and status fields)
- `src/components/StatsSummary.tsx` (added imports, replaced 7 magic strings)
- `src/components/charts/IntakeProcessingBarChart.tsx` (added imports, replaced 4 magic strings)
- `src/components/charts/CategorySubmissionsLineChart.tsx` (added imports, replaced 9 magic strings)
- `src/components/charts/IntakeProcessingLineChart.tsx` (added imports, replaced 4 magic strings)
- `src/components/charts/BureauPerformanceBubbleChart.tsx` (added imports, replaced 5 magic strings, fixed type narrowing)
- `src/components/charts/BureauDistributionRingChart.tsx` (added imports, replaced 3 magic strings)
- `src/utils/calculateEstimates.ts` (added imports, replaced 8 magic strings)

**Benefits:**
- Eliminated 40+ magic string usages across production code
- **Full compile-time type safety for all immigration data fields**
- Type-safe constants with TypeScript `as const` assertions
- Semantic naming makes code self-documenting (e.g., `STATUS_CODES.PROCESSED` vs `'300000'`)
- **IntelliSense autocomplete for all code values**
- **Type errors when using invalid bureau/status/application type codes**
- Reduced risk of typos and string literal errors
- Easier refactoring and maintenance
- All tests passing, zero regressions

**Type Safety Achievement:**
```typescript
// Before: Plain strings (no type safety)
interface ImmigrationData {
  bureau: string;
  type: string;
  status: string;
}

// After: Typed constants (full type safety)
interface ImmigrationData {
  bureau: BureauCode;        // '101010' | '101090' | ... (16 valid codes)
  type: ApplicationTypeCode;  // '10' | '20' | '30' | '40' | '50' | '60'
  status: StatusCode;         // '100000' | '102000' | '103000' | '300000' | ...
}
```

**Note:** Mock data files intentionally kept with literal strings for readability and portability

**Priority:** High ✅
**Effort:** Medium ✅

---

## 🟡 Medium Priority Issues

### 4. Console Logs in Production Code ✅ COMPLETE

**Status:** ✅ **Fully Implemented** (November 2025)

**Implementation:**
- Created `src/utils/logger.ts` with environment-based logging utility
- Replaced all console.error calls with logger.error in:
  - `src/utils/loadLocalData.ts` (2 instances)
  - `src/hooks/useImmigrationData.ts` (1 instance)
- Replaced all console.log calls with logger.debug in:
  - `src/components/FilterPanel.tsx` (2 instances)
- Updated all test files to mock the logger module instead of console
- All 315 tests passing after migration

**Files Modified:**
- `src/utils/logger.ts` (new - 17 lines)
- `src/utils/loadLocalData.ts` (added import, replaced 2 console.error calls)
- `src/hooks/useImmigrationData.ts` (added import, replaced 1 console.error call)
- `src/components/FilterPanel.tsx` (added import, replaced 2 console.log calls)
- `src/utils/loadLocalData.test.ts` (added logger mock, updated all error logging assertions)
- `src/components/FilterPanel.test.tsx` (added logger mock, updated all debug logging assertions)

**Benefits:**
- Console logs only appear in development builds
- Structured logging system ready for future enhancements
- No console output in production builds
- Improved performance (no logging overhead in production)
- All tests updated and passing
- Clean, maintainable logging approach

**Priority:** Medium ✅
**Effort:** Low ✅

---

### 5. Duplicated Chart Logic ✅ COMPLETE

**Status:** ✅ **Implemented** (October 2025)

**Implementation:**
- Created `useChartMonthRange` hook in `src/hooks/useChartMonthRange.ts`
- Extracted month range selection logic with proper memoization
- Updated all three chart components to use the custom hook
- Reduced code duplication by ~90 lines

**Files Modified:**
- `src/hooks/useChartMonthRange.ts` (new - 61 lines)
- `src/components/charts/IntakeProcessingBarChart.tsx` (reduced by ~30 lines)
- `src/components/charts/CategorySubmissionsLineChart.tsx` (reduced by ~30 lines)
- `src/components/charts/IntakeProcessingLineChart.tsx` (reduced by ~30 lines)

**Benefits:**
- Single source of truth for month range logic
- Improved maintainability and testability
- Better performance with proper memoization
- All tests passing (315 tests)

**Priority:** Medium
**Effort:** Low ✅

---

### 6. Duplicate Interface Definitions ✅ COMPLETE

**Status:** ✅ **Implemented** (October 2025)

**Implementation:**
- Created shared type file `src/types/bureau.ts` with BureauOption interface
- Updated `bureauOptions.ts` to import from shared types
- Updated `getBureauData.ts` to import from shared types
- Removed duplicate interface definitions

**Files Modified:**
- `src/types/bureau.ts` (new - 19 lines)
- `src/constants/bureauOptions.ts` (removed duplicate interface, added import)
- `src/utils/getBureauData.ts` (removed duplicate interface, added import)

**Benefits:**
- Single source of truth for BureauOption type
- Eliminated maintenance burden
- Prevents type drift and inconsistency
- All tests passing (315 tests)

**Priority:** Medium
**Effort:** Low ✅

---

### 7. Inefficient Bureau Label Lookups ✅ COMPLETE

**Status:** ✅ **Fully Implemented** (November 2025)

**Implementation:**
- Replaced O(n) array.find() with O(1) Map-based lookups
- Created bureauLabelMap and bureauShortMap for instant lookups
- Added getBureauShort() function for future use
- Comprehensive test coverage (61 tests total for getBureauData)

**Files Modified:**
- `src/utils/getBureauData.ts` - Replaced linear search with Map lookups
- `src/utils/getBureauData.test.ts` - Added 9 new tests for getBureauShort function

**Changes:**
```typescript
// Before: O(n) linear search
export const getBureauLabel = (bureauCode: string): string => {
  const bureau = bureauOptions.find((b: BureauOption) => b.value === bureauCode);
  return bureau ? bureau.label : bureauCode;
};

// After: O(1) Map lookup
const bureauLabelMap = new Map(bureauOptions.map((b) => [b.value, b.label]));
const bureauShortMap = new Map(bureauOptions.map((b) => [b.value, b.short]));

export const getBureauLabel = (bureauCode: string): string =>
  bureauLabelMap.get(bureauCode) ?? bureauCode;

export const getBureauShort = (bureauCode: string): string =>
  bureauShortMap.get(bureauCode) ?? bureauCode;
```

**Benefits:**
- Reduced lookup complexity from O(n) to O(1)
- Significant performance improvement for frequently called functions
- Scalable solution that maintains performance regardless of bureau count
- Added getBureauShort() utility for future use cases
- All 343 tests passing

**Performance Impact:** Functions now complete 1000 lookups in <100ms (verified by tests)
**Priority:** Medium ✅
**Effort:** Low ✅

---

### 8. Wasteful Re-computation in Components ✅ COMPLETE

**Status:** ✅ **Fully Implemented** (November 2025)

**Implementation:**
- Created useDataMetadata custom hook to extract unique months once
- Updated 7 components to use the shared hook instead of duplicate logic
- Eliminated ~80 lines of duplicate month extraction code
- Comprehensive test coverage (28 tests for useDataMetadata hook)

**Files Modified:**
- `src/hooks/useDataMetadata.ts` (new - 34 lines) - Centralized metadata extraction
- `src/hooks/useDataMetadata.test.ts` (new - 220 lines) - Comprehensive test suite
- `src/components/FilterPanel.tsx` - Replaced local useMemo with hook
- `src/components/EstimationCard.tsx` - Replaced local useMemo with hook
- `src/components/StatsSummary.tsx` - Replaced local month extraction with hook
- `src/components/charts/BureauPerformanceBubbleChart.tsx` - Replaced local useMemo with hook
- `src/components/charts/BureauDistributionRingChart.tsx` - Replaced local useMemo with hook
- `src/components/charts/MonthlyRadarChart.tsx` - Replaced local useMemo with hook

**Changes:**
```typescript
// Before: Each component extracted months independently
const sortedMonths = useMemo(() => {
  if (!data?.length) return [];
  return [...new Set(data.map((entry) => entry.month))].sort();
}, [data]);

// After: Shared hook extracts once and memoizes properly
const { uniqueMonths, dateRange, latestMonth } = useDataMetadata(data);
```

**Hook Implementation:**
```typescript
export const useDataMetadata = (data: ImmigrationData[]) => {
  const uniqueMonths = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    return [...new Set(data.map((entry) => entry.month))].filter(Boolean).sort();
  }, [data]); // Only recompute when data changes

  const dateRange = useMemo(() => ({
    min: uniqueMonths[0] ?? '',
    max: uniqueMonths[uniqueMonths.length - 1] ?? '',
  }), [uniqueMonths]);

  const latestMonth = useMemo(() =>
    uniqueMonths[uniqueMonths.length - 1] ?? '',
    [uniqueMonths]
  );

  return { uniqueMonths, dateRange, latestMonth };
};
```

**Benefits:**
- Eliminated duplicate month extraction logic across 7 components
- Prevents re-computation when filters change (only recomputes when data changes)
- Single source of truth for data metadata
- Improved maintainability and testability
- Performance improvement: No more wasteful Set creation and sorting on filter changes
- All 343 tests passing (28 new tests for the hook)

**Priority:** Medium ✅
**Effort:** Low ✅

---

## 🟢 Low Priority / Style Issues

### 9. Tailwind Config File Extension Mismatch

**Location:** `tailwind.config.ts:1-31`

**Issue:**
```typescript
// File: tailwind.config.ts (TypeScript extension)
module.exports = {  // ❌ CommonJS syntax
  // ...
}
```

**Recommendation:**

Option 1 - Use ES modules:
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  // ...
};

export default config;
```

Option 2 - Rename to `.js`:
```bash
mv tailwind.config.ts tailwind.config.js
```

**Priority:** Low
**Effort:** Low

---

### 10. Dark Mode Color String Manipulation ✅ COMPLETE

**Status:** ✅ **Implemented** (October 2025)

**Implementation:**
- Updated StatsSummary component to pass full Tailwind class names with both light and dark variants
- Removed problematic string manipulation `.replace('500', '600')`
- Removed ESLint disable comment that was masking the issue
- All color classes now properly purged by Tailwind at build time

**Files Modified:**
- `src/components/StatsSummary.tsx` (updated StatCard component and all 5 StatCard calls)

**Changes:**
```typescript
// Before (doesn't work):
<div className={`${color} dark:${color.replace('500', '600')} stat-badge`}>
color="bg-blue-500"

// After (works correctly):
<div className={`${color} stat-badge`}>
color="bg-blue-500 dark:bg-blue-600"
```

**Benefits:**
- Dark mode colors now work correctly
- Proper Tailwind class purging at build time
- No runtime string manipulation overhead
- Removed ESLint disable workaround
- All tests passing (315 tests)

**Priority:** Low
**Effort:** Low ✅

---

### 11. ESLint Disable Comments

**Locations:**
- `src/utils/dataTransform.ts:44` - `eslint-disable-next-line @typescript-eslint/no-explicit-any`
- `src/components/StatsSummary.tsx:105` - `eslint-disable-next-line tailwindcss/no-custom-classname`

**Issue:**
Disabling linting rules indicates underlying issues being swept under the rug.

**Recommendation:**

For `dataTransform.ts`:
- Fix by defining proper types (see Issue #2)

For `StatsSummary.tsx`:
- Fix by resolving dark mode color issue (see Issue #10)

**Priority:** Low
**Effort:** Low (after fixing root causes)

---

### 12. Accessibility Issue in FilterInput ✅ COMPLETE

**Status:** ✅ **Fully Implemented** (November 2025)

**Implementation:**
- Fixed `aria-label` attribute in FilterInput component to use the static descriptive label instead of the current value
- Updated both select and input elements with proper aria-label attributes
- Ensures screen readers announce the field purpose correctly without duplication

**Files Modified:**
- `src/components/common/FilterInput.tsx:43` - Changed `aria-label={value}` to `aria-label={label}` for select element
- `src/components/common/FilterInput.tsx:57` - Added `aria-label={label}` to input element

**Before:**
```typescript
<select aria-label={value} value={value}>  // ❌ Announces value twice
```

**After:**
```typescript
<select aria-label={label} value={value}>  // ✅ Announces field purpose once
```

**Benefits:**
- Screen readers now properly announce field purpose without duplication
- Complies with WCAG 2.1 accessibility guidelines
- Improved user experience for assistive technology users
- All 315 tests passing

**Priority:** Low ✅
**Effort:** Trivial ✅

---

### 13. Missing Semantic HTML ✅ COMPLETE

**Status:** ✅ **Fully Implemented** (November 2025)

**Implementation:**
- Added `aria-label` attributes to all icon-only buttons throughout the application
- Ensures all interactive elements are properly labeled for screen readers
- Dynamic aria-labels reflect current state (e.g., "Open" vs "Close")

**Files Modified:**
- `src/App.tsx:146` - Mobile drawer trigger button: Dynamic label based on drawer state
- `src/App.tsx:203` - Desktop chart tab buttons: Added chart name labels
- `src/components/EstimationCard.tsx:87` - Close/collapse button: Dynamic label based on variant

**Changes:**
```typescript
// Mobile drawer trigger
<button
  aria-label={isDrawerOpen ? 'Close estimator drawer' : 'Open estimator drawer'}
  onClick={() => setIsDrawerOpen(!isDrawerOpen)}
>

// Desktop chart tabs
<button
  aria-label={chart.name}
  onClick={() => setActiveChartIndex(index)}
>

// EstimationCard close/collapse
<button
  aria-label={variant === 'drawer' ? 'Close estimator' : 'Collapse estimator'}
  onClick={variant === 'drawer' ? onClose : onCollapse}
>
```

**Benefits:**
- All icon-only buttons now have descriptive labels
- Screen readers can properly identify button purposes
- Complies with WCAG 2.1 accessibility guidelines
- Improved keyboard navigation experience
- All 315 tests passing

**Priority:** Low ✅
**Effort:** Trivial ✅

---

## 📊 Performance Optimizations

### 14. Chart Component Re-renders ✅ COMPLETE

**Status:** ✅ **Substantially Addressed** (November 2025)

**Implementation:**
- Eliminated primary cause of wasteful re-renders via useDataMetadata hook (Issue #8)
- Charts no longer re-extract unique months when filters/props change
- Prevented unnecessary Set creation and array sorting on every render
- Charts now properly memoize month data extraction

**Key Improvement:**
The main performance issue was charts re-extracting unique months from data on every filter change. This has been resolved by:
1. Creating useDataMetadata hook that memoizes month extraction
2. Month data now only recomputes when actual data changes, not when filters change
3. Eliminated duplicate month extraction logic across 3 chart components

**Files Modified:**
- `src/hooks/useDataMetadata.ts` - Centralized month extraction with proper memoization
- `src/components/charts/BureauPerformanceBubbleChart.tsx` - Using useDataMetadata hook
- `src/components/charts/BureauDistributionRingChart.tsx` - Using useDataMetadata hook
- `src/components/charts/MonthlyRadarChart.tsx` - Using useDataMetadata hook

**Before:**
```typescript
// Re-runs whenever ANY dependency changes (including filters)
useEffect(() => {
  const allMonths = [...new Set(data.map((entry) => entry.month))].sort();
  // ... expensive chart data computation
}, [data, filters, monthRange, showAllMonths]);
```

**After:**
```typescript
// Months only recompute when data changes
const { uniqueMonths: sortedMonths } = useDataMetadata(data);

// Chart components already use useEffect/useMemo for data processing
// The key improvement is preventing wasteful month re-extraction
```

**Benefits:**
- Eliminated primary source of wasteful re-renders in charts
- Reduced unnecessary Set creation and array sorting operations
- Charts maintain existing useEffect-based rendering pattern (already optimized)
- All 343 tests passing

**Note:** Chart components already use useEffect and useState for chart data, which provides appropriate memoization for the actual chart rendering. The main issue was the wasteful month extraction, which has been resolved.

**Priority:** Medium ✅
**Effort:** Medium ✅

---

### 15. Bundle Size Analysis ✅ COMPLETE

**Status:** ✅ **Fully Implemented** (November 2025)

**Implementation:**
- Installed @next/bundle-analyzer package
- Integrated bundle analyzer into next.config.ts
- Configured to run with ANALYZE=true environment variable
- Documented current bundle sizes for baseline monitoring

**Files Modified:**
- `next.config.ts` - Added withBundleAnalyzer wrapper
- `package.json` - Added @next/bundle-analyzer dev dependency (15 packages)

**Configuration:**
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'build',
};

module.exports = withBundleAnalyzer(nextConfig);
```

**Current Bundle Sizes (Baseline):**
```
Route (app)                                 Size  First Load JS
┌ ○ /_not-found                            977 B         103 kB
├ ● /[[...slug]]                         8.36 kB         110 kB
└ ○ /robots.txt                              0 B            0 B

+ First Load JS shared by all             102 kB
  ├ chunks/4bd1b696-4c5383c108deca34.js  53.2 kB
  ├ chunks/684-14f279bd5db8aa64.js         46 kB
  └ other shared chunks (total)          2.58 kB
```

**Usage:**
```bash
# Run bundle analysis
ANALYZE=true npm run build

# Normal build (no analysis)
npm run build
```

**Next Steps (Optional Future Optimizations):**
1. Run `ANALYZE=true npm run build` to visualize bundle composition
2. Check Chart.js tree-shaking effectiveness
3. Identify duplicate dependencies
4. Analyze vendor chunk sizes
5. Look for unused code opportunities

**Benefits:**
- Bundle analyzer infrastructure in place for ongoing monitoring
- Baseline bundle sizes documented for comparison
- Easy to run analysis when needed (ANALYZE=true flag)
- Zero impact on normal builds
- All 343 tests passing

**Priority:** Low ✅
**Effort:** Low ✅

---

### 19. Lighthouse Performance Issues ⏳ IN PROGRESS

**Status:** ⏳ **Partially Implemented** (November 2025)

**Current Status:** Initial optimizations completed - code splitting, resource hints, and tree-shaking implemented

**Completed Optimizations:**
1. ✅ **Code Splitting for Charts** (19.6) - All 6 chart components now lazy-loaded on-demand
2. ✅ **Chart.js Tree-Shaking** (19.6) - Verified all components use tree-shakeable named imports
3. ✅ **Resource Hints** (19.3) - Added preconnect/dns-prefetch for Google Analytics and Iconify CDN
4. ✅ **Font Optimization** (19.3) - Using system fonts (no custom font loading overhead)

**Implementation Details:**

Code Splitting:
```typescript
// Before: Static imports (all charts loaded upfront)
import { IntakeProcessingBarChart } from '../charts/IntakeProcessingBarChart';

// After: Dynamic imports with React.lazy()
const IntakeProcessingBarChart = lazy(() =>
  import('../charts/IntakeProcessingBarChart').then((module) => ({
    default: module.IntakeProcessingBarChart,
  }))
);

// Wrapped in Suspense with loading fallback
<Suspense fallback={<LoadingSpinner icon="line-md:loading-twotone-loop" message="Loading chart..." />}>
  <ChartComponent data={data} filters={filters} isDarkMode={isDarkMode} />
</Suspense>
```

Resource Hints:
```typescript
// Added to layout.tsx
<link rel="preconnect" href="https://www.googletagmanager.com" />
<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
<link rel="preconnect" href="https://www.google-analytics.com" />
<link rel="dns-prefetch" href="https://www.google-analytics.com" />
<link rel="preconnect" href="https://api.iconify.design" />
<link rel="dns-prefetch" href="https://api.iconify.design" />
```

**Bundle Analysis Results:**
- First Load JS: 102 kB (gzipped) - unchanged but now split
- Chart chunks created: 6 separate lazy-loaded bundles
  - 905.js (105K) - Chart component
  - 281.js (44K) - Chart component
  - 579.js (41K) - Chart component
  - 573.js (30K) - Chart component
  - 11.js (8.1K) - Chart component
  - Additional smaller chunks
- Charts now load only when user switches tabs

**Remaining Issues to Address:**

**Critical Data File Size:**
- `public/datastore/statData.json` is 4.3MB (uncompressed)
- This is likely the primary LCP bottleneck
- **Constraint:** SSG/CSR only (GitHub Pages), no source file modifications

**Optimization Options (Ordered by Impact):**

#### Option 1: Pre-compress Data at Build Time (Highest Impact)
**Expected Impact:** 4.3MB → ~500-800KB (80-85% reduction)
**Effort:** Low
**Implementation:**
- Add build script to create Brotli-compressed version (`.br` file)
- Use `DecompressionStream` API in browser to decompress at runtime
- Fallback to uncompressed version for older browsers
- No source file modification required

**Code:**
```bash
# Add to package.json scripts
"compress-data": "node scripts/compress-data.js"
```

```typescript
// scripts/compress-data.js
const fs = require('fs');
const zlib = require('zlib');

const input = fs.readFileSync('public/datastore/statData.json');
const compressed = zlib.brotliCompressSync(input, {
  params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 }
});
fs.writeFileSync('public/datastore/statData.json.br', compressed);
```

```typescript
// src/utils/loadLocalData.ts - Use DecompressionStream API
const response = await fetch('/datastore/statData.json.br');
const decompressedStream = response.body?.pipeThrough(new DecompressionStream('br'));
const data = await new Response(decompressedStream).json();
```

**Pros:** Massive file size reduction, browser-native decompression
**Cons:** Requires modern browser (fallback available)

---

#### Option 2: IndexedDB Caching (Avoid Re-parsing)
**Expected Impact:** Instant load on repeat visits (0ms vs 500ms+ JSON parsing)
**Effort:** Medium
**Implementation:**
- Cache parsed JSON in IndexedDB after first load
- Check cache on subsequent visits (24-hour TTL)
- Skip network fetch and JSON parsing entirely

**Code:**
```typescript
// Install: npm install idb
import { openDB } from 'idb';

const getCachedData = async (key: string) => {
  const db = await openDB('immigration-data-cache', 1);
  const cached = await db.get('json-cache', key);

  if (cached && cached.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
    return cached.data; // Valid cache
  }
  return null;
};

// In loadLocalData()
const cached = await getCachedData('statData');
if (cached) return cached;

// Otherwise fetch, parse, and cache
const data = await response.json();
await setCachedData('statData', data);
```

**Pros:** Eliminates network request and parsing on repeat visits
**Cons:** Only helps returning visitors, adds ~3KB library

---

#### Option 3: Split Data by Time Period (Progressive Loading)
**Expected Impact:** First meaningful paint with ~360KB instead of 4.3MB
**Effort:** Medium
**Implementation:**
- Build script creates `statData-recent.json` (last 12 months)
- Build script creates `statData-historical.json` (older data)
- Load recent data first, show UI immediately
- Load historical data in background

**Code:**
```typescript
// scripts/split-data.js
const data = JSON.parse(fs.readFileSync('public/datastore/statData.json'));
const values = data.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE;

const cutoffMonth = '2024-01'; // Last 12 months
const recent = values.filter(v => v['@time'] >= cutoffMonth);
const historical = values.filter(v => v['@time'] < cutoffMonth);

// Create two separate files
fs.writeFileSync('public/datastore/statData-recent.json',
  JSON.stringify({...data, GET_STATS_DATA: {..., VALUE: recent}}));
```

```typescript
// src/hooks/useImmigrationData.ts
const recentData = await loadRecentData();
setData(transformData(recentData));
setLoading(false); // Page is interactive!

// Background load
const historicalData = await loadHistoricalData();
setData([...recentData, ...transformData(historicalData)]);
```

**Pros:** Fast initial load, progressive enhancement
**Cons:** Requires careful state management, more complex

---

#### Option 4: Web Worker for JSON Parsing (Keep Main Thread Responsive)
**Expected Impact:** Improves TTI/TBT metrics, main thread stays responsive
**Effort:** Medium
**Implementation:**
- Move JSON parsing and data transformation to Web Worker
- Main thread remains responsive during processing
- Post transformed data back to main thread

**Code:**
```typescript
// public/workers/data-parser.worker.js
self.addEventListener('message', async (e) => {
  const response = await fetch(e.data.url);
  const data = await response.json();
  const transformed = transformData(data); // Heavy work here
  self.postMessage({ type: 'DATA_READY', data: transformed });
});

// src/hooks/useImmigrationData.ts
const worker = new Worker('/workers/data-parser.worker.js');
worker.onmessage = (e) => {
  if (e.data.type === 'DATA_READY') {
    setData(e.data.data);
    setLoading(false);
  }
};
worker.postMessage({ type: 'PARSE_DATA', url: '/datastore/statData.json' });
```

**Pros:** Main thread stays responsive, better perceived performance
**Cons:** Can't use on older browsers without polyfill

---

#### Option 5: Service Worker (Progressive Enhancement)
**Expected Impact:** Near-instant load on repeat visits, offline support
**Effort:** Medium-High
**Implementation:**
- Cache data file using Service Worker
- Stale-while-revalidate strategy
- Pre-cache on first visit
- Update cache in background

**Code:**
```typescript
// public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/datastore/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cache immediately, update in background
        if (response) {
          fetch(event.request).then(fresh => {
            caches.open('data-v1').then(cache => cache.put(event.request, fresh));
          });
          return response;
        }
        return fetch(event.request);
      })
    );
  }
});
```

**Pros:** Offline support, instant repeat visits, automatic updates
**Cons:** Complex lifecycle management, requires HTTPS (works on localhost)

---

**Recommended Implementation Order:**
1. **Option 1** (Compression) - Biggest immediate impact (80% size reduction)
2. **Option 2** (IndexedDB) - Eliminates re-parsing on repeat visits
3. **Option 3** (Data Splitting) - Load recent data first for faster interactivity
4. **Option 4** (Web Worker) - Keep main thread responsive during parsing
5. **Option 5** (Service Worker) - Progressive enhancement for offline support

**Combined Impact:**
- First visit: 4.3MB → ~600KB compressed → ~100KB recent data only
- Repeat visits: IndexedDB cache = 0ms load time
- All visits: Main thread responsive (Web Worker parsing)
- Offline support: Service Worker caching

**Issues Identified:**

#### 19.1 Use Efficient Cache Lifetimes
**Issue:** Static assets may not have optimal cache headers configured
**Impact:** Users re-download unchanged assets on every visit
**Recommendation:**
- Configure long-term caching for static assets (images, fonts, JS bundles)
- Implement cache-busting strategy for code updates
- Set appropriate `Cache-Control` headers for GitHub Pages deployment

#### 19.2 Forced Reflow
**Issue:** JavaScript causing layout thrashing and forced synchronous layouts
**Impact:** Blocks main thread and delays rendering
**Recommendation:**
- Audit DOM read/write patterns in components
- Batch DOM reads together, then batch writes together
- Use `requestAnimationFrame` for layout operations
- Profile with Chrome DevTools Performance tab to identify specific culprits

#### 19.3 Network Dependency Tree
**Issue:** Critical resources may be loaded sequentially rather than in parallel
**Impact:** Delays page rendering and content display
**Recommendation:**
- Analyze network waterfall in DevTools
- Use resource hints (`preload`, `prefetch`) for critical assets
- Optimize font loading strategy
- Consider inlining critical CSS

#### 19.4 Reduce JavaScript Execution Time
**Issue:** JavaScript parsing/execution blocking main thread
**Impact:** Delays interactive elements and content rendering
**Recommendation:**
- Profile JavaScript execution with DevTools Performance tab
- Identify long-running tasks (>50ms)
- Consider code splitting for route-based lazy loading
- Defer non-critical JavaScript
- Review Chart.js initialization timing

#### 19.5 Minimize Main-Thread Work
**Issue:** Excessive main thread work blocking rendering
**Impact:** Poor responsiveness and delayed LCP
**Recommendation:**
- Move expensive computations to Web Workers if possible
- Optimize React component render cycles
- Review `useEffect` dependencies for unnecessary re-runs
- Profile with Chrome DevTools to identify specific bottlenecks

#### 19.6 Reduce Unused JavaScript
**Issue:** Shipping JavaScript that isn't used on initial page load
**Impact:** Larger bundle size, slower parse/compile time
**Recommendation:**
- Run `ANALYZE=true npm run build` to visualize bundle composition
- Implement code splitting for charts (load on-demand per tab)
- Tree-shake Chart.js imports (import only needed components)
- Review @nivo/treemap usage and consider lighter alternatives
- Audit third-party dependencies for unused code

**Performance Budget Targets:**
- **LCP:** < 2.5s (currently 4.5s) 🔴
- **First Contentful Paint (FCP):** < 1.8s
- **Time to Interactive (TTI):** < 3.8s
- **Total Blocking Time (TBT):** < 200ms

**Priority:** High
**Effort:** High (requires systematic performance profiling and optimization)

**Next Steps:**
1. Run Chrome DevTools Lighthouse audit to get detailed metrics
2. Run `ANALYZE=true npm run build` for bundle analysis
3. Profile with Performance tab to identify specific bottlenecks
4. Implement code splitting for chart components
5. Optimize Chart.js and @nivo imports
6. Configure caching strategy for GitHub Pages

---

## 🧪 Testing & Quality

### 16. No Error Boundaries ✅ COMPLETE

**Status:** ✅ **Implemented** (October 2025)

**Implementation:**
- Created `ErrorBoundary.tsx` component with production-ready error handling
- Integrated into `App.tsx` wrapping all major components
- Includes development-mode error details with stack traces
- Provides user-friendly fallback UI with retry button
- Optional error callback for future error reporting service integration

**Files Modified:**
- `src/components/common/ErrorBoundary.tsx` (new)
- `src/App.tsx` (wrapped 6 component instances)

**Priority:** Medium
**Effort:** Low ✅

---

### 17. Component Test Coverage ✅ MOSTLY COMPLETE

**Status:** ✅ 315 tests passing, 35.46% overall coverage (up from 232 tests, 26.92%)

**Current Coverage:**
- ✅ **Utils Module:** 99.44% statement, 93.9% branch (173 tests)
  - ✅ `calculateEstimates.ts` - 100% coverage (50 tests)
  - ✅ `correctBureauAggregates.ts` - 100% coverage (32 tests)
  - ✅ `dataTransform.ts` - 95% coverage (17 tests)
  - ✅ `loadLocalData.ts` - 100% coverage (22 tests)
  - ✅ `getBureauData.ts` - 100% coverage (52 tests)
- ✅ **Hooks Module:** 90.9% statement, 100% branch (32 tests)
  - ✅ `useImmigrationData.ts` - 90.9% coverage (32 tests)
- ✅ **Components Module:** Higher coverage achieved (110 tests)
  - ✅ `FilterPanel.tsx` - 100% coverage (27 tests)
  - ✅ `EstimationCard.tsx` - 100% coverage (45 tests) ✅ **NEW**
  - ✅ `StatsSummary.tsx` - 100% coverage (38 tests) ✅ **NEW**
  - ❌ Chart components - No tests (optional, lower priority)

**Completed Tests:**

1. ✅ `EstimationCard.tsx` (45 tests):
   - ✅ Estimation calculation display
   - ✅ Date input handling
   - ✅ Application type selection
   - ✅ Bureau selection
   - ✅ Expandable/drawer modes
   - ✅ Formula tooltip rendering
   - ✅ Edge cases (no data, invalid dates, past due dates)
   - ✅ Accessibility testing

2. ✅ `StatsSummary.tsx` (38 tests):
   - ✅ Stat badge rendering
   - ✅ Filtering by bureau/type
   - ✅ Status code calculations (granted, denied, approval rate)
   - ✅ Month selection
   - ✅ Number formatting
   - ✅ Tooltip integration
   - ✅ Edge cases and memoization
   - ✅ Accessibility testing

**Remaining Work (Optional):**
- Chart components (6 charts) - Lower priority
  - Would require mocking Chart.js instances
  - Data transformation logic already tested via utils

**Coverage Achievement:**
- ✅ All critical business logic tested (utils: 99.44%)
- ✅ State management tested (hooks: 90.9%)
- ✅ Key UI components tested (EstimationCard, StatsSummary, FilterPanel: 100%)
- ✅ Test infrastructure fully established

**Priority:** ✅ Complete (chart tests optional)
**Effort:** ✅ Complete

---

### 18. No TypeScript Type Testing

**Recommendation:**

Add type-level tests for critical types:

```typescript
// src/types/__tests__/estat.test-d.ts
import { expectType } from 'tsd';
import type { EStatResponse, EStatValue } from '../estat';

// Ensure e-Stat types are correct
const response: EStatResponse = {} as any;
expectType<string>(response.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE[0]['@time']);
```

**Priority:** Low
**Effort:** Low

---

## Summary Statistics

| Category | Count | Priority |
|----------|-------|----------|
| High Priority Issues | 1 (was 3) | 🔴 |
| Medium Priority Issues | 0 (was 2) | 🟡 |
| Low Priority Issues | 2 (was 5) | 🟢 |
| Performance Items | 1 (was 2) | 📊 |
| Testing & Quality | 1 (was 3) | 🧪 |
| **Total Issues** | **4** (was 6) | - |
| **Completed** | **15** (was 13) | ✅ |

### Code Metrics

- **TypeScript strict mode:** ✅ Enabled - 147 errors resolved, full compile-time type safety enforced
- **TypeScript `any` usage:** ✅ Resolved - eliminated 10+ production `any` types, comprehensive e-Stat API type definitions created
- **Console logs:** ✅ Resolved - environment-based logger implemented
- **Code duplication:** ✅ Resolved - custom hooks created (useChartMonthRange, useDataMetadata)
- **Magic strings:** ✅ Resolved - constants created for all codes with full type safety
- **Type safety:** ✅ Enhanced - ImmigrationData interface uses typed constants + proper Chart.js types throughout
- **Test coverage:** 343 tests passing (99.44% utils, 90.9% hooks, 100% key components)
- **ESLint disables:** ✅ Resolved - removed dark mode workaround
- **Accessibility issues:** ✅ Resolved - all icon-only buttons now have aria-labels, FilterInput uses proper labels
- **Performance optimizations:** ✅ Substantially Improved - O(1) lookups, memoized metadata extraction, bundle analyzer setup, code splitting
- **Bureau label lookups:** ✅ Optimized - O(n) → O(1) Map-based lookups
- **Chart re-renders:** ✅ Optimized - eliminated wasteful month re-extraction on filter changes
- **Bundle analysis:** ✅ Setup complete - baseline sizes documented (~110 kB First Load JS)
- **Code splitting:** ✅ Implemented - 6 chart components lazy-loaded on-demand (905.js, 281.js, 579.js, 573.js, 11.js + more)
- **Resource hints:** ✅ Added - preconnect/dns-prefetch for Google Analytics and Iconify CDN
- **Tree-shaking:** ✅ Verified - Chart.js uses tree-shakeable named imports throughout

### Estimated Technical Debt

| Priority | Estimated Effort | Issues |
|----------|-----------------|--------|
| 🔴 High | ~1-2 days | Remaining Lighthouse optimizations (data compression, caching) |
| 🟡 Medium | ✅ **Complete** | All medium priority issues resolved |
| 🟢 Low | ~0.5 days | Style fixes, minor improvements |
| 📊 Performance | ~1-2 days | Data file optimization (4.3MB bottleneck), caching strategy |
| 🧪 Testing | ~0.5 days | Optional: TypeScript type testing |
| **Total** | **~2-3 days** | 4 remaining issues (down from 18) |

**Recent Performance Improvements (Nov 2025):**
- ✅ Code splitting reduces initial JavaScript load (6 chart chunks created)
- ✅ Resource hints speed up external resource loading
- ✅ Chart.js tree-shaking verified and optimized
- ✅ First Load JS maintained at 102 kB (gzipped)

**Note:** Critical business logic testing is ✅ complete (343 tests, 99%+ utils/hooks coverage)

---

## Recommended Action Plan

### Phase 1: Quick Wins (1-2 days) - ✅ COMPLETE
1. ✅ Extract magic strings to constants (#3)
2. ✅ Create custom hook for chart month range (#5)
3. ✅ Fix bureau label lookup performance (#7)
4. ✅ Remove/fix console logs (#4)
5. ✅ Fix accessibility issues (#12, #13)

### Phase 2: Type Safety (2-3 days) - ✅ COMPLETE
1. ✅ Define proper e-Stat API types (#2)
2. ✅ Enable TypeScript strict mode (#1)
3. ⏳ Remove ESLint disables (#11) - Low priority

### Phase 3: Testing Infrastructure (3-4 days) - ✅ COMPLETE
1. ✅ Set up Jest + React Testing Library (#17)
2. ✅ Write critical path tests (315 tests: utils 99%, hooks 90%, components 100%)
3. ✅ Component tests (FilterPanel ✅, EstimationCard ✅, StatsSummary ✅)
4. ✅ Add error boundaries (#16)

### Phase 4: Optimization (1-2 days) - ✅ COMPLETE
1. ✅ Fix chart re-render issues (#14)
2. ✅ Run bundle analysis (#15)
3. ✅ Optimize data filtering (#8)
4. ✅ Optimize bureau label lookups (#7)

### Phase 5: Lighthouse Performance (2-3 days)
1. Profile with Chrome DevTools to identify LCP bottlenecks (#19)
2. Implement code splitting for chart components (#19.6)
3. Optimize JavaScript execution time and reduce unused code (#19.4, #19.6)
4. Fix forced reflow issues (#19.2)
5. Optimize network dependency tree (#19.3)
6. Configure efficient cache lifetimes for GitHub Pages (#19.1)
7. Minimize main-thread work (#19.5)

**Goal:** Reduce LCP from 4.5s to < 2.5s

---

## Notes

- Issues are tracked in this document until a proper issue tracking system is implemented
- Priority levels are suggestions and can be adjusted based on project needs
- Effort estimates are approximate and based on single developer work
- Some issues can be addressed in parallel

---

## Recent Progress

### TypeScript Strict Mode - Issue #1 Complete (November 2025)
✅ **Major achievement:** Enabled TypeScript strict mode and resolved all 147 errors

**Error Resolution Progress:**
- **Started:** 147 TypeScript strict mode errors
- **Phase 1:** 147 → 51 errors (65% reduction) - Fixed production code
- **Phase 2:** 51 → 0 errors (100% reduction) - Fixed test mocks and remaining issues
- **Final:** 0 errors, 100% resolved ✅

**Files Modified (20+ files):**
- **Type Definitions:** Created react-simple-maps.d.ts, jest-dom.d.ts
- **Hooks:** useDataMetadata (generic), useImmigrationData (error handling)
- **Components:** App, FilterPanel, 5 chart components
- **Utils:** loadLocalData, correctBureauAggregates, dataTransform
- **Tests:** Mock data enhanced with full EStatResponse structure

**Key Improvements:**

Null Safety Throughout:
```typescript
// Before: Potential null reference errors
<FilterPanel data={data} />
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// After: Safe null handling
<FilterPanel data={data ?? []} />
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''
```

Proper Error Handling:
```typescript
// Before: Implicit any loses type information
catch (error: any) {
  setError(error.message);
}

// After: Type-safe error handling
catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  setError(message);
}
```

Chart.js Full Type Safety:
```typescript
// Before: Untyped callbacks
afterBuildTicks: (axis) => { ... }

// After: Fully typed with Chart.js types
import type { Scale, TooltipItem } from 'chart.js';
afterBuildTicks: (axis: Scale) => { ... }
label: (context: TooltipItem<'bar'>) => { ... }
```

react-simple-maps Type Declarations:
```typescript
// Created comprehensive type definitions
export interface Geography {
  type: string;
  properties: GeoProperties;
  geometry: unknown;
  rsmKey: string;
}
```

**Impact:**
- ✅ **All strict mode checks enabled:** strictNullChecks, noImplicitAny, strictFunctionTypes, strictPropertyInitialization
- ✅ **147 type errors resolved** across 20+ files
- ✅ **Better IDE support:** Accurate autocomplete and error detection
- ✅ **Compile-time safety:** Catches bugs before runtime
- ✅ **All 343 tests passing** with zero regressions
- ✅ **Clean production build** verified

**Strict Mode Features Now Enforced:**
- `strictNullChecks` - All null/undefined access properly handled
- `noImplicitAny` - No implicit any types allowed
- `strictFunctionTypes` - Function signatures strictly checked
- `strictPropertyInitialization` - Class properties validated
- `strictBindCallApply` - bind/call/apply strictly typed
- `alwaysStrict` - Emit "use strict" in all files

### Type Safety Refactoring - Issue #2 Complete (November 2025)
✅ **Major achievement:** Eliminated all `any` types from production and test code

**Comprehensive Type System:**
- Created `src/types/estat.ts` with 174 lines of complete e-Stat API type definitions
- Defined 10+ interfaces: EStatResponse, EStatValue, ClassObj, ResultInfo, TableInfo, etc.
- All types documented with JSDoc comments for better developer experience

**Production Code Updated (14 files):**
- **Utils:** loadLocalData, correctBureauAggregates, dataTransform
- **Hooks:** useImmigrationData (error handling), useDataMetadata (generic)
- **Components:** FilterPanel, 6 chart components

**Test Code Updated (9 files):** ✅ **NEW**
- **Utils Tests:** getBureauData.test.ts (28 any), calculateEstimates.test.ts (2 any), dataTransform.test.ts (2 any)
- **Hooks Tests:** useDataMetadata.test.ts (4 any), useImmigrationData.test.ts (1 any)
- **Component Tests:** StatsSummary.test.tsx (4 any), EstimationCard.test.tsx (8 any), FilterPanel.test.tsx (9 any)

**Key Improvements:**
```typescript
// Before: Type erasure everywhere
export const loadLocalData = async (): Promise<any> => { ... }
catch (error: any) { setError(error.message); }
callbacks: { label: (context: any) => { ... } }

// After: Full type safety
export const loadLocalData = async (): Promise<EStatResponse | null> => { ... }
catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  setError(message);
}
callbacks: { label: (context: TooltipItem<'line'>) => { ... } }
```

**Impact:**
- **68+ `any` types eliminated** across 23 files (14 production + 9 test)
- **Zero ESLint warnings** for `@typescript-eslint/no-explicit-any`
- **Better IntelliSense:** IDE now provides accurate autocomplete for all code
- **Compile-time safety:** TypeScript catches type errors before runtime in production and tests
- **Safer refactoring:** Type system ensures consistency across changes
- **Test mock type safety:** All Jest mocks now have proper TypeScript interfaces
- **All 343 tests passing** with zero regressions
- **Clean production build** with no warnings
- **Consistent type patterns:** Uses `as unknown as T` for intentionally invalid test data

### Testing Achievement (October 2025)
✅ **Major milestone reached:** Comprehensive test coverage for all critical components

**Test Suite Summary:**
- **315 passing tests** across utilities, hooks, and components (up from 232)
- **35.46% overall coverage** (up from 26.92%)
- **Utils Module:** 99.44% coverage (173 tests)
  - All critical data transformation and calculation logic fully tested
  - Includes complex deaggregation algorithm and estimation calculations
- **Hooks Module:** 90.9% coverage (32 tests)
  - Data loading and state management thoroughly tested
- **Components Module:** 110 tests
  - FilterPanel component at 100% coverage (27 tests)
  - ✅ **NEW:** EstimationCard at 100% coverage (45 tests)
  - ✅ **NEW:** StatsSummary at 100% coverage (38 tests)

**Completed in Latest Update:**
1. ✅ EstimationCard comprehensive testing (45 tests)
   - Covers all variants (drawer, expandable), user interactions, edge cases
2. ✅ StatsSummary comprehensive testing (38 tests)
   - Covers filtering, calculations, tooltips, accessibility
3. ✅ ErrorBoundary component implementation
   - Production-ready error handling with dev mode details
   - Integrated throughout App.tsx

**Impact:**
- Critical business logic (data transformation, bureau corrections, processing estimates) is now well-protected against regressions
- Key UI components fully tested with 100% coverage
- Production error handling in place
- CI/CD pipeline integrated with automated test execution

**Remaining Optional Work:**
- Chart component tests (lower priority, data transformation already tested)

### Type Safety Enhancement (October 2025)
✅ **Major improvement:** Full type safety for ImmigrationData interface

**Enhancement Summary:**
- **Before:** ImmigrationData used plain `string` types for bureau, type, and status fields
- **After:** ImmigrationData uses typed constants (BureauCode, ApplicationTypeCode, StatusCode)
- **Result:** Compile-time type checking for all immigration data operations

**Changes Made:**
1. ✅ Updated `ImmigrationData` interface in `src/hooks/useImmigrationData.ts`
   - `bureau: string` → `bureau: BureauCode`
   - `type: string` → `type: ApplicationTypeCode`
   - `status: string` → `status: StatusCode`

2. ✅ Updated `dataTransform.ts` to add type assertions when parsing e-Stat data
   - Ensures raw string data is properly typed when creating ImmigrationData objects

3. ✅ Fixed type narrowing in `BureauPerformanceBubbleChart.tsx`
   - Fixed compilation error with `.includes()` method using StatusCode array

**Impact:**
- **IntelliSense support:** IDE now autocompletes valid bureau/type/status codes
- **Compile-time validation:** Invalid codes caught during development, not runtime
- **Type safety:** TypeScript enforces use of valid codes throughout codebase
- **Zero regressions:** All 315 tests passing, production build successful
- **Better refactoring:** Type system ensures all usages are updated when codes change

**Example:**
```typescript
// TypeScript now catches invalid codes at compile time
const data: ImmigrationData = {
  month: '2025-01',
  bureau: '999999',  // ❌ Type error: not assignable to BureauCode
  type: '99',        // ❌ Type error: not assignable to ApplicationTypeCode
  status: '000000',  // ❌ Type error: not assignable to StatusCode
  value: 100
};

// Valid usage with autocomplete support
const data: ImmigrationData = {
  month: '2025-01',
  bureau: BUREAU_CODES.SHINAGAWA,  // ✅ '101170'
  type: APPLICATION_TYPE_CODES.EXTENSION_OF_STAY,  // ✅ '20'
  status: STATUS_CODES.PROCESSED,  // ✅ '300000'
  value: 100
};
```