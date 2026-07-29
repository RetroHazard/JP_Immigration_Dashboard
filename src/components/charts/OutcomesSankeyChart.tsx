// src/components/charts/OutcomesSankeyChart.tsx
// NEW view: where applications end up. Application types flow into outcomes
// (granted / denied / other) on Bklit's Sankey, with an approval-rate gauge
// for the same selection alongside.
'use client';

import { useMemo } from 'react';

import type React from 'react';
import useMeasure from 'react-use-measure';

import { applicationOptions } from '../../constants/applicationOptions';
import { STATUS_CODES } from '../../constants/statusCodes';
import { bureauScopeFromFilter, getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import { Gauge } from '../bklit/charts/gauge';
import { SankeyChart } from '../bklit/charts/sankey/sankey-chart';
import { SankeyLink } from '../bklit/charts/sankey/sankey-link';
import { SankeyNode } from '../bklit/charts/sankey/sankey-node';
import { SankeyTooltip } from '../bklit/charts/sankey/sankey-tooltip';
import type { ImmigrationChartData } from '../common/ChartComponents';

const TYPES = applicationOptions.filter((option) => option.value !== 'all');
const OUTCOMES = [
  { name: 'Granted', status: STATUS_CODES.GRANTED },
  { name: 'Denied', status: STATUS_CODES.DENIED },
  { name: 'Other / Withdrawn', status: STATUS_CODES.OTHER },
];

// Bklit's Sankey reserves fixed 180px label margins per side, so a narrow
// container collapses the drawing area (and below ~360px it inverts). On
// narrow containers the chart switches to compact one-word labels, slim
// margins sized to those labels, a square aspect, and no value sublabels
// (the counts stay in the tooltip and the data table). 500 keeps the xl+
// desktop row (a ~520px slot beside the gauge) on the full treatment while
// catching phones and the tighter lg row.
const NARROW_WIDTH = 500;
const SHORT_NAMES: Record<string, string> = {
  'Status Acquisition': 'Acquisition',
  'Extension of Stay': 'Extension',
  'Change of Status': 'Change',
  'Permission for Activities': 'Permission',
  'Re-entry': 'Re-entry',
  'Permanent Residence': 'Permanent',
  'Other / Withdrawn': 'Other',
};

export const OutcomesSankeyChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const [measureRef, bounds] = useMeasure({ debounce: 10 });
  const isNarrow = bounds.width > 0 && bounds.width < NARROW_WIDTH;

  const { sankeyData, approvalRate, processed } = useMemo(() => {
    const months = monthsForRange(getAllMonths(data), range);
    // Both the flows and the gauge respect the active type filter, so e.g.
    // Permanent Residence shows its own (much lower) approval rate instead
    // of being averaged away by high-volume extensions.
    const rows = selectData(data, { scope: bureauScopeFromFilter(filters.bureau), type: filters.type }).filter(
      (entry) => months.includes(entry.month)
    );

    const displayName = (name: string) => (isNarrow ? (SHORT_NAMES[name] ?? name) : name);
    const activeTypes = filters.type === 'all' ? TYPES : TYPES.filter((type) => type.value === filters.type);
    const nodes = [
      ...activeTypes.map((type) => ({ name: displayName(type.label), category: 'source' as const })),
      ...OUTCOMES.map((outcome) => ({ name: displayName(outcome.name), category: 'outcome' as const })),
    ];
    const links: { source: number; target: number; value: number }[] = [];
    activeTypes.forEach((type, typeIndex) => {
      OUTCOMES.forEach((outcome, outcomeIndex) => {
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
  }, [data, filters.bureau, filters.type, range, isNarrow]);

  if (sankeyData.links.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        No processed applications in this period.
      </div>
    );
  }

  return (
    <div className="card-content">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div
          ref={measureRef}
          className="min-w-0 flex-1"
          role="img"
          aria-label="Sankey diagram of application types flowing to outcomes"
        >
          {bounds.width > 0 && (
            <SankeyChart
              data={sankeyData}
              aspectRatio={isNarrow ? '1 / 1' : '16 / 9'}
              margin={isNarrow ? { top: 16, right: 76, bottom: 16, left: 90 } : undefined}
              nodePadding={isNarrow ? 16 : 24}
            >
              <SankeyLink />
              <SankeyNode valueUnit="applications" showValueLabels={!isNarrow} />
              <SankeyTooltip valueLabel="Applications" />
            </SankeyChart>
          )}
        </div>
        {/* max-w cap: below lg the gauge would otherwise scale to the full
            card width and dwarf the sankey */}
        <div className="mx-auto flex w-full max-w-52 shrink-0 flex-col items-center gap-1 lg:mx-0 lg:w-52">
          <Gauge value={approvalRate} centerValue={approvalRate / 100} defaultLabel="Approval rate" totalNotches={40} formatOptions={{ style: 'percent', maximumFractionDigits: 1 }} />
          <p className="text-center text-xxs text-muted-foreground">
            of {processed.toLocaleString()} processed applications
          </p>
        </div>
      </div>
    </div>
  );
};
