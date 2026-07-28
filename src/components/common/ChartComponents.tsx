// src/components/common/ChartComponents.tsx
// Chart registry: one stable key, icon, filter capability, and allowed time
// ranges per chart. The shell renders tabs, the card header, and the period
// selector from this metadata joined to the catalogue via useChartRegistry();
// charts only plot.
import type { LucideIcon } from 'lucide-react';
import { BarChart3, ChartBarDecreasing, GitFork, Globe2, LayoutDashboard, LineChart as LineChartIcon, PieChart } from 'lucide-react';
import type React from 'react';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import type { ChartRange } from '../../utils/selectors';
import { BureauDistributionRingChart } from '../charts/BureauDistributionRingChart';
import { CategoryMixTreemap } from '../charts/CategoryMixTreemap';
import { CategorySubmissionsLineChart } from '../charts/CategorySubmissionsLineChart';
import { GeographicDistributionChart } from '../charts/GeographicDistributionChart';
import { IntakeProcessingBarChart } from '../charts/IntakeProcessingBarChart';
import { OutcomesSankeyChart } from '../charts/OutcomesSankeyChart';
import { ProcessingEfficiencyLollipop } from '../charts/ProcessingEfficiencyLollipop';

export type { ChartRange };

export interface ImmigrationChartData {
  data: ImmigrationData[];
  filters: {
    bureau: string;
    type: string;
  };
  range: ChartRange;
}

export interface ChartDefinition {
  /**
   * Stable slug used as the ?chart= URL value, and the catalogue key suffix
   * for this chart's `charts.<key>.label` / `.description` / `.aria` entries.
   * Display text is resolved by useChartRegistry() rather than living here —
   * a module-level array can't call the locale-bound `t`.
   */
  key: string;
  icon: LucideIcon;
  component: React.ComponentType<ImmigrationChartData>;
  filters: { bureau: boolean; appType: boolean };
  /** Whether the "Compare With" second-bureau view applies to this chart */
  compare: boolean;
  ranges: ChartRange[];
  defaultRange: ChartRange;
}

export const CHART_COMPONENTS: ChartDefinition[] = [
  {
    key: 'intake',
    icon: BarChart3,
    component: IntakeProcessingBarChart,
    filters: { bureau: true, appType: true },
    compare: true,
    ranges: ['6', '12', '24', '36', 'all'],
    defaultRange: '12',
  },
  {
    key: 'types',
    icon: LineChartIcon,
    component: CategorySubmissionsLineChart,
    filters: { bureau: true, appType: false },
    compare: true,
    ranges: ['6', '12', '24', '36', 'all'],
    defaultRange: '12',
  },
  {
    key: 'outcomes',
    icon: GitFork,
    component: OutcomesSankeyChart,
    filters: { bureau: true, appType: true },
    compare: false,
    ranges: ['latest', '6', '12', '24', '36', 'all'],
    defaultRange: '12',
  },
  {
    key: 'share',
    icon: PieChart,
    component: BureauDistributionRingChart,
    filters: { bureau: false, appType: true },
    compare: false,
    ranges: ['latest', '6', '12', '24', '36', 'all'],
    defaultRange: 'latest',
  },
  {
    key: 'mix',
    icon: LayoutDashboard,
    component: CategoryMixTreemap,
    filters: { bureau: true, appType: false },
    compare: false,
    ranges: ['latest', '6', '12', '24', '36', 'all'],
    defaultRange: 'latest',
  },
  {
    key: 'efficiency',
    icon: ChartBarDecreasing,
    component: ProcessingEfficiencyLollipop,
    filters: { bureau: true, appType: true },
    compare: false,
    ranges: ['latest', '6', '12', '24', '36', 'all'],
    defaultRange: 'latest',
  },
  {
    key: 'map',
    icon: Globe2,
    component: GeographicDistributionChart,
    filters: { bureau: false, appType: false },
    compare: false,
    ranges: [],
    defaultRange: 'latest',
  },
];

export const chartByKey = (key: string): ChartDefinition | undefined => CHART_COMPONENTS.find((c) => c.key === key);

export const CHART_KEYS = CHART_COMPONENTS.map((c) => c.key);
