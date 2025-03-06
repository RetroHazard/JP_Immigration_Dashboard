// src/components/common/ChartComponents.tsx
import type React from 'react';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { BureauDistributionRingChart } from '../charts/BureauDistributionRingChart';
import { BureauPerformanceBubbleChart } from '../charts/BureauPerformanceBubbleChart';
import { CategorySubmissionsLineChart } from '../charts/CategorySubmissionsLineChart';
import { GeographicDistributionChart } from '../charts/GeographicDistributionChart';
import { IntakeProcessingBarChart } from '../charts/IntakeProcessingBarChart';
import { MonthlyRadarChart } from '../charts/MonthlyRadarChart';
import { BureauDistributionTreemap } from '../charts/BureauDistributionTreemap';

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
    component: BureauDistributionTreemap,
    filters: { bureau: false, appType: false },
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
