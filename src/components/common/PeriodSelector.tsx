// src/components/common/PeriodSelector.tsx
// The one period selector. Replaces five copy-pasted <select> blocks that
// each offered slightly different options.
'use client';

import type React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ChartRange } from '@/utils/selectors';

const RANGE_LABELS: Record<ChartRange, string> = {
  latest: 'Latest month',
  '6': '6 months',
  '12': '12 months',
  '24': '24 months',
  '36': '36 months',
  all: 'All data',
};

interface PeriodSelectorProps {
  ranges: ChartRange[];
  value: ChartRange;
  onChange: (range: ChartRange) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ ranges, value, onChange }) => {
  if (ranges.length === 0) return null;
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ChartRange)}>
      <SelectTrigger size="sm" aria-label="Time range" className="w-fit gap-1.5 whitespace-nowrap">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {ranges.map((range) => (
          <SelectItem key={range} value={range}>
            {RANGE_LABELS[range]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
