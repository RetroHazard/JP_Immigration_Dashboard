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

  const { filteredData, sortedMonths } = useMemo(() => {
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
      <div
        style={{
          background: isDarkMode ? '#333' : '#fff',
          padding: 6,
          borderRadius: 4,
          boxShadow: '0 3px 9px rgba(0,0,0,0.15)',
          color: isDarkMode ? '#fff' : '#333',
        }}
      >
        <strong>{node.id}</strong>
        <div style={{ marginTop: 8 }}>Applications: {node.value.toLocaleString()}</div>
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
      <div className="map-container h-[250px] sm:h-[350px] md:h-[450px] md:overflow-hidden">
        <ResponsiveTreeMap
          data={chartData}
          identity="name"
          value="value"
          tile="binary"
          colors={(node) => node.data.color}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          labelSkipSize={24}
          outerPadding={5}
          innerPadding={5}
          parentLabelPadding={2}
          parentLabelPosition={'left'}
          parentLabelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          borderColor={{ from: 'color', modifiers: [['darker', isDarkMode ? 0.4 : 0.2]] }}
          nodeOpacity={0.33}
          animate={true}
          tooltip={CustomTooltip}
          enableLabel={false}
          enableParentLabel={true}
          motionConfig="gentle"
          theme={{
            tooltip: {
              container: {
                backgroundColor: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#fff' : '#333',
              },
            },
          }}
        />
      </div>
    </div>
  );
};
