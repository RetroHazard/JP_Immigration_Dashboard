// Serializes a TableModel to CSV.
//   - The export stays English whatever the interface language (see
//     src/i18n/README.md), so spreadsheets and scripts built against it keep
//     parsing: every label resolves through `englishOnly`.
//   - Every field is escaped. Row labels and the prefecture table's bureau
//     column are catalogue text, and nothing guarantees a catalogue string (a
//     parameterized one like `chart.share.otherSlice` above all) is comma-free.
import { englishOnly } from '../i18n/translate';
import type { TableColumn, TableModel, TableValue } from './chartTables';
import { resolveLabel } from './chartTables';

/** RFC 4180: quote on comma, quote, CR or LF; double any embedded quote. */
export const csvField = (value: string): string =>
  /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

// Defined in i18n/translate.ts because chartTables.ts needs it for the filename
// and importing it from here would be a cycle. Re-exported so this module
// presents the whole export contract in one place.
export { englishOnly };

/**
 * Percent cells are a bare `86.3` (no sign, no locale digit grouping) so the
 * column stays numeric to a spreadsheet. Units go in the header instead: ` (%)`
 * from `column.format`, any other from `csvUnit` (`Area (km²)` over `2200`).
 */
const csvValue = (value: TableValue, column: TableColumn): string => {
  if (typeof value === 'number') return column.format === 'percent' ? value.toFixed(1) : String(value);
  return resolveLabel(value, englishOnly);
};

const csvHeader = (column: TableColumn): string => {
  const label = englishOnly(column.labelKey);
  if (column.format === 'percent') return `${label} (%)`;
  return column.csvUnit ? `${label} (${column.csvUnit})` : label;
};

export const serializeTableCsv = (model: TableModel): string => {
  const lines = [
    // The sr-only <caption>'s text. A spreadsheet reads a `#` line as data, and
    // with a type selected `a11y.showingChartWithType` carries a comma, so the
    // whole line is quoted, `#` included: a `#` outside the opening quote is not
    // a field any parser recognises.
    csvField(`# ${resolveLabel(model.caption, englishOnly)}`),
    // Semicolon-separated, so it needs no quoting today; escaped anyway.
    csvField(`# ${model.csvSelection}`),
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
