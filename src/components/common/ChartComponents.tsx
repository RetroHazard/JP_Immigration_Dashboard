// Chart registry: key, icon, filter capability, allowed time ranges and, for
// processing charts, the data table that serves as the text alternative. The
// shell renders tabs, header, period selector and table from this metadata via
// useChartRegistry(); charts only plot.
//
// One registry per dataset, since the cubes share no dimension. Chart keys are
// unique across both: the dataset is derived from `?chart=`, so a permalink
// can't name a dataset and chart that disagree.
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  ChartBarDecreasing,
  GitFork,
  Globe,
  Globe2,
  Layers,
  LayoutDashboard,
  LineChart as LineChartIcon,
  Network,
  PieChart,
  Scale,
  TrendingUp,
} from 'lucide-react';
import type React from 'react';

import type { StatusGroup } from '../../constants/residenceStatuses';
import type { ImmigrationData } from '../../hooks/useImmigrationData';
import type { ProcessingTableId } from '../../utils/chartTables';
import type { ResidentRecord } from '../../utils/residentsData';
import type { ResidentRange } from '../../utils/residentsSelectors';
import type { ChartRange } from '../../utils/selectors';
import { BureauDistributionRingChart } from '../charts/BureauDistributionRingChart';
import { CategoryMixTreemap } from '../charts/CategoryMixTreemap';
import { CategorySubmissionsLineChart, typesAxisMax } from '../charts/CategorySubmissionsLineChart';
import { GeographicDistributionChart } from '../charts/GeographicDistributionChart';
import { intakeAxisMax,IntakeProcessingBarChart } from '../charts/IntakeProcessingBarChart';
import { NationalityMoversChart } from '../charts/NationalityMoversChart';
import { NationalityTrendChart } from '../charts/NationalityTrendChart';
import { OriginChoroplethChart } from '../charts/OriginChoroplethChart';
import { OutcomesSankeyChart } from '../charts/OutcomesSankeyChart';
import { PopulationGrowthChart } from '../charts/PopulationGrowthChart';
import { ProcessingEfficiencyLollipop } from '../charts/ProcessingEfficiencyLollipop';
import { ResidenceStatusSunburst } from '../charts/ResidenceStatusSunburst';
import { ResidentFlowsSankeyChart } from '../charts/ResidentFlowsSankeyChart';

export type { ChartRange, ResidentRange };

export type Dataset = 'processing' | 'residents';

export interface ImmigrationChartData {
  data: ImmigrationData[];
  filters: {
    bureau: string;
    type: string;
  };
  range: ChartRange;
  /**
   * Compare mode: the top of the count axis both panes must share so their bar
   * heights and line positions are directly comparable. Undefined = each chart
   * fits its own axis to its own data.
   */
  yMax?: number;
  /**
   * Compare mode: leave the policy-event list to the shell, which renders it
   * once — the events are national, so both panes would list the same rows.
   * Markers on the plot are unaffected.
   */
  hidePolicyList?: boolean;
}

export interface ResidentFilters {
  /** Continent code from NATIONALITY_REGIONS, or 'all' */
  region: string;
  /** e-Stat cat02 code, or 'all' */
  nationality: string;
  /**
   * Coarse status family, or 'all'. The URL param is ?status; parseStatusParam
   * maps legacy individual e-Stat status codes to their family.
   */
  group: 'all' | StatusGroup;
}

export interface ResidentChartData {
  data: ResidentRecord[];
  filters: ResidentFilters;
  range: ResidentRange;
  /**
   * The snapshot a stock view draws ('YYYY-06'|'YYYY-12'); null = latest.
   * Only meaningful on charts registered with timeControl: 'snapshot' —
   * range charts always receive null.
   */
  period: string | null;
}

interface BaseChartDefinition {
  /**
   * Stable slug: the ?chart= URL value and the key of this chart's
   * `charts.<key>.label` / `.description` / `.aria` entries. useChartRegistry()
   * resolves the text; a module-level array can't call the locale-bound `t`.
   */
  key: string;
  icon: LucideIcon;
  /** Whether the "Compare With" second-bureau view applies to this chart */
  compare: boolean;
}

export interface ProcessingChartDefinition extends BaseChartDefinition {
  dataset: 'processing';
  component: React.ComponentType<ImmigrationChartData>;
  filters: { bureau: boolean; appType: boolean };
  /**
   * Which data table (text alternative) this chart renders. Required so each
   * new chart has to choose one. Shapes and selector math live in
   * src/utils/chartTables.ts, keyed on this id, so an alternate component
   * swapped into the same entry keeps its table.
   */
  table: ProcessingTableId;
  ranges: ChartRange[];
  defaultRange: ChartRange;
  /**
   * Largest value this chart puts on its count axis for one bureau. Compare
   * mode takes the greater of the two panes' values and hands it back to both
   * as `yMax`. Present only on charts whose axis is a count worth normalising.
   */
  /** Whether the chart annotates policy events; compare mode then lists them once. */
  policyEvents?: boolean;
  axisMax?: (data: ImmigrationData[], filters: ImmigrationChartData['filters'], range: ChartRange) => number;
}

export interface ResidentChartDefinition extends BaseChartDefinition {
  dataset: 'residents';
  component: React.ComponentType<ResidentChartData>;
  filters: { region: boolean; nationality: boolean; group: boolean };
  /**
   * 'range' renders the window picker over `ranges`; 'snapshot' renders the
   * as-of period dropdown, since stock views draw a single period. Snapshot
   * charts keep `ranges: []`.
   */
  timeControl: 'range' | 'snapshot';
  ranges: ResidentRange[];
  /** Unused at runtime on snapshot charts; the type still requires it. */
  defaultRange: ResidentRange;
}

