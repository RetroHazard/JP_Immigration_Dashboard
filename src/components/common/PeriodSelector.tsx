// src/components/common/PeriodSelector.tsx
// The one period selector. Replaces five copy-pasted <select> blocks that
// each offered slightly different options.
'use client';

import type React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ChartRange } from '@/utils/selectors';

import { useLocale } from '../../i18n/LocaleContext';

interface PeriodSelectorProps {
  ranges: ChartRange[];
  value: ChartRange;
  onChange: (range: ChartRange) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ ranges, value, onChange }) => {
  const { t, tPlural } = useLocale();
  if (ranges.length === 0) return null;

  // The numeric ranges are a plural family rather than four fixed strings, so
  // a locale with more than two plural forms gets them right for free.
  const rangeLabel = (range: ChartRange) => {
    if (range === 'latest') return t('period.latest');
    if (range === 'all') return t('period.all');
    return tPlural('period.months', Number(range));
  };

  return (
    <Select value={value} onValueChange={(v) => onChange(v as ChartRange)}>
      <SelectTrigger size="sm" aria-label={t('period.label')} className="w-fit gap-1.5 whitespace-nowrap">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {ranges.map((range) => (
          <SelectItem key={range} value={range}>
            {rangeLabel(range)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
