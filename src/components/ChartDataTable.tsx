// src/components/ChartDataTable.tsx
// Collapsible monthly data table for the current selection, with CSV export.
// Doubles as the text alternative for the SVG charts.
'use client';

import { useMemo, useState } from 'react';

import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import type React from 'react';

import { STATUS_CODES } from '../constants/statusCodes';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { useApplicationType, useBureauLabel } from '../i18n/useDomainLabels';
import type { ChartRange } from '../utils/selectors';
import { bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../utils/selectors';

interface ChartDataTableProps {
  data: ImmigrationData[];
  filters: { bureau: string; type: string };
  range: ChartRange;
}

const COLUMNS = [
  { label: 'Carried over', status: STATUS_CODES.OLD_APPLICATIONS },
  { label: 'Received', status: STATUS_CODES.NEW_APPLICATIONS },
  { label: 'Processed', status: STATUS_CODES.PROCESSED },
  { label: 'Granted', status: STATUS_CODES.GRANTED },
  { label: 'Denied', status: STATUS_CODES.DENIED },
  { label: 'Other', status: STATUS_CODES.OTHER },
];

export const ChartDataTable: React.FC<ChartDataTableProps> = ({ data, filters, range }) => {
  const [open, setOpen] = useState(false);
  const bureauLabel = useBureauLabel();
  const applicationType = useApplicationType();

  const rows = useMemo(() => {
    if (!open) return [];
    const months = monthsForRange(getAllMonths(data), range);
    return months.map((month) => {
      const monthRows = selectData(data, {
        month,
        scope: bureauScopeFromFilter(filters.bureau),
        type: filters.type,
      });
      const sumOf = (status: string) =>
        monthRows.reduce((sum, entry) => (entry.status === status ? sum + entry.value : sum), 0);
      return { month, values: COLUMNS.map((column) => sumOf(column.status)) };
    });
  }, [data, filters.bureau, filters.type, range, open]);

  const downloadCsv = () => {
    const typeLabel = applicationType(filters.type)?.label ?? applicationType('all')?.label ?? '';
    const header = ['Month', ...COLUMNS.map((column) => column.label)].join(',');
    const body = rows.map((row) => [row.month, ...row.values].join(',')).join('\n');
    const blob = new Blob(
      [`# ${bureauLabel(filters.bureau)} / ${typeLabel}\n${header}\n${body}\n`],
      { type: 'text/csv;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `immigration-stats_${filters.bureau}_${filters.type}_${range}.csv`;
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
          {open ? 'Hide data table' : 'View data table'}
        </button>
        {open && (
          <button
            onClick={downloadCsv}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-secondary-foreground hover:bg-muted"
          >
            <Download className="size-3.5" aria-hidden="true" />
            Download CSV
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-xs">
            <caption className="sr-only">
              Monthly application statistics for {bureauLabel(filters.bureau)}
            </caption>
            <thead className="sticky top-0 bg-muted text-left">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Month
                </th>
                {COLUMNS.map((column) => (
                  <th key={column.label} scope="col" className="px-3 py-2 text-right font-semibold">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month} className="border-t border-border">
                  <th scope="row" className="px-3 py-1.5 text-left font-medium">
                    {row.month}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={COLUMNS[index].label} className="px-3 py-1.5 text-right tabular-nums">
                      {value.toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
