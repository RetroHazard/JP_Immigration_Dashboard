// components/StatsSummary.jsx
import { useMemo } from 'react';
import {getBureauLabel} from "../utils/getBureauData";
import {Icon} from "@iconify/react";

export const StatsSummary = ({ data, filters }) => {
    const stats = useMemo(() => {
        if (!data) return null;

        // Use the selected month from filters, or get the most recent month if none selected
        const selectedMonth = filters.month || [...new Set(data.map(entry => entry.month))].sort().reverse()[0];

        // Filter data based on all filters including month
        const filteredData = data.filter(entry => {
            const matchesMonth = entry.month === selectedMonth;
            const matchesType = filters.type === 'all' || entry.type === filters.type;

            if (filters.bureau === 'all') {
                return entry.bureau === '100000' && matchesMonth && matchesType;
            }

            return entry.bureau === filters.bureau && matchesMonth && matchesType;
        });

        // Rest of the calculations remain the same
        const totalApplications = filteredData.reduce((sum, entry) =>
            entry.status === '100000' ? sum + entry.value : sum, 0);
        const processed = filteredData.reduce((sum, entry) =>
            entry.status === '300000' ? sum + entry.value : sum, 0);
        const granted = filteredData.reduce((sum, entry) =>
            entry.status === '301000' ? sum + entry.value : sum, 0);
        const denied = filteredData.reduce((sum, entry) =>
            entry.status === '302000' ? sum + entry.value : sum, 0);
        const other = filteredData.reduce((sum, entry) =>
            entry.status === '305000' ? sum + entry.value : sum, 0);
        const pending = totalApplications - processed;

        return {
            totalApplications,
            processed,
            granted,
            denied,
            other,
            pending,
            approvalRate: processed ? (granted / processed * 100).toFixed(1) : 0,
        };
    }, [data, filters]); // filters includes month changes

    if (!stats) return null;

    const StatCard = ({ title, subtitle, date, value, color, icon }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`${color} min-w-10 h-24 min-h-12 rounded-2xl flex items-center justify-center`}>
                <span className="text-white text-xl">
                    <Icon icon={icon} fontSize={30} />
                </span>
                </div>
                <div className="ml-4">
                    <div className="flex flex-col">
                        <h3 className="text-gray-500 text-sm font-medium">
                            {title}
                        </h3>
                        <span className="text-gray-400 text-xs">
                        {subtitle}
                        </span>
                        <span className="text-gray-400 text-xs italic">
                        {date}
                        </span>
                    </div>
                    <p className="text-gray-900 text-2xl font-semibold mt-1">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
            <StatCard
                title="Total Applications"
                subtitle={getBureauLabel(filters.bureau)}
                date={filters.month}
                value={stats.totalApplications.toLocaleString()}
                color="bg-blue-500"
                icon='material-symbols:file-copy-outline-rounded'
            />
            <StatCard
                title="Granted"
                subtitle={getBureauLabel(filters.bureau)}
                date={filters.month}
                value={stats.granted.toLocaleString()}
                color="bg-green-500"
                icon='material-symbols:order-approve-rounded'
            />
            <StatCard
                title="Denied"
                subtitle={getBureauLabel(filters.bureau)}
                date={filters.month}
                value={stats.denied.toLocaleString()}
                color="bg-red-500"
                icon='material-symbols:cancel-outline-rounded'
            />
            <StatCard
                title="Pending"
                subtitle={getBureauLabel(filters.bureau)}
                date={filters.month}
                value={stats.pending.toLocaleString()}
                color="bg-yellow-500"
                icon='material-symbols:pending-actions-rounded'
            />
            <StatCard
                title="Approval Rate"
                subtitle={getBureauLabel(filters.bureau)}
                date={filters.month}
                value={`${stats.approvalRate}%`}
                color="bg-gray-500"
                icon='material-symbols:percent-rounded'
            />
        </div>
    );
};
