# Implementation TODO List - Code Review Findings

**Generated:** 2026-01-25
**Total Issues:** 37 (4 Critical, 12 High, 15 Medium, 6 Low)

This TODO list organizes all code review findings into actionable tasks prioritized by severity and impact. Each task includes file locations, specific changes needed, and verification steps.

---

## ⚠️ CRITICAL Priority (Must Fix - Week 1)

### Data Accuracy & Validation

- [ ] **D1: Add negative value validation in bureau deaggregation**
  - **File:** `src/utils/correctBureauAggregates.ts:106`
  - **Changes:**
    - Add validation check after `const corrected = base - subtotal;`
    - Log warning and return uncorrected value if negative
    - See CODE_REVIEW_FINDINGS.md D1 for implementation
  - **Verification:** Run validation script on production data, confirm no negatives

- [ ] **D2: Improve NaN fallback logging**
  - **File:** `src/utils/dataTransform.ts:56-57`
  - **Changes:**
    - Add warning log when NaN fallback occurs
    - Track which coordinates produce NaN corrections
    - See CODE_REVIEW_FINDINGS.md D2 for implementation
  - **Verification:** Ensure no silent NaN fallbacks in production data

- [ ] **D3: Add minimum data validation for estimation**
  - **File:** `src/utils/calculateEstimates.ts:64`
  - **Changes:**
    - Check minimum 3 months of data before estimation
    - Return data quality indicator in results
    - Add UI warning when < 6 months available
    - See CODE_REVIEW_FINDINGS.md D3 for implementation
  - **Verification:** Test with 1, 3, 5, and 6+ months of data

- [ ] **D4: Add infinite loop protection**
  - **File:** `src/utils/calculateEstimates.ts:176-183`
  - **Changes:**
    - Add MAX_MONTHS_TO_SIMULATE = 60 constant
    - Add monthsSimulated counter in while loop
    - Return null if limit exceeded with error log
    - See CODE_REVIEW_FINDINGS.md D4 for implementation
  - **Verification:** Test with invalid application dates (far future)

- [ ] **D5: Add month format validation**
  - **File:** `src/utils/dataTransform.ts:38`
  - **Changes:**
    - Create validateAndParseMonth function
    - Validate YYYYMMDD format with regex
    - Validate month range (01-12)
    - See CODE_REVIEW_FINDINGS.md D5 for implementation
  - **Verification:** Test with malformed @time values

---

## 🚀 HIGH Priority (Performance - Week 2)

### Bundle Size Optimization

- [ ] **P1: Implement dynamic imports for charts**
  - **Files:** `src/components/common/ChartComponents.tsx`, all 6 chart components
  - **Changes:**
    - Use Next.js `dynamic()` for all chart components
    - Add `ssr: false` and loading spinner
    - See CODE_REVIEW_FINDINGS.md P1 for implementation
  - **Expected Impact:** -150KB bundle, faster FCP
  - **Verification:** Build and compare bundle sizes before/after

- [ ] **P10: Lazy load KaTeX library**
  - **File:** `src/components/EstimationCard.tsx:5,16`
  - **Changes:**
    - Remove static import of react-katex and CSS
    - Use dynamic import with Suspense
    - Load CSS in useEffect when showDetails true
    - See CODE_REVIEW_FINDINGS.md P10 for implementation
  - **Expected Impact:** -100KB bundle reduction
  - **Verification:** Test formula display still works

### Render Performance

- [ ] **P2: Extract anonymous IIFE to separate component**
  - **File:** `src/App.tsx:133-136, 205-208`
  - **Changes:**
    - Create new `src/components/ActiveChart.tsx`
    - Wrap with React.memo and custom comparison
    - Replace IIFE calls with <ActiveChart /> component
    - See CODE_REVIEW_FINDINGS.md P2 for implementation
  - **Expected Impact:** Eliminate unnecessary chart re-renders
  - **Verification:** Use React DevTools Profiler to verify no re-renders when filters don't change

- [ ] **P3: Memoize chart options objects**
  - **Files:** All 6 chart components (e.g., `IntakeProcessingBarChart.tsx:112`)
  - **Changes:**
    - Wrap options object in useMemo
    - Add isDarkMode and chartData as dependencies
    - Apply to all 6 charts
    - See CODE_REVIEW_FINDINGS.md P3 for implementation
  - **Expected Impact:** Faster theme toggle, no unnecessary Chart.js reconfiguration
  - **Verification:** Test theme toggle is smooth, no chart reinitialization

