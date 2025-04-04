// src/components/FilterPanel.tsx
import { useMemo } from 'react';

import type React from 'react';

import { applicationOptions } from '../constants/applicationOptions';
import { bureauOptions } from '../constants/bureauOptions';
import { FilterInput } from './common/FilterInput';

interface FilterPanelProps {
  data: { month: string }[];
  filters: { bureau: string; type: string };
  onChange: (filters: { bureau: string; type: string }) => void;
  filterConfig: { bureau: boolean; appType: boolean };
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ data, filters, onChange, filterConfig }) => {
  const dateRange = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('No valid data provided');
      return { min: '', max: '' };
    }

    const months = [...new Set(data.map((entry) => entry.month))].filter(Boolean);

    if (months.length === 0) {
      console.log('No valid months found in data');
      return { min: '', max: '' };
    }

    const sortedMonths = months.sort();
    return {
      min: sortedMonths[0],
      max: sortedMonths[sortedMonths.length - 1],
    };
  }, [data]);

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';

    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);

    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="base-container">
      <div className="filter-block">
        <FilterInput
          type="select"
          label="Immigration Bureau"
          options={bureauOptions}
          value={filters.bureau}
          onChange={(value) => onChange({ ...filters, bureau: value })}
          disabled={!filterConfig.bureau}
        />

        <FilterInput
          type="select"
          label="Application Type"
          options={applicationOptions}
          value={filters.type}
          onChange={(value) => onChange({ ...filters, type: value })}
          disabled={!filterConfig.appType}
        />
      </div>
      <div className="filter-note mt-2">
        * Data is available from {formatDateString(dateRange.min)} to {formatDateString(dateRange.max)}
      </div>
    </div>
  );
};
