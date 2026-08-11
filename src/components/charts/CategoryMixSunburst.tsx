// src/components/charts/CategoryMixSunburst.tsx
// Category Mix on Bklit's SunburstChart: all applications at the root, one
// ring of application types, one ring of bureaus. Drill-down zoom, the
// breadcrumb, and segment animation come from the component; we supply the
// hierarchy and the --chart-mix-* palette (bureaus as tints of their type).
//
// NOT currently registered — the zoomable treemap is the live Category Mix
// view. Same data and props contract; swap the `mix` entry in
// ChartComponents.tsx to switch back.
'use client';

import { useCallback, useMemo } from 'react';

import type React from 'react';

import { useCoarsePointer } from '../../hooks/useCoarsePointer';
import { useLocale } from '../../i18n/LocaleContext';
import { useApplicationType, useBureauLabel } from '../../i18n/useDomainLabels';
import { buildCategoryMixTree, mixLeafColor } from '../../utils/categoryMixTree';
import { buildArcs } from '../bklit/charts/sunburst';
import { SunburstBreadcrumb, useSunburstBreadcrumbItems } from '../bklit/charts/sunburst-breadcrumb';
import { SunburstCenter } from '../bklit/charts/sunburst-center';
import { SunburstChart } from '../bklit/charts/sunburst-chart';
import type { SunburstNode } from '../bklit/charts/sunburst-data';
import { SunburstHint } from '../bklit/charts/sunburst-hint';
import { SunburstLabels } from '../bklit/charts/sunburst-labels';
import { SunburstSegment } from '../bklit/charts/sunburst-segment';
import type { ImmigrationChartData } from '../common/ChartComponents';
import { SeriesLegend } from '../common/SeriesLegend';
import { idleSunburstHint } from './sunburstHint';

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

export const CategoryMixSunburst: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const tree = useMemo(() => buildCategoryMixTree(data, filters, range), [data, filters, range]);
  // The tree carries codes only; display names are resolved here.
  const { t, formatters } = useLocale();
  const coarsePointer = useCoarsePointer();
  const applicationType = useApplicationType();
  const getBureauLabel = useBureauLabel();
  const typeLabel = useCallback((code: string) => applicationType(code)?.label ?? code, [applicationType]);

  const sunburstData: SunburstNode = useMemo(
    () => ({
      name: t('chart.mix.root'),
      children: tree.categories.map((category) => ({
        name: typeLabel(category.key),
        color: category.color,
        children: category.children.map((leaf, rank) => ({
          name: getBureauLabel(leaf.code),
          value: leaf.value,
          color: mixLeafColor(category.color, rank),
        })),
      })),
    }),
    [tree, typeLabel, getBureauLabel, t]
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
      <SeriesLegend
        className="mb-2"
        items={tree.categories.map((category) => ({
          id: category.key,
          label: typeLabel(category.key),
          color: category.color,
        }))}
      />
      <div aria-label={t('charts.mixSunburst.aria')}>
        {/* ~80 bureau arcs: compress the per-segment stagger so the enter
            sweep (and the labels gated behind it) lands in ~2s, not ~7s */}
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
            {({ hoveredArc, focus }) =>
              hoveredArc
                ? t('chart.mix.sunburstHint', {
                    trail: hoveredArc.trail.join(' › '),
                    count: formatters.number(hoveredArc.value),
                    percent: formatters.percent((hoveredArc.value / tree.total) * 100),
                  })
                : t(idleSunburstHint(focus.depth, coarsePointer))
            }
          </SunburstHint>
        </SunburstChart>
      </div>
    </div>
  );
};
