// src/utils/__tests__/chartTables.test.ts
// The tables under the Application Processing charts used to be one hardcoded
// month x status pivot rendered under all seven, which described only `intake`.
// These assertions pin each builder to the projection its own chart draws —
// the `typesByMonth` case below is the one that reproduces the original report.
import { describe, expect, it } from 'vitest';

import { PROCESSING_CHARTS } from '../../components/common/ChartComponents';
import { applicationOptions } from '../../constants/applicationOptions';
import { bureauOptions } from '../../constants/bureauOptions';
import { japanPrefectures } from '../../constants/japanPrefectures';
import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { en } from '../../i18n/locales/en';
import type { DictionaryKey } from '../../i18n/types';
import { buildCategoryMixTree } from '../categoryMixTree';
import type { LabelRef, TableInput, TableValue } from '../chartTables';
import { buildProcessingTable, PROCESSING_TABLES, resolveLabel } from '../chartTables';
import { computeBureauVolumes } from '../processingEfficiency';

const NATIONWIDE = '100000';
const SHINAGAWA = '101170';
const OSAKA = '101460';

const entry = (overrides: Partial<ImmigrationData>): ImmigrationData => ({
  month: '2025-06',
  bureau: NATIONWIDE,
  type: '20',
  status: '103000',
  value: 100,
  ...overrides,
});

// June, laid out so every builder has something distinguishable to find:
// two application types, two bureaus plus the aggregate row, and a full set
// of outcome statuses on the aggregate.
const data: ImmigrationData[] = [
  entry({ status: '102000', value: 300 }),
  entry({ status: '103000', value: 500 }),
  entry({ status: '300000', value: 400 }),
  entry({ status: '301000', value: 350 }),
  entry({ status: '302000', value: 30 }),
  entry({ status: '305000', value: 20 }),
  entry({ type: '60', status: '103000', value: 200 }),
  entry({ type: '60', status: '300000', value: 100 }),
  entry({ type: '60', status: '301000', value: 60 }),

  entry({ bureau: SHINAGAWA, status: '102000', value: 120 }),
  entry({ bureau: SHINAGAWA, status: '103000', value: 380 }),
  entry({ bureau: SHINAGAWA, status: '300000', value: 300 }),
  entry({ bureau: SHINAGAWA, type: '60', status: '103000', value: 120 }),

  entry({ bureau: OSAKA, status: '102000', value: 80 }),
  entry({ bureau: OSAKA, status: '103000', value: 120 }),
  entry({ bureau: OSAKA, status: '300000', value: 60 }),

  // A second month, so a range narrower than 'all' has something to exclude.
  entry({ month: '2025-05', status: '103000', value: 250 }),
];

const input = (overrides: Partial<TableInput> = {}): TableInput => ({
  data,
  filters: { bureau: 'all', type: 'all' },
  range: 'all',
  chartKey: 'intake',
  ...overrides,
});

/** English text for a cell, whichever half of TableValue it is. */
const text = (value: TableValue): string =>
  typeof value === 'number' ? String(value) : resolveLabel(value, (key, params) => resolveEn(key, params));

const resolveEn = (key: DictionaryKey, params?: Record<string, string | number>): string => {
  const template = en[key] ?? key;
  return params ? template.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match)) : template;
};

const columnIds = (model: { columns: { id: string }[] }) => model.columns.map((column) => column.id);
const rowIds = (model: { rows: { id: string }[] }) => model.rows.map((row) => row.id);
const row = (model: { rows: { id: string; values: TableValue[] }[] }, id: string) =>
  model.rows.find((candidate) => candidate.id === id);

