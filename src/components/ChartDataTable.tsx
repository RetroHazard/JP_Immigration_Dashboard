// Collapsible data table for the active chart, with CSV export: the text
// alternative to the SVG above it, so its shape follows that chart. It holds no
// domain knowledge; it renders whichever TableModel the chart's registry entry
// names (src/utils/chartTables.ts), whether its rows are months or bureaus.
'use client';

import { useCallback, useMemo, useState } from 'react';

import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import type React from 'react';

import type { ImmigrationData } from '../hooks/useImmigrationData';
import { useLocale } from '../i18n/LocaleContext';
import { serializeTableCsv } from '../utils/chartTableCsv';
import type { ProcessingTableId, TableColumn, TableValue } from '../utils/chartTables';
import { buildProcessingTable, resolveLabel } from '../utils/chartTables';
import type { ChartRange } from '../utils/selectors';

interface ChartDataTableProps {
  /** Which table shape to render — from the active chart's registry entry. */
  table: ProcessingTableId;
  /** Registry key of the chart this table stands in for; names the caption. */
  chartKey: string;
  data: ImmigrationData[];
  filters: { bureau: string; type: string };
  range: ChartRange;
  /**
   * Compare mode renders one table per bureau; this names whose, so the two
   * identical "View data table" controls stay distinguishable to a screen reader.
   */
  label?: string;
}

/** Room for the row-label column plus each data column. */
const minWidthFor = (columns: number): number => Math.max(560, 140 + columns * 84);

export const ChartDataTable: React.FC<ChartDataTableProps> = ({ table, chartKey, data, filters, range, label }) => {
  const [open, setOpen] = useState(false);
  const { t, formatters } = useLocale();

  const build = useCallback(
    () => buildProcessingTable(table, { data, filters, range, chartKey }),
    [table, chartKey, data, filters, range]
  );
  // Built only while open. The export builds on demand if the memo is empty,
  // so the download control doesn't depend on the table being open.
  const model = useMemo(() => (open ? build() : null), [open, build]);

  const cell = (value: TableValue, column: TableColumn): string => {
    if (typeof value !== 'number') return resolveLabel(value, t);
    if (column.format === 'percent') return formatters.percent(value);
    const formatted = formatters.number(value);
    return column.unitKey ? t(column.unitKey, { value: formatted }) : formatted;
  };

  const downloadCsv = () => {
    const exported = model ?? build();
    const blob = new Blob([serializeTableCsv(exported)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${exported.csvStem}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3 border-t border-border pt-2">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={label ? `${t(open ? 'table.hide' : 'table.view')} (${label})` : undefined}
          className="flex items-center gap-1 text-xs text-primary hover:opacity-80"
        >
          {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          {t(open ? 'table.hide' : 'table.view')}
        </button>
        {open && (
          <button
            onClick={downloadCsv}
            aria-label={label ? `${t('table.downloadCsv')} (${label})` : undefined}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-secondary-foreground hover:bg-muted"
          >
            <Download className="size-3.5" aria-hidden="true" />
            {t('table.downloadCsv')}
          </button>
        )}
      </div>
      {model && model.rows.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">{t('common.noDataForFilters')}</p>
      )}
      {model && model.rows.length > 0 && (
        <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-border">
          <table className="w-full text-xs" style={{ minWidth: minWidthFor(model.columns.length) }}>
            <caption className="sr-only">{resolveLabel(model.caption, t)}</caption>
            <thead className="sticky top-0 bg-muted text-left">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  {t(model.rowHeaderKey)}
                </th>
                {model.columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className={`px-3 py-2 font-semibold ${column.format === 'label' ? 'text-left' : 'text-right'}`}
                  >
                    {t(column.labelKey)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {model.rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <th scope="row" className="whitespace-nowrap px-3 py-1.5 text-left font-medium">
                    {resolveLabel(row.label, t)}
                  </th>
                  {row.values.map((value, index) => {
                    const column = model.columns[index];
                    return (
                      <td
                        key={column.id}
                        className={`px-3 py-1.5 ${
                          column.format === 'label' ? 'text-left' : 'text-right tabular-nums'
                        }`}
                      >
                        {cell(value, column)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
