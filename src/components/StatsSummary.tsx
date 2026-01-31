// src/components/StatsSummary.tsx
import { useMemo } from 'react';

import type React from 'react';

import type { ImmigrationData } from '../hooks/useImmigrationData';
import { getBureauLabel } from '../utils/getBureauData';
import { StatCard } from './common/StatCard';

interface StatsSummaryProps {
  data: ImmigrationData[];
  filters: { month?: string; type: string; bureau: string };
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ data, filters }) => {
  const stats = useMemo(() => {
    if (!data) return null;

    // Use the most recent month
    const selectedMonth = [...new Set(data.map((entry) => entry.month))].sort().reverse()[0];

    // Filter data based on all filters including month
    const filteredData = data.filter((entry) => {
      const matchesMonth = entry.month === selectedMonth;
      const matchesType = filters.type === 'all' || entry.type === filters.type;

      if (filters.bureau === 'all') {
        return entry.bureau === '100000' && matchesMonth && matchesType;
      }

      return entry.bureau === filters.bureau && matchesMonth && matchesType;
    });

    // Optimize: single reduce instead of 6 separate iterations
    const { oldApplications, newApplications, processed, granted, denied, other } = filteredData.reduce(
      (acc, entry) => {
        switch (entry.status) {
          case '102000':
            acc.oldApplications += entry.value;
            break;
          case '103000':
            acc.newApplications += entry.value;
            break;
          case '300000':
            acc.processed += entry.value;
            break;
          case '301000':
            acc.granted += entry.value;
            break;
          case '302000':
            acc.denied += entry.value;
            break;
          case '305000':
            acc.other += entry.value;
            break;
        }
        return acc;
      },
      { oldApplications: 0, newApplications: 0, processed: 0, granted: 0, denied: 0, other: 0 }
    );

    const totalApplications = oldApplications + newApplications;
    const pending = totalApplications - processed + other;

    return {
      totalApplications,
      processed,
      granted,
      denied,
      other,
      pending,
      approvalRate: processed ? ((granted / processed) * 100).toFixed(1) : 0,
    };
  }, [data, filters]);

  if (!stats) return null;

  return (
    <div className="stat-container">
      <StatCard
        title="Total Applications"
        shortTitle="Total"
        subtitle={getBureauLabel(filters.bureau)}
        value={stats.totalApplications.toLocaleString()}
        color="bg-blue-500"
        icon="material-symbols:file-copy-outline-rounded"
        filterType={filters.type}
      />
      <StatCard
        title="Pending"
        shortTitle="Pending"
        subtitle={getBureauLabel(filters.bureau)}
        value={stats.pending.toLocaleString()}
        color="bg-yellow-500"
        icon="material-symbols:pending-actions-rounded"
        filterType={filters.type}
      />
      <StatCard
        title="Granted"
        shortTitle="Granted"
        subtitle={getBureauLabel(filters.bureau)}
        value={stats.granted.toLocaleString()}
        color="bg-green-500"
        icon="material-symbols:order-approve-rounded"
        filterType={filters.type}
      />
      <StatCard
        title="Denied"
        shortTitle="Denied"
        subtitle={getBureauLabel(filters.bureau)}
        value={stats.denied.toLocaleString()}
        color="bg-red-500"
        icon="material-symbols:cancel-outline-rounded"
        filterType={filters.type}
      />
      <StatCard
        title="Approval Rate"
        shortTitle="APV. Rate"
        subtitle={getBureauLabel(filters.bureau)}
        value={`${stats.approvalRate}%`}
        color="bg-gray-500"
        icon="material-symbols:percent-rounded"
        filterType={filters.type}
      />
    </div>
  );
};
