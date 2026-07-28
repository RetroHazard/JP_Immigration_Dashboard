# Development Guide

Comprehensive guide for setting up, running, and developing the Japan Immigration Statistics Dashboard locally.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Build and Deployment](#build-and-deployment)
- [Project Structure](#project-structure)
- [Key Technologies](#key-technologies)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required

- **Node.js** — `package.json` has no `engines` field pinning a minimum; CI runs Node 22 (`ci.yaml`) and the deploy workflow runs Node 20 (`build.yaml`), so either is known-working
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version`

- **npm** — 9.0.0 or higher (included with Node.js)
  - Verify: `npm --version`

- **Git** — For version control
  - Download from [git-scm.com](https://git-scm.com/)

### Optional

- **VS Code** — Recommended editor
  - Extensions: ESLint, Prettier, TypeScript
- **Docker** — For containerized development (optional)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/RetroHazard/JP_Immigration_Dashboard.git
cd JP_Immigration_Dashboard
```

### 2. Install Dependencies

```bash
npm install
```

This installs all dependencies from `package-lock.json` (locked versions for consistency).

### 3. Verify Installation

```bash
npm run lint        # Check that ESLint works
npm test            # Verify tests run
npm run build       # Ensure production build succeeds
```

## Running the Project

### Development Server

```bash
npm run dev
```

- **URL:** `http://localhost:3000`
- **Features:**
  - Hot module reloading (HMR) — Code changes appear instantly
  - Turbopack compiler for faster builds
  - Automatic CHANGELOG syncing
  - Build info generation

The server runs on port 3000. Press `Ctrl+C` to stop.

### Production Build & Server

```bash
npm run start
```

- Builds the project for production (`build/` directory)
- Starts a local server to serve the built files
- URL: `http://localhost:3000` (after build completes)
- Useful for testing production-like behavior locally

### Building Without Serving

```bash
npm run build
```

- Creates an optimized production build in `build/`
- Does NOT start a server
- Output includes build size information

## Build and Deployment

### Build Process

`npm run build` runs, in order:

1. **Build Info Generation** — `react-build-info` injects version and timestamp
2. **CHANGELOG Syncing** — `scripts/sync-changelog.js` copies `CHANGELOG.md` into `public/`
3. **Data Transform** — `scripts/transform-data.mts` turns `public/datastore/statData.json` (the raw e-Stat payload, or a generated fixture if it's absent) into the compact `public/data/dashboard.json` the client fetches
4. **Next.js Build** — Compiles React + TypeScript to a static export (`output: 'export'` in `next.config.ts`)
5. **Strip Raw Data** — `scripts/strip-raw-data.mjs` removes `datastore/` from the exported output so the verbose raw payload never ships to visitors
6. **Output Location** — All files go to the `build/` directory

`npm run dev` runs the data transform once (via the `predev` script) and then starts `next dev --turbopack` with build-info generation and CHANGELOG syncing, same as build.

### Deployment

The project uses **GitHub Pages** for hosting:

1. **Automatic via GitHub Actions** — Pushes to `main` trigger the build workflow
2. **Manual deployment** — Not typically needed (see `.github/workflows/build.yaml`)

### Data Updates

Data is automatically updated via the **Data Watcher Workflow**:

- **Schedule:** Daily at 10:05 AM JST, year-round (not just around the expected release window)
- **Trigger:** A changed `SURVEY_DATE` in the e-Stat API response vs. the previous run
- **Action:** Builds and deploys only when a change is actually detected; most daily runs just refresh the cache

See `.github/workflows/watcher.yaml` for details.

## Project Structure

```
JP_Immigration_Dashboard/
├── src/
│   ├── App.tsx                        # Data-loading gate: spinner/error/DashboardShell
│   ├── index.css                      # Tailwind v4 entry + Civic Glass @theme tokens
│   │
│   ├── app/
│   │   ├── layout.tsx                 # Root layout: fonts, metadata, GoogleAnalytics
│   │   ├── favicon.ico
│   │   ├── robots.txt
│   │   └── [[...slug]]/
│   │       ├── page.tsx               # generateStaticParams + renders ClientWrapper
│   │       └── client.tsx             # Client providers: nuqs, theme, locale, tooltip, error boundary
│   │
│   ├── components/
│   │   ├── DashboardShell.tsx         # The single responsive shell (header, tabs, filters, estimator)
│   │   ├── ActiveChart.tsx            # Memoized switch over the active chart registry entry
│   │   ├── FilterPanel.tsx            # Bureau/type filter controls + compare + airport toggle
│   │   ├── StatsSummary.tsx           # Summary stat cards
│   │   ├── EstimationCard.tsx         # Processing Time Estimator (sidebar/sheet)
│   │   ├── ChartDataTable.tsx         # Collapsible data table + CSV export
│   │   ├── ChangelogModal.tsx         # CHANGELOG.md viewer (shadcn Dialog)
│   │   │
│   │   ├── charts/
│   │   │   ├── IntakeProcessingBarChart.tsx      # Bklit ComposedChart (bar + line)
│   │   │   ├── CategorySubmissionsLineChart.tsx  # Bklit LineChart
│   │   │   ├── OutcomesSankeyChart.tsx           # Bklit Sankey + Gauge
│   │   │   ├── BureauDistributionRingChart.tsx   # Bklit PieChart (donut)
│   │   │   ├── CategoryMixTreemap.tsx            # Custom zoomable treemap
│   │   │   ├── CategoryMixSunburst.tsx           # Alternate sunburst view (same data hierarchy)
│   │   │   ├── ProcessingEfficiencyQuadrantChart.tsx  # Custom quadrant scatter (d3-scale, raw SVG)
│   │   │   ├── ProcessingEfficiencyLollipop.tsx  # Alternate ranked lollipop view (same data)
│   │   │   ├── EfficiencyHoverCard.tsx           # Shared hover card for the efficiency views
│   │   │   └── GeographicDistributionChart.tsx   # Bklit choropleth (visx + topojson)
│   │   │
│   │   ├── common/
│   │   │   ├── ChartComponents.tsx    # Chart registry: label, icon, filters, ranges per chart
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── FilterInput.tsx
│   │   │   ├── FormulaTooltip.tsx     # KaTeX formula popover for the estimator
│   │   │   ├── IconTooltip.tsx        # Wrapper over the shadcn/Radix Tooltip
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── PeriodSelector.tsx
│   │   │   ├── SeriesLegend.tsx
│   │   │   └── StatCard.tsx
│   │   │
│   │   ├── ui/                        # shadcn/Radix primitives (vendored)
│   │   │   └── badge, button, card, dialog, label, popover, select,
│   │   │       separator, sheet, skeleton, tabs, toggle(-group), tooltip
│   │   │
│   │   ├── bklit/                     # Vendored Bklit UI chart library (visx-based)
│   │   │   ├── charts/                # Line/Bar/Pie/Sankey/Sunburst/Choropleth/Radar/Gauge primitives
│   │   │   └── components/
│   │   │
│   │   └── __tests__/
│   │       └── components.smoke.test.tsx
│   │
│   ├── hooks/
│   │   └── useImmigrationData.ts      # Fetches + unpacks public/data/dashboard.json
│   │
│   ├── utils/
│   │   ├── dashboardData.ts           # Pack/unpack format shared with scripts/transform-data.mts
│   │   ├── dataTransform.ts           # e-Stat payload → ImmigrationData[] flattening
│   │   ├── correctBureauAggregates.ts # Subtracts branch offices out of aggregate bureaus
│   │   ├── loadLocalData.ts           # Runtime fetch of public/data/dashboard.json
│   │   ├── selectors.ts               # BureauScope-aware data selection/filtering
│   │   ├── calculateEstimates.ts      # Queue-position / processing-time estimation model
│   │   ├── categoryMixTree.ts         # Shared hierarchy for the Category Mix charts
│   │   ├── bureauColors.ts            # Per-theme bureau color helpers
│   │   ├── getBureauData.ts           # Bureau option lookups
│   │   ├── urlApplicationDetails.ts   # Estimator permalink <-> URL params
│   │   ├── renderChangelog.tsx        # Minimal inline-markdown renderer for the changelog modal
│   │   ├── logger.ts                  # Dev-only console logger
│   │   └── __tests__/                 # Unit tests (*.test.ts)
│   │
│   ├── constants/
│   │   ├── applicationOptions.ts
│   │   ├── bureauOptions.ts
│   │   ├── japanPrefectures.ts
│   │   └── statusCodes.ts
│   │
│   ├── contexts/
│   │   └── ThemeContext.tsx           # Thin adapter over next-themes
│   │
│   ├── i18n/
│   │   ├── LocaleContext.tsx
│   │   ├── en.ts
│   │   └── ja.ts
│   │
│   └── lib/
│       ├── utils.ts                   # cn() class-merge helper (shadcn convention)
│       └── motion.ts                  # Anime.js scope helper + reduced-motion gate
│
├── public/
│   ├── data/dashboard.json            # Build-time-transformed data the client fetches
│   ├── datastore/statData.json        # Raw e-Stat payload (build input; stripped from export output)
│   ├── static/japan.topo.json         # TopoJSON for the regional map
│   ├── CHANGELOG.md                   # Synced from the repo root at build time
│   └── favicon.ico, manifest.webmanifest, og.png, ...
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yaml                # Lint, typecheck, test, fixture build on push/PR
│   │   ├── build.yaml             # Build + deploy to GitHub Pages (manual dispatch)
│   │   └── watcher.yaml           # Scheduled e-Stat data check
│   └── ISSUE_TEMPLATE/            # Issue templates
│
├── scripts/
│   ├── transform-data.mts         # Build-time e-Stat → dashboard.json transform
│   ├── generate-fixture.mjs       # Deterministic fixture data for local/CI builds
│   ├── strip-raw-data.mjs         # Removes datastore/ from the exported build output
│   ├── sync-changelog.js          # Copies CHANGELOG.md into public/
│   ├── vendor-bklit.mjs           # Pulls Bklit UI registry items into the repo
│   └── og-template.html
│
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript config
├── next.config.ts                 # Next.js config (static export)
├── eslint.config.mjs              # Flat ESLint config
├── vitest.config.ts               # Vitest config
├── .prettierrc                    # Prettier config
└── README.md                      # Project overview
```

Note: Tailwind v4 is configured via `@theme`/`:root` tokens directly in `src/index.css` — there is no `tailwind.config.ts`.

## Key Technologies

### Frontend Framework

- **Next.js 15** (`15.5.19`) — React framework, built as a static export (`output: 'export'`)
- **React 19** (`^19.2.8`) — Component library
- **TypeScript 5.9** (`^5.9.2`) — Strict-mode, type-safe JavaScript

### Styling

- **Tailwind CSS v4** (`^4.3.3`) — Utility-first CSS, configured via `@theme`/`:root` tokens directly in `src/index.css` (no `tailwind.config.ts`)
- **@tailwindcss/forms** — Form component styling
- **tw-animate-css** — Animation utility classes
- **class-variance-authority**, **tailwind-merge**, **clsx** — Variant and class-merging helpers (shadcn/ui convention)

### Data Visualization

- **Bklit UI** (vendored, MIT) — `src/components/bklit/` — the chart primitive library (Line/Bar/Pie/Sankey/Sunburst/Choropleth/Radar/Gauge), built on visx
- **@visx/*** (curve, event, geo, gradient, grid, group, pattern, responsive, sankey, scale, shape, zoom) — visx primitives Bklit UI is built on
- **d3-array**, **d3-geo**, **d3-sankey**, **d3-scale**, **d3-shape**, **topojson-client** — scales, geography, and Sankey layout helpers
- **KaTeX** (`^0.16.28`) + **react-katex** — Mathematical notation rendering for the estimator's formulas

### UI Utilities

- **radix-ui** (`^1.6.7`) — Unstyled accessible primitives underlying the shadcn/ui components (Dialog, Popover, Select, Sheet, Tabs, Toggle, Tooltip, ...)
- **lucide-react** — Icon library
- **next-themes** — Dark/light mode, adapted by `src/contexts/ThemeContext.tsx`
- **nuqs** — Type-safe URL query state (active chart, filters, time range, compare)
- **animejs** (Anime.js v4) — Motion/animation layer (`src/lib/motion.ts`)
- **@number-flow/react** — Animated number counters (StatCard)

### Development

- **Vitest 4** (`^4.1.10`) — Unit testing framework (jsdom environment)
- **@testing-library/react** — Component testing utilities
- **ESLint 9** (`9.39.2`) — Flat config (`eslint.config.mjs`)
- **Prettier 3** (`^3.8.1`) — Code formatting, with `prettier-plugin-tailwindcss`
- **TypeScript ESLint** — Type-aware linting

### Build & Deployment

- **GitHub Actions** — CI/CD automation (`ci.yaml`, `build.yaml`, `watcher.yaml`)
- **GitHub Pages** — Static site hosting
- **react-build-info** — Build metadata injection (version + build date)
- **tsx** — Runs the TypeScript build-time data transform script

## Common Tasks

### Adding a New Feature

1. **Create a branch:**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Create the chart component** (named export, `ImmigrationChartData` props):
   ```typescript
   // src/components/charts/NewChart.tsx
   import type { ImmigrationChartData } from '../common/ChartComponents';

   export const NewChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
     return <div>Chart here</div>;
   };
   ```

3. **Register it in the chart registry** — charts aren't imported into a page directly; they're added to the `CHART_COMPONENTS` array, which drives the tabs, card header, and period selector:
   ```typescript
   // src/components/common/ChartComponents.tsx
   import { NewChart } from '../charts/NewChart';

   export const CHART_COMPONENTS: ChartDefinition[] = [
     // ...existing entries
     {
       key: 'new-chart',
       label: 'New Chart',
       description: 'One sentence: what question this chart answers.',
       icon: SomeLucideIcon,
       component: NewChart,
       filters: { bureau: true, appType: true },
       compare: false,
       ranges: ['6', '12', '24', '36', 'all'],
       defaultRange: '12',
     },
   ];
   ```

4. **Test in dev server:**
   ```bash
   npm run dev
   # Visit http://localhost:3000 and verify
   ```

5. **Run linting and tests:**
   ```bash
   npm run lint
   npm test
   ```

6. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add new chart feature"
   git push origin feature/feature-name
   ```

### Updating Data Processing

Data processing is split between a build-time transform and runtime selection:

1. **Build-time transform** — `scripts/transform-data.mts` reads the raw e-Stat payload (`public/datastore/statData.json`), flattens it (`src/utils/dataTransform.ts`), corrects bureau aggregates (`src/utils/correctBureauAggregates.ts`), and packs it into `public/data/dashboard.json`
2. **Fetch data** — `useImmigrationData` hook loads and unpacks `public/data/dashboard.json` via `src/utils/loadLocalData.ts`
3. **Select/filter data** — `src/utils/selectors.ts` (`selectData`, `useSelectedData`) applies bureau-scope and type filters
4. **Calculate metrics** — `src/utils/calculateEstimates.ts` (queue estimation), plus per-chart aggregation inside each chart component
5. **Pass to charts** — Components receive processed data via props

To modify calculations:
1. Edit `src/utils/calculateEstimates.ts`, `src/utils/selectors.ts`, or the relevant chart component
2. Add unit tests in `src/utils/__tests__/`
3. Test with `npm test`
4. Verify in dev server with `npm run dev`

### Updating Styles

Styles use Tailwind CSS classes:

```typescript
// Good — use Tailwind classes
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900">
  <h1 className="text-2xl font-bold">Title</h1>
</div>

// Avoid — inline styles
<div style={{ display: 'flex', padding: '1rem' }}>
  Content
</div>
```

### Fixing ESLint Errors

```bash
# See all errors
npm run lint

# Auto-fix auto-fixable errors
npm run lint -- --fix
```

### Running Tests

```bash
# Run all tests once
npm test

# Run in watch mode (re-runs on file changes)
npm test -- --watch

# Run specific test file
npm test -- src/utils/__tests__/calculateEstimates.test.ts
```

### Managing Dependencies

#### Dependency Pinning Strategy

Some critical dependencies (the Next.js ecosystem, TypeScript ESLint, ESLint itself) are **pinned to exact versions** to ensure:
- **Stability** — Consistent behavior across all environments
- **Reproducibility** — Same versions in CI/CD and local development
- **Security** — Controlled updates for security-critical packages

Pinned packages:
- `next` — Core framework stability
- `@next/third-parties`, `@next/eslint-plugin-next`, `eslint-config-next` — Next.js ecosystem
- `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` — Type-aware linting
- `eslint` — Code quality enforcement
- `@types/node` — Matches the pinned toolchain's Node types

`react`, `react-dom`, and `typescript` currently use `^` ranges rather than exact pins. Unpinned packages allow patch and minor updates for utilities and non-critical dependencies.

#### Security Audits

There is no automated `npm audit` gate in CI today — `ci.yaml` runs lint, typecheck, test, and a fixture build; `build.yaml` builds and deploys. Run audits locally (and before merging dependency changes):

```bash
# Run security audit locally
npm audit

# Run audit with a moderate severity threshold
npm audit --audit-level=moderate

# Fix vulnerabilities automatically
npm audit fix

# Interactive fix (choose which vulnerabilities to address)
npm audit fix --force
```

#### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# View dependency tree
npm ls

# Update to latest versions (respects pinning strategy)
npm update

# Update a specific package
npm install package-name@latest

# For pinned packages, explicitly update (may require careful testing)
npm install next@latest
```

**Before updating critical dependencies:**
1. Test thoroughly locally (`npm run dev` + manual testing)
2. Run the full test suite (`npm test`)
3. Run security audit (`npm audit`)
4. Commit with clear message explaining why the update was needed

## Troubleshooting

### Port 3000 Already in Use

```bash
# On macOS/Linux, find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Stale Cache Issues

```bash
# Clear the build output/cache — next.config.ts sets distDir: 'build',
# so this project uses build/ instead of the default .next/
rm -rf build

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Full clean rebuild
npm run build
```

### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit

# May indicate issues not caught by ESLint
```

### ESLint Errors

```bash
# View all issues
npm run lint

# Try auto-fixing
npm run lint -- --fix

# If issues persist, manually review the files listed
```

### Build Fails

```bash
# Check for errors in detail
npm run build 2>&1 | head -50

# May indicate type errors or missing dependencies
```

### Data Not Updating

1. Check that `public/data/dashboard.json` exists
2. Verify the file contains valid JSON: `npm test`
3. Check the browser console for fetch errors
4. Ensure the CHANGELOG has been synced: `npm run build`

### Hot Module Reloading (HMR) Not Working

```bash
# Restart the dev server
# Press Ctrl+C to stop
npm run dev
```

### Git Issues

```bash
# Check current branch and status
git status

# If stuck in a bad state, stash changes and start over
git stash
git checkout main
git pull origin main
git checkout -b feature/new-branch
```

### Security Audit Failures

```bash
# View vulnerabilities in detail
npm audit

# See which packages have vulnerabilities
npm audit --json | jq '.vulnerabilities'

# Fix auto-fixable vulnerabilities
npm audit fix

# If npm audit fix doesn't resolve all issues, manually update the affected package
npm install vulnerable-package@latest

# After fixing, verify the audit passes
npm audit --audit-level=moderate
```

**Note:** CI does not currently run `npm audit` automatically. Run it locally before pushing dependency changes.

### Dependency Conflicts

```bash
# If package installations conflict with pinned versions
npm ci  # Uses exact versions from package-lock.json

# Clear and reinstall if CI doesn't work
rm -rf node_modules package-lock.json
npm install

# Check for dependency resolution issues
npm ls

# Force resolution of peer dependency conflicts
npm install --force
```

## Additional Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **TypeScript Docs:** https://www.typescriptlang.org/docs
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **visx Docs:** https://airbnb.io/visx/ (the primitives Bklit UI's vendored charts are built on)
- **KaTeX Docs:** https://katex.org/docs/ (estimator formula rendering)
- **nuqs Docs:** https://nuqs.dev/ (URL state for filters, chart tab, and the estimator)
- **Anime.js Docs:** https://animejs.com/documentation/ (app-level motion layer)
- **GitHub Actions:** https://docs.github.com/en/actions

Need more help? Open an [issue](https://github.com/RetroHazard/JP_Immigration_Dashboard/issues) or start a [discussion](https://github.com/RetroHazard/JP_Immigration_Dashboard/discussions).
