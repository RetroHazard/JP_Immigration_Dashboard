# Testing Guide

## Overview

This document describes the testing infrastructure and guidelines for the Japan Immigration Dashboard project.

## Testing Stack

- **Test Runner**: Jest 30.2.0
- **React Testing**: @testing-library/react 16.3.0
- **DOM Matchers**: @testing-library/jest-dom 6.9.1
- **User Interactions**: @testing-library/user-event 14.6.1
- **TypeScript Support**: ts-jest 29.4.5

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Project Structure

```
src/
├── __mocks__/              # Mock data for testing
│   ├── mockEStatData.ts    # Mock e-Stat API responses
│   └── mockImmigrationData.ts  # Mock transformed immigration data
├── utils/
│   └── *.test.ts          # Unit tests for utilities
├── hooks/
│   └── *.test.ts          # Tests for React hooks
└── components/
    └── *.test.tsx         # Tests for React components

__mocks__/                  # Global mocks
├── styleMock.js           # CSS/SCSS mock
└── fileMock.js            # Image/asset mock
```

## Test Files

Test files should be named `*.test.ts` or `*.test.tsx` and placed alongside the files they test.

### Current Test Files

**Utility Tests:**
- `src/utils/dataTransform.test.ts` - 17 tests for e-Stat data transformation
- `src/utils/correctBureauAggregates.test.ts` - 32 tests for bureau deaggregation system
- `src/utils/loadLocalData.test.ts` - 22 tests for data fetching
- `src/utils/calculateEstimates.test.ts` - 50 tests for processing time estimation
- `src/utils/getBureauData.test.ts` - 52 tests for bureau utility functions

**Hook Tests:**
- `src/hooks/useImmigrationData.test.ts` - 32 tests for data loading hook

**Component Tests:**
- `src/components/FilterPanel.test.tsx` - 27 tests for filter panel with date range calculation

**Total:** 232 tests covering critical business logic, hooks, utilities, and components

## Mock Data

### mockEStatData.ts

Contains sample e-Stat API response data including:
- **mockEStatResponse**: Full response with multiple bureaus, months, and application types
- **mockEStatMinimal**: Minimal response for basic tests
- **mockEStatEmpty**: Empty response for error handling tests

### mockImmigrationData.ts

Contains transformed ImmigrationData samples including:
- **mockImmigrationData**: Multi-month data for Shinagawa and Osaka bureaus
- **mockImmigrationDataMinimal**: Single data point for basic tests
- **mockImmigrationDataEdgeCases**: Edge cases (zero values, large values)
- **generateMockData()**: Helper function to generate custom mock datasets

## Writing Tests

### Unit Tests (Utilities)

```typescript
import { transformData } from './dataTransform';
import { mockEStatResponse } from '../__mocks__/mockEStatData';

describe('dataTransform', () => {
  describe('transformData', () => {
    it('should transform e-Stat data correctly', () => {
      const result = transformData(mockEStatResponse);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('month');
    });
  });
});
```

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);

    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should return expected value', async () => {
    const { result } = renderHook(() => useMyHook());

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

## Coverage Goals

### Current Coverage (After Phase 4 - Partial)
- **Overall**: 26.92% statement coverage
- **Utils Module**: 99.44% statement, 93.9% branch, 100% function coverage
- **Hooks Module**: 90.9% statement, 100% branch, 75% function coverage
- **Components Module**: 25.77% statement, 13.63% branch, 21.42% function coverage
- **Total Tests**: 232 passing tests

**Individual Files:**
- **dataTransform.ts**: 95% statement, 83.33% branch (17 tests) ✓
- **correctBureauAggregates.ts**: 100% statement, 90.62% branch (32 tests) ✓
- **loadLocalData.ts**: 100% statement, 100% branch (22 tests) ✓
- **calculateEstimates.ts**: 100% statement, 100% branch (50 tests) ✓
- **getBureauData.ts**: 100% statement, 100% branch (52 tests) ✓
- **useImmigrationData.ts**: 90.9% statement, 100% branch (32 tests) ✓
- **FilterPanel.tsx**: 100% statement, 100% branch (27 tests) ✓

### Target Coverage