- [ ] **P4: Memoize prefecture color calculations**
  - **File:** `src/components/charts/GeographicDistributionChart.tsx:30-86, 196-207`
  - **Changes:**
    - Create prefectureColors useMemo
    - Pre-calculate all 47 prefecture colors once
    - Simplify getFillColor to O(1) lookup
    - See CODE_REVIEW_FINDINGS.md P4 for implementation
  - **Expected Impact:** 47× → 1× color calculations, smoother map interactions
  - **Verification:** Test map pan/zoom performance

- [ ] **P5: Filter data once at App.tsx level**
  - **Files:** `src/App.tsx`, all 6 chart components
  - **Changes:**
    - Add filteredData useMemo in App.tsx
    - Pass filteredData to charts instead of data
    - Simplify chart component filter logic
    - See CODE_REVIEW_FINDINGS.md P5 for implementation
  - **Expected Impact:** 6× → 1× data filtering
  - **Verification:** Test filtering still works correctly in all charts

- [ ] **P6: Extract StatCard component**
  - **File:** `src/components/StatsSummary.tsx:82-121`
  - **Changes:**
    - Create new `src/components/common/StatCard.tsx`
    - Wrap with React.memo
    - Import and use in StatsSummary
    - See CODE_REVIEW_FINDINGS.md P6 for implementation
  - **Expected Impact:** Faster stats renders, better code organization
  - **Verification:** Stats display correctly on all filter changes

- [ ] **P9: Add React.memo to all chart components**
  - **Files:** All 6 chart components
  - **Changes:**
    - Wrap each chart export with React.memo
    - Add custom comparison function
    - Add displayName for better debugging
    - See CODE_REVIEW_FINDINGS.md P9 for implementation
  - **Expected Impact:** Prevent unnecessary chart re-renders
  - **Verification:** Use React Profiler to verify selective re-rendering

### Data Processing

- [ ] **P11: Optimize stats calculation to single reduce**
  - **File:** `src/components/StatsSummary.tsx:48-59`
  - **Changes:**
    - Replace 6 separate reduces with single reduce
    - Use switch statement for status codes
    - See CODE_REVIEW_FINDINGS.md P11 for implementation
  - **Expected Impact:** 6× → 1× array iteration
  - **Verification:** Stats calculations produce same results

- [ ] **P12: Derive chartData instead of using state**
  - **File:** `src/components/charts/IntakeProcessingBarChart.tsx:16-32, 109`
  - **Changes:**
    - Remove useState for chartData
    - Replace useEffect with useMemo
    - Calculate chart data directly
    - See CODE_REVIEW_FINDINGS.md P12 for implementation
  - **Expected Impact:** Simpler code, no stale state issues
  - **Verification:** Chart renders correctly with same data

---

## 📊 MEDIUM Priority (Best Practices - Week 3)

### Hooks & Component Patterns

- [ ] **P7: Add useCallback to stable functions**
  - **Files:** `src/App.tsx:45`, `src/components/FilterPanel.tsx:38`
  - **Changes:**
    - Wrap toggleTheme with useCallback
    - Wrap formatDateString with useCallback
    - See CODE_REVIEW_FINDINGS.md P7 for implementation
  - **Expected Impact:** Prevent unnecessary child re-renders
  - **Verification:** Test theme toggle, date formatting still work

- [ ] **P8: Add AbortController for fetch cleanup**
  - **File:** `src/components/charts/GeographicDistributionChart.tsx:130-141`
  - **Changes:**
    - Create AbortController in useEffect
    - Pass signal to fetch
    - Return cleanup function
    - See CODE_REVIEW_FINDINGS.md P8 for implementation
  - **Expected Impact:** No memory leak warnings
  - **Verification:** Test rapid chart switching, no console warnings

### Error Handling

- [ ] **R2: Add error boundaries**
  - **Files:** Create `src/components/common/ErrorBoundary.tsx`, update `src/App.tsx`
  - **Changes:**
    - Create ErrorBoundary component
    - Wrap entire app in ErrorBoundary
    - Wrap individual charts in ErrorBoundary with fallback
    - See CODE_REVIEW_FINDINGS.md R2 for implementation
  - **Expected Impact:** Graceful error handling, no white screens
  - **Verification:** Throw test error, verify fallback UI displays

