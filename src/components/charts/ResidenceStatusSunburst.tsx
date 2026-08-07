// src/components/charts/ResidenceStatusSunburst.tsx
// Residence Status Mix on Bklit's SunburstChart: all residents at the center,
// one ring of purpose-of-stay groups, one ring of individual statuses. Click
// a group to zoom into it; the breadcrumb climbs back out. Replaces the
// custom treemap view (ResidenceStatusMixChart, kept unregistered) with the
// same buildResidenceStatusTree hierarchy and the same --chart-mix-* palette.
//
// A stock figure, so the range picker chooses which snapshot to show rather
// than a window to sum, and the header says which period is drawn.
'use client';

import { useMemo } from 'react';

import type React from 'react';

import type { StatusGroup } from '../../constants/residenceStatuses';
import { useLocale } from '../../i18n/LocaleContext';
import { useNationalityLabel, useResidenceStatusLabel, useStatusGroupLabel } from '../../i18n/useDomainLabels';
import { mixLeafColor } from '../../utils/categoryMixTree';
import { buildResidenceStatusTree, treePeriod } from '../../utils/residenceStatusTree';
import { formatPeriod } from '../../utils/residentPeriod';
import { buildArcs } from '../bklit/charts/sunburst';
import { SunburstBreadcrumb, useSunburstBreadcrumbItems } from '../bklit/charts/sunburst-breadcrumb';
import { SunburstCenter } from '../bklit/charts/sunburst-center';
import { SunburstChart } from '../bklit/charts/sunburst-chart';
import type { SunburstNode } from '../bklit/charts/sunburst-data';
import { SunburstHint } from '../bklit/charts/sunburst-hint';
import { SunburstLabels } from '../bklit/charts/sunburst-labels';
import { SunburstSegment } from '../bklit/charts/sunburst-segment';
import type { ResidentChartData } from '../common/ChartComponents';
import { SeriesLegend } from '../common/SeriesLegend';

const BreadcrumbTrail: React.FC = () => {
  const { items, zoomTo } = useSunburstBreadcrumbItems();
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      {items.map((item, index) => (
        <span key={item.id} className="flex items-center gap-1.5">
          {index > 0 && <span aria-hidden="true">›</span>}
          <button
            onClick={() => zoomTo(item.id)}
            disabled={item.isCurrent}
            className="rounded font-medium text-primary hover:opacity-80 disabled:font-semibold disabled:text-foreground"
          >
            {item.label}
          </button>
        </span>
      ))}
    </div>
  );
};

export const ResidenceStatusSunburst: React.FC<ResidentChartData> = ({ data, filters, range }) => {
  const { t, formatters } = useLocale();
  const statusLabel = useResidenceStatusLabel();
  const groupLabel = useStatusGroupLabel();
  const nationalityLabel = useNationalityLabel();

  const tree = useMemo(
    () => buildResidenceStatusTree(data, { nationality: filters.nationality }, range),
    [data, filters.nationality, range]
  );
  const period = useMemo(() => treePeriod(data, range), [data, range]);

  const sunburstData: SunburstNode = useMemo(
    () => ({
      name: filters.nationality === 'all' ? t('residents.mixRoot') : nationalityLabel(filters.nationality),
      children: tree.categories.map((category) => ({
        // The category key is a StatusGroup, not a code — buildResidenceStatusTree
        // only ever emits members of STATUS_GROUPS.
        name: groupLabel(category.key as StatusGroup),
        color: category.color,
        children: category.children.map((leaf, rank) => ({
          name: statusLabel(leaf.code),
          value: leaf.value,
          color: mixLeafColor(category.color, rank),
        })),
      })),
    }),
    [tree, filters.nationality, groupLabel, statusLabel, nationalityLabel, t]
  );

  const arcs = useMemo(() => buildArcs(sunburstData).arcs, [sunburstData]);

  if (tree.total === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        {t('common.noDataForFilters')}
      </div>
    );
  }

  return (
    <div className="chart-card-content">
      {period && (
        <p className="mb-1 text-xxs text-muted-foreground">
          {t('residents.asOf', { period: formatPeriod(period, formatters) })}
        </p>
      )}
      <SeriesLegend
        className="mb-2"
        items={tree.categories.map((category) => ({
          id: category.key,
          label: groupLabel(category.key as StatusGroup),
          color: category.color,
        }))}
      />
      <div aria-label={t('charts.statuses.aria')}>
        {/* ~40 status arcs: same stagger compression as the processing
            sunburst so the enter sweep lands quickly */}
        <SunburstChart data={sunburstData} size={430} className="mx-auto" enterStaggerScale={0.3}>
          <SunburstBreadcrumb className="mb-2">
            <BreadcrumbTrail />
          </SunburstBreadcrumb>
          {arcs.map((arc) => (
            <SunburstSegment index={arc.arcIndex} key={arc.id} />
          ))}
          <SunburstCenter />
          <SunburstLabels fontSize={11} />
          <SunburstHint className="mt-2 min-h-5 text-center text-xs text-muted-foreground">
            {({ hintText, hoveredArc }) =>
              hoveredArc
                ? t('residents.sunburstHint', {
                    trail: hoveredArc.trail.join(' › '),
                    count: formatters.number(hoveredArc.value),
                    percent: formatters.percent((hoveredArc.value / tree.total) * 100),
                  })
                : hintText
            }
          </SunburstHint>
        </SunburstChart>
      </div>
    </div>
  );
};
