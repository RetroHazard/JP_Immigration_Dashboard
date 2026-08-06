// src/components/common/PeriodSelector.tsx
// The one period selector. Replaces five copy-pasted <select> blocks that
// each offered slightly different options.
'use client';

import type React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ResidentRange } from '@/utils/residentsSelectors';
import type { ChartRange } from '@/utils/selectors';

import { useLocale } from '../../i18n/LocaleContext';

type AnyRange = ChartRange | ResidentRange;

interface PeriodSelectorProps {
  ranges: readonly AnyRange[];
  value: AnyRange;
  onChange: (range: AnyRange) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ ranges, value, onChange }) => {
  const { t, tPlural } = useLocale();
  if (ranges.length === 0) return null;

  // The numeric ranges are a plural family rather than fixed strings, so a
  // locale with more than two plural forms gets them right for free. The
  // residents table publishes twice a year, so its ranges are named in years
  // ('3y') — "12" there would read as twelve months and mean six years.
  const isHalfYearly = ranges.some((range) => range.endsWith('y'));
  const rangeLabel = (range: AnyRange) => {
    if (range === 'latest') return t(isHalfYearly ? 'period.latestPeriod' : 'period.latest');
    if (range === 'all') return t('period.all');
    if (range.endsWith('y')) return tPlural('period.years', Number(range.slice(0, -1)));
    return tPlural('period.months', Number(range));
  };

  return (
    <Select value={value} onValueChange={(v) => onChange(v as AnyRange)}>
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
