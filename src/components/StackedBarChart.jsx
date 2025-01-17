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
                label: 'Applications',
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
                label: 'Newly Accepted',
                data: [],
                backgroundColor: 'rgba(234, 179, 8, 0.6)',
                borderColor: 'rgb(234, 179, 8)',
                borderWidth: 1
            }
        ]
    });

    useEffect(() => {
        if (!data) return;

        const processedData = {
            labels: [...new Set(data.map(entry => entry['@time']))].sort(),
            datasets: [
                {
                    label: 'Applications',
                    data: data.filter(entry =>
                        (filters.bureau === 'all' || entry['@cat03'] === filters.bureau) &&
                        (filters.type === 'all' || entry['@cat02'] === filters.type)
                    ).map(entry => entry['$']),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                },
                {
                    label: 'Processed',
                    data: data.filter(entry =>
                        (filters.bureau === 'all' || entry['@cat03'] === filters.bureau) &&
                        (filters.type === 'all' || entry['@cat02'] === filters.type)
                    ).map(entry => entry['$']),
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1
                },
                {
                    label: 'Newly Accepted',
                    data: data.filter(entry =>
                        (filters.bureau === 'all' || entry['@cat03'] === filters.bureau) &&
                        (filters.type === 'all' || entry['@cat02'] === filters.type)
                    ).map(entry => entry['$']),
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
        scales: {
            x: { stacked: true },
            y: { stacked: true }
        },
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: 'Immigration Applications by Period'
            }
        }
    };

    return (
        <div className="h-[400px] w-full">
            <Bar data={chartData} options={options} />
        </div>
    );
};
