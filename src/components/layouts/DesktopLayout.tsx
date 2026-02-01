// DesktopLayout.tsx
import type React from 'react';
import { Icon } from '@iconify/react';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { ActiveChart } from '../ActiveChart';
import { CHART_COMPONENTS } from '../common/ChartComponents';
import { EstimationCard } from '../EstimationCard';
import { FilterPanel } from '../FilterPanel';

interface DesktopLayoutProps {
  data: ImmigrationData[];
  filteredData: ImmigrationData[];
  filters: { bureau: string; type: string };
  onFilterChange: (filters: { bureau: string; type: string }) => void;
  activeChartIndex: number;
  onActiveChartChange: (index: number) => void;
  isEstimationExpanded: boolean;
  onEstimationToggle: (expanded: boolean) => void;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  data,
  filteredData,
  filters,
  onFilterChange,
  activeChartIndex,
  onActiveChartChange,
  isEstimationExpanded,
  onEstimationToggle,
}) => {
  return (
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
              onChange={onFilterChange}
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
      </div>

      {/* Right estimator column */}
      <div
        className={`transition-slow h-full ${
          isEstimationExpanded ? 'estimator-expanded' : 'estimator-collapsed'
        }`}
      >
        <div
          className="h-full cursor-pointer rounded-lg bg-white shadow-lg dark:bg-gray-700"
          onClick={() => !isEstimationExpanded && onEstimationToggle(true)}
        >
          <EstimationCard
            variant="expandable"
            data={data}
            isExpanded={isEstimationExpanded}
            onClose={null}
            onCollapse={() => onEstimationToggle(false)}
          />
        </div>
      </div>
    </div>
  );
};
