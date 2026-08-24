// src/utils/chartTables.ts
// What each Application Processing chart's data table actually contains.
//
// The table used to be a single hardcoded month x status pivot rendered under
// every chart, which was true of `intake` alone: the Application Types chart
// plots six application types and got a table with no type axis at all, and
// Bureau Share plots a per-bureau breakdown and got the nationwide aggregate
// row. A table that describes a different projection of the cube than the
// chart above it is not a text alternative to that chart.
//
// So the row axis varies here (month / application type / bureau / prefecture),
// and each builder reads its numbers from the same helper the chart does —
// `buildCategoryMixTree` for the treemap, `computeBureauVolumes` for the
// lollipop, the ring chart's own status pair for the donut — so the two can
// never drift apart. The registry names a builder by id; the math lives here
// rather than in ChartComponents.tsx so the selector graph stays out of the
// chart registry's imports.
import { applicationOptions } from '../constants/applicationOptions';
import { bureauOptions } from '../constants/bureauOptions';
import { japanPrefectures } from '../constants/japanPrefectures';
import { STATUS_CODES } from '../constants/statusCodes';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import type { DictionaryKey, TranslateFn } from '../i18n/types';
import { buildCategoryMixTree } from './categoryMixTree';
import { computeBureauVolumes } from './processingEfficiency';
import type { ChartRange } from './selectors';
import { bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from './selectors';

/**
 * Display text named by identity rather than by value. The DOM resolves a ref
 * with the locale-bound `t`; the CSV writer resolves the same ref against
 * English. That is what keeps the export English-only by construction now that
 * rows and cells carry names and not just `YYYY-MM` months — see
 * `chartTableCsv.ts`. A bare string is a language-neutral literal.
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
   * Wraps the formatted number for the on-screen cell only, e.g. `map.areaValue`
   * renders "377,975 km²". Units are a reading affordance; the CSV writes the
   * bare number so a spreadsheet still sees a number.
   */
  unitKey?: DictionaryKey;
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
  /** Download filename stem. Codes only, never display text. */
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
 * "Showing Bureau Share for Nationwide, Permanent Residence" — the same
 * sentence the shell announces the chart with (DashboardShell.tsx:443), which
 * is exactly what a caption for that chart's text alternative should say.
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
 * The one table that was already right, kept byte-identical: a month x status
 * pivot, and a superset of the three series the bar chart plots. It is also the
 * closest thing the app offers to a raw dump, so it stays six columns wide
 * rather than being narrowed to what the chart draws.
 */
const intakeByMonth: TableBuilder = (input) => {
  const { data, filters, range } = input;
  const months = monthsForRange(getAllMonths(data), range);
  return {
    rowHeaderKey: 'table.month',
    columns: STATUS_COLUMNS.map(({ id, labelKey }) => ({ id, labelKey, format: 'count' })),
    rows: months.map((month) => {
      const monthRows = selectData(data, {
        month,
        scope: bureauScopeFromFilter(filters.bureau),
        type: filters.type,
      });
      return {
        id: month,
        label: month,
        values: STATUS_COLUMNS.map((column) => sumWhere(monthRows, (entry) => entry.status === column.status)),
      };
    }),
    caption: caption(input),
    csvStem: `immigration-stats_intake_${filters.bureau}_${filters.type}_${range}`,
    csvSelection: selection(input),
  };
};

// ── types ──────────────────────────────────────────────────────────────────

/**
 * The reported bug. Mirrors CategorySubmissionsLineChart's own memo: status
 * pinned to new applications, summed per `entry.type`. `filters.type` is
 * deliberately not applied — the registry marks this chart `appType: false`,
 * so the type dimension is the chart's subject, not a filter on it.
 *
 * Columns take the canonical `appType.<code>` names rather than the chart's
 * width-fitted `chart.types.series.*` legend text: a table column has room for
 * "Permission for Activities", and deriving them from `applicationOptions`
 * rather than copying the chart's SERIES map is what removes the drift.
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
    csvStem: `immigration-stats_types_${filters.bureau}_${range}`,
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
 * One row per source node, one column per outcome node: the cross-tab that the
 * Sankey's links *are*, which no month x status pivot could express. The
 * trailing percent column is the approval-rate gauge beside it.
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
      // Summed from the source rows rather than from the six rows above, so it
      // reproduces the gauge even if the cube ever carries a type code outside
      // `applicationOptions`. Redundant when a single type is selected.
      ...(filters.type === 'all'
        ? [{ id: 'all', label: typeRef('all'), values: valuesFor(() => true) }]
        : []),
    ],
    caption: caption(input),
    csvStem: `immigration-stats_outcomes_${filters.bureau}_${filters.type}_${range}`,
    csvSelection: selection(input),
  };
};

// ── share ──────────────────────────────────────────────────────────────────

/**
 * The donut's own math (BureauDistributionRingChart): every per-bureau row in
 * range, aggregate row excluded, carried-over plus newly received.
 *
 * Deliberately a superset of the chart: the donut folds everything past the
 * seventh bureau into one "Other (n)" slice because the categorical palette
 * carries eight slots, and the table is where those bureaus become readable
 * again. The share denominator is the sum of the bureau rows — the donut's
 * total — not the official nationwide aggregate row, which is a separate row
 * in the source data and need not agree.
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
    csvStem: `immigration-stats_share_${filters.type}_${range}`,
    csvSelection: selection(input),
  };
};

// ── mix ────────────────────────────────────────────────────────────────────

/**
 * The treemap flattened: its `application type -> bureau` hierarchy transposed
 * into a bureau x type matrix, which carries every leaf value in the tree
 * without needing a two-level row axis. Built from `buildCategoryMixTree` so
 * the scope semantics and the new-applications status pin come from the chart
 * itself. Columns stay in canonical code order rather than the tree's
 * value-descending order, so they do not reshuffle as filters change.
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
    csvStem: `immigration-stats_mix_${filters.bureau}_${range}`,
    csvSelection: selection(input),
  };
};

// ── efficiency ─────────────────────────────────────────────────────────────

/**
 * The lollipop's ranking, in its own order: the same `computeBureauVolumes`
 * the chart plots, sorted by completion rate descending. The trailing row is
 * the dashed nationwide guide, which comes from the official aggregate row
 * rather than from summing the bureaus above it.
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
      { id: 'completion', labelKey: 'metric.completion', format: 'percent' },
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
    csvStem: `immigration-stats_efficiency_${filters.bureau}_${filters.type}_${range}`,
    csvSelection: selection(input),
  };
};

// ── map ────────────────────────────────────────────────────────────────────

/**
 * The Regional Map is the one processing chart that reads no immigration data
 * — it shades prefectures by population density and pins bureau locations — so
 * its table is the reference geography behind it, not a slice of the cube. No
 * filter or range applies, which is why the filename carries neither.
 *
 * This is also the only table with a text column, and therefore the one that
 * makes CSV quoting load-bearing rather than theoretical.
 */
const prefectures: TableBuilder = () => ({
  rowHeaderKey: 'table.prefecture',
  columns: [
    { id: 'bureau', labelKey: 'map.serviceBureau', format: 'label' },
    { id: 'population', labelKey: 'metric.population', format: 'count' },
    { id: 'area', labelKey: 'metric.area', format: 'count', unitKey: 'map.areaValue' },
    { id: 'density', labelKey: 'metric.density', format: 'count', unitKey: 'map.densityValue' },
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
 * Which text alternative a chart renders. Keyed separately from the chart key
 * so the registry's swap-ready alternates — CategoryMixSunburst for the
 * treemap, ProcessingEfficiencyQuadrantChart for the lollipop — inherit their
 * table without touching this module.
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
