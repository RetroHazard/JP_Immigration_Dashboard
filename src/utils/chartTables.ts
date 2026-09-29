// What each Application Processing chart's data table contains. A table must
// describe the same projection of the cube as the chart above it, so the row
// axis varies (month / application type / bureau / prefecture) and each builder
// reads its numbers from the helper the chart uses (`buildCategoryMixTree`,
// `computeBureauVolumes`, …) so the two cannot drift. The registry names a
// builder by id; the math lives here to keep the selector graph out of
// ChartComponents.tsx's imports.
import { applicationOptions } from '../constants/applicationOptions';
import { bureauOptions } from '../constants/bureauOptions';
import { japanPrefectures } from '../constants/japanPrefectures';
import { STATUS_CODES } from '../constants/statusCodes';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { englishOnly } from '../i18n/translate';
import type { DictionaryKey, TranslateFn } from '../i18n/types';
import { buildCategoryMixTree } from './categoryMixTree';
import { computeBureauVolumes } from './processingEfficiency';
import type { ChartRange } from './selectors';
import { bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from './selectors';

/**
 * Display text named by identity rather than by value. The DOM resolves a ref
 * with the locale-bound `t`; the CSV writer resolves the same ref against
 * English, which keeps exports English-only (`chartTableCsv.ts`). A bare string
 * is a language-neutral literal.
 */
export type LabelRef = string | { key: DictionaryKey; params?: Record<string, string | number | LabelRef> };

/** Resolves a ref, and any nested refs in its params, through one translator. */
export const resolveLabel = (ref: LabelRef, t: TranslateFn): string => {
  if (typeof ref === 'string') return ref;
  if (!ref.params) return t(ref.key);
  const params: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(ref.params)) {
    params[name] = typeof value === 'object' ? resolveLabel(value, t) : value;
  }
  return t(ref.key, params);
};

export interface TableColumn {
  /** Stable identity: React key and CSV column order. Never display text. */
  id: string;
  labelKey: DictionaryKey;
  /**
   * 'count'   — `formatters.number` in the DOM, a raw integer in the CSV
   * 'percent' — `formatters.percent` (0-100 scale), a bare `86.3` in the CSV
   * 'label'   — a nested LabelRef; left-aligned, and the reason CSV quotes
   */
  format: 'count' | 'percent' | 'label';
  /**
   * Wraps the on-screen cell only, e.g. `map.areaValue` renders "377,975 km²".
   * The CSV writes the bare number so a spreadsheet still sees a number.
   */
  unitKey?: DictionaryKey;
  /**
   * The unit's bare form for the CSV header (`km²` gives `Area (km²)`, as a
   * percent column takes ` (%)`). Set it with `unitKey`, or the unit shows on
   * screen but not in the export.
   */
  csvUnit?: string;
}

export type TableValue = number | LabelRef;

export interface TableRow {
  /** Stable identity: React key. A month, a bureau code, a JIS prefecture id. */
  id: string;
  label: LabelRef;
  /** Parallel to `columns`. */
  values: TableValue[];
}

export interface TableModel {
  /** Header of the leading row-label column. */
  rowHeaderKey: DictionaryKey;
  columns: TableColumn[];
  rows: TableRow[];
  /** One source for the sr-only `<caption>` and the CSV's leading `#` line. */
  caption: LabelRef;
  /** Download filename stem: English names, not e-Stat codes, in lowercase `[a-z0-9_-]`. */
  csvStem: string;
  /** Second `#` line: a language-neutral echo of what produced this table. */
  csvSelection: string;
}

export interface TableInput {
  /** Already airport-filtered — DashboardShell's `chartData`. */
  data: ImmigrationData[];
  /** The registry-neutralized `effectiveFilters`. */
  filters: { bureau: string; type: string };
  range: ChartRange;
  /** Registry key of the chart this table stands in for; names the caption. */
  chartKey: string;
}

export type TableBuilder = (input: TableInput) => TableModel;

// ── Shared pieces ──────────────────────────────────────────────────────────

const TYPE_CODES = applicationOptions.filter((option) => option.value !== 'all').map((option) => option.value);