- [ ] **R3: Display error state to users**
  - **File:** `src/App.tsx:21`
  - **Changes:**
    - Destructure error from useImmigrationData
    - Add error state UI before main render
    - Show error message and retry button
    - See CODE_REVIEW_FINDINGS.md R3 for implementation
  - **Expected Impact:** Users see errors instead of blank screen
  - **Verification:** Simulate fetch error, verify error UI

### TypeScript

- [ ] **R1: Start TypeScript strict mode migration**
  - **Files:** `tsconfig.json:11`, `src/hooks/useImmigrationData.ts`, `src/utils/loadLocalData.ts`, `src/components/charts/GeographicDistributionChart.tsx`
  - **Changes:**
    - Enable noImplicitAny in tsconfig.json
    - Fix error: any → proper error handling
    - Fix Promise<any> → Promise<EStatData | null>
    - Fix geographyData: any → FeatureCollection
    - See CODE_REVIEW_FINDINGS.md R1 for full migration plan
  - **Expected Impact:** Better type safety, catch bugs at compile time
  - **Verification:** Build succeeds with no type errors

---

## 🔧 LOW Priority (Code Quality - Week 4)

### Refactoring & Code Organization

- [ ] **RO1: Create shared filter hook**
  - **File:** Create `src/hooks/useFilteredData.ts`
  - **Changes:**
    - Extract filter logic to reusable hook
    - Use in StatsSummary and chart components
    - See CODE_REVIEW_FINDINGS.md RO1 for implementation
  - **Expected Impact:** DRY principle, consistent filtering
  - **Verification:** All components filter data identically

- [ ] **RO4: Centralize status code constants**
  - **File:** Create `src/constants/statusCodes.ts`
  - **Changes:**
    - Define STATUS_CODES constant object
    - Replace magic strings throughout codebase
    - See CODE_REVIEW_FINDINGS.md RO4 for implementation
  - **Expected Impact:** Better maintainability, no magic strings
  - **Verification:** All status lookups work correctly

- [ ] **R7: Remove console.log from production**
  - **File:** `src/components/FilterPanel.tsx:20,27`
  - **Changes:**
    - Remove or wrap in NODE_ENV === 'development' check
    - Consider creating logger utility
    - See CODE_REVIEW_FINDINGS.md R7 for implementation
  - **Expected Impact:** Cleaner production console
  - **Verification:** No console logs in production build

### Optional Refactoring

- [ ] **R4: Consider useReducer for App state** (Optional)
  - **File:** `src/App.tsx:22-30`
  - **Changes:**
    - Create appReducer function
    - Replace 4 useState with useReducer
    - See CODE_REVIEW_FINDINGS.md R4 for implementation
  - **Note:** Current approach is acceptable, this is optional improvement

- [ ] **R5: Create theme context** (Optional)
  - **Files:** Create `src/contexts/ThemeContext.tsx`, update `src/app/[[...slug]]/client.tsx`
  - **Changes:**
    - Create ThemeProvider and useTheme hook
    - Wrap app in ThemeProvider
    - Remove isDarkMode prop drilling
    - See CODE_REVIEW_FINDINGS.md R5 for implementation
  - **Note:** Current approach is acceptable for this scale

- [ ] **R6: Split App.tsx into layouts** (Optional)
  - **File:** `src/App.tsx`
  - **Changes:**
    - Create MobileLayout component
    - Create DesktopLayout component
    - Import and use in App.tsx
    - See CODE_REVIEW_FINDINGS.md R6 for implementation
  - **Note:** Current organization is acceptable

---

## ✅ Verification Checklist

### After Each Phase

#### Data Accuracy Verification
- [ ] Create validation script for bureau corrections
- [ ] Run against production data - verify no negatives
- [ ] Test estimation with various data conditions
- [ ] Verify month parsing for all data points
- [ ] Check console for NaN warnings - should be zero

#### Performance Verification
- [ ] Build project: `npm run build`
- [ ] Compare bundle sizes before/after
  - [ ] Check `build/.next/static/chunks/` directory
  - [ ] Document size reductions
- [ ] Run Lighthouse audit
  - [ ] Measure FCP (First Contentful Paint)
  - [ ] Measure LCP (Largest Contentful Paint)
  - [ ] Measure TBT (Total Blocking Time)
  - [ ] Compare before/after scores
- [ ] Use React DevTools Profiler
  - [ ] Profile chart component renders
  - [ ] Profile filter changes
  - [ ] Verify no unnecessary re-renders
- [ ] Manual testing
  - [ ] Test theme toggle smoothness
  - [ ] Test map pan/zoom performance
  - [ ] Test filter interactions

