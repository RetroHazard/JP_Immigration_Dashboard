// src/components/FilterPanel.tsx
import type React from 'react';

import { applicationOptions } from '../constants/applicationOptions';
import { bureauOptions } from '../constants/bureauOptions';
import { useDataMetadata } from '../hooks/useDataMetadata';
import { logger } from '../utils/logger';
import { FilterInput } from './common/FilterInput';

interface FilterPanelProps {
  data: { month: string }[];
  filters: { bureau: string; type: string };
  onChange: (filters: { bureau: string; type: string }) => void;
  filterConfig: { bureau: boolean; appType: boolean };
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ data, filters, onChange, filterConfig }) => {
  const { dateRange, uniqueMonths } = useDataMetadata(data);

  // Log debug messages for edge cases
  if (!data || !Array.isArray(data) || data.length === 0) {
    logger.debug('No valid data provided');
  } else if (uniqueMonths.length === 0) {
    logger.debug('No valid months found in data');
  }

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
        * Data is available from {formatDateString(dateRange.min)} through {formatDateString(dateRange.max)}
      </div>
    </div>
  );
};
