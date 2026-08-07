// src/components/charts/ResidentFlowsSankeyChart.tsx
// Origins → Status Categories on Bklit's Sankey, in three tiers: world
// region → country → purpose-of-stay group. The nationality × status
// cross-tabulation this cube uniquely offers, keyed to geography. Selecting
// a region narrows the left column to it; selecting a nationality collapses
// the chart into that country's profile; selecting a category narrows the
// right column.
//
// A stock figure: the flows describe the single snapshot the period picker
// chooses, and the header says which one.
'use client';

import { useMemo } from 'react';

import type React from 'react';
import useMeasure from 'react-use-measure';

import { useLocale } from '../../i18n/LocaleContext';
import { useNationalityLabel, useRegionLabel, useStatusGroupLabel } from '../../i18n/useDomainLabels';
import { GROUP_COLOR } from '../../utils/residenceStatusTree';
import { formatPeriod } from '../../utils/residentPeriod';
import { buildResidentFlows, FLOWS_OTHER } from '../../utils/residentsFlows';
import { REGION_COLOR } from '../../utils/residentsGrowth';
import { measureLabelWidth } from '../bklit/charts/chart-formatters';
import { SankeyChart } from '../bklit/charts/sankey/sankey-chart';
import { SankeyLink } from '../bklit/charts/sankey/sankey-link';
import { SankeyNode } from '../bklit/charts/sankey/sankey-node';
import { SankeyTooltip } from '../bklit/charts/sankey/sankey-tooltip';
import type { ResidentChartData } from '../common/ChartComponents';

/** Middle-tier country hues, positional by rank within the current view. */
const COUNTRY_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
];

/** The everyone-else bucket stays visually recessive. */
const OTHER_COLOR = 'var(--muted-foreground)';

// Same rationale as OutcomesSankeyChart: the vendored Sankey's fixed label
// margins collapse the drawing area on narrow containers. Below this width
// the chart goes taller, drops the value sublabels, and hides the middle
// tier's above-node labels (countries stay identifiable via the tooltip).
const NARROW_WIDTH = 500;

export const ResidentFlowsSankeyChart: React.FC<ResidentChartData> = ({ data, filters, period: requestedPeriod }) => {
  const [measureRef, bounds] = useMeasure({ debounce: 10 });
  const isNarrow = bounds.width > 0 && bounds.width < NARROW_WIDTH;
  const { t, formatters } = useLocale();
  const nationalityLabel = useNationalityLabel();
  const regionLabel = useRegionLabel();
  const groupLabel = useStatusGroupLabel();

  const flows = useMemo(
    () =>
      buildResidentFlows(
        data,
        { region: filters.region, nationality: filters.nationality, group: filters.group },
        requestedPeriod
      ),
    [data, filters.region, filters.nationality, filters.group, requestedPeriod]
  );

  const { sankeyData, nodeColors } = useMemo(() => {
    const countryName = (code: string) =>
      code === FLOWS_OTHER ? t('residents.otherNationalities') : nationalityLabel(code);
    const nodes = [
      ...flows.regions.map((region) => ({ name: regionLabel(region.code), category: 'source' as const })),
      // 'landing' marks the middle tier: its on-canvas value sublabel (were
      // it ever shown) totals inflow, and the margin measurer skips it.
      ...flows.countries.map((country) => ({ name: countryName(country.code), category: 'landing' as const })),
      ...flows.groups.map((entry) => ({ name: groupLabel(entry.group), category: 'outcome' as const })),
    ];
    const nodeColors = [
      ...flows.regions.map((region) => REGION_COLOR[region.code] ?? 'var(--chart-8)'),
      ...flows.countries.map((country, rank) =>
        country.code === FLOWS_OTHER ? OTHER_COLOR : COUNTRY_COLORS[rank % COUNTRY_COLORS.length]
      ),
      ...flows.groups.map((entry) => GROUP_COLOR[entry.group]),
    ];

    const regionIndex = new Map(flows.regions.map((region, index) => [region.code, index]));
    const countryIndex = new Map(
      flows.countries.map((country, index) => [country.code, flows.regions.length + index])
    );
    const groupIndex = new Map(
      flows.groups.map((entry, index) => [entry.group, flows.regions.length + flows.countries.length + index])
    );

    const links = [
      ...flows.regionCountryLinks.flatMap((link) => {
        const source = regionIndex.get(link.region);
        const target = countryIndex.get(link.country);
        return source !== undefined && target !== undefined ? [{ source, target, value: link.value }] : [];
      }),
      ...flows.countryGroupLinks.flatMap((link) => {
        const source = countryIndex.get(link.country);
        const target = groupIndex.get(link.group);
        return source !== undefined && target !== undefined ? [{ source, target, value: link.value }] : [];
      }),
    ];
    return { sankeyData: { nodes, links }, nodeColors };
  }, [flows, nationalityLabel, regionLabel, groupLabel, t]);

  // Measured label margins, same as OutcomesSankeyChart: region and category
  // names vary wildly across the twelve locales and would otherwise clip.
  // The middle tier needs no margin — its labels sit inside the plot.
  const sankeyMargin = useMemo(() => {
    const nodeLabelFont =
      '500 13px -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Hiragino Sans", "Yu Gothic UI", sans-serif';
    const widthOf = (category: 'source' | 'outcome') =>
      sankeyData.nodes
        .filter((node) => node.category === category)
        .reduce((max, node) => Math.max(max, measureLabelWidth(node.name, nodeLabelFont)), 0);
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    const allowance = 12 + 14;
    if (isNarrow) {
      return {
        top: 16,
        bottom: 16,
        left: clamp(Math.ceil(widthOf('source')) + allowance, 90, 140),
        right: clamp(Math.ceil(widthOf('outcome')) + allowance, 76, 120),
      };
    }
    // Top margin covers the topmost middle node's above-node label.
    return {
      top: 32,
      bottom: 32,
      left: clamp(Math.ceil(widthOf('source')) + allowance, 130, 230),
      right: clamp(Math.ceil(widthOf('outcome')) + allowance, 130, 230),
    };
  }, [sankeyData, isNarrow]);

  if (sankeyData.links.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        {t('common.noDataForFilters')}
      </div>
    );
  }

  return (
    <div className="chart-card-content">
      {flows.period && (
        <p className="mb-1 text-xxs text-muted-foreground">
          {t('residents.asOf', { period: formatPeriod(flows.period, formatters) })}
        </p>
      )}
      <div ref={measureRef} className="min-w-0" role="img" aria-label={t('charts.flows.aria')}>
        {bounds.width > 0 && (
          <SankeyChart
            data={sankeyData}
            aspectRatio={isNarrow ? '4 / 5' : '16 / 11'}
            margin={sankeyMargin}
            nodePadding={isNarrow ? 8 : 12}
          >
            <SankeyLink />
            <SankeyNode
              valueUnit={t('residents.flowsValueUnit')}
              showValueLabels={!isNarrow}
              showMiddleLabels={!isNarrow}
              getNodeColor={(_node, index) => nodeColors[index] ?? 'var(--chart-1)'}
            />
            <SankeyTooltip
              valueLabel={t('residents.flowsTooltipValueLabel')}
              linkLabel={t('residents.flowsTooltipFlowLabel')}
            />
          </SankeyChart>
        )}
      </div>
    </div>
  );
};
