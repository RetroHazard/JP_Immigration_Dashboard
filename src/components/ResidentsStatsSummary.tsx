// src/components/ResidentsStatsSummary.tsx
// Stat tiles for the residents dataset. The processing tiles count events over
// a month; these read a stock at a point in time, so the delta is half-over-
// half rather than month-over-month and the sparkline walks periods.
import { useMemo } from 'react';

import { Globe, Layers, Percent, Users } from 'lucide-react';
import type React from 'react';

import { japanPopulationForPeriod } from '../constants/japanPopulation';
import { useLocale } from '../i18n/LocaleContext';
import { useNationalityLabel, useResidenceStatusLabel, useStatusGroupLabel } from '../i18n/useDomainLabels';
import { formatPeriod } from '../utils/residentPeriod';
import type { ResidentRecord } from '../utils/residentsData';
import { getAllPeriods, selectResidents, sumResidents, totalsBy } from '../utils/residentsSelectors';
import type { ResidentFilters } from './common/ChartComponents';
import { StatCard } from './common/StatCard';

/** Periods behind the current one that feed the sparkline. */
const SPARK_PERIODS = 8;

interface ResidentsStatsSummaryProps {
  data: ResidentRecord[];
  filters: ResidentFilters;
}

export const ResidentsStatsSummary: React.FC<ResidentsStatsSummaryProps> = ({ data, filters }) => {
  const { t, formatters } = useLocale();
  const nationalityLabel = useNationalityLabel();
  const statusLabel = useResidenceStatusLabel();
  const groupLabel = useStatusGroupLabel();

  const stats = useMemo(() => {
    const periods = getAllPeriods(data);
    const latest = periods.at(-1);
    if (!latest) return null;

    const rowsFor = (period: string) =>
      selectResidents(data, {
        period,
        region: filters.region,
        nationality: filters.nationality,
        group: filters.group,
      });

    const current = rowsFor(latest);
    const previous = periods.at(-2) ? rowsFor(periods.at(-2)!) : [];
    const total = sumResidents(current);
    const previousTotal = sumResidents(previous);

    const byNationality = totalsBy(current, 'nationality');
    const byStatus = totalsBy(current, 'status');
    const [topNationality, topNationalityValue] = [...byNationality.entries()][0] ?? [null, 0];
    const [topStatus, topStatusValue] = [...byStatus.entries()][0] ?? [null, 0];

    const sparkPeriods = periods.slice(-SPARK_PERIODS);
    const sparkTotals = sparkPeriods.map((period) => sumResidents(rowsFor(period)));
    const population = japanPopulationForPeriod(latest);

    return {
      latest,
      total,
      // A stock can shrink, and a shrinking foreign population is not
      // self-evidently bad news, so the delta is 'neutral' rather than graded.
      delta:
        previousTotal > 0
          ? { percent: ((total - previousTotal) / previousTotal) * 100, direction: 'neutral' as const }
          : null,
      spark: sparkTotals,
      // The selection as a share of the whole country. The denominator moves
      // with each period's own estimate, so the sparkline shows the share
      // genuinely rising rather than just the numerator growing.
      population,
      populationShare: (total / population) * 100,
      populationShareSpark: sparkPeriods.map(
        (period, index) => (sparkTotals[index] / japanPopulationForPeriod(period)) * 100
      ),
      topNationality,
      topNationalityValue,
      topStatus,
      topStatusValue,
    };
  }, [data, filters.region, filters.nationality, filters.group]);

  if (!stats) return null;

  const scope = t('residents.scope', {
    nationality: filters.nationality === 'all' ? t('filters.allNationalities') : nationalityLabel(filters.nationality),
    status: filters.group === 'all' ? t('filters.allStatuses') : groupLabel(filters.group),
  });
  const share = (value: number) =>
    stats.total > 0 ? t('residents.share', { share: formatters.percent((value / stats.total) * 100) }) : scope;

  return (
    // One row of four at every width: dense tiles keep phones from stacking
    // the summary into a full screen of cards before the charts appear.
    <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
      <StatCard
        dense
        title={t('residents.total')}
        shortTitle={t('residents.total.short')}
        subtitle={t('residents.asOf', { period: formatPeriod(stats.latest, formatters) })}
        value={stats.total}
        formatValue={formatters.number}
        color="blue"
        icon={Users}
        delta={stats.delta}
        deltaKey="residents.delta"
        spark={stats.spark}
      />
      <StatCard
        dense
        title={t('residents.populationShare')}
        shortTitle={t('residents.populationShare.short')}
        subtitle={t('residents.populationShareOf', { population: formatters.compactNumber(stats.population) })}
        value={stats.populationShare}
        formatValue={(value) => formatters.percent(value, 2)}
        color="yellow"
        icon={Percent}
        delta={null}
        spark={stats.populationShareSpark}
      />
      <StatCard
        dense
        title={t('residents.topNationality')}
        shortTitle={t('residents.topNationality.short')}
        subtitle={stats.topNationality ? nationalityLabel(stats.topNationality) : scope}
        value={stats.topNationalityValue}
        formatValue={formatters.number}
        color="green"
        icon={Globe}
        delta={null}
      />
      <StatCard
        dense
        title={t('residents.topStatus')}
        shortTitle={t('residents.topStatus.short')}
        subtitle={stats.topStatus ? `${statusLabel(stats.topStatus)} · ${share(stats.topStatusValue)}` : scope}
        value={stats.topStatusValue}
        formatValue={formatters.number}
        color="gray"
        icon={Layers}
        delta={null}
      />
    </div>
  );
};
