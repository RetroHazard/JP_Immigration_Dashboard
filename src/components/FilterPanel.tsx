// src/components/FilterPanel.tsx
import { Plane, RotateCcw } from 'lucide-react';
import type React from 'react';

import { applicationOptions } from '../constants/applicationOptions';
import { bureauOptions } from '../constants/bureauOptions';
import { AIRPORT_BUREAU_CODES } from '../utils/getBureauData';
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
  /** Whether airport branch offices are included in the charts (global) */
  includeAirports: boolean;
  onAirportsChange: (include: boolean) => void;
  /** Restore every filter (bureau, type, comparison, airports) to its default */
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  filterConfig,
  compare,
  compareEnabled,
  onCompareChange,
  includeAirports,
  onAirportsChange,
  onReset,
}) => {
  const isPristine = filters.bureau === 'all' && filters.type === 'all' && !compare && includeAirports;
  const visibleBureauOptions = includeAirports
    ? bureauOptions
    : bureauOptions.filter((option) => !AIRPORT_BUREAU_CODES.has(option.value));
  const airportsLabel = includeAirports ? 'Exclude airport offices' : 'Include airport offices';
  return (
    /* @container: inputs size against the panel's own width, not the viewport —
       the estimator sidebar narrows this panel at lg without any viewport change */
    <div className="base-container @container">
      {/* flex-wrap: on very narrow panels the button pair drops to its own
          row (ml-auto keeps it right-aligned) instead of squeezing the selects */}
      <div className="flex flex-wrap items-end gap-3">
        {/* basis-60 (not flex-1's basis 0) so the wrap actually happens once
            the selects would drop below a usable width */}
        <div className="grid grow basis-60 grid-cols-2 gap-2 @lg:gap-3 @2xl:gap-6 md:grid-cols-3">
          <FilterInput
            fluid
            type="select"
            label="Immigration Bureau"
            options={visibleBureauOptions}
            value={filters.bureau}
            onChange={(value) => onChange({ ...filters, bureau: value })}
            disabled={!filterConfig.bureau}
          />

          <FilterInput
            fluid
            type="select"
            label="Application Type"
            options={applicationOptions}
            value={filters.type}
            onChange={(value) => onChange({ ...filters, type: value })}
            disabled={!filterConfig.appType}
          />

          {/* Comparison is a desktop affordance: on phones the side-by-side
              view has no room, so the control is hidden below md */}
          <div className="hidden md:grid">
            <FilterInput
              fluid
              type="select"
              label="Compare With"
              options={visibleBureauOptions.filter((option) => option.value !== 'all')}
              value={compare ?? ''}
              includeDefaultOption
              defaultOptionLabel="None"
              onChange={(value) => onCompareChange(value || null)}
              disabled={!compareEnabled}
            />
          </div>
        </div>
        <div className="mb-0.5 ml-auto flex shrink-0 gap-2">
          {/* Accent = the exclusion filter is engaged */}
          <button
            type="button"
            onClick={() => onAirportsChange(!includeAirports)}
            aria-pressed={!includeAirports}
            title={airportsLabel}
            className={`flex size-9 items-center justify-center rounded-lg border transition-colors ${
              includeAirports
                ? 'border-border text-secondary-foreground hover:bg-muted hover:text-foreground'
                : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15'
            }`}
          >
            <span className="relative flex items-center justify-center" aria-hidden="true">
              <Plane className="size-4" />
              {/* Crossed out = airports excluded */}
              {!includeAirports && (
                <span className="absolute h-[1.5px] w-[22px] rotate-45 rounded-full bg-current" />
              )}
            </span>
            <span className="sr-only">{airportsLabel}</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={isPristine}
            title="Reset filters"
            className="flex size-9 items-center justify-center rounded-lg border border-border text-secondary-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            <span className="sr-only">Reset filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
