// components/StatsSummary.jsx
import { useMemo } from 'react';
import {getBureauLabel} from "../utils/getBureauData";
import {Icon} from "@iconify/react";

export const StatsSummary = ({ data, filters }) => {
    const stats = useMemo(() => {
        if (!data) return null;

        // Get the most recent month
        const months = [...new Set(data.map(entry => entry.month))];
        const currentMonth = months.sort().reverse()[0];

        // If a specific bureau is selected, use that bureau's data
        // Otherwise use the total (総数) data where cat03 === '100000'
        const filteredData = data.filter(entry => {
            const isCurrentMonth = entry.month === currentMonth;
            const matchesType = filters.type === 'all' || entry.type === filters.type;

            if (filters.bureau === 'all') {
                return entry.bureau === '100000' && isCurrentMonth && matchesType;
            }

            return entry.bureau === filters.bureau && isCurrentMonth && matchesType;
        });


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
    }, [data, filters]);

    if (!stats) return null;

    const StatCard = ({ title, subtitle, value, color, icon }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center`}>
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
                value={stats.totalApplications.toLocaleString()}
                color="bg-blue-500"
                icon='material-symbols:file-copy-outline-rounded'
            />
            <StatCard
                title="Granted"
                subtitle={getBureauLabel(filters.bureau)}
                value={stats.granted.toLocaleString()}
                color="bg-green-500"
                icon='material-symbols:order-approve-rounded'
            />
            <StatCard
                title="Denied"
                subtitle={getBureauLabel(filters.bureau)}
                value={stats.denied.toLocaleString()}
                color="bg-red-500"
                icon='material-symbols:cancel-outline-rounded'
            />
            <StatCard
                title="Pending"
                subtitle={getBureauLabel(filters.bureau)}
                value={stats.pending.toLocaleString()}
                color="bg-yellow-500"
                icon='material-symbols:pending-actions-rounded'
            />
            <StatCard
                title="Approval Rate"
                subtitle={getBureauLabel(filters.bureau)}
                value={`${stats.approvalRate}%`}
                color="bg-gray-500"
                icon='material-symbols:percent-rounded'
            />
        </div>
    );
};
