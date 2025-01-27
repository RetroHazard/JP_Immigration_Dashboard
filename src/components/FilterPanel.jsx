import { useMemo } from 'react';
import { bureauOptions } from '../constants/bureauOptions';
import { applicationOptions } from '../constants/applicationOptions';

export const FilterPanel = ({ data, filters, onChange }) => {
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

  const formatDateString = (dateStr) => {
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
        <div className="space-y-2">
          <label className="filter-label">Immigration Bureau</label>
          <select
            className="filter-select"
            value={filters.bureau}
            onChange={(e) => onChange({ ...filters, bureau: e.target.value })}
          >
            {bureauOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="filter-label">Application Type</label>
          <select
            className="filter-select"
            value={filters.type}
            onChange={(e) => onChange({ ...filters, type: e.target.value })}
          >
            {applicationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="filter-label">Month</label>
          <input
            type="month"
            placeholder="YYYY-MM"
            className="filter-select"
            value={filters.month}
            onChange={(e) => onChange({ ...filters, month: e.target.value })}
            min={dateRange.min}
            max={dateRange.max}
          />
          <span className="filter-note">
            * Data available from {formatDateString(dateRange.min)} to {formatDateString(dateRange.max)}
          </span>
        </div>
      </div>
    </div>
  );
};
