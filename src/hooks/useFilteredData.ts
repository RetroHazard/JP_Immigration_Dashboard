// src/hooks/useFilteredData.ts
import { useMemo } from 'react';

import { STATUS_CODES } from '../constants/statusCodes';
import type { ImmigrationData } from './useImmigrationData';

/**
 * Filter options for immigration data
 */
export interface DataFilters {
  bureau?: string;
  type?: string;
  month?: string;
  status?: string;
}

/**
 * Pure function for filtering immigration data with consistent logic
 * Use this when you need to filter data inside loops or callbacks
 *
 * @param data - Array of immigration data entries
 * @param filters - Filter criteria to apply
 * @returns Filtered array of immigration data
 */
export const filterData = (
  data: ImmigrationData[],
  filters: DataFilters = {}
): ImmigrationData[] => {
  if (!data || data.length === 0) return [];

  const { bureau, type, month, status } = filters;

  return data.filter((entry) => {
    // Month filter: if specified, entry must match exactly
    if (month !== undefined && entry.month !== month) {
      return false;
    }

    // Bureau filter:
    // - 'all' means use only nationwide aggregate (bureau code NATIONWIDE_BUREAU)
    // - specific bureau code means match that bureau exactly
    // - undefined means include all bureaus (no filtering)
    if (bureau !== undefined) {
      if (bureau === 'all') {
        if (entry.bureau !== STATUS_CODES.NATIONWIDE_BUREAU) return false;
      } else {
        if (entry.bureau !== bureau) return false;
      }
    }

    // Type filter:
    // - 'all' means include all types (no filtering)
    // - specific type code means match that type exactly
    // - undefined means include all types (no filtering)
    if (type !== undefined && type !== 'all') {
      if (entry.type !== type) return false;
    }

    // Status filter: if specified, entry must match exactly
    if (status !== undefined && entry.status !== status) {
      return false;
    }

    return true;
  });
};

/**
 * Shared hook for filtering immigration data with consistent logic
 *
 * This hook centralizes filtering logic that was previously duplicated across
 * StatsSummary and chart components. It ensures consistent filtering behavior
 * and reduces code duplication.
 *
 * @param data - Array of immigration data entries
 * @param filters - Filter criteria to apply
 * @returns Filtered array of immigration data
 *
 * @example
 * // Filter by bureau and type
 * const filtered = useFilteredData(data, { bureau: '101170', type: '10' });
 *
 * @example
 * // Filter by month with 'all' bureau (returns only nationwide data)
 * const filtered = useFilteredData(data, { bureau: 'all', month: '2025-01' });
 */
export const useFilteredData = (
  data: ImmigrationData[],
  filters: DataFilters = {}
): ImmigrationData[] => {
  return useMemo(() => filterData(data, filters), [data, filters]);
};

/**
 * Helper function to get the most recent month from data
 * Useful for components that need to display latest month stats
 *
 * @param data - Array of immigration data entries
 * @returns Most recent month string (YYYY-MM format) or null if no data
 */
export const getLatestMonth = (data: ImmigrationData[]): string | null => {
  if (!data || data.length === 0) return null;

  const months = [...new Set(data.map((entry) => entry.month))].sort();
  return months[months.length - 1] || null;
};

/**
 * Helper function to get all unique months from data, sorted chronologically
 *
 * @param data - Array of immigration data entries
 * @returns Array of month strings (YYYY-MM format) sorted chronologically
 */
export const getAllMonths = (data: ImmigrationData[]): string[] => {
  if (!data || data.length === 0) return [];

  return [...new Set(data.map((entry) => entry.month))].sort();
};
