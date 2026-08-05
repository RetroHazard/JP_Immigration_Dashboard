// src/components/charts/OutcomesSankeyChart.tsx
// NEW view: where applications end up. Application types flow into outcomes
// (granted / denied / other) on Bklit's Sankey, with an approval-rate gauge
// for the same selection alongside.
'use client';

import { useMemo } from 'react';

import type React from 'react';
import useMeasure from 'react-use-measure';

import { STATUS_CODES } from '../../constants/statusCodes';
import { useLocale } from '../../i18n/LocaleContext';
import { useApplicationOptions } from '../../i18n/useDomainLabels';
import { bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import { measureLabelWidth } from '../bklit/charts/chart-formatters';
import { Gauge } from '../bklit/charts/gauge';
import { SankeyChart } from '../bklit/charts/sankey/sankey-chart';
import { SankeyLink } from '../bklit/charts/sankey/sankey-link';
import { SankeyNode } from '../bklit/charts/sankey/sankey-node';
import { SankeyTooltip } from '../bklit/charts/sankey/sankey-tooltip';
import type { ImmigrationChartData } from '../common/ChartComponents';

const OUTCOMES = [
  { labelKey: 'metric.granted', compactKey: 'metric.granted', status: STATUS_CODES.GRANTED },
  { labelKey: 'metric.denied', compactKey: 'metric.denied', status: STATUS_CODES.DENIED },
  { labelKey: 'chart.outcomes.otherWithdrawn', compactKey: 'metric.other', status: STATUS_CODES.OTHER },
] as const;

// Bklit's Sankey reserves fixed 180px label margins per side, so a narrow
// container collapses the drawing area (and below ~360px it inverts). On
// narrow containers the chart switches to compact one-word labels, slim
// margins sized to those labels, a square aspect, and no value sublabels
// (the counts stay in the tooltip and the data table). 500 keeps the xl+
// desktop row (a ~520px slot beside the gauge) on the full treatment while
// catching phones and the tighter lg row.
const NARROW_WIDTH = 500;

export const OutcomesSankeyChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const [measureRef, bounds] = useMeasure({ debounce: 10 });
  const isNarrow = bounds.width > 0 && bounds.width < NARROW_WIDTH;
  const { t, formatters } = useLocale();
  const applicationOptions = useApplicationOptions();
  const types = useMemo(() => applicationOptions.filter((option) => option.value !== 'all'), [applicationOptions]);
  const outcomes = useMemo(
    () => OUTCOMES.map((outcome) => ({ ...outcome, label: t(outcome.labelKey), compact: t(outcome.compactKey) })),
    [t]
  );

  const { sankeyData, approvalRate, processed } = useMemo(() => {
    const months = monthsForRange(getAllMonths(data), range);
    // Both the flows and the gauge respect the active type filter, so e.g.
    // Permanent Residence shows its own (much lower) approval rate instead
    // of being averaged away by high-volume extensions.
    const rows = selectData(data, { scope: bureauScopeFromFilter(filters.bureau), type: filters.type }).filter(
      (entry) => months.includes(entry.month)
    );

    // Narrow containers get the one-word forms, which each option now carries
    // itself rather than being looked up by its English label.
    const displayName = (entry: { label: string; compact: string }) => (isNarrow ? entry.compact : entry.label);
    const activeTypes = filters.type === 'all' ? types : types.filter((type) => type.value === filters.type);
    const nodes = [
      ...activeTypes.map((type) => ({ name: displayName(type), category: 'source' as const })),
      ...outcomes.map((outcome) => ({ name: displayName(outcome), category: 'outcome' as const })),
    ];
    const links: { source: number; target: number; value: number }[] = [];
    activeTypes.forEach((type, typeIndex) => {
      outcomes.forEach((outcome, outcomeIndex) => {
        const value = rows.reduce(
          (sum, entry) => (entry.type === type.value && entry.status === outcome.status ? sum + entry.value : sum),
          0
        );
        if (value > 0) {
          links.push({ source: typeIndex, target: activeTypes.length + outcomeIndex, value });
        }
      });
    });

    const sumStatus = (status: string) =>
      rows.reduce((sum, entry) => (entry.status === status ? sum + entry.value : sum), 0);
    const granted = sumStatus(STATUS_CODES.GRANTED);
    const totalProcessed = sumStatus(STATUS_CODES.PROCESSED);

    return {
      sankeyData: { nodes, links },
      approvalRate: totalProcessed > 0 ? (granted / totalProcessed) * 100 : 0,
      processed: totalProcessed,
    };
  }, [data, filters.bureau, filters.type, range, isNarrow, types, outcomes]);

  // Node labels are real translated strings (bureau/application-type/outcome
  // names), not fixed English words — a German compound noun or a longer
  // Portuguese/Spanish outcome name can run past the vendored Sankey's fixed
  // 180px label margin and clip against the SVG edge. Size the margin from
  // what's actually rendering this pass instead of trusting a constant.
  const sankeyMargin = useMemo(() => {
    // Matches sankey-node.tsx's name-label styling ("font-medium text-[13px]").
    const nodeLabelFont =
      '500 13px -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Hiragino Sans", "Yu Gothic UI", sans-serif';
    const widthOf = (category: 'source' | 'outcome') =>
      sankeyData.nodes
        .filter((node) => node.category === category)
        .reduce((max, node) => Math.max(max, measureLabelWidth(node.name, nodeLabelFont)), 0);
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    // sankey-node.tsx's LABEL_OFFSET (12px gap from the node edge) plus a
    // little breathing room before the SVG boundary.
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
      top: 40,
      bottom: 40,
      left: clamp(Math.ceil(widthOf('source')) + allowance, 150, 230),
      right: clamp(Math.ceil(widthOf('outcome')) + allowance, 150, 230),
    };
  }, [sankeyData, isNarrow]);

  if (sankeyData.links.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        {t('chart.outcomes.empty')}
      </div>
    );
  }

  return (
    <div className="chart-card-content">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div
          ref={measureRef}
          className="min-w-0 flex-1"
          role="img"
          aria-label={t('charts.outcomes.aria')}
        >
          {bounds.width > 0 && (
            <SankeyChart
              data={sankeyData}
              aspectRatio={isNarrow ? '1 / 1' : '16 / 9'}
              margin={sankeyMargin}
              nodePadding={isNarrow ? 16 : 24}
            >
              <SankeyLink />
              <SankeyNode valueUnit={t('chart.outcomes.valueUnit')} showValueLabels={!isNarrow} />
              <SankeyTooltip
                valueLabel={t('chart.outcomes.tooltipValueLabel')}
                linkLabel={t('chart.outcomes.tooltipFlowLabel')}
              />
            </SankeyChart>
          )}
        </div>
        {/* max-w cap: below lg the gauge would otherwise scale to the full
            card width and dwarf the sankey */}
        <div className="mx-auto flex w-full max-w-52 shrink-0 flex-col items-center gap-1 lg:mx-0 lg:w-52">
          <Gauge value={approvalRate} centerValue={approvalRate / 100} defaultLabel={t('chart.outcomes.approvalRate')} totalNotches={40} formatOptions={{ style: 'percent', maximumFractionDigits: 1 }} />
          <p className="text-center text-xxs text-muted-foreground">
            {t('chart.outcomes.ofProcessed', { count: formatters.number(processed) })}
          </p>
        </div>
      </div>
    </div>
  );
};
