// src/components/common/ChartComponents.tsx
import dynamic from 'next/dynamic';

import type React from 'react';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { LoadingSpinner } from './LoadingSpinner';

// Dynamic imports for code splitting - reduces initial bundle size
const IntakeProcessingBarChart = dynamic(
  () => import('../charts/IntakeProcessingBarChart').then((mod) => ({ default: mod.IntakeProcessingBarChart })),
  {
    ssr: false,
    loading: () => <LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Loading chart..." />,
  }
);

const CategorySubmissionsLineChart = dynamic(
  () => import('../charts/CategorySubmissionsLineChart').then((mod) => ({ default: mod.CategorySubmissionsLineChart })),
  {
    ssr: false,
    loading: () => <LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Loading chart..." />,
  }
);

const BureauDistributionRingChart = dynamic(
  () => import('../charts/BureauDistributionRingChart').then((mod) => ({ default: mod.BureauDistributionRingChart })),
  {
    ssr: false,
    loading: () => <LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Loading chart..." />,
  }
);

const BureauPerformanceBubbleChart = dynamic(
  () =>
    import('../charts/BureauPerformanceBubbleChart').then((mod) => ({ default: mod.BureauPerformanceBubbleChart })),
  {
    ssr: false,
    loading: () => <LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Loading chart..." />,
  }
);

const MonthlyRadarChart = dynamic(
  () => import('../charts/MonthlyRadarChart').then((mod) => ({ default: mod.MonthlyRadarChart })),
  {
    ssr: false,
    loading: () => <LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Loading chart..." />,
  }
);

const GeographicDistributionChart = dynamic(
  () => import('../charts/GeographicDistributionChart').then((mod) => ({ default: mod.GeographicDistributionChart })),
  {
    ssr: false,
    loading: () => <LoadingSpinner icon="svg-spinners:90-ring-with-bg" message="Loading chart..." />,
  }
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
