import { useMemo } from 'react';
import { bureauOptions } from '../constants/bureauOptions';

export const FilterPanel = ({ data, filters, onChange }) => {
    // components/FilterPanel.jsx
    const dateRange = useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.log('No valid data provided');
            return { min: '', max: '' };
        }

        // Extract unique dates from the transformed data format (YYYY-MM)
        const months = [...new Set(data.map(entry => entry.month))].filter(Boolean);

        if (months.length === 0) {
            console.log('No valid months found in data');
            return { min: '', max: '' };
        }

        // Sort months to get min and max (YYYY-MM format will sort correctly as strings)
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

    // Add console log to debug
    console.log('FilterPanel received data:', data);
    console.log('Calculated date range:', dateRange);

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
                        value={dateRange.max}
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