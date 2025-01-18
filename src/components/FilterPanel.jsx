import { useMemo } from 'react';
import { bureauOptions } from '../constants/bureauOptions';
import { applicationOptions } from '../constants/applicationOptions';

export const FilterPanel = ({ data, filters, onChange }) => {
    const dateRange = useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.log('No valid data provided');
            return { min: '', max: '' };
        }

        const months = [...new Set(data.map(entry => entry.month))].filter(Boolean);

        if (months.length === 0) {
            console.log('No valid months found in data');
            return { min: '', max: '' };
        }

        const sortedMonths = months.sort();
        return {
            min: sortedMonths[0],
            max: sortedMonths[sortedMonths.length - 1]
        };
    }, [data]);

    const formatDateString = (dateStr) => {
        if (!dateStr) return '';

        const [year, month] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);

        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Immigration Bureau
                    </label>
                    <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={filters.bureau}
                        onChange={(e) => onChange({ ...filters, bureau: e.target.value })}
                    >
                        {bureauOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Application Type
                    </label>
                    <select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={filters.type}
                        onChange={(e) => onChange({ ...filters, type: e.target.value })}
                    >
                        {applicationOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Month
                    </label>
                    <input
                        type="month"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={filters.month}
                        onChange={(e) => onChange({ ...filters, month: e.target.value })}
                        min={dateRange.min}
                        max={dateRange.max}
                    />
                    <span className="text-xs italic text-gray-500">
                        * Data available from {formatDateString(dateRange.min)} to {formatDateString(dateRange.max)}
                    </span>
                </div>
            </div>
        </div>
    );
};
    