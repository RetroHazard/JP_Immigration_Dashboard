// App.tsx
import { useMemo, useState } from 'react';

import type React from 'react';
import { Icon } from '@iconify/react';

import { CHART_COMPONENTS } from './components/common/ChartComponents';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { DesktopLayout } from './components/layouts/DesktopLayout';
import { MobileLayout } from './components/layouts/MobileLayout';
import { StatsSummary } from './components/StatsSummary';
import { useTheme } from './contexts/ThemeContext';
import { useImmigrationData } from './hooks/useImmigrationData';
import buildInfo from './buildInfo';

interface Filters {
  bureau: string;
  type: string;
}

const App: React.FC = () => {
  const { data, loading, error } = useImmigrationData();
  const { isDarkMode, toggleTheme } = useTheme();
  const [filters, setFilters] = useState<Filters>({
    bureau: 'all',
    type: 'all',
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEstimationExpanded, setIsEstimationExpanded] = useState(false);
  const [activeChartIndex, setActiveChartIndex] = useState(0);

  // Get current chart's filter configuration
  const currentChartFilters = CHART_COMPONENTS[activeChartIndex].filters;

  // Centralized filtering: filter data once instead of in each chart component
  // This eliminates 6× duplicate filtering on every filter change
  // For filters the current chart doesn't support, treat as 'all' (no filtering)
  const filteredData = useMemo(() => {
    if (!data) return [];

    // Determine effective filter values based on chart support
    const effectiveBureau = currentChartFilters.bureau ? filters.bureau : 'all';
    const effectiveType = currentChartFilters.appType ? filters.type : 'all';

    return data.filter((entry) => {
      // Bureau filter: 'all' means include ALL bureaus, specific value filters to that bureau
      // Note: Charts that want only nationwide (NATIONWIDE_BUREAU) when 'all' is selected must filter themselves
      const matchesBureau = effectiveBureau === 'all' || entry.bureau === effectiveBureau;

      // Type filter: 'all' means include all types, otherwise match specific type
      const matchesType = effectiveType === 'all' || entry.type === effectiveType;

      return matchesBureau && matchesType;
    });
  }, [data, filters.bureau, filters.type, currentChartFilters.bureau, currentChartFilters.appType]);

  if (loading) {
    return <LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Crunching Immigration Data..." />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Error Loading Data</h1>
          <p className="mb-4 text-gray-700 dark:text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <nav className="header-block">
        <div className="marginals">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <div className="flex flex-col items-start">
                <h1 className="section-title">
                  Japan
                  <Icon icon="ph:line-vertical-light" className="vertical-align-sub inline-block align-middle" />
                  Immigration Bureaus
                </h1>
                <h1 className="section-title">Statistics Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-1 lg:gap-5">
              <div className="flex-col-end">
                <span className="build-info">Version: {buildInfo.buildVersion}</span>
                <span className="build-info">Last Updated:</span>
                <span className="build-info">
                  {new Date(buildInfo.buildDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                <Icon
                  icon={
                    isDarkMode
                      ? 'line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition'
                      : 'line-md:sunny-outline-loop'
                  }
                  className="theme-toggle-icon"
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="marginals flex-1 py-8">
        {!loading && (
          <>
            {/* Mobile Layout */}
            <MobileLayout
              data={data}
              filteredData={filteredData}
              filters={filters}
              onFilterChange={setFilters}
              activeChartIndex={activeChartIndex}
              onActiveChartChange={setActiveChartIndex}
              isDrawerOpen={isDrawerOpen}
              onDrawerToggle={() => setIsDrawerOpen(!isDrawerOpen)}
            />

            {/* Desktop Layout */}
            <DesktopLayout
              data={data}
              filteredData={filteredData}
              filters={filters}
              onFilterChange={setFilters}
              activeChartIndex={activeChartIndex}
              onActiveChartChange={setActiveChartIndex}
              isEstimationExpanded={isEstimationExpanded}
              onEstimationToggle={setIsEstimationExpanded}
            />

            <StatsSummary data={data} filters={filters} />
          </>
        )}
      </main>

      <footer className="footer-block mt-auto">
        <div className="marginals">
          <div className="footer-text">
            Official Statistics provided by Immigration Services Agency of Japan
            <br />
            Data acquisition provided by e-Stat{' '}
            <a href="https://www.e-stat.go.jp/" target="_blank" rel="noreferrer" aria-label="e-Stat Website">
              <Icon icon="ri:link" className="hyperlink vertical-align-sub inline-block align-middle" />
            </a>
          </div>
          <div className="footer-text-small">
            Built using{' '}
            <a href="https://react.dev" className="hyperlink" target="_blank" rel="noreferrer">
              React
            </a>{' '}
            and{' '}
            <a href="https://nextjs.org" className="hyperlink" target="_blank" rel="noreferrer">
              Next.js
            </a>{' '}
            in 2025 by{' '}
            <a href="https://github.com/RetroHazard" className="hyperlink" target="_blank" rel="noreferrer">
              <Icon icon="openmoji:github" className="vertical-align-sub-more inline-block align-middle text-sm" />
              RetroHazard
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
