// src/components/ChartDataTable.tsx
// Collapsible data table for the active chart, with CSV export.
//
// The text alternative to the SVG above it — which means its shape follows
// that chart rather than being fixed. This component holds no domain knowledge
// at all now: it renders whichever TableModel the chart's registry entry names
// (src/utils/chartTables.ts), so the row axis is a month here and a bureau or
// a prefecture there without this file knowing the difference.
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
}

/** Room for the row-label column plus each data column, floored at the old width. */
const minWidthFor = (columns: number): number => Math.max(560, 140 + columns * 84);

export const ChartDataTable: React.FC<ChartDataTableProps> = ({ table, chartKey, data, filters, range }) => {
  const [open, setOpen] = useState(false);
  const { t, formatters } = useLocale();

  const build = useCallback(
    () => buildProcessingTable(table, { data, filters, range, chartKey }),
    [table, chartKey, data, filters, range]
  );
  // Collapsed, the table costs nothing. The export falls back to building on
  // demand rather than reading a memo that is empty by design — the download
  // control only renders while open today, and this keeps that a layout
  // choice rather than a correctness one.
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
          className="flex items-center gap-1 text-xs text-primary hover:opacity-80"
        >
          {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          {t(open ? 'table.hide' : 'table.view')}
        </button>
        {open && (
          <button
            onClick={downloadCsv}
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