#### Phase 1: Critical Business Logic ✓ (COMPLETE)
- **correctBureauAggregates.ts**: 90%+ coverage ✓ (100% achieved)
- **dataTransform.ts**: 90%+ coverage ✓ (95% achieved)
- **loadLocalData.ts**: 90%+ coverage ✓ (100% achieved)
- **calculateEstimates.ts**: 85%+ coverage ✓ (100% achieved)

#### Phase 2: Hooks & Utilities ✓ (COMPLETE)
- **useImmigrationData**: 90%+ coverage ✓ (90.9% achieved)
- **getBureauData**: 90%+ coverage ✓ (100% achieved)

#### Phase 3: Components (In Progress)
- **FilterPanel**: 70%+ coverage ✓ (100% achieved)
- **EstimationCard**: 70%+ coverage (pending)
- **StatsSummary**: 70%+ coverage (pending)
- **Chart Components**: 70%+ coverage (future)

#### Overall Target
- **Total Project**: 75%+ coverage

## Configuration

### jest.config.js

The Jest configuration is set up for Next.js with:
- `jsdom` test environment for React components
- Path mapping for `@/` imports
- CSS and image mocking
- Coverage collection from `src/**/*.{ts,tsx}`
- Exclusion of Next.js app directory

### jest.setup.js

Setup file includes:
- `@testing-library/jest-dom` matchers
- `window.matchMedia` mock
- `ResizeObserver` mock
- `IntersectionObserver` mock
- `HTMLCanvasElement.getContext` mock for Chart.js

## Best Practices

### 1. Test Business Logic First
Focus on critical data pipeline and calculation logic before testing UI components.

### 2. Use Mock Data
Utilize the mock data files in `src/__mocks__/` for consistent test data.

### 3. Test Edge Cases
Always test:
- Empty data
- Null/undefined values
- Malformed input
- Boundary conditions

### 4. Mock External Dependencies
Mock:
- Fetch API calls
- Chart.js rendering
- Browser APIs (localStorage, etc.)

### 5. Avoid Snapshot Testing
Avoid snapshots for:
- Charts (canvas/SVG output)
- Date-dependent content
- Randomized data

### 6. Test User Interactions
For components, test:
- User input (typing, clicking)
- State changes
- Conditional rendering

## Continuous Integration

Tests are automatically run in the GitHub Actions workflow. Future enhancements will include:
- Coverage reporting to Codecov
- Pre-commit hooks with Husky
- Coverage badges in README

## Testing Roadmap

### Week 1: Foundation ✓ (Complete)
- [x] Set up Jest and React Testing Library
- [x] Configure test environment
- [x] Create mock data files
- [x] Write initial tests for dataTransform

### Week 2-3: Critical Business Logic ✓ (Complete)
- [x] Test correctBureauAggregates (deaggregation system) - 32 tests, 100% coverage
- [x] Test loadLocalData (data fetching) - 22 tests, 100% coverage
- [x] Test calculateEstimates (estimation algorithm) - 50 tests, 100% coverage

### Week 4-5: Hooks & Utilities ✓ (Complete)
- [x] Test useImmigrationData hook - 32 tests, 90.9% coverage
- [x] Test getBureauData utilities - 52 tests, 100% coverage

### Week 6-8: Components (In Progress)
- [x] Test FilterPanel - 27 tests, 100% coverage
- [ ] Test StatsSummary (pending)
- [ ] Test EstimationCard (pending)
- [ ] Test Chart components (future)

## Troubleshooting

### Common Issues

**Canvas errors in chart tests:**
- The `jest.setup.js` file mocks `HTMLCanvasElement.getContext`
- For deeper chart testing, mock Chart.js entirely

**Module path errors:**
- Ensure `@/` alias is configured in `jest.config.js`
- Check that `tsconfig.json` paths match

**Async test timeouts:**
- Use `waitFor` from `@testing-library/react`
- Increase timeout if needed: `jest.setTimeout(10000)`

**CSS import errors:**
- Verify `styleMock.js` is in `__mocks__/` directory
- Check `moduleNameMapper` in `jest.config.js`

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Testing Best Practices](https://testingjavascript.com/)
