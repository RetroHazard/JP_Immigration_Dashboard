// components/common/FilterInput.jsx
export const FilterInput = ({
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
  const handleChange = (e) => onChange(e.target.value);

  return (
    <div className="space-y-2">
      <label className="filter-label">{label}</label>
      {type === 'select' ? (
        <div className={`${disabled ? 'pointer-events-none opacity-50' : ''}`}>
          <select className="filter-select" aria-label={value} value={value} onChange={handleChange}>
            {includeDefaultOption && <option value="">{defaultOptionLabel}</option>}
            {options.filter(filterFn).map((option) => (
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
