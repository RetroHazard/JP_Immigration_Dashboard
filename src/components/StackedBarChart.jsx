// components/StackedBarChart.jsx
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const StackedBarChart = ({ data, filters }) => {
    const [monthRange, setMonthRange] = useState(12);
    const [showAllMonths, setShowAllMonths] = useState(false);

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Old Applications',
                data: []
            },
            {
                label: 'New Applications',
                data: []
            },
            {
                label: 'Processed Applications',
                data: []
            }
        ]
    });

    useEffect(() => {
        if (!data) return;

        // Get selected month or latest month if none selected
        const endMonth = filters.month || [...new Set(data.map(entry => entry.month))].sort().reverse()[0];

        // Get all months from data
        const allMonths = [...new Set(data.map(entry => entry.month))].sort();

        // Find index of selected/end month
        const endIndex = allMonths.indexOf(endMonth);
        if (endIndex === -1) return;

        // Get months based on range selection
        let months;
        if (showAllMonths) {
            months = allMonths;
        } else {
            const startIndex = Math.max(0, endIndex - (monthRange - 1));
            months = allMonths.slice(startIndex, endIndex + 1);
        }

        const monthlyStats = months.map(month => {
            const monthData = data.filter(entry => {
                const matchesMonth = entry.month === month;
                const matchesType = filters.type === 'all' || entry.type === filters.type;

                if (filters.bureau === 'all') {
                    return entry.bureau === '100000' && matchesMonth && matchesType;
                }
                return entry.bureau === filters.bureau && matchesMonth && matchesType;
            });

            return {
                month,
                totalApplications: monthData.reduce((sum, entry) =>
                    entry.status === '102000' ? sum + entry.value : sum, 0), // 受理_旧受 (Previously Received)
                processed: monthData.reduce((sum, entry) =>
                    entry.status === '300000' ? sum + entry.value : sum, 0), // 処理済み (Processed)
                newApplications: monthData.reduce((sum, entry) =>
                    entry.status === '103000' ? sum + entry.value : sum, 0) // 受理_新受 (Newly Received)
            };
        });

        const processedData = {
            labels: months,
            datasets: [
                {
                    label: 'Old Applications',
                    data: monthlyStats.map(stat => stat.totalApplications),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1,
                    yAxisID: 'y',
                    order: 1
                },
                {
                    label: 'New Applications',
                    data: monthlyStats.map(stat => stat.newApplications),
                    backgroundColor: 'rgba(234, 179, 8, 0.6)',
                    borderColor: 'rgb(234, 179, 8)',
                    borderWidth: 1,
                    yAxisID: 'y',
                    order: 2
                },
                {
                    label: 'Processed Applications',
                    data: monthlyStats.map(stat => stat.processed),
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1,
                    yAxisID: 'y2',
                    barPercentage: 0.6,
                    order: 0
                }
            ]
        };

        setChartData(processedData);
    }, [data, filters, monthRange, showAllMonths]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Month'
                },
                ticks: {
                    minRotation: 45,
                    maxRotation: 45
                }
            },
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Application Count'
                },
                ticks: {
                    suggestedMin: Math.min(...chartData.datasets.map(dataset => Math.min(...dataset.data))),
                    suggestedMax: Math.max(...chartData.datasets.map(dataset => Math.max(...dataset.data)))
                },
                afterBuildTicks: (axis) => {
                    axis.chart.scales.y2.options.min = axis.min;
                    axis.chart.scales.y2.options.max = axis.max;
                },
                grid: {
                    drawOnChartArea: true,
                    drawTicks: true,
                    color: (context) => {
                        return Math.abs(context.tick.value) % 10000 === 0 ?
                            'rgba(0,0,0,0.1)' :
                            'rgba(0,0,0,0.05)';
                    }
                }
            },
            y2: {
                display: false
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            },
            title: {
                display: true,
                text: 'Immigration Applications by Period',
                padding: {
                    top: 10,
                    bottom: 10
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
                    }
                }
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 h-full">
                <h2 className="text-lg font-semibold">
                    Application Processing Trends
                </h2>
                <select
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={showAllMonths ? 'all' : monthRange}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'all') {
                            setShowAllMonths(true);
                        } else {
                            setShowAllMonths(false);
                            setMonthRange(parseInt(value));
                        }
                    }}
                >
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                    <option value="36">36 Months</option>
                    <option value="all">All Data</option>
                </select>
            </div>

            <div className="h-[400px] w-full">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};