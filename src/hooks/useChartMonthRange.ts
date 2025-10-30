// src/hooks/useChartMonthRange.ts
import { useMemo, useState } from 'react';

import type { ImmigrationData } from './useImmigrationData';

interface UseChartMonthRangeOptions {
  data: ImmigrationData[];
  defaultRange?: number;
}

interface UseChartMonthRangeReturn {
  months: string[];
  monthRange: number;
  setMonthRange: (range: number) => void;
  showAllMonths: boolean;
  setShowAllMonths: (show: boolean) => void;
}

/**
 * Custom hook for managing month range selection in chart components
 *
 * @param data - Immigration data array
 * @param defaultRange - Default number of months to display (default: 12)
 * @returns Object containing months array and month range controls
 */
export const useChartMonthRange = ({
  data,
  defaultRange = 12,
}: UseChartMonthRangeOptions): UseChartMonthRangeReturn => {
  const [monthRange, setMonthRange] = useState(defaultRange);
  const [showAllMonths, setShowAllMonths] = useState(false);

  const months = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get the most recent month from the data
    const endMonth = [...new Set(data.map((entry) => entry.month))].sort().reverse()[0];

    // Get all months from data
    const allMonths = [...new Set(data.map((entry) => entry.month))].sort();

    // Find index of the most recent month
    const endIndex = allMonths.indexOf(endMonth);
    if (endIndex === -1) return [];

    // Get months based on range
    if (showAllMonths) {
      return allMonths;
    }

    const startIndex = Math.max(0, endIndex - (monthRange - 1));
    return allMonths.slice(startIndex, endIndex + 1);
  }, [data, monthRange, showAllMonths]);

  return {
    months,
    monthRange,
    setMonthRange,
    showAllMonths,
    setShowAllMonths,
  };
};