describe('typesByMonth — the table reported as showing intake instead of application types', () => {
  const model = buildProcessingTable('typesByMonth', input({ chartKey: 'types' }));

  it('breaks down by application type, not by status', () => {
    expect(columnIds(model)).toEqual(['type-10', 'type-20', 'type-30', 'type-40', 'type-50', 'type-60']);
    // The regression itself: not one status metric among the columns.
    expect(model.columns.some((column) => column.labelKey.startsWith('metric.'))).toBe(false);
    expect(model.columns.map((column) => column.labelKey)).toContain('appType.10');
  });

  it('sums new applications per type for the month', () => {
    const june = row(model, '2025-06');
    // Nationwide scope, status 103000: 500 of type 20 and 200 of type 60.
    expect(june?.values).toEqual([0, 500, 0, 0, 0, 200]);
  });

  it('keeps all six columns when a type is selected, since the chart ignores that filter', () => {
    // `types` is registered `appType: false`, so effectiveFilters pins type to
    // 'all' — but a hand-edited URL must not be able to collapse the table to
    // one column while the chart still draws six lines.
    const filtered = buildProcessingTable('typesByMonth', input({ chartKey: 'types', filters: { bureau: 'all', type: '60' } }));
    expect(row(filtered, '2025-06')?.values).toEqual([0, 500, 0, 0, 0, 200]);
  });

  it('honours the bureau scope', () => {
    const shinagawa = buildProcessingTable(
      'typesByMonth',
      input({ chartKey: 'types', filters: { bureau: SHINAGAWA, type: 'all' } })
    );
    expect(row(shinagawa, '2025-06')?.values).toEqual([0, 380, 0, 0, 0, 120]);
  });
});

describe('intakeByMonth — the one table that was already right', () => {
  const model = buildProcessingTable('intakeByMonth', input());

  it('keeps its six status columns', () => {
    expect(columnIds(model)).toEqual(['carriedOver', 'received', 'processed', 'granted', 'denied', 'other']);
  });

  it('sums the nationwide aggregate row only', () => {
    // 500 + 200 received across the two types; the per-bureau rows stay out.
    expect(row(model, '2025-06')?.values).toEqual([300, 700, 500, 410, 30, 20]);
  });

  it('narrows to the range', () => {
    expect(rowIds(buildProcessingTable('intakeByMonth', input({ range: 'latest' })))).toEqual(['2025-06']);
  });
});

describe('shareByBureau — the donut, which had no bureau axis at all', () => {
  const model = buildProcessingTable('shareByBureau', input({ chartKey: 'share' }));

  it('rows are bureaus, and never the aggregate row the old table showed', () => {
    expect(rowIds(model)).toEqual([SHINAGAWA, OSAKA]);
    expect(rowIds(model)).not.toContain(NATIONWIDE);
  });

  it('counts carried-over plus newly received, like the donut slices', () => {
    expect(row(model, SHINAGAWA)?.values.slice(0, 3)).toEqual([120, 500, 620]);
    expect(row(model, OSAKA)?.values.slice(0, 3)).toEqual([80, 120, 200]);
  });

  it('shares are of the bureau total and add up to 100', () => {
    const shares = model.rows.map((entryRow) => entryRow.values[3] as number);
    expect(shares.reduce((sum, share) => sum + share, 0)).toBeCloseTo(100, 6);
    expect(shares[0]).toBeCloseTo((620 / 820) * 100, 6);
  });

  it('is sorted by volume descending, like the donut', () => {
    const totals = model.rows.map((entryRow) => entryRow.values[2] as number);
    expect([...totals].sort((a, b) => b - a)).toEqual(totals);
  });
});

describe('efficiencyByBureau — the lollipop, which collapsed to one nationwide row', () => {
  const model = buildProcessingTable('efficiencyByBureau', input({ chartKey: 'efficiency' }));

  it('reports the chart’s own volumes, ranked by completion', () => {
    const volumes = computeBureauVolumes(data, { bureau: 'all', type: 'all' }, 'all');
    for (const volume of volumes) {
      expect(row(model, volume.code)?.values).toEqual([volume.received, volume.processed, volume.rate]);
    }
    const rates = model.rows.slice(0, -1).map((entryRow) => entryRow.values[2] as number);
    expect([...rates].sort((a, b) => b - a)).toEqual(rates);
  });

  it('ends with the nationwide guide the chart draws as a dashed line', () => {
    const nationwide = model.rows[model.rows.length - 1];
    expect(nationwide.id).toBe('all');
    // The official aggregate row over the whole range: 500 + 200 received in
    // June plus 250 in May, against 500 processed.
    expect(nationwide.values).toEqual([950, 500, (500 / 950) * 100]);
  });
});

