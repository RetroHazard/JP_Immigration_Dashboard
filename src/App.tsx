// App.tsx
import { useEffect, useState } from 'react';

import type React from 'react';
import { Icon } from '@iconify/react';

import { CHART_COMPONENTS } from './components/common/ChartComponents';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { EstimationCard } from './components/EstimationCard';
import { FilterPanel } from './components/FilterPanel';
import { StatsSummary } from './components/StatsSummary';
import { useImmigrationData } from './hooks/useImmigrationData';
import buildInfo from './buildInfo';

interface Filters {
  bureau: string;
  type: string;
}

const App: React.FC = () => {
  const { data, loading } = useImmigrationData();
  const [filters, setFilters] = useState<Filters>({
    bureau: 'all',
    type: 'all',
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEstimationExpanded, setIsEstimationExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeChartIndex, setActiveChartIndex] = useState(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      setIsDarkMode(systemIsDark);
      document.documentElement.classList.toggle('dark', systemIsDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  if (loading) {
    return <LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Crunching Immigration Data..." />;
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
            {(CHART_COMPONENTS[activeChartIndex].filters.bureau ||
              CHART_COMPONENTS[activeChartIndex].filters.appType) && (
              <div className="section-block mb-4 grid grid-cols-1 sm:hidden">
                <FilterPanel
                  data={data}
                  filters={filters}
                  onChange={setFilters}
                  filterConfig={CHART_COMPONENTS[activeChartIndex].filters}
                />
              </div>
            )}

            {/* Mobile Layout */}
            <div className="relative sm:hidden">
              <div className="section-block grid grid-cols-1">
                <div className="base-container">
                  <div className="mb-2 flex justify-between space-x-1 border-b dark:border-gray-500">
                    {CHART_COMPONENTS.map((chart, index) => (
                      <button
                        key={chart.name}
                        aria-label={chart.name}
                        onClick={() => setActiveChartIndex(index)}
                        className={`rounded-t-lg px-4 py-2 ${
                          activeChartIndex === index
                            ? 'bg-blue-500 text-gray-100 dark:bg-gray-300 dark:text-gray-600'
                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-500 dark:hover:bg-gray-400'
                        }`}
                      >
                        <Icon icon={chart.icon} />
                      </button>
                    ))}
                  </div>
                  <ErrorBoundary>
                    {(() => {
                      const ChartComponent = CHART_COMPONENTS[activeChartIndex].component;
                      return <ChartComponent data={data} filters={filters} isDarkMode={isDarkMode} />;
                    })()}
                  </ErrorBoundary>
                </div>
              </div>

              <div className={`mobile-drawer-trigger ${isDrawerOpen ? 'translate-x-[300px]' : ''}`}>
                <button
                  onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                  aria-label={isDrawerOpen ? 'Close estimator drawer' : 'Open estimator drawer'}
                  className="clip-tapered-btn"
                >
                  <div className="flex origin-center flex-col items-center">
                    <Icon icon="ci:chevron-left-duo" className="flashing-chevron text-gray-300 dark:text-gray-700" />
                    <span className="mobile-drawer-label">estimator</span>
                    <Icon icon="ci:chevron-left-duo" className="flashing-chevron text-gray-300 dark:text-gray-700" />
                  </div>
                </button>
              </div>

              {isDrawerOpen && (
                <>
                  <div className="mobile-drawer-overlay transition-slow" onClick={() => setIsDrawerOpen(false)} />
                  <div className="mobile-drawer-content transition-slow">
                    <ErrorBoundary>
                      <EstimationCard
                        variant="drawer"
                        data={data}
                        isExpanded={null}
                        onClose={() => setIsDrawerOpen(false)}
                        onCollapse={null}
                      />
                    </ErrorBoundary>
                  </div>
                </>
              )}
            </div>

            {/* Desktop Layout */}
            <div className="section-block hidden h-full grid-cols-12 sm:grid sm:gap-3 md:gap-4 lg:gap-5">
              {/* Left main content column */}
              <div
                className={`transition-slow flex h-full flex-col ${
                  isEstimationExpanded ? 'main-collapsed' : 'main-expanded'
                }`}
              >
                {/* Filter row */}
                {(CHART_COMPONENTS[activeChartIndex].filters.bureau ||
                  CHART_COMPONENTS[activeChartIndex].filters.appType) && (
                  <div className="shrink-0 sm:mb-4 md:mb-5 lg:mb-6">
                    <FilterPanel
                      data={data}
                      filters={filters}
                      onChange={setFilters}
                      filterConfig={CHART_COMPONENTS[activeChartIndex].filters}
                    />
                  </div>
                )}

                {/* Chart row */}
                <div className="grow">
                  <div className="base-container h-full">
                    <div className="mb-4 flex space-x-2 overflow-x-auto border-b dark:border-gray-500">
                      {CHART_COMPONENTS.map((chart, index) => (
                        <button
                          key={chart.name}
                          aria-label={chart.name}
                          onClick={() => setActiveChartIndex(index)}
                          className={`rounded-t-lg px-4 py-2 ${
                            activeChartIndex === index
                              ? 'bg-blue-500 text-gray-100 dark:bg-gray-300 dark:text-gray-600'
                              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-500 dark:hover:bg-gray-400'
                          }`}
                        >
                          <Icon icon={chart.icon} />
                        </button>
                      ))}
                    </div>
                    <ErrorBoundary>
                      {(() => {
                        const ChartComponent = CHART_COMPONENTS[activeChartIndex].component;
                        return <ChartComponent data={data} filters={filters} isDarkMode={isDarkMode} />;
                      })()}
                    </ErrorBoundary>
                  </div>
                </div>
              </div>

              {/* Right estimator column */}
              <div
                className={`transition-slow h-full ${
                  isEstimationExpanded ? 'estimator-expanded' : 'estimator-collapsed'
                }`}
              >
                <div
                  className="h-full cursor-pointer rounded-lg bg-white shadow-lg dark:bg-gray-700"
                  onClick={() => !isEstimationExpanded && setIsEstimationExpanded(true)}
                >
                  <ErrorBoundary>
                    <EstimationCard
                      variant="expandable"
                      data={data}
                      isExpanded={isEstimationExpanded}
                      onClose={null}
                      onCollapse={() => setIsEstimationExpanded(false)}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            </div>

            <ErrorBoundary>
              <StatsSummary data={data} filters={filters} />
            </ErrorBoundary>
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
