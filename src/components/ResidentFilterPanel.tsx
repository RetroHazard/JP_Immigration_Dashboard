// The residents dataset's filter bar: a sibling of FilterPanel rather than a
// branch inside it, since none of that panel's controls apply to this cube.
// Region and Nationality cascade: the country list narrows to the selected
// region. The status filter offers the six purpose-of-stay categories; the
// sunburst shows the individual statuses.
import { RotateCcw } from 'lucide-react';
import type React from 'react';

import { useLocale } from '../i18n/LocaleContext';
import { useNationalityOptions, useRegionOptions, useStatusGroupOptions } from '../i18n/useDomainLabels';
import type { ResidentFilters } from './common/ChartComponents';
import { FilterInput } from './common/FilterInput';

interface ResidentFilterPanelProps {
  filters: ResidentFilters;
  onChange: (filters: ResidentFilters) => void;
  filterConfig: { region: boolean; nationality: boolean; group: boolean };
  onReset: () => void;
}

export const ResidentFilterPanel: React.FC<ResidentFilterPanelProps> = ({
  filters,
  onChange,
  filterConfig,
  onReset,
}) => {
  const { t } = useLocale();
  const regions = useRegionOptions();
  const nationalities = useNationalityOptions();
  const groups = useStatusGroupOptions();
  const isPristine = filters.region === 'all' && filters.nationality === 'all' && filters.group === 'all';

  const regionOptions = [{ value: 'all', label: t('filters.allRegions') }, ...regions];
  // Sorted by localized name in useNationalityOptions (not e-Stat's kana
  // order), and narrowed to the selected region's countries.
  const nationalityOptions = [
    { value: 'all', label: t('filters.allNationalities') },
    ...nationalities
      .filter((nationality) => filters.region === 'all' || nationality.region === filters.region)
      .map((nationality) => ({ value: nationality.value, label: nationality.name })),
  ];
  const groupOptions = [{ value: 'all', label: t('filters.allCategories') }, ...groups];

  const nationalityRegion = (code: string) => nationalities.find((entry) => entry.value === code)?.region;

  return (
    <div className="base-container @container">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid grow basis-60 grid-cols-1 gap-2 @lg:gap-3 @2xl:gap-6 sm:grid-cols-3">
          <FilterInput
            fluid
            type="select"
            label={t('filters.region')}
            options={regionOptions}
            value={filters.region}
            onChange={(value) =>
              onChange({
                ...filters,
                region: value,
                // A nationality outside the new region would silently empty
                // every chart; one inside it stays selected.
                nationality:
                  value === 'all' || nationalityRegion(filters.nationality) === value ? filters.nationality : 'all',
              })
            }
            disabled={!filterConfig.region}
          />
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
            options={groupOptions}
            value={filters.group}
            onChange={(value) => onChange({ ...filters, group: value as ResidentFilters['group'] })}
            disabled={!filterConfig.group}
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