describe('mixByBureau — the treemap, which had neither of its axes', () => {
  const model = buildProcessingTable('mixByBureau', input({ chartKey: 'mix' }));

  it('is the treemap hierarchy transposed, cell for cell', () => {
    const tree = buildCategoryMixTree(data, { bureau: 'all', type: 'all' }, 'all');
    for (const category of tree.categories) {
      const columnIndex = columnIds(model).indexOf(`type-${category.key}`);
      for (const leaf of category.children) {
        expect(row(model, leaf.code)?.values[columnIndex]).toBe(leaf.value);
      }
    }
  });

  it('keeps a stable column order and a row total', () => {
    expect(columnIds(model)).toEqual(['type-10', 'type-20', 'type-30', 'type-40', 'type-50', 'type-60', 'total']);
    expect(row(model, SHINAGAWA)?.values).toEqual([0, 380, 0, 0, 0, 120, 500]);
  });
});

describe('outcomesByType — the cross-tab the Sankey draws', () => {
  const model = buildProcessingTable('outcomesByType', input({ chartKey: 'outcomes' }));

  it('gives every source node a row and every outcome node a column', () => {
    expect(columnIds(model)).toEqual(['granted', 'denied', 'other', 'processed', 'approvalRate']);
    expect(row(model, '20')?.values).toEqual([350, 30, 20, 400, 87.5]);
    expect(row(model, '60')?.values).toEqual([60, 0, 0, 100, 60]);
  });

  it('carries a total row reproducing the approval gauge', () => {
    expect(row(model, 'all')?.values).toEqual([410, 30, 20, 500, 82]);
  });

  it('drops the redundant total when a single type is selected', () => {
    const single = buildProcessingTable(
      'outcomesByType',
      input({ chartKey: 'outcomes', filters: { bureau: 'all', type: '60' } })
    );
    expect(rowIds(single)).toEqual(['60']);
  });
});

describe('prefectures — the map, whose table was unrelated data entirely', () => {
  const model = buildProcessingTable('prefectures', input({ chartKey: 'map' }));

  it('lists every prefecture in JIS order with its reference figures', () => {
    expect(model.rows).toHaveLength(47);
    expect(resolveLabel(model.rows[12].label, resolveEn)).toBe(en['prefecture.13']);
    const tokyo = japanPrefectures[12];
    expect(model.rows[12].values.slice(1)).toEqual([
      tokyo.population,
      tokyo.area,
      Math.round(tokyo.density * 100) / 100,
    ]);
  });

  it('carries the service bureau as a label ref, not baked-in English', () => {
    const bureau = model.rows[12].values[0];
    expect(typeof bureau).toBe('object');
    expect(text(bureau)).toBe(en[`bureau.${japanPrefectures[12].bureau}` as DictionaryKey]);
  });

  it('names an export that claims no filter or range, because none applies', () => {
    expect(model.csvStem).toBe('immigration-stats_prefectures');
  });
});

