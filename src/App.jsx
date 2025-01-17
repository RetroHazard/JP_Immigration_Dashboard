// App.jsx
import { useState, useEffect } from 'react';
import { FilterPanel } from './components/FilterPanel';
import { StackedBarChart } from './components/StackedBarChart';
import { EstimationCard } from './components/EstimationCard';
import { StatsSummary } from './components/StatsSummary';
import { useImmigrationData } from './hooks/useImmigrationData';

const App = () => {
    const { data, loading } = useImmigrationData();
    const [filters, setFilters] = useState({
        bureau: 'all',
        type: 'all',
        month: new Date().toISOString().slice(0, 7)
    });

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">
                                Immigration Application Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center">
              <span className="text-sm text-gray-500">
                Last Updated: {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
              })}
              </span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
                    </div>
                ) : (
                    <>
                        <FilterPanel data={data} filters={filters} onChange={setFilters} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <h2 className="text-lg font-semibold mb-4">
                                        Application Processing Trends
                                    </h2>
                                    <StackedBarChart data={data} filters={filters} />
                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                <EstimationCard data={data} />
                            </div>
                        </div>

                        <StatsSummary data={data} filters={filters} />
                    </>
                )}
            </main>

            <footer className="bg-white border-t mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center text-sm text-gray-500">
                        Data provided by Immigration Services Agency of Japan
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;