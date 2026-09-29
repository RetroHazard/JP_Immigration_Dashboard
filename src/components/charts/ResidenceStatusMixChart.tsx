// Residence Status Mix on the shared MixTreemap: purpose-of-stay groups at the
// root, individual statuses nested inside. Click a group to zoom into it.
//
// Not registered: ResidenceStatusSunburst is the live Residence Status Mix
// view. Same data and props contract; swap the `statuses` entry in
// ChartComponents.tsx to switch back.
//
// A stock figure: summing half-years would count each resident once per
// period, so it draws the single snapshot the period picker chooses, and the
// header says which.
'use client';

import { useMemo } from 'react';

import type React from 'react';

import type { StatusGroup } from '../../constants/residenceStatuses';
import { useLocale } from '../../i18n/LocaleContext';
import { useNationalityLabel, useResidenceStatusLabel, useStatusGroupLabel } from '../../i18n/useDomainLabels';
import { buildResidenceStatusTree, treePeriod } from '../../utils/residenceStatusTree';
import { formatPeriod } from '../../utils/residentPeriod';
import type { ResidentChartData } from '../common/ChartComponents';
import type { MixTreemapLabels } from './CategoryMixTreemap';
import { MixTreemap } from './CategoryMixTreemap';

export const ResidenceStatusMixChart: React.FC<ResidentChartData> = ({ data, filters, period: requestedPeriod }) => {
  const { t, formatters } = useLocale();
  const statusLabel = useResidenceStatusLabel();
  const groupLabel = useStatusGroupLabel();
  const nationalityLabel = useNationalityLabel();

  const tree = useMemo(
    () => buildResidenceStatusTree(data, { nationality: filters.nationality, region: filters.region }, requestedPeriod),
    [data, filters.nationality, filters.region, requestedPeriod]
  );
  const period = useMemo(() => treePeriod(data, requestedPeriod), [data, requestedPeriod]);

  const labels: MixTreemapLabels = {
    root:
      filters.nationality === 'all'
        ? t('residents.mixRoot')
        : nationalityLabel(filters.nationality),
    scopeAll: t('residents.mixScopeAll'),
    // Safe cast: buildResidenceStatusTree only emits STATUS_GROUPS members.
    categoryLabel: (key) => groupLabel(key as StatusGroup),
    categoryShort: (key) => groupLabel(key as StatusGroup),
    leafLabel: statusLabel,
    leafCompact: statusLabel,
    categoryAria: (params) => t('residents.mixCategoryAria', params),
    tooltipValue: (params) => t('residents.mixTooltipValue', params),
  };

  return (
    <div>
      {period && (
        <p className="mb-1 text-xxs text-muted-foreground">
          {t('residents.asOf', { period: formatPeriod(period, formatters) })}
        </p>
      )}
      <div role="img" aria-label={t('charts.statuses.aria')}>
        <MixTreemap tree={tree} labels={labels} />
      </div>
    </div>
  );
};
