// components/FilterPanel.jsx
import { useMemo } from 'react';
import { bureauOptions } from '../constants/bureauOptions';

const formatDateString = (dateStr) => {
    if (!dateStr) return '';

    // Extract year and month from the special format YYYYMM[MM]
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(6, 8); // Get the last two digits for month

    // Create date from parts (month - 1 because JS months are 0-based)
    const date = new Date(parseInt(year), parseInt(month) - 1);

    // Format the date
    return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
};


export const FilterPanel = ({ data, filters, onChange }) => {
    const dateRange = useMemo(() => {
        if (!data || data.length === 0) return { min: '', max: '' };

        const months = [...new Set(data.map(entry => entry.month))];
        return {
            min: months.sort()[0],
            max: months.sort().reverse()[0]
        };
    }, [data]);

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
                        <option value="all">All Types</option>
                        <option value="10">Status Acquisition</option>
                        <option value="20">Extension</option>
                        <option value="30">Change of Status</option>
                        <option value="40">Permission for Activity</option>
                        <option value="50">Re-entry</option>
                        <option value="60">Permanent Residence</option>
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
                    <span className="text-xs text-gray-500">
                        Data available from {formatDateString(dateRange.min)} to {formatDateString(dateRange.max)}
                    </span>
                </div>
            </div>
        </div>
    );
};
