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

        // Get last 12 months of data
        const months = [...new Set(data.map(entry => entry.month))]
            .sort()
            .slice(-12);

        const filteredData = data.filter(entry => {
            const matchesBureau = filters.bureau === 'all' || entry.bureau === filters.bureau;
            const matchesType = filters.type === 'all' || entry.type === filters.type;
            return matchesBureau && matchesType && months.includes(entry.month);
        });

        const processedData = {
            labels: months.map(month => {
                const [year, monthNum] = month.split('-');
                return `${year}-${monthNum.padStart(2, '0')}`;
            }),
            datasets: [
                {
                    label: 'Total Applications',
                    data: months.map(month => {
                        return filteredData
                            .filter(entry => entry.month === month && entry.status === '100000')
                            .reduce((sum, entry) => sum + entry.value, 0);
                    }),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                },
                {
                    label: 'Processed',
                    data: months.map(month => {
                        return filteredData
                            .filter(entry => entry.month === month && entry.status === '300000')
                            .reduce((sum, entry) => sum + entry.value, 0);
                    }),
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1
                },
                {
                    label: 'New Applications',
                    data: months.map(month => {
                        return filteredData
                            .filter(entry => entry.month === month && entry.status === '103000')
                            .reduce((sum, entry) => sum + entry.value, 0);
                    }),
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
