import { ApplicationDensityTreemapChart } from '../charts/ApplicationDensityTreemapChart';
import { ApplicationTypeLineChart } from '../charts/ApplicationTypeLineChart';
import { BureauDistributionPieChart } from '../charts/BureauDistributionPieChart';
import { BureauPerformanceBubbleChart } from '../charts/BureauPerformanceBubbleChart';
import { IntakeProcessingBarChart } from '../charts/IntakeProcessingBarChart';
import { MonthlyRadarChart } from '../charts/MonthlyRadarChart';

export const CHART_COMPONENTS = [
  {
    name: 'Intake Processing',
    icon: 'carbon:chart-combo',
    component: IntakeProcessingBarChart,
  },
  /*  {
    name: 'Intake Processing (Line)',
    icon: 'carbon:chart-multi-line',
    component: IntakeProcessingLineChart,
  },*/
  {
    name: 'Application Types',
    icon: 'carbon:chart-multi-line',
    component: ApplicationTypeLineChart,
  },
  {
    name: 'Application Bureau Heatmap',
    icon: 'carbon:chart-treemap',
    component: ApplicationDensityTreemapChart,
  },
  {
    name: 'Bureau Distribution',
    icon: 'carbon:chart-pie',
    component: BureauDistributionPieChart,
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
