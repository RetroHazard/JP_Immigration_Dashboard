// components/Dashboard.jsx
import { useState } from 'react';
import { useImmigrationData } from '../hooks/useImmigrationData';

export const Dashboard = () => {
    const [filters, setFilters] = useState({
        bureau: 'all',
        type: 'all',
        month: 'current'
    });

    const { data, loading, error } = useImmigrationData();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4 text-red-600">
                Error loading data: {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <FilterPanel
                filters={filters}
                onChange={setFilters}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StackedBarChart
                    data={data}
                    filters={filters}
                />
                <EstimationCard
                    data={data}
                />
            </div>
            <StatsSummary
                data={data}
                filters={filters}
            />
        </div>
    );
};
