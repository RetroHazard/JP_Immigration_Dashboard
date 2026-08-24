// src/components/common/ChartComponents.tsx
// Chart registry: one stable key, icon, filter capability, and allowed time
// ranges per chart. The shell renders tabs, the card header, and the period
// selector from this metadata joined to the catalogue via useChartRegistry();
// charts only plot.
//
// Two registries, one per dataset. The two cubes share no dimension — the
// processing table is bureau x application type x status by month, the
// residents table is nationality x residence status by half-year — so they
// carry different filters, different ranges, and different props. A
// discriminated union on `dataset` is what lets the shell narrow to the right
// pairing instead of every chart accepting both shapes.
//
// Chart keys are unique ACROSS both registries: the active dataset is derived
// from `?chart=` rather than a URL param of its own, so a permalink can never
// name a dataset and a chart that disagree, and every link written before the
// residents dataset existed still resolves.
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
import { CategorySubmissionsLineChart } from '../charts/CategorySubmissionsLineChart';
import { GeographicDistributionChart } from '../charts/GeographicDistributionChart';
import { IntakeProcessingBarChart } from '../charts/IntakeProcessingBarChart';
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
}

export interface ResidentFilters {
  /** Continent code from NATIONALITY_REGIONS, or 'all' */
  region: string;
  /** e-Stat cat02 code, or 'all' */
  nationality: string;
  /**
   * Coarse status family, or 'all'. The URL param is still named ?status —
   * it used to carry individual e-Stat status codes, and legacy values are
   * mapped to their category by parseStatusParam.
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
   * Stable slug used as the ?chart= URL value, and the catalogue key suffix
   * for this chart's `charts.<key>.label` / `.description` / `.aria` entries.
   * Display text is resolved by useChartRegistry() rather than living here —
   * a module-level array can't call the locale-bound `t`.
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
   * Which text alternative this chart's data table renders — a capability
   * declaration in the same spirit as `filters` and `ranges`. Required, not
   * optional: the table used to be a single hardcoded month x status pivot
   * mounted under every chart, and making each chart name its own is what
   * stops the next one being added without anyone deciding. The shapes and
   * their selector math live in src/utils/chartTables.ts, keyed on this id, so
   * a swap-ready alternate component inherits its table for free.
   */
  table: ProcessingTableId;
  ranges: ChartRange[];
  defaultRange: ChartRange;
}

export interface ResidentChartDefinition extends BaseChartDefinition {
  dataset: 'residents';
  component: React.ComponentType<ResidentChartData>;
  filters: { region: boolean; nationality: boolean; group: boolean };
  /**
   * How the header's time control behaves: 'range' renders the window picker
   * over `ranges`; 'snapshot' renders the as-of period dropdown instead
   * (stock views draw one period, so a window would be a lie — see the
   * builders' snapshot comments). Snapshot charts keep `ranges: []`.
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
  // Tab order is the narrative: how the total grew → who grew → how origin
  // and status cross-tabulate → the status detail → where on the map → what
  // changed most recently.
  {
    key: 'growth',
    dataset: 'residents',
    icon: TrendingUp,
    component: PopulationGrowthChart,
    filters: { region: true, nationality: true, group: false },
    timeControl: 'range',
    compare: false,
    // The whole timeline IS the story (2M→4M with the COVID dip); a window
    // picker only ever cropped it. Empty ranges = no picker, range resolves
    // to defaultRange.
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
