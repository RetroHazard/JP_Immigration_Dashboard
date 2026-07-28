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
  min?: string;
  max?: string;
  includeDefaultOption?: boolean;
  defaultOptionLabel?: string;
  filterFn?: (option: { value: string; label: string }) => boolean;
  /** 'eyebrow' renders the small uppercase label style used by the stat tiles */
  labelVariant?: 'default' | 'eyebrow';
  /** Size label/select by the nearest `@container` width instead of the
      viewport — for inputs whose column narrows when a sidebar engages */
  fluid?: boolean;
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
  labelVariant = 'default',
  fluid = false,
}) => {
  const id = useId();
  const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => onChange(e.target.value);

  const filteredOptions = useMemo(() => options.filter(filterFn), [options, filterFn]);

  const labelClass =
    labelVariant === 'eyebrow'
      ? 'text-xxs font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs'
      : fluid
        ? 'text-xs font-medium text-secondary-foreground @lg:text-sm @2xl:text-base @2xl:font-semibold'
        : 'filter-label';
  const inputClass = fluid
    ? 'w-full rounded-md text-xs font-semibold input-box-colors @lg:text-sm @2xl:text-base'
    : 'filter-select';

  return (
    /* justify-end keeps sibling inputs bottom-aligned in a grid row even when
       one label wraps to a second line and the others don't */
    <div className="flex flex-col justify-end gap-2">
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      {type === 'select' ? (
        <select
          id={id}
          className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
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
          className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          disabled={disabled}
        />
      )}
    </div>
  );
};
