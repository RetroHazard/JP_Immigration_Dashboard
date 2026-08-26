# Contributing to Japan Immigration Statistics Dashboard

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Before You Start](#before-you-start)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Guidelines](#coding-guidelines)
- [Localization](#localization)
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

- **Node.js** — pinned in `.nvmrc` (Node 22); CI and the deploy both read it from there. Run `nvm use` to adopt it locally
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

4. **Typecheck** — CI gates on this, so catch type errors before pushing:
   ```bash
   npm run typecheck
   ```

5. **Run tests** — Verify tests pass:
   ```bash
   npm test
   ```

6. **Build locally** — Test that production build succeeds:
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
├── app/              # Next.js app routes (static export entry points)
├── components/       # React components
│   ├── common/       # Reusable components (StatCard, FilterInput, ...)
│   ├── charts/       # Chart components (one per chart tab)
│   ├── ui/           # shadcn/Radix primitives (vendored)
│   ├── bklit/        # Vendored Bklit UI chart library (visx-based)
│   └── __tests__/    # Component tests
├── hooks/            # Custom React hooks
├── utils/            # Utility functions and data selectors (+ __tests__/)
├── constants/        # Constants (bureaus, application types, status codes, ...)
├── contexts/         # React context providers (theme)
├── i18n/             # Locale catalogues, translation runtime, and formatters
└── lib/              # Small shared helpers (class-merge, motion)
```

## Localization

Every user-visible string lives in a per-language catalogue under
`src/i18n/locales/`, so adding or fixing a translation is a content change,
not a code change — see [`src/i18n/README.md`](src/i18n/README.md) for the
full guide to the catalogue format, plurals, and the three name widths
(`.label`/`.compact`/`.short`).

### Correcting a translation

English is written and reviewed by hand. Every other locale started from a
machine translation, and while each pack was checked for structural
correctness (every key present, placeholders intact, right plural forms),
that check can't catch wrong terminology, awkward phrasing, or a mistranslated
nuance — only a fluent reader will spot those. If you find one:

1. Open `src/i18n/locales/<code>.ts` and fix the line(s) in question.
2. Run `npx vitest run src/i18n` to confirm the catalogue tests still pass
   (placeholders preserved, no accidental blank values, script check for
   non-Latin locales).
3. Open a PR as described below. A one- or two-line wording fix doesn't need
   an issue first — that requirement is for larger changes. Explain what was
   wrong and why your replacement is correct; if you're not a fluent speaker
   of the language, say so, so reviewers know to look for a second opinion.

If you'd rather flag a mistake than fix it yourself, open a
[bug report issue](https://github.com/RetroHazard/JP_Immigration_Dashboard/issues/new?template=bug_report.md)
naming the language, the key or on-screen text, and what it should say
instead.

### Adding or removing an English string

Any code change that introduces user-visible text needs a catalogue key, and a
key is never English-only: all twelve locales are marked `complete`, so CI
fails the moment English defines something they don't.

1. Add the key to `src/i18n/locales/en.ts`, in the section for the surface it
   appears on. `DictionaryKey` derives from this file, so nothing type-checks
   until it exists here.
2. Add a translation to each of the other eleven locale files. The catalogue
   tests reject a value left identical to English, and hold `ja`, `ko`,
   `zh-CN` and `zh-TW` to their own scripts — a copied English string will not
   pass. If you can't translate one, say so in the PR rather than pasting
   English in.
3. **Removing** a key is the same in reverse: delete it from all twelve files,
   then grep the repo for stragglers — including the Markdown, where catalogue
   keys quoted in documentation are checked by nothing.
4. Regenerate the contributor template: `npm run i18n:template`. A test
   compares the committed template against English, so skipping this fails CI.
5. Run `npx vitest run src/i18n` before pushing.

Two things worth reusing rather than adding to: bureau, application-type and
prefecture names already exist in three widths each, and the `metric.*` names
are shared across chart legends, hover cards and data-table columns — where
they are also written into CSV exports, so rewording one changes a file other
people may be parsing.

Adding a language you don't see listed follows the same catalogue file
mechanism — the step-by-step is in `src/i18n/README.md`, not repeated here.

## Testing

### Writing Tests

- Tests use **Vitest** and should be placed near the code they test
- File naming: `*.test.ts` or `*.test.tsx`
- Test data processing functions, hooks, and utilities

Example (adapted from the real `src/utils/__tests__/selectors.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { selectData } from '../selectors';

describe('selectData bureau scopes', () => {
  it('bureau scope returns exactly that bureau', () => {
    const data = [
      { month: '2025-06', bureau: '101170', type: '20', status: '300000', value: 600 },
      { month: '2025-06', bureau: '101460', type: '20', status: '300000', value: 400 },
    ];

    const result = selectData(data, { scope: { kind: 'bureau', code: '101460' } });

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(400);
  });
});
```

### Running Tests

```bash
npm test                 # Run all tests once
npm test -- --watch     # Run in watch mode
```

## Documentation

### Which docs to update

The repo keeps six documents, and they cover different readers. Match your
change to the ones it actually affects:

| If your change… | Update |
| --- | --- |
| affects features, behaviour, or setup | `README.md` |
| is user-visible at all | `CHANGELOG.md`, under the current month |
| **adds or renames a file** under `src/` | the file-by-file tree in `DEVELOPMENT.md` — it is exhaustive, and a missing entry is a real gap |
| adds a component, a pure module, or a new pattern | a `#### **Name**` section in `ARCHITECTURE.md`, and any diagram that would now be incomplete without it |
| changes how a workflow is done (adding a chart, a dataset, a catalogue key) | the matching walkthrough in `DEVELOPMENT.md` or `CONTRIBUTING.md`. A code sample in a guide is code: if it no longer compiles, it is a bug |
| touches the catalogue | `src/i18n/README.md` |

Also bump the version in `package.json` and the version badge at the top of
`README.md` together — they are checked by nobody and drift the moment one
moves without the other.

### Bump the version

A changelog entry names a version, so the version has to move with it. Both
places, or the two disagree:

1. `version` in `package.json` — what `react-build-info` stamps into the footer
2. The version badge on line 2 of `README.md`

Semver as usual: a new feature or a visible change to one takes the minor, a
bug fix on its own takes the patch. Everything shipping together shares a
single version, however many commits it took.

### Update CHANGELOG.md

When adding a feature or fixing a bug:

1. Find the current month section (create if needed)
2. Add your change under the appropriate subsection:
   - **Added** — New features
   - **Changed** — Modifications to existing features
   - **Fixed** — Bug fixes

Dependency/CVE patches aren't user-facing on their own and don't belong here — git history and Dependabot already track those.

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
   npm run lint        # Check code style
   npm run typecheck   # Check types
   npm test            # Run tests
   npm run build       # Verify production build
   ```

   These are exactly what `verify.yaml` runs on your PR, so a clean pass here
   means a green check.

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

1. **Automated checks** — `verify.yaml` runs the lockfile check, lint, typecheck, tests, and a production build against the fixture data. It reports as a single `verify` check, and runs on pull requests only, so you get one run per push rather than two
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
