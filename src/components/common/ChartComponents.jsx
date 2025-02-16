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
  },
  {
    name: 'Application Types',
    icon: 'carbon:chart-multi-line',
    component: CategorySubmissionsLineChart,
  },
  {
    name: 'Bureau Distribution',
    icon: 'carbon:chart-ring',
    component: BureauDistributionRingChart,
  },
  {
    name: 'Bureau Performance',
    icon: 'carbon:chart-bubble',
    component: BureauPerformanceBubbleChart,
  },
  {
    name: 'Monthly Radar',
    icon: 'carbon:chart-radar',
    component: MonthlyRadarChart,
  },
];
