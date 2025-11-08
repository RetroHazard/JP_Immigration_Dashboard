// src/components/common/ChartComponents.tsx
import { lazy } from 'react';

import type React from 'react';

import type { ImmigrationData } from '../../hooks/useImmigrationData';

// Lazy load chart components for code splitting - reduces initial bundle size
const BureauDistributionRingChart = lazy(() =>
  import('../charts/BureauDistributionRingChart').then((module) => ({
    default: module.BureauDistributionRingChart,
  }))
);
const BureauPerformanceBubbleChart = lazy(() =>
  import('../charts/BureauPerformanceBubbleChart').then((module) => ({
    default: module.BureauPerformanceBubbleChart,
  }))
);
const CategorySubmissionsLineChart = lazy(() =>
  import('../charts/CategorySubmissionsLineChart').then((module) => ({
    default: module.CategorySubmissionsLineChart,
  }))
);
const GeographicDistributionChart = lazy(() =>
  import('../charts/GeographicDistributionChart').then((module) => ({
    default: module.GeographicDistributionChart,
  }))
);
const IntakeProcessingBarChart = lazy(() =>
  import('../charts/IntakeProcessingBarChart').then((module) => ({
    default: module.IntakeProcessingBarChart,
  }))
);
const MonthlyRadarChart = lazy(() =>
  import('../charts/MonthlyRadarChart').then((module) => ({
    default: module.MonthlyRadarChart,
  }))
);

export interface ImmigrationChartData {
  data: ImmigrationData[];
  filters: {
    bureau: string;
    type: string;
  };
  isDarkMode: boolean;
}

interface ChartComponent {
  name: string;
  icon: string;
  component: React.ComponentType<ImmigrationChartData>;
  filters: { bureau: boolean; appType: boolean };
}

export const CHART_COMPONENTS: ChartComponent[] = [
  {
    name: 'Intake Processing',
    icon: 'carbon:chart-stacked',
    component: IntakeProcessingBarChart,
    filters: { bureau: true, appType: true },
  },
  {
    name: 'Application Types',
    icon: 'carbon:chart-multi-line',
    component: CategorySubmissionsLineChart,
    filters: { bureau: true, appType: false },
  },
  {
    name: 'Bureau Distribution',
    icon: 'carbon:chart-ring',
    component: BureauDistributionRingChart,
    filters: { bureau: false, appType: true },
  },
  {
    name: 'Bureau Performance',
    icon: 'carbon:chart-bubble',
    component: BureauPerformanceBubbleChart,
    filters: { bureau: true, appType: true },
  },
  {
    name: 'Monthly Radar',
    icon: 'carbon:chart-radar',
    component: MonthlyRadarChart,
    filters: { bureau: true, appType: false },
  },
  {
    name: 'Geographic Distribution',
    icon: 'carbon:map',
    component: GeographicDistributionChart,
    filters: { bureau: false, appType: false },
  },
];
