// src/components/StatsSummary.tsx
import { useMemo } from 'react';

import { CircleSlash, FileStack, Hourglass, Percent, Stamp } from 'lucide-react';
import type React from 'react';

import { applicationOptions } from '../constants/applicationOptions';
import { STATUS_CODES } from '../constants/statusCodes';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { getBureauLabel } from '../utils/getBureauData';
import { bureauScopeFromFilter, getAllMonths, selectData } from '../utils/selectors';
import type { StatDelta } from './common/StatCard';
import { StatCard } from './common/StatCard';

interface StatsSummaryProps {
  data: ImmigrationData[];
  filters: { type: string; bureau: string };
}

interface MonthStats {
  totalApplications: number;
  pending: number;
  granted: number;
  denied: number;
  processed: number;
  approvalRate: number;
}

const SPARK_MONTHS = 8;

const statsForRows = (rows: ImmigrationData[]): MonthStats => {
  const acc = { oldApplications: 0, newApplications: 0, processed: 0, granted: 0, denied: 0, other: 0 };
  for (const entry of rows) {
    switch (entry.status) {
      case STATUS_CODES.OLD_APPLICATIONS:
        acc.oldApplications += entry.value;
        break;
      case STATUS_CODES.NEW_APPLICATIONS:
        acc.newApplications += entry.value;
        break;
      case STATUS_CODES.PROCESSED:
        acc.processed += entry.value;
        break;
      case STATUS_CODES.GRANTED:
        acc.granted += entry.value;
        break;
      case STATUS_CODES.DENIED:
        acc.denied += entry.value;
        break;
      case STATUS_CODES.OTHER:
        acc.other += entry.value;
        break;
    }
  }
  const totalApplications = acc.oldApplications + acc.newApplications;
  return {
    totalApplications,
    pending: totalApplications - acc.processed + acc.other,
    granted: acc.granted,
    denied: acc.denied,
    processed: acc.processed,
    approvalRate: acc.processed ? (acc.granted / acc.processed) * 100 : 0,
  };
};

const formatInt = (value: number) => Math.round(value).toLocaleString('en-US');
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const deltaOf = (current: number, previous: number | undefined, direction: StatDelta extends null ? never : NonNullable<StatDelta>['direction']): StatDelta =>
  previous === undefined || previous === 0 ? null : { percent: ((current - previous) / previous) * 100, direction };

export const StatsSummary: React.FC<StatsSummaryProps> = ({ data, filters }) => {
  const monthly = useMemo(() => {
    const scoped = selectData(data, { scope: bureauScopeFromFilter(filters.bureau), type: filters.type });
    const months = getAllMonths(scoped).slice(-SPARK_MONTHS);
    return months.map((month) => statsForRows(scoped.filter((entry) => entry.month === month)));
  }, [data, filters.bureau, filters.type]);

  if (monthly.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No data for this combination of filters.
      </div>
    );
  }

  const latest = monthly[monthly.length - 1];
  const previous = monthly.length > 1 ? monthly[monthly.length - 2] : undefined;
  const bureauLabel = getBureauLabel(filters.bureau);
  const typeLabel =
    filters.type !== 'all' ? applicationOptions.find((option) => option.value === filters.type)?.short : undefined;
  const subtitle = typeLabel ? `${bureauLabel} (${typeLabel})` : bureauLabel;
  const spark = (pick: (m: MonthStats) => number) => monthly.map(pick);

  // A single scroll-snap row at every viewport: the five cards flex to fill
  // wide screens and scroll horizontally (with a peeking card as the cue)
  // instead of wrapping to two or three rows on smaller ones.
  const cardClass = 'min-w-40 flex-1 snap-start sm:min-w-44';

  return (
    <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 md:gap-3">
      <StatCard
        className={cardClass}
        title="Total Applications"
        subtitle={subtitle}
        value={latest.totalApplications}
        formatValue={formatInt}
        color="blue"
        icon={FileStack}
        delta={deltaOf(latest.totalApplications, previous?.totalApplications, 'neutral')}
        spark={spark((m) => m.totalApplications)}
      />
      <StatCard
        className={cardClass}
        title="Pending"
        subtitle={subtitle}
        value={latest.pending}
        formatValue={formatInt}
        color="yellow"
        icon={Hourglass}
        delta={deltaOf(latest.pending, previous?.pending, 'up-warn')}
        spark={spark((m) => m.pending)}
      />
      <StatCard
        className={cardClass}
        title="Granted"
        subtitle={subtitle}
        value={latest.granted}
        formatValue={formatInt}
        color="green"
        icon={Stamp}
        delta={deltaOf(latest.granted, previous?.granted, 'up-good')}
        spark={spark((m) => m.granted)}
      />
      <StatCard
        className={cardClass}
        title="Denied"
        subtitle={subtitle}
        value={latest.denied}
        formatValue={formatInt}
        color="red"
        icon={CircleSlash}
        delta={deltaOf(latest.denied, previous?.denied, 'up-warn')}
        spark={spark((m) => m.denied)}
      />
      <StatCard
        className={cardClass}
        title="Approval Rate"
        subtitle={subtitle}
        value={latest.approvalRate}
        formatValue={formatPercent}
        color="gray"
        icon={Percent}
        delta={deltaOf(latest.approvalRate, previous?.approvalRate, 'up-good')}
        spark={spark((m) => m.approvalRate)}
      />
    </div>
  );
};
