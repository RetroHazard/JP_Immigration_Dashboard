// src/components/common/ChartComponents.tsx
// Chart registry: one canonical name, description, icon, filter capability,
// and allowed time ranges per chart. The shell renders tabs, the card header,
// and the period selector from this metadata; charts only plot.
import type { LucideIcon } from 'lucide-react';
import { BarChart3, ChartScatter, GitFork, Globe2, LayoutDashboard, LineChart as LineChartIcon, PieChart } from 'lucide-react';
import type React from 'react';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import type { ChartRange } from '../../utils/selectors';
import { BureauDistributionRingChart } from '../charts/BureauDistributionRingChart';
import { BureauPerformanceBubbleChart } from '../charts/BureauPerformanceBubbleChart';
import { CategoryMixTreemap } from '../charts/CategoryMixTreemap';
import { CategorySubmissionsLineChart } from '../charts/CategorySubmissionsLineChart';
import { GeographicDistributionChart } from '../charts/GeographicDistributionChart';
import { IntakeProcessingBarChart } from '../charts/IntakeProcessingBarChart';
import { OutcomesSankeyChart } from '../charts/OutcomesSankeyChart';

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
  /** Stable slug used as the ?chart= URL value */
  key: string;
  /** Canonical display name, used by the tab AND the card header */
  label: string;
  /** One sentence: what question this chart answers */
  description: string;
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
    label: 'Intake & Processing',
    description: 'Applications carried over and received each month, against the volume the bureaus completed.',
    icon: BarChart3,
    component: IntakeProcessingBarChart,
    filters: { bureau: true, appType: true },
    compare: true,
    ranges: ['6', '12', '24', '36', 'all'],
    defaultRange: '12',
  },
  {
    key: 'types',
    label: 'Application Types',
    description: 'Monthly new submissions broken down by application type — click a legend entry to toggle a series.',
    icon: LineChartIcon,
    component: CategorySubmissionsLineChart,
    filters: { bureau: true, appType: false },
    compare: true,
    ranges: ['6', '12', '24', '36', 'all'],
    defaultRange: '12',
  },
  {
    key: 'outcomes',
    label: 'Outcomes',
    description: 'Where applications end up: each type’s flow into granted, denied, or other outcomes.',
    icon: GitFork,
    component: OutcomesSankeyChart,
    filters: { bureau: true, appType: true },
    compare: false,
    ranges: ['latest', '6', '12', '24', '36', 'all'],
    defaultRange: '12',
  },
  {
    key: 'share',
    label: 'Bureau Share',
    description: 'Where applications were filed: each bureau’s share of total intake.',
    icon: PieChart,
    component: BureauDistributionRingChart,
    filters: { bureau: false, appType: true },
    compare: false,
    ranges: ['latest', '6', '12', '24', '36', 'all'],
    defaultRange: 'latest',
  },
  {
    key: 'mix',
    label: 'Category Mix',
    description: 'All applications by type and bureau — click a category to zoom into its breakdown.',
    icon: LayoutDashboard,
    component: CategoryMixTreemap,
    filters: { bureau: true, appType: false },
    compare: false,
    ranges: ['latest', '6', '12', '24', '36', 'all'],
    defaultRange: 'latest',
  },
  {
    key: 'efficiency',
    label: 'Processing Efficiency',
    description: 'Completion rate against intake volume per bureau; bubble size shows processed volume.',
    icon: ChartScatter,
    component: BureauPerformanceBubbleChart,
    filters: { bureau: true, appType: true },
    compare: false,
    ranges: ['latest', '6', '12', '24', '36', 'all'],
    defaultRange: 'latest',
  },
  {
    key: 'map',
    label: 'Regional Map',
    description: 'Bureau service areas and population density, with bureau and airport office locations.',
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
