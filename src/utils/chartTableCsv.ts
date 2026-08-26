// src/utils/chartTableCsv.ts
// Serializes a TableModel to CSV.
//
// Two things live here that used to be inlined in ChartDataTable, and both are
// load-bearing now that a table's rows and cells carry names rather than only
// `YYYY-MM` months and integers:
//
//   - The export stays English whatever the interface language (see
//     src/i18n/README.md), so spreadsheets and scripts built against it keep
//     parsing. Resolving every label through a translator bound to an empty
//     dictionary is the pin: `translate` falls through to the English
//     catalogue for any key that dictionary lacks.
//   - Fields are escaped. The old writer joined on commas with no quoting,
//     which was safe only because every cell was a number or a `YYYY-MM`
//     month. Row labels and the prefecture table's service-bureau column are
//     catalogue text now. Today's English bureau and prefecture names happen
//     to be single comma-free words, so this is a guard rather than a fix for
//     a live corruption — but nothing about a catalogue string guarantees
//     that, and a parameterized label like `chart.share.otherSlice` is one
//     edit away from carrying a separator.
import { englishOnly } from '../i18n/translate';
import type { TableColumn, TableModel, TableValue } from './chartTables';
import { resolveLabel } from './chartTables';

/** RFC 4180: quote on comma, quote, CR or LF; double any embedded quote. */
export const csvField = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

// The English pin now lives in i18n/translate.ts: the filename that
// chartTables.ts assembles needs the same resolver, and importing it back from
// here would be a cycle. Re-exported so this module still presents the whole
// export contract — contents and all — in one place.
export { englishOnly };

/**
 * Percent cells are written as a bare `86.3` — no sign, no locale digit
 * grouping — so the column stays numeric to a spreadsheet. The unit moves to
 * the header instead, driven off `column.format` rather than a catalogue key
 * so it can never drift from how the cell is written.
 */
const csvValue = (value: TableValue, column: TableColumn): string => {
  if (typeof value === 'number') return column.format === 'percent' ? value.toFixed(1) : String(value);
  return resolveLabel(value, englishOnly);
};

const csvHeader = (column: TableColumn): string =>
  column.format === 'percent' ? `${englishOnly(column.labelKey)} (%)` : englishOnly(column.labelKey);

export const serializeTableCsv = (model: TableModel): string => {
  const lines = [
    // The same caption the sr-only <caption> renders, so the two can't disagree.
    `# ${resolveLabel(model.caption, englishOnly)}`,
    `# ${model.csvSelection}`,
    [englishOnly(model.rowHeaderKey), ...model.columns.map(csvHeader)].map(csvField).join(','),
    ...model.rows.map((row) =>
      [
        resolveLabel(row.label, englishOnly),
        ...row.values.map((value, index) => csvValue(value, model.columns[index])),
      ]
        .map(csvField)
        .join(',')
    ),
  ];
  return `${lines.join('\n')}\n`;
};
