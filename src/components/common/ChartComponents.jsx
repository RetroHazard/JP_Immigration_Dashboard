// components/common/ChartComponents.jsx
import { IntakeProcessingBarChart } from '../charts/IntakeProcessingBarChart';
import { CategorySubmissionsLineChart } from '../charts/CategorySubmissionsLineChart';
import { BureauDistributionRingChart } from '../charts/BureauDistributionRingChart';
import { BureauPerformanceBubbleChart } from '../charts/BureauPerformanceBubbleChart';
import { MonthlyRadarChart } from '../charts/MonthlyRadarChart';

export const CHART_COMPONENTS = [
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
];
