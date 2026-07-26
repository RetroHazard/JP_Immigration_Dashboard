// src/components/charts/BureauDistributionRingChart.tsx
// Bureau Share on Bklit's PieChart as a donut: top bureaus by intake volume
// plus an explicit "Other" fold (the categorical palette carries 8 slots;
// past that, more slices would stop being distinguishable anyway).
'use client';

import { useMemo, useState } from 'react';

import type React from 'react';

import { bureauOptions } from '../../constants/bureauOptions';
import { STATUS_CODES } from '../../constants/statusCodes';
import { getAllMonths, monthsForRange, selectData } from '../../utils/selectors';
import { PieCenter } from '../bklit/charts/pie-center';
import { PieChart } from '../bklit/charts/pie-chart';
import { PieSlice } from '../bklit/charts/pie-slice';
import type { ImmigrationChartData } from '../common/ChartComponents';

const TOP_SLICES = 7;
const SLICE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--muted-foreground)', // "Other"
];

export const BureauDistributionRingChart: React.FC<ImmigrationChartData> = ({ data, filters, range }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { slices, total } = useMemo(() => {
    const months = monthsForRange(getAllMonths(data), range);
    // Per-bureau breakdown: aggregate row excluded, active type filter applied.
    const rows = selectData(data, { scope: { kind: 'eachBureau' }, type: filters.type }).filter(
      (entry) =>
        months.includes(entry.month) &&
        (entry.status === STATUS_CODES.OLD_APPLICATIONS || entry.status === STATUS_CODES.NEW_APPLICATIONS)
    );

    const byBureau = bureauOptions
      .filter((bureau) => bureau.value !== 'all')
      .map((bureau) => ({
        label: bureau.label,
        value: rows.reduce((sum, entry) => (entry.bureau === bureau.value ? sum + entry.value : sum), 0),
      }))
      .filter((bureau) => bureau.value > 0)
      .sort((a, b) => b.value - a.value);

    const top = byBureau.slice(0, TOP_SLICES);
    const rest = byBureau.slice(TOP_SLICES);
    const otherTotal = rest.reduce((sum, bureau) => sum + bureau.value, 0);
    const result = otherTotal > 0 ? [...top, { label: `Other (${rest.length})`, value: otherTotal }] : top;

    return {
      slices: result.map((slice, index) => ({ ...slice, color: SLICE_COLORS[index] })),
      total: byBureau.reduce((sum, bureau) => sum + bureau.value, 0),
    };
  }, [data, filters.type, range]);

  if (slices.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        No data for this combination of filters.
      </div>
    );
  }

  return (
    <div className="card-content">
      <div
        className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10"
        role="img"
        aria-label="Donut chart of each bureau's share of received applications"
      >
        <div className="max-w-[320px] flex-1">
          <PieChart
            data={slices}
            innerRadius={62}
            padAngle={0.015}
            cornerRadius={3}
            hoveredIndex={hoveredIndex}
            onHoverChange={setHoveredIndex}
          >
            {slices.map((slice, index) => (
              <PieSlice key={slice.label} index={index} color={slice.color} />
            ))}
            <PieCenter defaultLabel="Applications" />
          </PieChart>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-1">
          {slices.map((slice, index) => (
            <li
              key={slice.label}
              className={`flex cursor-default items-center gap-2 transition-opacity ${
                hoveredIndex !== null && hoveredIndex !== index ? 'opacity-40' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span aria-hidden="true" className="size-2.5 rounded-[3px]" style={{ backgroundColor: slice.color }} />
              <span className="text-secondary-foreground">{slice.label}</span>
              <span className="ml-auto font-semibold tabular-nums text-foreground">
                {total ? ((slice.value / total) * 100).toFixed(1) : 0}%
              </span>
              <span className="w-16 text-right tabular-nums text-muted-foreground">
                {slice.value.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
