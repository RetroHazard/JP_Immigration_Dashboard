// src/components/charts/BureauDistributionTreemap.tsx
import { useMemo, useState } from 'react';

import type React from 'react';
import { ResponsiveTreeMap } from '@nivo/treemap';

import { applicationOptions } from '../../constants/applicationOptions';
import { bureauOptions } from '../../constants/bureauOptions';
import type { ImmigrationChartData } from '../common/ChartComponents';

interface CustomNode {
  id: string;
  value: number;
  color: string;
  parent?: CustomNode;
  data: {
    rootTotal?: number;
    color: string;
  };
  depth: number;
}

export const BureauDistributionTreemap: React.FC<ImmigrationChartData> = ({ data, filters, isDarkMode }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1');

  const { filteredData } = useMemo(() => {
    if (!data?.length) return { sortedMonths: [], filteredData: [] };

    const sortedMonths = [...new Set(data.map((entry) => entry.month))].sort();
    const period = parseInt(selectedPeriod, 10);
    const selectedMonths = selectedPeriod === 'all' ? sortedMonths : sortedMonths.slice(-period);

    const filtered = data.filter(
      (entry) =>
        selectedMonths.includes(entry.month) &&
        (filters.type === 'all' || entry.type === filters.type) &&
        (entry.status === '102000' || entry.status === '103000') // Status filter
    );

    return { sortedMonths, filteredData: filtered };
  }, [data, selectedPeriod, filters.type]);

  const chartData = useMemo(() => {
    if (!filteredData.length) return { name: 'root', children: [] };

    // Initialize bureau structure with all application types
    const bureauData = bureauOptions.reduce(
      (acc, bureau) => {
        if (bureau.value !== 'all') {
          acc[bureau.value] = {
            name: bureau.label,
            color: bureau.background,
            value: 0, // Bureau total
            children: applicationOptions
              .filter((opt) => opt.value !== 'all')
              .map((opt) => ({
                name: opt.label,
                value: 0,
                color: bureau.background,
              })),
          };
        }
        return acc;
      },
      {} as Record<string, any>
    );

    // Aggregate values directly into structured format
    filteredData.forEach((entry) => {
      const bureau = bureauData[entry.bureau];
      if (!bureau) return;

      const appType = applicationOptions.find((opt) => opt.value === entry.type);
      if (appType) {
        const typeNode = bureau.children.find((c: any) => c.name === appType.label);
        if (typeNode) {
          typeNode.value += entry.value;
          bureau.value = entry.value;
        }
      }
    });

    // Calculate root total for percentage calculations
    const rootTotal = Object.values(bureauData).reduce((sum: number, b: any) => sum + b.value, 0);

    return {
      name: 'Applications',
      rootTotal, // Store at root for tooltip access
      children: Object.values(bureauData)
        .filter((b: any) => b.value > 0)
        .map((bureau: any) => ({
          ...bureau,
          children: bureau.children.filter((c: any) => c.value > 0),
        })),
    };
  }, [filteredData]);

  const CustomTooltip = ({ node }: { node: CustomNode }) => {
    const total = node.depth === 1 ? chartData.rootTotal : node.parent?.value;

    return (
      <div className="rounded-md bg-gray-600 px-2 py-1 text-xs text-white shadow-xl dark:bg-gray-300 dark:text-gray-600">
        <strong className="mb-2 block">{node.id}</strong>
        <div className="space-y-1">
          <div>Applications: {node.value.toLocaleString()}</div>
          <div>{total}% of total applications</div>
        </div>
      </div>
    );
  };

  return (
    <div className="card-content">
      <div className="mb-4 flex h-full items-center justify-between">
        <div className="section-title">Bureau Distribution</div>
        <select
          className="chart-filter-select"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="1">Latest</option>
          <option value="6">6 Months</option>
          <option value="12">12 Months</option>
          <option value="24">24 Months</option>
          <option value="36">36 Months</option>
          <option value="all">All Data</option>
        </select>
      </div>
      <div className="map-container h-[350px] rounded-lg sm:h-[450px] md:h-[550px] md:overflow-hidden">
        <ResponsiveTreeMap
          data={chartData}
          identity="name"
          value="value"
          tile="binary"
          colors={(node) => node.data.color}
          labelSkipSize={24}
          outerPadding={0}
          innerPadding={0}
          parentLabelPadding={3}
          parentLabelPosition={'top'}
          parentLabelTextColor={{ from: 'color', modifiers: [[isDarkMode ? 'brighter' : 'darker', 2]] }}
          borderColor={{ from: 'color', modifiers: [[isDarkMode ? 'brighter' : 'darker', 1]] }}
          nodeOpacity={0.33}
          animate={true}
          tooltip={CustomTooltip}
          enableLabel={false}
          enableParentLabel={true}
          motionConfig="gentle"
        />
      </div>
    </div>
  );
};
