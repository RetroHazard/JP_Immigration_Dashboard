# Contributing to Japan Immigration Statistics Dashboard

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Before You Start](#before-you-start)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Review Process](#review-process)

## Code of Conduct

Be respectful, constructive, and collaborative. We're all here to improve immigration data accessibility. Harassment, discrimination, and disrespectful behavior are not tolerated.

## Before You Start

1. **Check existing issues and PRs** — Browse [open issues](https://github.com/RetroHazard/JP_Immigration_Dashboard/issues) and [pull requests](https://github.com/RetroHazard/JP_Immigration_Dashboard/pulls) to avoid duplicating work.

2. **For major changes** — Open an issue first to discuss your proposal. This helps ensure your work aligns with the project's direction and prevents wasted effort.

3. **Fork the repository** — Create a personal fork and work on a feature branch from `main`.

## Getting Started

### Prerequisites

- **Node.js** — Version 18+ (check `package.json` for exact version requirements)
- **npm** — Comes with Node.js
- **Git** — For version control

### Setup

1. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/JP_Immigration_Dashboard.git
   cd JP_Immigration_Dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The dashboard will be available at `http://localhost:3000`

## Development Workflow

### Creating a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/new-chart-type`
- `fix/estimation-calculation`
- `docs/update-readme`
- `refactor/data-hooks`

### During Development

1. **Write code** following the [Coding Guidelines](#coding-guidelines)
2. **Test frequently** — Use the dev server and test changes in browser
3. **Run linting** — Ensure code passes linting checks:
   ```bash
   npm run lint
   ```

4. **Run tests** — Verify tests pass:
   ```bash
   npm test
   ```

5. **Build locally** — Test that production build succeeds:
   ```bash
   npm run build
   ```

### Before Committing

- **Format code** — Prettier is configured and runs automatically during commits
- **Remove debug code** — No `console.log` or temporary modifications in commits
- **Write clear commit messages** — See [Commit Message Guidelines](#commit-message-guidelines) below

#### Commit Message Guidelines

Use clear, descriptive commit messages:

- **For features:** `feat: add export functionality to charts`
- **For fixes:** `fix: prevent aggregate bureaus from double-counting`
- **For docs:** `docs: add architecture guide`
- **For refactors:** `refactor: consolidate data filtering logic`
- **For tests:** `test: add unit tests for estimation formula`

## Coding Guidelines

### TypeScript

- **Strict types required** — No implicit `any` types. Use explicit types for all functions and variables.
- **Type safety** — Leverage TypeScript for compile-time error catching
- **Example:**
  ```typescript
  // Good
  function filterByBureau(data: ImmigrationData[], bureau: string): ImmigrationData[] {
    return data.filter(item => item.bureau === bureau);
  }

  // Avoid
  function filterByBureau(data: any[], bureau: any): any[] {
    return data.filter(item => item.bureau === bureau);
  }
  ```

### Code Style

- **ESLint + Prettier** — Automatically enforces code style
- **Import sorting** — Use `simple-import-sort` plugin
- **Tailwind CSS** — Use utility classes for styling (avoid inline styles)
- **React components** — Use functional components with hooks

### Performance

- **Memoization** — Use `useMemo` and `useCallback` for expensive operations
- **Lazy loading** — Import heavy dependencies dynamically when possible
- **Avoid re-renders** — Use proper dependency arrays in hooks

### File Organization

Follow the existing project structure:

```
src/
├── app/              # Next.js app routes
├── components/       # React components
│   ├── layouts/      # Layout components
│   ├── common/       # Reusable components
│   └── charts/       # Chart components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── constants/        # Constants and type definitions
├── contexts/         # React context providers
└── __tests__/        # Unit tests
```

## Testing

### Writing Tests

- Tests use **Vitest** and should be placed near the code they test
- File naming: `*.test.ts` or `*.test.tsx`
- Test data processing functions, hooks, and utilities

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { filterByBureau } from './data-utils';

describe('filterByBureau', () => {
  it('returns only items matching the bureau', () => {
    const data = [
      { bureau: 'Tokyo', count: 100 },
      { bureau: 'Osaka', count: 50 },
    ];

    const result = filterByBureau(data, 'Tokyo');

    expect(result).toHaveLength(1);
    expect(result[0].bureau).toBe('Tokyo');
  });
});
```

### Running Tests

```bash
npm test                 # Run all tests once
npm test -- --watch     # Run in watch mode
```

## Documentation

### Update README.md

If your changes affect the dashboard's features, behavior, or setup:
1. Update relevant sections in `README.md`
2. Add an entry to `CHANGELOG.md` under the current month

### Update CHANGELOG.md

When adding a feature or fixing a bug:

1. Find the current month section (create if needed)
2. Add your change under the appropriate subsection:
   - **Added** — New features
   - **Changed** — Modifications to existing features
   - **Fixed** — Bug fixes
   - **Security** — Security patches

Example:
```markdown
### Added

- **v0.9.0**: New bureau comparison feature with side-by-side charts ([#123](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/123))

### Fixed

- Fixed estimation formula for applications crossing month boundaries
```

### Code Comments

- **Keep comments minimal** — Well-named code is self-documenting
- **Only comment non-obvious logic** — Explain the "why", not the "what"
- **Avoid redundant comments** — Don't repeat what the code clearly states

## Submitting Changes

### Before Creating a Pull Request

1. **Update from main:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all checks:**
   ```bash
   npm run lint    # Check code style
   npm test        # Run tests
   npm run build   # Verify production build
   ```

3. **Test in browser:**
   - Test across different screen sizes (mobile + desktop)
   - Test in light and dark mode
   - Verify all affected features work correctly

### Creating a Pull Request

1. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a PR on GitHub:**
   - Provide a clear, descriptive title
   - Reference related issues (e.g., "Fixes #123")
   - Describe what changed and why
   - Include screenshots for UI changes

3. **Enable maintainer edits:**
   - If your PR is from a fork, check "Allow edits by maintainers"
   - This lets maintainers push fixups directly without requiring a new PR

## Review Process

### What to Expect

1. **Automated checks** — GitHub Actions runs linting, tests, and builds
2. **Code review** — Maintainers or contributors may review and suggest changes
3. **Responsiveness** — Be prepared to respond to feedback and make updates

### Making Requested Changes

1. **Address feedback** — Make the requested changes in new commits
2. **Push updates** — Maintainers will review the updates
3. **Keep it focused** — Avoid adding unrelated changes in the same PR

### After Merge

Once your PR is merged:
- Your contribution will be part of the next release
- You'll be acknowledged in the project (if applicable)
- The branch will be automatically deleted

## Getting Help

- **Questions?** — Open a [discussion](https://github.com/RetroHazard/JP_Immigration_Dashboard/discussions) or ask in a related issue
- **Found a bug?** — Open a [bug report issue](https://github.com/RetroHazard/JP_Immigration_Dashboard/issues/new?template=bug_report.md)
- **Have an idea?** — Open a [feature request issue](https://github.com/RetroHazard/JP_Immigration_Dashboard/issues/new?template=feature_request.md)

Thank you for contributing! 🙏
