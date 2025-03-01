// src/components/StatsSummary.tsx
import { useMemo } from 'react';

import type React from 'react';
import { Icon } from '@iconify/react';
import Tippy from '@tippyjs/react';

import type { ImmigrationData } from '../hooks/useImmigrationData';
import { getBureauLabel } from '../utils/getBureauData';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';

interface StatsSummaryProps {
  data: ImmigrationData[];
  filters: { month?: string; type: string; bureau: string };
}

interface StatCardProps {
  title: string;
  shortTitle: string;
  subtitle: string;
  value: string | number;
  color: string;
  icon: string;
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

    const oldApplications = filteredData.reduce(
      (sum, entry) => (entry.status === '102000' ? sum + entry.value : sum),
      0,
    );
    const newApplications = filteredData.reduce(
      (sum, entry) => (entry.status === '103000' ? sum + entry.value : sum),
      0,
    );
    const processed = filteredData.reduce((sum, entry) => (entry.status === '300000' ? sum + entry.value : sum), 0);
    const granted = filteredData.reduce((sum, entry) => (entry.status === '301000' ? sum + entry.value : sum), 0);
    const denied = filteredData.reduce((sum, entry) => (entry.status === '302000' ? sum + entry.value : sum), 0);
    const other = filteredData.reduce((sum, entry) => (entry.status === '305000' ? sum + entry.value : sum), 0);

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

  const StatCard: React.FC<StatCardProps> = ({ title, shortTitle, subtitle, value, color, icon }) => {
    return (
      <Tippy
        className="sm:pointer-events-none sm:hidden"
        content={
          <div className="flex flex-col gap-1 text-center">
            <div className="font-semibold">{title}</div>
            <div className="mt-1 font-bold">{value}</div>
          </div>
        }
        animation="shift-away"
        placement="top"
        arrow={true}
        theme="stat-tooltip"
        delay={[300, 0]}
        touch={true}
      >
        <div className="stat-card">
          <div className="group relative">
            <div className={`${color} dark:${color.replace('500', '600')} stat-badge`}>
              <div className="stat-icon-text">
                <Icon icon={icon} />
              </div>
            </div>
          </div>
          <div className="stat-details">
            <div className="stat-title">{title}</div>
            <div className="stat-short-title">{shortTitle}</div>
            <div className="stat-subtitle">{subtitle}</div>
            <div className="stat-value">{value}</div>
          </div>
        </div>
      </Tippy>
    );
  };

  return (
    <div className="stat-container">
      <StatCard
        title="Total Applications"
        shortTitle="Total"
        subtitle={getBureauLabel(filters.bureau)}
        value={stats.totalApplications.toLocaleString()}
        color="bg-blue-500"
        icon="material-symbols:file-copy-outline-rounded"
      />
      <StatCard
        title="Pending"
        shortTitle="Pending"
        subtitle={getBureauLabel(filters.bureau)}
        value={stats.pending.toLocaleString()}
        color="bg-yellow-500"
        icon="material-symbols:pending-actions-rounded"
      />
      <StatCard
        title="Granted"
        shortTitle="Granted"
        subtitle={getBureauLabel(filters.bureau)}
        value={stats.granted.toLocaleString()}
        color="bg-green-500"
        icon="material-symbols:order-approve-rounded"
      />
      <StatCard
        title="Denied"
        shortTitle="Denied"
        subtitle={getBureauLabel(filters.bureau)}
        value={stats.denied.toLocaleString()}
        color="bg-red-500"
        icon="material-symbols:cancel-outline-rounded"
      />
      <StatCard
        title="Approval Rate"
        shortTitle="APV. Rate"
        subtitle={getBureauLabel(filters.bureau)}
        value={`${stats.approvalRate}%`}
        color="bg-gray-500"
        icon="material-symbols:percent-rounded"
      />
    </div>
  );
};
