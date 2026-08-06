// src/components/ResidentFilterPanel.tsx
// The residents dataset's filter bar. The processing FilterPanel's controls
// (bureau, application type, compare, airports) have no counterpart in this
// cube, so this is a sibling rather than a conditional branch inside it.
import { RotateCcw } from 'lucide-react';
import type React from 'react';

import { useLocale } from '../i18n/LocaleContext';
import { useNationalityOptions, useResidenceStatusOptions } from '../i18n/useDomainLabels';
import type { ResidentFilters } from './common/ChartComponents';
import { FilterInput } from './common/FilterInput';

interface ResidentFilterPanelProps {
  filters: ResidentFilters;
  onChange: (filters: ResidentFilters) => void;
  filterConfig: { nationality: boolean; status: boolean };
  onReset: () => void;
}

export const ResidentFilterPanel: React.FC<ResidentFilterPanelProps> = ({
  filters,
  onChange,
  filterConfig,
  onReset,
}) => {
  const { t } = useLocale();
  const nationalities = useNationalityOptions();
  const statuses = useResidenceStatusOptions();
  const isPristine = filters.nationality === 'all' && filters.status === 'all';

  // Sorted by localized name in useNationalityOptions, so the list reorders
  // with the language rather than sitting in e-Stat's Japanese kana order.
  const nationalityOptions = [
    { value: 'all', label: t('filters.allNationalities') },
    ...nationalities.map((nationality) => ({ value: nationality.value, label: nationality.name })),
  ];
  // The 合計 rollups are pruned from the data, so offering them would produce
  // an always-empty view.
  const statusOptions = [
    { value: 'all', label: t('filters.allStatuses') },
    ...statuses
      .filter((status) => !status.isAggregate)
      .map((status) => ({ value: status.value, label: status.label })),
  ];

  return (
    <div className="base-container @container">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid grow basis-60 grid-cols-1 gap-2 @lg:gap-3 @2xl:gap-6 sm:grid-cols-2">
          <FilterInput
            fluid
            type="select"
            label={t('filters.nationality')}
            options={nationalityOptions}
            value={filters.nationality}
            onChange={(value) => onChange({ ...filters, nationality: value })}
            disabled={!filterConfig.nationality}
          />
          <FilterInput
            fluid
            type="select"
            label={t('filters.residenceStatus')}
            options={statusOptions}
            value={filters.status}
            onChange={(value) => onChange({ ...filters, status: value })}
            disabled={!filterConfig.status}
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onReset}
            disabled={isPristine}
            title={t('filters.reset')}
            aria-label={t('filters.reset')}
            className="flex size-9 items-center justify-center rounded-md border border-border text-secondary-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
