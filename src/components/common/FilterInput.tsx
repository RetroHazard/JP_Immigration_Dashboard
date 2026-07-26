// components/common/FilterInput.tsx
import { useId, useMemo } from 'react';

import type React from 'react';
import type { ChangeEvent } from 'react';

interface FilterInputProps {
  type?: 'select' | 'text' | 'date';
  label: string;
  options?: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Shown under the control when disabled, e.g. "Not used by this view" */
  disabledNote?: string;
  min?: string;
  max?: string;
  includeDefaultOption?: boolean;
  defaultOptionLabel?: string;
  filterFn?: (option: { value: string; label: string }) => boolean;
}

export const FilterInput: React.FC<FilterInputProps> = ({
  type = 'select',
  label,
  options = [],
  value,
  onChange,
  disabled,
  disabledNote,
  min,
  max,
  includeDefaultOption = false,
  defaultOptionLabel = 'Select',
  filterFn = (x) => x,
}) => {
  const id = useId();
  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => onChange(e.target.value);

  const filteredOptions = useMemo(() => options.filter(filterFn), [options, filterFn]);

  return (
    <div className="space-y-2">
      <label className="filter-label" htmlFor={id}>
        {label}
      </label>
      {type === 'select' ? (
        <select
          id={id}
          className="filter-select disabled:cursor-not-allowed disabled:opacity-50"
          value={value}
          onChange={handleChange}
          disabled={disabled}
        >
          {includeDefaultOption && <option value="">{defaultOptionLabel}</option>}
          {filteredOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          className="filter-select disabled:cursor-not-allowed disabled:opacity-50"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          disabled={disabled}
        />
      )}
      {disabled && disabledNote && <p className="text-xxs italic text-muted-foreground">{disabledNote}</p>}
    </div>
  );
};
