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

- **Node.js** — 18.0.0 or higher
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

The build process includes:

1. **Build Info Generation** — `react-build-info` injects version and timestamp
2. **CHANGELOG Syncing** — Syncs `CHANGELOG.md` to the application
3. **Next.js Build** — Compiles React + TypeScript to static HTML/JS
4. **Output Location** — All files go to `build/` directory

### Deployment

The project uses **GitHub Pages** for hosting:

1. **Automatic via GitHub Actions** — Pushes to `main` trigger the build workflow
2. **Manual deployment** — Not typically needed (see `.github/workflows/build.yaml`)

### Data Updates

Data is automatically updated via the **Data Watcher Workflow**:

- **Schedule:** Daily at 10:05 AM JST (23rd–28th of each month)
- **Trigger:** New data detected via e-Stat API
- **Action:** Automatically builds and deploys if new data is found

See `.github/workflows/watcher.yaml` for details.

## Project Structure

```
JP_Immigration_Dashboard/
├── src/
│   ├── app/
│   │   └── [[...slug]]/
│   │       ├── page.tsx          # Main dashboard page
│   │       ├── layout.tsx         # App layout wrapper
│   │       └── error.tsx          # Error boundary
│   │
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── Header.tsx        # Top navigation
│   │   │   └── Footer.tsx        # Footer
│   │   ├── common/
│   │   │   ├── FilterPanel.tsx   # Filter controls
│   │   │   ├── StatsBadge.tsx    # Data summary badges
│   │   │   └── ErrorBoundary.tsx # Error handling
│   │   └── charts/
│   │       ├── StackedBarChart.tsx
│   │       ├── MultiLineChart.tsx
│   │       ├── RingChart.tsx
│   │       ├── BubbleChart.tsx
│   │       ├── RadarChart.tsx
│   │       └── ChoroplethMap.tsx
│   │
│   ├── hooks/
│   │   ├── useImmigrationData.ts  # Data fetching hook
│   │   ├── useFilteredData.ts     # Filtering logic
│   │   ├── useTheme.ts            # Dark/light mode
│   │   └── usePrefectureColors.ts # Color calculations
│   │
│   ├── utils/
│   │   ├── data-processing.ts    # Data transformation
│   │   ├── estimation.ts         # Queue estimation logic
│   │   ├── calculations.ts       # Rate calculations
│   │   └── constants.ts          # Shared constants
│   │
│   ├── contexts/
│   │   └── ThemeContext.tsx      # Theme provider
│   │
│   ├── constants/
│   │   ├── bureaus.ts            # Bureau definitions
│   │   ├── statuses.ts           # Application status codes
│   │   └── types.ts              # TypeScript interfaces
│   │
│   └── __tests__/
│       └── *.test.ts             # Unit tests
│
├── public/
│   ├── data/
│   │   └── stats.json            # Cached immigration data
│   ├── geo/
│   │   └── japan.json            # GeoJSON for map
│   └── favicon.ico
│
├── .github/
│   ├── workflows/
│   │   ├── build.yaml            # CI/CD build pipeline
│   │   └── watcher.yaml          # Automated data updates
│   └── ISSUE_TEMPLATE/           # Issue templates
│
├── scripts/
│   └── sync-changelog.js         # Sync CHANGELOG to app
│
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript config
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind CSS config
├── .eslintrc.js                  # ESLint config
├── .prettierrc                   # Prettier config
└── README.md                     # Project overview
```

## Key Technologies

### Frontend Framework

- **Next.js 15** — React framework with static export
- **React 18** — Component library
- **TypeScript 5.7** — Type-safe JavaScript

### Styling

- **Tailwind CSS 3** — Utility-first CSS framework
- **@tailwindcss/forms** — Form component styling

### Data Visualization

- **Chart.js 4** — Interactive charts
- **react-chartjs-2** — React wrapper for Chart.js
- **@nivo/treemap** — Hierarchical tree maps
- **react-simple-maps** — Geographic map rendering
- **d3-scale** — Data scaling utilities
- **KaTeX** — Mathematical notation rendering

### UI Utilities

- **@floating-ui/react** — Tooltips and popovers
- **@iconify/react** — Icon library

### Development

- **Vitest 4** — Unit testing framework
- **ESLint 9** — Code linting
- **Prettier 3** — Code formatting
- **TypeScript ESLint** — Type-aware linting
- **Tailwind CSS ESLint Plugin** — Tailwind-specific linting

### Build & Deployment

- **GitHub Actions** — CI/CD automation
- **GitHub Pages** — Static site hosting
- **react-build-info** — Build metadata injection

## Common Tasks

### Adding a New Feature

1. **Create a branch:**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Create component (if needed):**
   ```bash
   # Example: src/components/charts/NewChart.tsx
   export default function NewChart() {
     return <div>Chart here</div>;
   }
   ```

3. **Import in main page:**
   ```typescript
   // src/app/[[...slug]]/page.tsx
   import NewChart from '@/components/charts/NewChart';
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

Data processing happens in `src/utils/data-processing.ts`:

1. **Fetch data** — `useImmigrationData` hook loads from `public/data/stats.json`
2. **Filter data** — `useFilteredData` hook applies filter selections
3. **Calculate metrics** — Functions in `src/utils/calculations.ts`
4. **Pass to charts** — Components receive processed data via props

To modify calculations:
1. Edit `src/utils/calculations.ts` or `src/utils/estimation.ts`
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
npm test -- src/utils/__tests__/calculations.test.ts
```

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update to latest versions (with caution)
npm update

# Update a specific package
npm install package-name@latest
```

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
# Clear Next.js cache
rm -rf .next

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

1. Check that `public/data/stats.json` exists
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

## Additional Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **TypeScript Docs:** https://www.typescriptlang.org/docs
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Chart.js Docs:** https://www.chartjs.org/docs
- **GitHub Actions:** https://docs.github.com/en/actions

Need more help? Open an [issue](https://github.com/RetroHazard/JP_Immigration_Dashboard/issues) or start a [discussion](https://github.com/RetroHazard/JP_Immigration_Dashboard/discussions).
