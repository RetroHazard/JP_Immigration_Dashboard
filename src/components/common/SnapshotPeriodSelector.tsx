// src/components/common/SnapshotPeriodSelector.tsx
// The as-of picker for stock views. A stock figure describes one period, so
// a window selector would be a lie there — the flows sankey, status
// sunburst, and world map instead choose which half-year snapshot to draw.
'use client';

import type React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useLocale } from '../../i18n/LocaleContext';
import { formatPeriod } from '../../utils/residentPeriod';

interface SnapshotPeriodSelectorProps {
  /** Every available period, newest first. */
  periods: readonly string[];
  /** Selected period, or null for the newest (kept out of the URL). */
  value: string | null;
  onChange: (period: string | null) => void;
}

export const SnapshotPeriodSelector: React.FC<SnapshotPeriodSelectorProps> = ({ periods, value, onChange }) => {
  const { t, formatters } = useLocale();
  if (periods.length === 0) return null;

  const newest = periods[0];
  const selected = value !== null && periods.includes(value) ? value : newest;

  return (
    <Select
      value={selected}
      // The newest period is the default view; picking it clears the param
      // rather than pinning the URL to a snapshot that goes stale on the
      // next data release.
      onValueChange={(period) => onChange(period === newest ? null : period)}
    >
      <SelectTrigger size="sm" aria-label={t('period.snapshotLabel')} className="w-fit gap-1.5 whitespace-nowrap">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="max-h-72">
        {periods.map((period) => (
          <SelectItem key={period} value={period}>
            {formatPeriod(period, formatters)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
