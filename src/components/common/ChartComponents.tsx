// src/components/common/ChartComponents.tsx
import { IntakeProcessingBarChart } from '../charts/IntakeProcessingBarChart';
import { CategorySubmissionsLineChart } from '../charts/CategorySubmissionsLineChart';
import { BureauDistributionRingChart } from '../charts/BureauDistributionRingChart';
import { BureauPerformanceBubbleChart } from '../charts/BureauPerformanceBubbleChart';
import { MonthlyRadarChart } from '../charts/MonthlyRadarChart';
import { GeographicDistributionChart } from '../charts/GeographicDistributionChart';
import { ImmigrationData } from '../../hooks/useImmigrationData';

export interface ImmigrationChartData {
  data: ImmigrationData[];
  filters: {
    bureau: string;
    month: string;
    type: string };
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