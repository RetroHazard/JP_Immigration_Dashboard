// MobileLayout.tsx
import type React from 'react';
import { Icon } from '@iconify/react';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { ActiveChart } from '../ActiveChart';
import { CHART_COMPONENTS } from '../common/ChartComponents';
import { EstimationCard } from '../EstimationCard';
import { FilterPanel } from '../FilterPanel';

interface MobileLayoutProps {
  data: ImmigrationData[];
  filteredData: ImmigrationData[];
  filters: { bureau: string; type: string };
  onFilterChange: (filters: { bureau: string; type: string }) => void;
  activeChartIndex: number;
  onActiveChartChange: (index: number) => void;
  isDrawerOpen: boolean;
  onDrawerToggle: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  data,
  filteredData,
  filters,
  onFilterChange,
  activeChartIndex,
  onActiveChartChange,
  isDrawerOpen,
  onDrawerToggle,
}) => {
  return (
    <>
      {/* Mobile Filter Panel */}
      {(CHART_COMPONENTS[activeChartIndex].filters.bureau ||
        CHART_COMPONENTS[activeChartIndex].filters.appType) && (
        <div className="section-block mb-4 grid grid-cols-1 sm:hidden">
          <FilterPanel
            data={data}
            filters={filters}
            onChange={onFilterChange}
            filterConfig={CHART_COMPONENTS[activeChartIndex].filters}
          />
        </div>
      )}

      {/* Mobile Chart Section */}
      <div className="relative sm:hidden">
        <div className="section-block grid grid-cols-1">
          <div className="base-container">
            <div className="mb-2 flex justify-between space-x-1 border-b dark:border-gray-500">
              {CHART_COMPONENTS.map((chart, index) => (
                <button
                  key={chart.name}
                  aria-label={chart.name}
                  onClick={() => onActiveChartChange(index)}
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
            <ActiveChart
              activeChartIndex={activeChartIndex}
              data={filteredData}
              filters={filters}
            />
          </div>
        </div>

        {/* Mobile Drawer Trigger */}
        <div className={`mobile-drawer-trigger ${isDrawerOpen ? 'translate-x-[300px]' : ''}`}>
          <button onClick={onDrawerToggle} className="clip-tapered-btn">
            <div className="flex origin-center flex-col items-center">
              <Icon icon="ci:chevron-left-duo" className="flashing-chevron text-gray-300 dark:text-gray-700" />
              <span className="mobile-drawer-label">estimator</span>
              <Icon icon="ci:chevron-left-duo" className="flashing-chevron text-gray-300 dark:text-gray-700" />
            </div>
          </button>
        </div>

        {/* Mobile Drawer */}
        {isDrawerOpen && (
          <>
            <div className="mobile-drawer-overlay transition-slow" onClick={onDrawerToggle} />
            <div className="mobile-drawer-content transition-slow">
              <EstimationCard
                variant="drawer"
                data={data}
                isExpanded={null}
                onClose={onDrawerToggle}
                onCollapse={null}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};