const BUREAU_CODES = bureauOptions.filter((bureau) => bureau.value !== 'all').map((bureau) => bureau.value);

const chartRef = (chartKey: string): LabelRef => ({ key: `charts.${chartKey}.label` as DictionaryKey });
const bureauRef = (code: string): LabelRef => ({ key: `bureau.${code}` as DictionaryKey });
const typeRef = (code: string): LabelRef => ({ key: `appType.${code}` as DictionaryKey });

/**
 * Lowercase, filename-safe English name. Names rather than e-Stat codes keep the
 * download readable; `englishOnly` because exports are English whatever the UI
 * language.
 */
const fileSafe = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const bureauName = (code: string): string => fileSafe(englishOnly(`bureau.${code}` as DictionaryKey));
const typeName = (code: string): string => fileSafe(englishOnly(`appType.${code}.short` as DictionaryKey));

/**
 * "Showing Bureau Share for Nationwide, Permanent Residence": the same sentence
 * DashboardShell announces the chart with.
 */
const caption = ({ chartKey, filters }: TableInput): LabelRef =>
  filters.type === 'all'
    ? { key: 'a11y.showingChart', params: { chart: chartRef(chartKey), bureau: bureauRef(filters.bureau) } }
    : {
        key: 'a11y.showingChartWithType',
        params: { chart: chartRef(chartKey), bureau: bureauRef(filters.bureau), type: typeRef(filters.type) },
      };

const selection = ({ chartKey, filters, range }: TableInput): string =>
  `chart=${chartKey}; bureau=${filters.bureau}; type=${filters.type}; range=${range}`;

/** Columns for a per-application-type breakdown, in canonical code order. */
const typeColumns = (): TableColumn[] =>
  TYPE_CODES.map((code) => ({ id: `type-${code}`, labelKey: `appType.${code}` as DictionaryKey, format: 'count' }));

/** Rows in range, already narrowed to a bureau scope and application type. */
const rowsInRange = (data: ImmigrationData[], range: ChartRange, selectFrom: () => ImmigrationData[]) => {
  const months = monthsForRange(getAllMonths(data), range);
  return selectFrom().filter((entry) => months.includes(entry.month));
};

const sumWhere = (rows: ImmigrationData[], predicate: (entry: ImmigrationData) => boolean): number =>
  rows.reduce((sum, entry) => (predicate(entry) ? sum + entry.value : sum), 0);

const rate = (part: number, whole: number): number => (whole > 0 ? (part / whole) * 100 : 0);

// ── intake ─────────────────────────────────────────────────────────────────

const STATUS_COLUMNS: { id: string; labelKey: DictionaryKey; status: string }[] = [
  { id: 'carriedOver', labelKey: 'metric.carriedOver', status: STATUS_CODES.OLD_APPLICATIONS },
  { id: 'received', labelKey: 'metric.received', status: STATUS_CODES.NEW_APPLICATIONS },
  { id: 'processed', labelKey: 'metric.processed', status: STATUS_CODES.PROCESSED },
  { id: 'granted', labelKey: 'metric.granted', status: STATUS_CODES.GRANTED },
  { id: 'denied', labelKey: 'metric.denied', status: STATUS_CODES.DENIED },
  { id: 'other', labelKey: 'metric.other', status: STATUS_CODES.OTHER },
];

/**
 * Month x status pivot: a superset of the bar chart's volume series and the
 * closest thing the app offers to a raw dump, so it keeps all six status
 * columns. The trailing percent column is the chart's approval-rate line
 * (granted out of processed, per month).
 */
