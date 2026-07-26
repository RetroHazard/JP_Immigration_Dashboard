// src/components/FilterPanel.tsx
import { useCallback, useMemo } from 'react';

import type React from 'react';

import { applicationOptions } from '../constants/applicationOptions';
import { bureauOptions } from '../constants/bureauOptions';
import { FilterInput } from './common/FilterInput';

interface FilterPanelProps {
  data: { month: string }[];
  filters: { bureau: string; type: string };
  onChange: (filters: { bureau: string; type: string }) => void;
  filterConfig: { bureau: boolean; appType: boolean };
  /** Canonical name of the active chart, used in the "not used by" note */
  chartLabel: string;
  /** Second bureau shown as a small-multiple comparison (null = off) */
  compare: string | null;
  onCompareChange: (compare: string | null) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ data, filters, onChange, filterConfig, chartLabel, compare, onCompareChange }) => {
  const dateRange = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { min: '', max: '' };
    }

    const months = [...new Set(data.map((entry) => entry.month))].filter(Boolean);

    if (months.length === 0) {
      return { min: '', max: '' };
    }

    const sortedMonths = months.sort();
    return {
      min: sortedMonths[0],
      max: sortedMonths[sortedMonths.length - 1],
    };
  }, [data]);

  const formatDateString = useCallback((dateStr: string) => {
    if (!dateStr) return '';

    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);

    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, []);

  return (
    <div className="base-container">
      <div className="grid grid-cols-2 gap-4 sm:gap-3 md:grid-cols-3 md:gap-6">
        <FilterInput
          type="select"
          label="Immigration Bureau"
          options={bureauOptions}
          value={filters.bureau}
          onChange={(value) => onChange({ ...filters, bureau: value })}
          disabled={!filterConfig.bureau}
          disabledNote={`Not used by ${chartLabel} — it always shows every bureau.`}
        />

        <FilterInput
          type="select"
          label="Application Type"
          options={applicationOptions}
          value={filters.type}
          onChange={(value) => onChange({ ...filters, type: value })}
          disabled={!filterConfig.appType}
          disabledNote={`Not used by ${chartLabel} — it always shows every application type.`}
        />

        <FilterInput
          type="select"
          label="Compare With"
          options={bureauOptions.filter((option) => option.value !== 'all')}
          value={compare ?? ''}
          includeDefaultOption
          defaultOptionLabel="No comparison"
          onChange={(value) => onCompareChange(value || null)}
          disabled={!filterConfig.bureau}
          disabledNote={`Not used by ${chartLabel}.`}
        />
      </div>
      <div className="filter-note mt-2">
        * Data is available from {formatDateString(dateRange.min)} through {formatDateString(dateRange.max)}
      </div>
    </div>
  );
};