describe('every builder', () => {
  const ids = Object.keys(PROCESSING_TABLES) as (keyof typeof PROCESSING_TABLES)[];

  const keysIn = (ref: LabelRef): DictionaryKey[] => {
    if (typeof ref === 'string') return [];
    const nested = Object.values(ref.params ?? {}).flatMap((value) =>
      typeof value === 'object' ? keysIn(value) : []
    );
    return [ref.key, ...nested];
  };

  it.each(ids)('%s gives every row one value per column', (id) => {
    const model = buildProcessingTable(id, input());
    for (const entryRow of model.rows) {
      expect(entryRow.values).toHaveLength(model.columns.length);
    }
    expect(new Set(columnIds(model)).size).toBe(model.columns.length);
    expect(new Set(rowIds(model)).size).toBe(model.rows.length);
  });

  it.each(ids)('%s names only keys the English catalogue defines', (id) => {
    const model = buildProcessingTable(id, input());
    // Template-literal DictionaryKey casts are unchecked, so a typo would
    // otherwise render as the raw key rather than throwing.
    const keys = [
      model.rowHeaderKey,
      ...model.columns.map((column) => column.labelKey),
      ...model.columns.flatMap((column) => (column.unitKey ? [column.unitKey] : [])),
      ...keysIn(model.caption),
      ...model.rows.flatMap((entryRow) => keysIn(entryRow.label)),
      ...model.rows.flatMap((entryRow) =>
        entryRow.values.flatMap((value) => (typeof value === 'object' ? keysIn(value) : []))
      ),
    ];
    expect(keys.filter((key) => en[key] === undefined)).toEqual([]);
  });

  it.each(ids)('%s produces a lowercase filename stem safe to put on disk', (id) => {
    expect(buildProcessingTable(id, input()).csvStem).toMatch(/^[a-z0-9_-]+$/);
  });

  // e-Stat's `101720` and `20` are identifiers, not something a reader can
  // place. The stem carries the bureau's name and the type's abbreviation.
  it('names the file by bureau and application type rather than by their codes', () => {
    const model = buildProcessingTable('intakeByMonth', input({ filters: { bureau: '101720', type: '20' } }));

    expect(model.csvStem).toBe('immigration-stats_intake_fukuoka_ext_all');
    expect(model.csvStem).not.toContain('101720');
    expect(model.csvStem).not.toContain('_20_');
  });

  // The one bureau shape that could put a space on disk.
  it('keeps a two-word bureau name filename-safe', () => {
    const model = buildProcessingTable('intakeByMonth', input({ filters: { bureau: '101190', type: '60' } }));

    expect(model.csvStem).toBe('immigration-stats_intake_narita-airport_pr_all');
  });

  // Every bureau and type the filters can hold, not just the ones spelled out
  // above: a name that lost its last character to the sanitizer, or resolved to
  // a bare `bureau.101720` because a key went missing, would land here.
  it('resolves every bureau and type to a real name', () => {
    for (const { value: bureau } of bureauOptions) {
      const stem = buildProcessingTable('intakeByMonth', input({ filters: { bureau, type: 'all' } })).csvStem;
      expect(stem).toContain(en[`bureau.${bureau}` as DictionaryKey].toLowerCase().replace(/ /g, '-'));
    }
    for (const { value: type } of applicationOptions) {
      const stem = buildProcessingTable('intakeByMonth', input({ filters: { bureau: 'all', type } })).csvStem;
      expect(stem).toContain(en[`appType.${type}.short` as DictionaryKey].toLowerCase());
    }
  });

  it('is reachable — every processing chart names one, and every id has a builder', () => {
    for (const chart of PROCESSING_CHARTS) {
      expect(PROCESSING_TABLES[chart.table]).toBeTypeOf('function');
    }
    expect(new Set(PROCESSING_CHARTS.map((chart) => chart.table)).size).toBe(ids.length);
  });

  it('survives an empty dataset', () => {
    for (const id of ids) {
      expect(() => buildProcessingTable(id, input({ data: [] }))).not.toThrow();
    }
  });
});

describe('resolveLabel', () => {
  it('passes a language-neutral literal straight through', () => {
    expect(resolveLabel('2025-06', resolveEn)).toBe('2025-06');
  });

  it('resolves nested refs before interpolating them', () => {
    const caption = buildProcessingTable('shareByBureau', input({ chartKey: 'share' })).caption;
    expect(resolveLabel(caption, resolveEn)).toBe(
      en['a11y.showingChart'].replace('{chart}', en['charts.share.label']).replace('{bureau}', en['bureau.all'])
    );
  });

  it('names the application type when one is selected', () => {
    const caption = buildProcessingTable(
      'intakeByMonth',
      input({ filters: { bureau: 'all', type: '60' } })
    ).caption;
    expect(resolveLabel(caption, resolveEn)).toContain(en['appType.60']);
  });
});