#### Functional Verification
- [ ] All 6 charts render correctly
- [ ] Bureau filter works correctly
- [ ] Application type filter works correctly
- [ ] Estimation calculator produces correct results
- [ ] Mobile drawer opens/closes
- [ ] Desktop estimator expands/collapses
- [ ] Theme toggle updates all components
- [ ] Stats summary displays correct values
- [ ] All tooltips display correctly
- [ ] Map markers and colors display correctly

#### Build Verification
```bash
# Clean build
rm -rf build .next node_modules/.cache

# Fresh install
npm install

# Build
npm run build

# Check for errors
# Should complete without TypeScript or build errors

# Test production build
npx serve@latest ./build
# Open http://localhost:3000
# Test all functionality
```

---

## 📋 Implementation Notes

### Best Practices

1. **One issue at a time:** Implement and test each fix individually
2. **Create feature branches:** Use git branches for each phase
3. **Test thoroughly:** Run verification steps after each change
4. **Commit frequently:** Small, atomic commits with clear messages
5. **Document changes:** Update CHANGELOG.md with user-facing changes

### Suggested Git Workflow

```bash
# Phase 1: Critical fixes
git checkout -b fix/data-accuracy-validation
# Implement D1, D2, D3, D4, D5
git commit -m "Add data accuracy validation and error handling"
# Test thoroughly
git push origin fix/data-accuracy-validation
# Create PR

# Phase 2: Performance
git checkout -b perf/bundle-and-render-optimization
# Implement P1, P2, P3, P4, P5, P6, P9, P10, P11, P12
git commit -m "Optimize bundle size and render performance"
# Test thoroughly
git push origin perf/bundle-and-render-optimization
# Create PR

# Phase 3: Best practices
git checkout -b improve/error-handling-and-types
# Implement P7, P8, R1, R2, R3
git commit -m "Add error handling and improve type safety"
# Test thoroughly
git push origin improve/error-handling-and-types
# Create PR

# Phase 4: Code quality
git checkout -b refactor/code-organization
# Implement RO1, RO4, R7, optional items
git commit -m "Refactor for better code organization"
# Test thoroughly
git push origin refactor/code-organization
# Create PR
```

### Testing Strategy

1. **Unit tests** (if adding test framework):
   - Test validateAndParseMonth function
   - Test bureau deaggregation validation
   - Test estimation algorithm edge cases

2. **Integration tests**:
   - Test filter interactions
   - Test chart rendering with various data states
   - Test theme switching

3. **E2E tests** (if adding Cypress/Playwright):
   - Test full user workflows
   - Test mobile drawer
   - Test estimation calculator

### Performance Baselines

Before starting Phase 2, record current metrics:

```bash
npm run build
# Record bundle sizes from build/.next/static/chunks/

# Run Lighthouse
# Record scores for FCP, LCP, TBT, CLS
```

After Phase 2, compare:
- Expected bundle reduction: ~150KB (-18-22%)
- Expected FCP improvement: -200-400ms
- Expected LCP improvement: -300-500ms

---

## 📊 Progress Tracking

**Phase 1 (Critical):** ☐ 0/5 complete
**Phase 2 (High):** ☐ 0/10 complete
**Phase 3 (Medium):** ☐ 0/6 complete
**Phase 4 (Low):** ☐ 0/6 complete (3 optional)

**Overall Progress:** ☐ 0/37 issues resolved

---

## 🎯 Expected Outcomes

After completing all TODO items:

### Data Quality
✅ No invalid negative values in bureau corrections
✅ All data transformations validated and logged
✅ Estimation algorithm handles edge cases safely
✅ No silent data errors

### Performance
✅ -150KB smaller bundle size
✅ -200-400ms faster First Contentful Paint
✅ Smoother filter interactions
✅ No unnecessary chart re-renders
✅ Efficient map color calculations

### Code Quality
✅ TypeScript strict mode enabled
✅ Error boundaries prevent white screens
✅ Proper error messages for users
✅ Cleaner, more maintainable code
✅ Consistent code patterns throughout

### User Experience
✅ Faster page loads
✅ Smoother interactions
✅ Clear error messages
✅ Reliable data accuracy
✅ Better mobile performance

---

**Generated by:** Claude Sonnet 4.5
**Date:** 2026-01-25
**Estimated Total Effort:** 3-4 weeks (1 week per phase)
**Recommended Approach:** Implement phases sequentially, test thoroughly between phases