export type ChartDefinition = ProcessingChartDefinition | ResidentChartDefinition;

export const PROCESSING_CHARTS: ProcessingChartDefinition[] = [
  {
    key: 'intake',
    dataset: 'processing',
    icon: BarChart3,
    component: IntakeProcessingBarChart,
    filters: { bureau: true, appType: true },
    table: 'intakeByMonth',
    axisMax: intakeAxisMax,
    policyEvents: true,
    compare: true,
    ranges: ['6', '12', '24', '36', 'all'],
    defaultRange: '12',
  },
  {
    key: 'types',
    dataset: 'processing',
    icon: LineChartIcon,
    component: CategorySubmissionsLineChart,
    filters: { bureau: true, appType: false },
    table: 'typesByMonth',
    axisMax: typesAxisMax,
    compare: true,
    ranges: ['6', '12', '24', '36', 'all'],
    defaultRange: '12',
  },
  {
    key: 'outcomes',
    dataset: 'processing',
    icon: GitFork,
    component: OutcomesSankeyChart,
    filters: { bureau: true, appType: true },
    table: 'outcomesByType',
    compare: false,
    ranges: ['latest', '6', '12', '24', '36', 'all'],
    defaultRange: '12',
  },
  {
    key: 'share',
    dataset: 'processing',
    icon: PieChart,
    component: BureauDistributionRingChart,
    filters: { bureau: false, appType: true },
    table: 'shareByBureau',
    compare: false,
    ranges: ['latest', '6', '12', '24', '36', 'all'],
    defaultRange: 'latest',
  },
  {
    key: 'mix',
    dataset: 'processing',
    icon: LayoutDashboard,
    component: CategoryMixTreemap,
    filters: { bureau: true, appType: false },
    table: 'mixByBureau',
    compare: false,
    ranges: ['latest', '6', '12', '24', '36', 'all'],
    defaultRange: 'latest',
  },
  {
    key: 'efficiency',
    dataset: 'processing',
    icon: ChartBarDecreasing,
    component: ProcessingEfficiencyLollipop,
    filters: { bureau: true, appType: true },
    table: 'efficiencyByBureau',
    compare: false,
    ranges: ['latest', '6', '12', '24', '36', 'all'],
    defaultRange: 'latest',
  },
  {
    key: 'map',
    dataset: 'processing',
    icon: Globe2,
    component: GeographicDistributionChart,
    filters: { bureau: false, appType: false },
    table: 'prefectures',
    compare: false,
    ranges: [],
    defaultRange: 'latest',
  },
];

export const RESIDENT_CHARTS: ResidentChartDefinition[] = [
  // Tab order is the narrative: total growth → who grew → origin x status →
  // status detail → map → most recent change.
  {
    key: 'growth',
    dataset: 'residents',
    icon: TrendingUp,
    component: PopulationGrowthChart,
    filters: { region: true, nationality: true, group: false },
    timeControl: 'range',
    compare: false,
    // Always the full timeline (2M→4M with the COVID dip). Empty ranges = no
    // picker; range resolves to defaultRange.
    ranges: [],
    defaultRange: 'all',
  },
  {
    key: 'origins',
    dataset: 'residents',
    icon: LineChartIcon,
    component: NationalityTrendChart,
    filters: { region: true, nationality: false, group: true },
    timeControl: 'range',
    compare: false,
    // Same as growth: always the full half-yearly history.
    ranges: [],
    defaultRange: 'all',
  },
  {
    key: 'flows',
    dataset: 'residents',
    icon: Network,
    component: ResidentFlowsSankeyChart,
    filters: { region: true, nationality: true, group: true },
    timeControl: 'snapshot',
    compare: false,
    ranges: [],
    defaultRange: 'latest',
  },
  {
    key: 'statuses',
    dataset: 'residents',
    icon: Layers,
    component: ResidenceStatusSunburst,
    filters: { region: true, nationality: true, group: false },
    timeControl: 'snapshot',
    compare: false,
    ranges: [],
    defaultRange: 'latest',
  },
  {
    key: 'worldmap',
    dataset: 'residents',
    icon: Globe,
    component: OriginChoroplethChart,
    filters: { region: true, nationality: false, group: true },
    timeControl: 'snapshot',
    compare: false,
    ranges: [],
    defaultRange: 'latest',
  },
  {
    key: 'movers',
    dataset: 'residents',
    icon: Scale,
    component: NationalityMoversChart,
    filters: { region: true, nationality: false, group: true },
    timeControl: 'range',
    compare: false,
    ranges: ['3y', '5y', '10y', 'all'],
    defaultRange: '3y',
  },
];

export const CHARTS_BY_DATASET: Record<Dataset, ChartDefinition[]> = {
  processing: PROCESSING_CHARTS,
  residents: RESIDENT_CHARTS,
};

export const DATASETS: Dataset[] = ['processing', 'residents'];

/** Every chart in both registries, in tab order within each dataset. */
export const CHART_COMPONENTS: ChartDefinition[] = [...PROCESSING_CHARTS, ...RESIDENT_CHARTS];

export const chartByKey = (key: string): ChartDefinition | undefined =>
  CHART_COMPONENTS.find((chart) => chart.key === key);

export const CHART_KEYS = CHART_COMPONENTS.map((chart) => chart.key);

/** Which dataset a `?chart=` value belongs to; processing for an unknown key. */
export const datasetForChart = (key: string): Dataset => chartByKey(key)?.dataset ?? 'processing';
