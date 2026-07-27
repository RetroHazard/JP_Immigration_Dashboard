// src/components/charts/CategoryMixSunburst.tsx
// Category Mix on Bklit's SunburstChart: all applications at the root, one
// ring of application types, one ring of bureaus. Drill-down zoom, the
// breadcrumb, and segment animation come from the component; we supply the
// hierarchy and the --chart-mix-* palette (bureaus as tints of their type).
'use client';

import { useMemo } from 'react';

import type React from 'react';

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

  const sunburstData: SunburstNode = useMemo(
    () => ({
      name: 'All applications',
      children: tree.categories.map((category) => ({
        name: category.name,
        color: category.color,
        children: category.children.map((leaf, rank) => ({
          name: leaf.name,
          value: leaf.value,
          color: mixLeafColor(category.color, rank),
        })),
      })),
    }),
    [tree]
  );

  const arcs = useMemo(() => buildArcs(sunburstData).arcs, [sunburstData]);

  if (tree.total === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        No data for this combination of filters.
      </div>
    );
  }

  return (
    <div className="card-content">
      <SeriesLegend
        className="mb-2"
        items={tree.categories.map((category) => ({ label: category.name, color: category.color }))}
      />
      <div aria-label="Sunburst of applications by type and bureau; interactive drill-down">
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
            {({ hintText, hoveredArc }) =>
              hoveredArc
                ? `${hoveredArc.trail.join(' › ')} — ${hoveredArc.value.toLocaleString()} applications` +
                  ` (${((hoveredArc.value / tree.total) * 100).toFixed(1)}% of total)`
                : hintText
            }
          </SunburstHint>
        </SunburstChart>
      </div>
    </div>
  );
};
