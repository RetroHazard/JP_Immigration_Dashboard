// src/components/FilterPanel.tsx
import type React from 'react';

import { applicationOptions } from '../constants/applicationOptions';
import { bureauOptions } from '../constants/bureauOptions';
import { FilterInput } from './common/FilterInput';

interface FilterPanelProps {
  filters: { bureau: string; type: string };
  onChange: (filters: { bureau: string; type: string }) => void;
  filterConfig: { bureau: boolean; appType: boolean };
  /** Second bureau shown as a small-multiple comparison (null = off) */
  compare: string | null;
  /** Whether the active chart supports the comparison view at all */
  compareEnabled: boolean;
  onCompareChange: (compare: string | null) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  filterConfig,
  compare,
  compareEnabled,
  onCompareChange,
}) => {
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
        />

        <FilterInput
          type="select"
          label="Application Type"
          options={applicationOptions}
          value={filters.type}
          onChange={(value) => onChange({ ...filters, type: value })}
          disabled={!filterConfig.appType}
        />

        <FilterInput
          type="select"
          label="Compare With"
          options={bureauOptions.filter((option) => option.value !== 'all')}
          value={compare ?? ''}
          includeDefaultOption
          defaultOptionLabel="No comparison"
          onChange={(value) => onCompareChange(value || null)}
          disabled={!compareEnabled}
        />
      </div>
    </div>
  );
};
