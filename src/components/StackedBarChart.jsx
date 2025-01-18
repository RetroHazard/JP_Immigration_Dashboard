// components/StackedBarChart.jsx
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const StackedBarChart = ({ data, filters }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Total Applications',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
            },
            {
                label: 'Processed',
                data: [],
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1
            },
            {
                label: 'New Applications',
                data: [],
                backgroundColor: 'rgba(234, 179, 8, 0.6)',
                borderColor: 'rgb(234, 179, 8)',
                borderWidth: 1
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

        // Get 12 months up to and including the selected month
        const startIndex = Math.max(0, endIndex - 11);
        const months = allMonths.slice(startIndex, endIndex + 1);

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
                    entry.status === '100000' ? sum + entry.value : sum, 0),
                processed: monthData.reduce((sum, entry) =>
                    entry.status === '300000' ? sum + entry.value : sum, 0),
                newApplications: monthData.reduce((sum, entry) =>
                    entry.status === '103000' ? sum + entry.value : sum, 0)
            };
        });

        const processedData = {
            labels: months,
            datasets: [
                {
                    label: 'Total Applications',
                    data: monthlyStats.map(stat => stat.totalApplications),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                },
                {
                    label: 'Processed',
                    data: monthlyStats.map(stat => stat.processed),
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1
                },
                {
                    label: 'New Applications',
                    data: monthlyStats.map(stat => stat.newApplications),
                    backgroundColor: 'rgba(234, 179, 8, 0.6)',
                    borderColor: 'rgb(234, 179, 8)',
                    borderWidth: 1
                }
            ]
        };

        setChartData(processedData);
    }, [data, filters]);
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Month'
                }
            },
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Application Count'
                },
                ticks: {
                    stepSize: 5000,
                    callback: value => value.toLocaleString()
                },
                grid: {
                    drawOnChartArea: true,
                    drawTicks: true,
                    color: (context) => {
                        return context.tick.value % 10000 === 0
                            ? 'rgba(0,0,0,0.1)'
                            : 'rgba(0,0,0,0.05)';
                    }
                }
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
                    bottom: 30
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
        <div className="h-[400px] w-full">
            <Bar data={chartData} options={options} />
        </div>
    );
};

