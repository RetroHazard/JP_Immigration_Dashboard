// src/utils/__tests__/chartTableCsv.test.ts
// The CSV writer had no coverage at all before per-chart tables landed, and it
// grew two properties worth pinning: it stays English whatever the interface
// language, and it escapes fields now that cells carry names and not only
// numbers.
import { describe, expect, it } from 'vitest';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { en } from '../../i18n/locales/en';
import { ja } from '../../i18n/locales/ja';
import { csvField, englishOnly, serializeTableCsv } from '../chartTableCsv';
import type { TableModel } from '../chartTables';
import { buildProcessingTable } from '../chartTables';

const model: TableModel = {
  rowHeaderKey: 'filters.bureau',
  columns: [
    { id: 'note', labelKey: 'metric.other', format: 'label' },
    { id: 'received', labelKey: 'metric.received', format: 'count' },
    { id: 'efficiency', labelKey: 'metric.efficiency', format: 'percent' },
  ],
  rows: [
    { id: 'a', label: 'Osaka, Kansai', values: ['plain', 1234, 86.25] },
    // No embedded newline in this fixture: a quoted field may legally contain
    // one, which would make the line-count assertion below a lie. csvField
    // covers that case directly instead.
    { id: 'b', label: 'He said "go"', values: ['plain', 0, 0] },
  ],
  caption: { key: 'a11y.showingChart', params: { chart: { key: 'charts.share.label' }, bureau: 'Nationwide' } },
  csvStem: 'immigration-stats_test',
  csvSelection: 'chart=share; bureau=all; type=all; range=12',
};

const lines = serializeTableCsv(model).split('\n');

describe('csvField', () => {
  it('leaves an ordinary value alone', () => {
    expect(csvField('Shinagawa')).toBe('Shinagawa');
  });

  it('quotes a separator, a newline, and a quote — doubling the quote', () => {
    expect(csvField('Osaka, Kansai')).toBe('"Osaka, Kansai"');
    expect(csvField('line\nbreak')).toBe('"line\nbreak"');
    expect(csvField('He said "go"')).toBe('"He said ""go"""');
  });
});

describe('serializeTableCsv', () => {
  it('opens with the caption and a language-neutral echo of the selection', () => {
    const caption = en['a11y.showingChart']
      .replace('{chart}', en['charts.share.label'])
      .replace('{bureau}', 'Nationwide');
    expect(lines[0]).toBe(`# ${caption}`);
    expect(lines[1]).toBe('# chart=share; bureau=all; type=all; range=12');
  });

  it('leaves the caption unquoted when it carries no separator', () => {
    // `a11y.showingChart` — no type, so no comma, so nothing to escape.
    expect(lines[0].startsWith('# ')).toBe(true);
  });

  it('emits one header row and one line per row, and nothing else', () => {
    // Two comment lines, a header, two rows, and the trailing newline's tail.
    expect(lines).toHaveLength(6);
    expect(lines[5]).toBe('');
  });

  it('marks the unit on a percent header and writes the cell as a bare number', () => {
    expect(lines[2]).toBe(
      `${en['filters.bureau']},${en['metric.other']},${en['metric.received']},${en['metric.efficiency']} (%)`
    );
    expect(lines[3]).toBe('"Osaka, Kansai",plain,1234,86.3');
  });

  it('escapes a row label carrying quotes', () => {
    expect(lines[4]).toBe('"He said ""go""",plain,0,0.0');
  });

  it('stays English regardless of the interface language', () => {
    // The writer never sees a locale: it resolves through `englishOnly`, which
    // falls through an empty dictionary to the English catalogue.
    expect(englishOnly('metric.received')).toBe(en['metric.received']);
    expect(serializeTableCsv(model)).not.toContain(ja['metric.received']!);
  });
});

describe('unit headers', () => {
  it('carries a count column\'s unit in the header, cells staying bare numbers', () => {
    // The prefecture table shows "2,200 km²" on screen; the export moves the
    // unit to the header the way percent columns move their `%`.
    const csv = serializeTableCsv(
      buildProcessingTable('prefectures', {
        data: [],
        filters: { bureau: 'all', type: 'all' },
        range: 'all',
        chartKey: 'map',
      })
    );
    const [, , header, firstRow] = csv.split('\n');
    expect(header).toContain(`${en['metric.area']} (km²)`);
    expect(header).toContain(`${en['metric.density']} (/km²)`);
    // Hokkaido's row: bare numbers, no unit text in any cell.
    expect(firstRow).not.toContain('km²');
  });
});

describe('a real table', () => {
  const data: ImmigrationData[] = [
    { month: '2025-06', bureau: '100000', type: '20', status: '103000', value: 500 },
    { month: '2025-06', bureau: '100000', type: '60', status: '103000', value: 200 },
  ];

  // "Showing {chart} for {bureau}, {type}" — the one line in the file that
  // reliably carries a separator, and a spreadsheet reads a `#` opener as a
  // data row, not a comment. Unquoted, the caption arrived as two cells.
  it('quotes the caption when a selected type puts a comma in it', () => {
    const caption = serializeTableCsv(
      buildProcessingTable('intakeByMonth', {
        data,
        filters: { bureau: 'all', type: '60' },
        range: 'all',
        chartKey: 'intake',
      })
    ).split('\n')[0];

    expect(caption).toContain(',');
    expect(caption).toBe(`"# ${en['a11y.showingChartWithType']
      .replace('{chart}', en['charts.intake.label'])
      .replace('{bureau}', en['bureau.all'])
      .replace('{type}', en['appType.60'])}"`);
  });

  it('names application types in the header of the Application Types export', () => {
    const csv = serializeTableCsv(
      buildProcessingTable('typesByMonth', {
        data,
        filters: { bureau: 'all', type: 'all' },
        range: 'all',
        chartKey: 'types',
      })
    );
    const [, , header, firstRow] = csv.split('\n');
    expect(header).toContain(en['appType.60']);
    // What the reported bug produced instead.
    expect(header).not.toContain(en['metric.carriedOver']);
    expect(firstRow).toBe('2025-06,0,500,0,0,0,200');
  });
});
