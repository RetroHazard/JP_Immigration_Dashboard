// src/components/charts/ResidentFlowsSankeyChart.tsx
// Origins → Status Groups on Bklit's Sankey: the nationality × residence-status
// cross-tabulation this cube uniquely offers, as flows from the largest
// nationalities (plus an Other bucket) into purpose-of-stay groups. Selecting
// a single nationality collapses the left side to one node, which reads as
// that country's status profile.
//
// A stock figure: the flows describe the single most recent period in the
// selected range, and the header says which one.
'use client';

import { useMemo } from 'react';

import type React from 'react';
import useMeasure from 'react-use-measure';

import { useLocale } from '../../i18n/LocaleContext';
import { useNationalityLabel, useStatusGroupLabel } from '../../i18n/useDomainLabels';
import { GROUP_COLOR } from '../../utils/residenceStatusTree';
import { formatPeriod } from '../../utils/residentPeriod';
import { buildResidentFlows, FLOWS_OTHER } from '../../utils/residentsFlows';
import { measureLabelWidth } from '../bklit/charts/chart-formatters';
import { SankeyChart } from '../bklit/charts/sankey/sankey-chart';
import { SankeyLink } from '../bklit/charts/sankey/sankey-link';
import { SankeyNode } from '../bklit/charts/sankey/sankey-node';
import { SankeyTooltip } from '../bklit/charts/sankey/sankey-tooltip';
import type { ResidentChartData } from '../common/ChartComponents';

/** Same positional palette as the Origins line chart, so the same top
 * nationalities wear roughly the same hues across the two views. */
const SOURCE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-mix-1)',
  'var(--chart-mix-4)',
];

/** The everyone-else bucket stays visually recessive. */
const OTHER_COLOR = 'var(--muted-foreground)';

// Same rationale as OutcomesSankeyChart: the vendored Sankey's fixed label
// margins collapse the drawing area on narrow containers, so below this width
// the chart switches to a square aspect, slimmer measured margins, and no
// value sublabels.
const NARROW_WIDTH = 500;

export const ResidentFlowsSankeyChart: React.FC<ResidentChartData> = ({ data, filters, range }) => {
  const [measureRef, bounds] = useMeasure({ debounce: 10 });
  const isNarrow = bounds.width > 0 && bounds.width < NARROW_WIDTH;
  const { t, formatters } = useLocale();
  const nationalityLabel = useNationalityLabel();
  const groupLabel = useStatusGroupLabel();

  const flows = useMemo(
    () => buildResidentFlows(data, { nationality: filters.nationality }, range),
    [data, filters.nationality, range]
  );

  const { sankeyData, nodeColors } = useMemo(() => {
    const sourceName = (code: string) =>
      code === FLOWS_OTHER ? t('residents.otherNationalities') : nationalityLabel(code);
    const nodes = [
      ...flows.sources.map((source) => ({ name: sourceName(source.code), category: 'source' as const })),
      ...flows.groups.map((entry) => ({ name: groupLabel(entry.group), category: 'outcome' as const })),
    ];
    const nodeColors = [
      ...flows.sources.map((source, rank) =>
        source.code === FLOWS_OTHER ? OTHER_COLOR : SOURCE_COLORS[rank % SOURCE_COLORS.length]
      ),
      ...flows.groups.map((entry) => GROUP_COLOR[entry.group]),
    ];
    const sourceIndex = new Map(flows.sources.map((source, index) => [source.code, index]));
    const groupIndex = new Map(flows.groups.map((entry, index) => [entry.group, flows.sources.length + index]));
    const links = flows.links.flatMap((link) => {
      const source = sourceIndex.get(link.source);
      const target = groupIndex.get(link.group);
      return source !== undefined && target !== undefined ? [{ source, target, value: link.value }] : [];
    });
    return { sankeyData: { nodes, links }, nodeColors };
  }, [flows, nationalityLabel, groupLabel, t]);

  // Measured label margins, same as OutcomesSankeyChart: country names vary
  // wildly across the twelve locales and would otherwise clip.
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
    return {
      top: 32,
      bottom: 32,
      left: clamp(Math.ceil(widthOf('source')) + allowance, 150, 230),
      right: clamp(Math.ceil(widthOf('outcome')) + allowance, 150, 230),
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
            aspectRatio={isNarrow ? '1 / 1' : '16 / 10'}
            margin={sankeyMargin}
            nodePadding={isNarrow ? 12 : 18}
          >
            <SankeyLink />
            <SankeyNode
              valueUnit={t('residents.flowsValueUnit')}
              showValueLabels={!isNarrow}
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