const intakeByMonth: TableBuilder = (input) => {
  const { data, filters, range } = input;
  const months = monthsForRange(getAllMonths(data), range);
  return {
    rowHeaderKey: 'table.month',
    columns: [
      ...STATUS_COLUMNS.map(({ id, labelKey }) => ({ id, labelKey, format: 'count' as const })),
      // The chart's own legend label for the line this column mirrors.
      { id: 'approvalRate', labelKey: 'metric.approvalRate', format: 'percent' },
    ],
    rows: months.map((month) => {
      const monthRows = selectData(data, {
        month,
        scope: bureauScopeFromFilter(filters.bureau),
        type: filters.type,
      });
      const counts = STATUS_COLUMNS.map((column) => sumWhere(monthRows, (entry) => entry.status === column.status));
      const [, , processed, granted] = counts;
      return {
        id: month,
        label: month,
        values: [...counts, rate(granted, processed)],
      };
    }),
    caption: caption(input),
    csvStem: `immigration-stats_intake_${bureauName(filters.bureau)}_${typeName(filters.type)}_${range}`,
    csvSelection: selection(input),
  };
};

// ── types ──────────────────────────────────────────────────────────────────

/**
 * Mirrors CategorySubmissionsLineChart: new applications summed per
 * `entry.type`. `filters.type` is not applied; the registry marks this chart
 * `appType: false` because the type dimension is its subject. Columns take the
 * full `appType.<code>` names from `applicationOptions`, not the chart's
 * width-fitted legend text.
 */
const typesByMonth: TableBuilder = (input) => {
  const { data, filters, range } = input;
  const months = monthsForRange(getAllMonths(data), range);
  return {
    rowHeaderKey: 'table.month',
    columns: typeColumns(),
    rows: months.map((month) => {
      const monthRows = selectData(data, {
        month,
        scope: bureauScopeFromFilter(filters.bureau),
        status: STATUS_CODES.NEW_APPLICATIONS,
      });
      return {
        id: month,
        label: month,
        values: TYPE_CODES.map((code) => sumWhere(monthRows, (entry) => entry.type === code)),
      };
    }),
    caption: caption(input),
    csvStem: `immigration-stats_types_${bureauName(filters.bureau)}_${range}`,
    csvSelection: selection(input),
  };
};

// ── outcomes ───────────────────────────────────────────────────────────────

const OUTCOME_COLUMNS: { id: string; labelKey: DictionaryKey; status: string }[] = [
  { id: 'granted', labelKey: 'metric.granted', status: STATUS_CODES.GRANTED },
  { id: 'denied', labelKey: 'metric.denied', status: STATUS_CODES.DENIED },
  // The label the Sankey draws on that node, not the generic 'Other'.
  { id: 'other', labelKey: 'chart.outcomes.otherWithdrawn', status: STATUS_CODES.OTHER },
  { id: 'processed', labelKey: 'metric.processed', status: STATUS_CODES.PROCESSED },
];

/**
 * One row per Sankey source node, one column per outcome node: the cross-tab
 * of the Sankey's links. The trailing percent column is the approval-rate gauge.
 */
const outcomesByType: TableBuilder = (input) => {
  const { data, filters, range } = input;
  const rows = rowsInRange(data, range, () =>
    selectData(data, { scope: bureauScopeFromFilter(filters.bureau), type: filters.type })
  );
  const activeTypes = filters.type === 'all' ? TYPE_CODES : TYPE_CODES.filter((code) => code === filters.type);

  const valuesFor = (matches: (entry: ImmigrationData) => boolean): TableValue[] => {
    const counts = OUTCOME_COLUMNS.map((column) =>
      sumWhere(rows, (entry) => matches(entry) && entry.status === column.status)
    );
    const [granted, , , processed] = counts;
    return [...counts, rate(granted, processed)];
  };

  return {
    rowHeaderKey: 'filters.appType',
    columns: [
      ...OUTCOME_COLUMNS.map(({ id, labelKey }) => ({ id, labelKey, format: 'count' as const })),
      { id: 'approvalRate', labelKey: 'chart.outcomes.approvalRate', format: 'percent' },
    ],
    rows: [
      ...activeTypes.map((code) => ({
        id: code,
        label: typeRef(code),
        values: valuesFor((entry) => entry.type === code),
      })),
      // Summed from the source rows, not the rows above, so it matches the gauge
      // even if the cube carries a type code outside `applicationOptions`.
      ...(filters.type === 'all'
        ? [{ id: 'all', label: typeRef('all'), values: valuesFor(() => true) }]
        : []),
    ],
    caption: caption(input),
    csvStem: `immigration-stats_outcomes_${bureauName(filters.bureau)}_${typeName(filters.type)}_${range}`,
    csvSelection: selection(input),
  };
};

