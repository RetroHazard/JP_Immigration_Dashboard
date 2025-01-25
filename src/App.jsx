// App.jsx
import { useState } from 'react';
import { FilterPanel } from './components/FilterPanel';
import { StackedBarChart } from './components/StackedBarChart';
import { EstimationCard } from './components/EstimationCard';
import { StatsSummary } from './components/StatsSummary';
import { useImmigrationData } from './hooks/useImmigrationData';
import { Icon } from '@iconify/react';
import buildInfo from './buildInfo';

const App = () => {
    const { data, loading } = useImmigrationData();
    const [filters, setFilters] = useState({
        bureau: 'all',
        type: 'all',
        month: '' // Initialize Empty
    });

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex flex-col items-start">
                                <h1 className="section-title">
                                    Japan <Icon icon="ph:line-vertical-light" className="inline-block align-middle" style={{ verticalAlign: '-0.125em' }} /> Immigration Applications
                                </h1>
                                <h1 className="section-title">
                                    Statistics Dashboard
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex flex-col items-end">
                                <span className="build-info">
                                    Version: {buildInfo.buildVersion}
                                </span>
                                <span className="build-info">
                                    Last Updated:
                                </span>
                                <span className="build-info">
                                    {new Date(buildInfo.buildDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-8 mb-8">
                            <FilterPanel data={data} filters={filters} onChange={setFilters} />
                        </div>

                        <div className="relative">
                            <div className="mb-8 h-full">
                                <div className="bg-white rounded-lg shadow-lg p-6 h-full">
                                    <StackedBarChart data={data} filters={filters} />
                                </div>
                            </div>
                            
                            <div
                                className={`drawer-trigger ${
                                    isDrawerOpen ? 'translate-x-[300px]' : ''
                                }`}
                            >
                                <button
                                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                                    className="animate-pulse bg-gray-700 text-white shadow-lg hover:bg-gray-500 flex justify-center items-center relative overflow-visible clip-tapered-btn w-[28px] h-[130px]"
                                >
                                    <div className="flex flex-col items-center gap-2 origin-center">
                                        <Icon
                                            icon="ci:chevron-left-duo"
                                            className="text-lg animate-pulse"
                                        />
                                        <span className="whitespace-nowrap text-sm rotate-90 my-2.5">
                                            Estimator
                                        </span>
                                        <Icon
                                            icon="ci:chevron-left-duo"
                                            className="text-lg animate-pulse"
                                        />
                                    </div>
                                </button>
                            </div>
                            
                            {isDrawerOpen && (
                                <div
                                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                                    onClick={() => setIsDrawerOpen(false)}
                                />
                            )}
                            
                            <div
                                className={`fixed top-0 right-0 h-full w-full max-w-[300px] bg-white shadow-xl z-50 transform transition-transform duration-300 ${
                                    isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                                }`}
                            >
                                <EstimationCard
                                    data={data}
                                    onClose={() => setIsDrawerOpen(false)}
                                />
                            </div>
                        </div>

                        <StatsSummary data={data} filters={filters} />
                    </>
                )}
            </main>

            <footer className="bg-white border-t">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="footer-text text-pretty">
                        Official Statistics provided by Immigration Services Agency of Japan<br></br>
                        Data acquisition provided by e-Stat
                        <a href="https://www.e-stat.go.jp/dbview?sid=0003449073">
                            <Icon icon="ri:link"
                                  className="text-indigo-600 hover:text-indigo-500 inline-block align-middle"
                                  style={{ verticalAlign: '-0.125em' }} />
                        </a>
                    </div>
                    <div className="mt-1 footer-text-small">
                        Built using <a href="https://react.dev"
                                       className="text-indigo-600 hover:text-indigo-500">React</a> in 2025 by <a
                        href="https://github.com/RetroHazard" className="text-indigo-600 hover:text-indigo-500"><Icon
                        icon="openmoji:github" className="inline-block align-middle"
                        style={{ verticalAlign: '-0.125em' }} />RetroHazard</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;