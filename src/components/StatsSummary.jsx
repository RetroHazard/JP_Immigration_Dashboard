// components/StatsSummary.jsx
import { useMemo } from 'react';
import { getBureauLabel } from '../utils/getBureauData';
import { Icon } from '@iconify/react';

export const StatsSummary = ({ data, filters }) => {
  const stats = useMemo(() => {
    if (!data) return null;

    // Use the selected month from filters, or get the most recent month if none selected
    const selectedMonth = filters.month || [...new Set(data.map((entry) => entry.month))].sort().reverse()[0];

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
      0
    );
    const newApplications = filteredData.reduce(
      (sum, entry) => (entry.status === '103000' ? sum + entry.value : sum),
      0
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

  const StatCard = ({ title, shortTitle, subtitle, date, value, color, icon }) => {
    return (
      <div className="stat-card">
        <div className="group relative">
          <div className={`${color} stat-icon`}>
            <span className="stat-icon-text">
              <Icon icon={icon} />
            </span>
          </div>
          {/* Mobile Tooltip */}
          <div className="stat-tooltip">
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{title}</span>
              <span className="mt-1 font-bold">{value}</span>
            </div>
            <div className="stat-tooltip-arrow"></div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="stat-details">
          <div className="flex flex-col">
            <h3 className="stat-title">{title}</h3>
            <h3 className="stat-short-title">{shortTitle}</h3>
            <span className="stat-subtitle">{subtitle}</span>
            <span className="stat-date">{date}</span>
          </div>
          <p className="stat-value">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="stat-container">
      <StatCard
        title="Total Applications"
        shortTitle="Total"
        subtitle={getBureauLabel(filters.bureau)}
        date={filters.month}
        value={stats.totalApplications.toLocaleString()}
        color="bg-blue-500"
        icon="material-symbols:file-copy-outline-rounded"
      />
      <StatCard
        title="Pending"
        shortTitle="Pending"
        subtitle={getBureauLabel(filters.bureau)}
        date={filters.month}
        value={stats.pending.toLocaleString()}
        color="bg-yellow-500"
        icon="material-symbols:pending-actions-rounded"
      />
      <StatCard
        title="Granted"
        shortTitle="Granted"
        subtitle={getBureauLabel(filters.bureau)}
        date={filters.month}
        value={stats.granted.toLocaleString()}
        color="bg-green-500"
        icon="material-symbols:order-approve-rounded"
      />
      <StatCard
        title="Denied"
        shortTitle="Denied"
        subtitle={getBureauLabel(filters.bureau)}
        date={filters.month}
        value={stats.denied.toLocaleString()}
        color="bg-red-500"
        icon="material-symbols:cancel-outline-rounded"
      />
      <StatCard
        title="Approval Rate"
        shortTitle="APV. Rate"
        subtitle={getBureauLabel(filters.bureau)}
        date={filters.month}
        value={`${stats.approvalRate}%`}
        color="bg-gray-500"
        icon="material-symbols:percent-rounded"
      />
    </div>
  );
};