// ── share ──────────────────────────────────────────────────────────────────

/**
 * The donut's math (BureauDistributionRingChart): per-bureau rows in range,
 * carried over plus received. Lists every bureau, including those the donut
 * folds into "Other (n)". The share denominator is the sum of the bureau rows
 * (the donut's total), not the nationwide aggregate row, which need not agree.
 */
const shareByBureau: TableBuilder = (input) => {
  const { data, filters, range } = input;
  const rows = rowsInRange(data, range, () =>
    selectData(data, { scope: { kind: 'eachBureau' }, type: filters.type })
  ).filter(
    (entry) => entry.status === STATUS_CODES.OLD_APPLICATIONS || entry.status === STATUS_CODES.NEW_APPLICATIONS
  );

  const byBureau = BUREAU_CODES.map((code) => {
    const carriedOver = sumWhere(rows, (entry) => entry.bureau === code && entry.status === STATUS_CODES.OLD_APPLICATIONS);
    const received = sumWhere(rows, (entry) => entry.bureau === code && entry.status === STATUS_CODES.NEW_APPLICATIONS);
    return { code, carriedOver, received, total: carriedOver + received };
  })
    .filter((bureau) => bureau.total > 0)
    .sort((a, b) => b.total - a.total);

  const total = byBureau.reduce((sum, bureau) => sum + bureau.total, 0);

  return {
    rowHeaderKey: 'filters.bureau',
    columns: [
      { id: 'carriedOver', labelKey: 'metric.carriedOver', format: 'count' },
      { id: 'received', labelKey: 'metric.received', format: 'count' },
      { id: 'applications', labelKey: 'metric.applications', format: 'count' },
      { id: 'share', labelKey: 'table.shareOfTotal', format: 'percent' },
    ],
    rows: byBureau.map((bureau) => ({
      id: bureau.code,
      label: bureauRef(bureau.code),
      values: [bureau.carriedOver, bureau.received, bureau.total, rate(bureau.total, total)],
    })),
    caption: caption(input),
    csvStem: `immigration-stats_share_${typeName(filters.type)}_${range}`,
    csvSelection: selection(input),
  };
};

// ── mix ────────────────────────────────────────────────────────────────────

/**
 * The treemap's `application type -> bureau` hierarchy transposed into a
 * bureau x type matrix, built from `buildCategoryMixTree` so scope and the
 * new-applications status pin come from the chart. Columns stay in canonical
 * code order, not the tree's value order, so they don't reshuffle with filters.
 */
const mixByBureau: TableBuilder = (input) => {
  const { data, filters, range } = input;
  const tree = buildCategoryMixTree(data, filters, range);

  const byBureau = new Map<string, Map<string, number>>();
  for (const category of tree.categories) {
    for (const leaf of category.children) {
      const row = byBureau.get(leaf.code) ?? new Map<string, number>();
      row.set(category.key, leaf.value);
      byBureau.set(leaf.code, row);
    }
  }

  const ranked = [...byBureau.entries()]
    .map(([code, cells]) => ({
      code,
      cells,
      total: [...cells.values()].reduce((sum, value) => sum + value, 0),
    }))
    .sort((a, b) => b.total - a.total);

  return {
    rowHeaderKey: 'filters.bureau',
    columns: [...typeColumns(), { id: 'total', labelKey: 'metric.applications', format: 'count' }],
    rows: ranked.map((bureau) => ({
      id: bureau.code,
      label: bureauRef(bureau.code),
      values: [...TYPE_CODES.map((code) => bureau.cells.get(code) ?? 0), bureau.total],
    })),
    caption: caption(input),
    csvStem: `immigration-stats_mix_${bureauName(filters.bureau)}_${range}`,
    csvSelection: selection(input),
  };
};

// ── efficiency ─────────────────────────────────────────────────────────────

