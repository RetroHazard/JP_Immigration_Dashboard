// components/common/FilterInput.tsx
import { useMemo } from 'react';

import type React from 'react';
import type { ChangeEvent } from 'react';

interface FilterInputProps {
  type?: 'select' | 'text' | 'date';
  label: string;
  options?: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
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
  min,
  max,
  includeDefaultOption = false,
  defaultOptionLabel = 'Select',
  filterFn = (x) => x,
}) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => onChange(e.target.value);

  const filteredOptions = useMemo(() => options.filter(filterFn), [options, filterFn]);

  return (
    <div className="space-y-2">
      <label className="filter-label">{label}</label>
      {type === 'select' ? (
        <div className={`${disabled ? 'pointer-events-none opacity-50' : ''}`}>
          <select className="filter-select" aria-label={value} value={value} onChange={handleChange}>
            {includeDefaultOption && <option value="">{defaultOptionLabel}</option>}
            {filteredOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input
          type={type}
          placeholder="YYYY-MM"
          className="filter-select"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
        />
      )}
    </div>
  );
};
