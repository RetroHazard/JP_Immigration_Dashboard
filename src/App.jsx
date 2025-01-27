// App.jsx
import { useState } from 'react';
import { FilterPanel } from './components/FilterPanel';
import { StackedBarChart } from './components/StackedBarChart';
import { EstimationCard } from './components/EstimationCard';
import { StatsSummary } from './components/StatsSummary';
import { useImmigrationData } from './hooks/useImmigrationData';
import { Icon } from '@iconify/react';
import buildInfo from './buildInfo';

const App = () => {
  const { data, loading } = useImmigrationData();
  const [filters, setFilters] = useState({
    bureau: 'all',
    type: 'all',
    month: '', // Initialize Empty
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEstimationExpanded, setIsEstimationExpanded] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <div className="flex flex-col items-start">
                <h1 className="section-title">
                  Japan
                  <Icon
                    icon="ph:line-vertical-light"
                    className="inline-block align-middle"
                    style={{ verticalAlign: '-0.125em' }}
                  />
                  Immigration Applications
                </h1>
                <h1 className="section-title">Statistics Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex flex-col items-end">
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
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl flex-grow px-4 py-8 sm:px-6 lg:px-8">
        {!loading && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-8">
              <FilterPanel data={data} filters={filters} onChange={setFilters} />
            </div>

            {/* Mobile Layout */}
            <div className="relative sm:hidden">
              <div className="mb-8 h-full">
                <div className="h-full rounded-lg bg-white p-6 shadow-lg">
                  <StackedBarChart data={data} filters={filters} />
                </div>
              </div>

              <div className={`drawer-trigger ${isDrawerOpen ? 'translate-x-[300px]' : ''}`}>
                <button
                  onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                  className="clip-tapered-btn relative flex h-[130px] w-[28px] animate-pulse items-center justify-center overflow-visible bg-gray-700 text-white shadow-lg hover:bg-gray-500"
                >
                  <div className="flex origin-center flex-col items-center gap-2">
                    <Icon icon="ci:chevron-left-duo" className="animate-pulse text-lg" />
                    <span className="my-2.5 rotate-90 whitespace-nowrap text-sm">Estimator</span>
                    <Icon icon="ci:chevron-left-duo" className="animate-pulse text-lg" />
                  </div>
                </button>
              </div>

              {isDrawerOpen && (
                <>
                  <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)} />
                  <div className="drawer-content">
                    <EstimationCard variant="drawer" data={data} onClose={() => setIsDrawerOpen(false)} />
                  </div>
                </>
              )}
            </div>

            {/* Desktop Layout */}
            <div className="mb-8 hidden h-full grid-cols-12 gap-6 sm:grid sm:gap-2 md:gap-3 lg:gap-4">
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isEstimationExpanded ? 'chart-collapsed' : 'chart-expanded'
                }`}
              >
                <div className="h-full rounded-lg bg-white p-6 shadow-lg">
                  <StackedBarChart data={data} filters={filters} />
                </div>
              </div>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isEstimationExpanded ? 'estimator-expanded' : 'estimator-collapsed'
                }`}
              >
                <div
                  className="h-full cursor-pointer rounded-lg bg-white shadow-lg"
                  onClick={() => !isEstimationExpanded && setIsEstimationExpanded(true)}
                >
                  <EstimationCard
                    variant="expandable"
                    data={data}
                    isExpanded={isEstimationExpanded}
                    onCollapse={() => setIsEstimationExpanded(false)}
                  />
                </div>
              </div>
            </div>

            <StatsSummary data={data} filters={filters} />
          </>
        )}
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="footer-text text-pretty">
            Official Statistics provided by Immigration Services Agency of Japan<br></br>
            Data acquisition provided by e-Stat
            <a href="https://www.e-stat.go.jp/dbview?sid=0003449073">
              <Icon
                icon="ri:link"
                className="inline-block align-middle text-indigo-600 hover:text-indigo-500"
                style={{ verticalAlign: '-0.125em' }}
              />
            </a>
          </div>
          <div className="footer-text-small mt-1">
            Built using{' '}
            <a href="https://react.dev" className="text-indigo-600 hover:text-indigo-500">
              React
            </a>{' '}
            in 2025 by{' '}
            <a href="https://github.com/RetroHazard" className="text-indigo-600 hover:text-indigo-500">
              <Icon
                icon="openmoji:github"
                className="inline-block align-middle"
                style={{ verticalAlign: '-0.125em' }}
              />
              RetroHazard
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
