// src/hooks/useDataMetadata.ts
import { useMemo } from 'react';

import type { ImmigrationData } from './useImmigrationData';

/**
 * Custom hook to extract metadata from immigration data
 * Memoizes expensive operations like unique month extraction
 * Only recomputes when data changes, not when filters change
 */
export const useDataMetadata = (data: ImmigrationData[]) => {
  // Extract unique months sorted chronologically
  const uniqueMonths = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    return [...new Set(data.map((entry) => entry.month))].filter(Boolean).sort();
  }, [data]);

  // Calculate date range (min/max months)
  const dateRange = useMemo(
    () => ({
      min: uniqueMonths[0] ?? '',
      max: uniqueMonths[uniqueMonths.length - 1] ?? '',
    }),
    [uniqueMonths]
  );

  // Get most recent month
  const latestMonth = useMemo(() => uniqueMonths[uniqueMonths.length - 1] ?? '', [uniqueMonths]);

  return {
    uniqueMonths,
    dateRange,
    latestMonth,
  };
};
