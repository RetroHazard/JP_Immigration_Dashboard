// src/components/StatsSummary.tsx
import { useMemo } from 'react';

import type React from 'react';
import { Icon } from '@iconify/react';
import Tippy from '@tippyjs/react';

import { applicationOptions } from '../constants/applicationOptions';
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

  const getApplicationTypeLabel = (type: string) => {
    const appType = applicationOptions.find((option) => option.value === type);
    return appType ? appType.short : '';
  };

  const StatCard: React.FC<StatCardProps> = ({ title, shortTitle, subtitle, value, color, icon }) => {
    const appTypeLabel = filters.type !== 'all' ? getApplicationTypeLabel(filters.type) : '';
    const combinedSubtitle = appTypeLabel ? `${subtitle} (${appTypeLabel})` : subtitle;

    return (
      <Tippy
        className="sm:pointer-events-none sm:hidden"
        content={
          <div className="flex flex-col gap-1 text-center">
            <div className="font-semibold">{title}</div>
            <div className="font-light">{combinedSubtitle}</div>
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
            {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
            <div className={`${color} dark:${color.replace('500', '600')} stat-badge`}>
              <div className="stat-icon-text">
                <Icon icon={icon} />
              </div>
            </div>
          </div>
          <div className="stat-details">
            <div className="stat-title">{title}</div>
            <div className="stat-short-title">{shortTitle}</div>
            <div className="stat-subtitle">{combinedSubtitle}</div>
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