/**
 * The lollipop's ranking: `computeBureauVolumes`, by completion rate descending.
 * The trailing row is the dashed nationwide guide, taken from the official
 * aggregate row rather than summed from the bureaus above.
 */
const efficiencyByBureau: TableBuilder = (input) => {
  const { data, filters, range } = input;
  const ranked = [...computeBureauVolumes(data, filters, range)].sort((a, b) => b.rate - a.rate);

  const nationwide = rowsInRange(data, range, () =>
    selectData(data, { scope: bureauScopeFromFilter('all'), type: filters.type })
  );
  const nationwideReceived = sumWhere(nationwide, (entry) => entry.status === STATUS_CODES.NEW_APPLICATIONS);
  const nationwideProcessed = sumWhere(nationwide, (entry) => entry.status === STATUS_CODES.PROCESSED);

  return {
    rowHeaderKey: 'filters.bureau',
    columns: [
      { id: 'received', labelKey: 'metric.received', format: 'count' },
      { id: 'processed', labelKey: 'metric.processed', format: 'count' },
      { id: 'efficiency', labelKey: 'metric.efficiency', format: 'percent' },
    ],
    rows: [
      ...ranked.map((volume) => ({
        id: volume.code,
        label: bureauRef(volume.code),
        values: [volume.received, volume.processed, volume.rate],
      })),
      ...(nationwideReceived > 0
        ? [
            {
              id: 'all',
              label: bureauRef('all'),
              values: [
                nationwideReceived,
                nationwideProcessed,
                rate(nationwideProcessed, nationwideReceived),
              ],
            },
          ]
        : []),
    ],
    caption: caption(input),
    csvStem: `immigration-stats_efficiency_${bureauName(filters.bureau)}_${typeName(filters.type)}_${range}`,
    csvSelection: selection(input),
  };
};

// ── map ────────────────────────────────────────────────────────────────────

/**
 * The Regional Map reads no immigration data (it shades prefectures by density
 * and pins bureaus), so its table is that reference geography. No filter or
 * range applies, so the filename carries neither.
 */
const prefectures: TableBuilder = () => ({
  rowHeaderKey: 'table.prefecture',
  columns: [
    { id: 'bureau', labelKey: 'map.serviceBureau', format: 'label' },
    { id: 'population', labelKey: 'metric.population', format: 'count' },
    { id: 'area', labelKey: 'metric.area', format: 'count', unitKey: 'map.areaValue', csvUnit: 'km²' },
    { id: 'density', labelKey: 'metric.density', format: 'count', unitKey: 'map.densityValue', csvUnit: '/km²' },
  ],
  rows: japanPrefectures.map((prefecture) => ({
    id: String(prefecture.id),
    label: { key: `prefecture.${prefecture.id}` as DictionaryKey },
    values: [
      bureauRef(prefecture.bureau),
      prefecture.population,
      prefecture.area,
      // Matches the rounding the map's own prefecture list renders.
      Math.round(prefecture.density * 100) / 100,
    ],
  })),
  caption: { key: 'charts.map.label' },
  csvStem: 'immigration-stats_prefectures',
  csvSelection: 'chart=map; source=japanPrefectures',
});

// ── registry ───────────────────────────────────────────────────────────────

/**
 * Which table a chart renders. Keyed apart from the chart key so the registry's
 * alternates (CategoryMixSunburst, ProcessingEfficiencyQuadrantChart) inherit
 * their table without touching this module.
 */
export type ProcessingTableId =
  | 'intakeByMonth'
  | 'typesByMonth'
  | 'outcomesByType'
  | 'shareByBureau'
  | 'mixByBureau'
  | 'efficiencyByBureau'
  | 'prefectures';

/** Total by construction: a new id will not compile without a builder. */
export const PROCESSING_TABLES: Record<ProcessingTableId, TableBuilder> = {
  intakeByMonth,
  typesByMonth,
  outcomesByType,
  shareByBureau,
  mixByBureau,
  efficiencyByBureau,
  prefectures,
};

export const buildProcessingTable = (id: ProcessingTableId, input: TableInput): TableModel =>
  PROCESSING_TABLES[id](input);
