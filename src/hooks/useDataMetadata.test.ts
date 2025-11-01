// src/hooks/useDataMetadata.test.ts
import { renderHook } from '@testing-library/react';

import { useDataMetadata } from './useDataMetadata';
import type { ImmigrationData } from './useImmigrationData';

describe('useDataMetadata', () => {
  const mockData: ImmigrationData[] = [
    { month: '2024-01', bureau: '101170', type: '20', status: '100000', value: 100 } as ImmigrationData,
    { month: '2024-03', bureau: '101460', type: '30', status: '103000', value: 200 } as ImmigrationData,
    { month: '2024-02', bureau: '101350', type: '10', status: '300000', value: 150 } as ImmigrationData,
    { month: '2024-03', bureau: '101170', type: '20', status: '100000', value: 120 } as ImmigrationData,
  ];

  describe('uniqueMonths', () => {
    it('should return unique months sorted chronologically', () => {
      const { result } = renderHook(() => useDataMetadata(mockData));

      expect(result.current.uniqueMonths).toEqual(['2024-01', '2024-02', '2024-03']);
    });

    it('should return empty array for empty data', () => {
      const { result } = renderHook(() => useDataMetadata([]));

      expect(result.current.uniqueMonths).toEqual([]);
    });

    it('should return empty array for null data', () => {
      const { result } = renderHook(() => useDataMetadata(null as unknown as ImmigrationData[]));

      expect(result.current.uniqueMonths).toEqual([]);
    });

    it('should return empty array for undefined data', () => {
      const { result } = renderHook(() => useDataMetadata(undefined as unknown as ImmigrationData[]));

      expect(result.current.uniqueMonths).toEqual([]);
    });

    it('should filter out falsy month values', () => {
      const dataWithFalsyMonths: ImmigrationData[] = [
        { month: '2024-01', bureau: '101170', type: '20', status: '100000', value: 100 } as ImmigrationData,
        { month: '', bureau: '101460', type: '30', status: '103000', value: 200 } as ImmigrationData,
        { month: '2024-03', bureau: '101350', type: '10', status: '300000', value: 150 } as ImmigrationData,
      ];

      const { result } = renderHook(() => useDataMetadata(dataWithFalsyMonths));

      expect(result.current.uniqueMonths).toEqual(['2024-01', '2024-03']);
    });

    it('should handle single month', () => {
      const singleMonth: ImmigrationData[] = [
        { month: '2024-06', bureau: '101170', type: '20', status: '100000', value: 100 } as ImmigrationData,
      ];

      const { result } = renderHook(() => useDataMetadata(singleMonth));

      expect(result.current.uniqueMonths).toEqual(['2024-06']);
    });

    it('should handle duplicate months', () => {
      const duplicateMonths: ImmigrationData[] = [
        { month: '2024-01', bureau: '101170', type: '20', status: '100000', value: 100 } as ImmigrationData,
        { month: '2024-01', bureau: '101460', type: '30', status: '103000', value: 200 } as ImmigrationData,
        { month: '2024-01', bureau: '101350', type: '10', status: '300000', value: 150 } as ImmigrationData,
      ];

      const { result } = renderHook(() => useDataMetadata(duplicateMonths));

      expect(result.current.uniqueMonths).toEqual(['2024-01']);
    });
  });

  describe('dateRange', () => {
    it('should return correct min and max dates', () => {
      const { result } = renderHook(() => useDataMetadata(mockData));

      expect(result.current.dateRange).toEqual({
        min: '2024-01',
        max: '2024-03',
      });
    });

    it('should return empty strings for empty data', () => {
      const { result } = renderHook(() => useDataMetadata([]));

      expect(result.current.dateRange).toEqual({
        min: '',
        max: '',
      });
    });

    it('should handle single month', () => {
      const singleMonth: ImmigrationData[] = [
        { month: '2024-06', bureau: '101170', type: '20', status: '100000', value: 100 } as ImmigrationData,
      ];

      const { result } = renderHook(() => useDataMetadata(singleMonth));

      expect(result.current.dateRange).toEqual({
        min: '2024-06',
        max: '2024-06',
      });
    });

    it('should handle unsorted data correctly', () => {
      const unsortedData: ImmigrationData[] = [
        { month: '2024-12', bureau: '101170', type: '20', status: '100000', value: 100 } as ImmigrationData,
        { month: '2024-01', bureau: '101460', type: '30', status: '103000', value: 200 } as ImmigrationData,
        { month: '2024-06', bureau: '101350', type: '10', status: '300000', value: 150 } as ImmigrationData,
      ];

      const { result } = renderHook(() => useDataMetadata(unsortedData));

      expect(result.current.dateRange).toEqual({
        min: '2024-01',
        max: '2024-12',
      });
    });
  });

  describe('latestMonth', () => {
    it('should return the most recent month', () => {
      const { result } = renderHook(() => useDataMetadata(mockData));

      expect(result.current.latestMonth).toBe('2024-03');
    });

    it('should return empty string for empty data', () => {
      const { result } = renderHook(() => useDataMetadata([]));

      expect(result.current.latestMonth).toBe('');
    });

    it('should handle single month', () => {
      const singleMonth: ImmigrationData[] = [
        { month: '2024-06', bureau: '101170', type: '20', status: '100000', value: 100 } as ImmigrationData,
      ];

      const { result } = renderHook(() => useDataMetadata(singleMonth));

      expect(result.current.latestMonth).toBe('2024-06');
    });
  });

  describe('memoization', () => {
    it('should memoize results when data does not change', () => {
      const { result, rerender } = renderHook(({ data }) => useDataMetadata(data), {
        initialProps: { data: mockData },
      });

      const firstUniqueMonths = result.current.uniqueMonths;
      const firstDateRange = result.current.dateRange;
      const firstLatestMonth = result.current.latestMonth;

      // Re-render with same data
      rerender({ data: mockData });

      // Results should be referentially equal (same object)
      expect(result.current.uniqueMonths).toBe(firstUniqueMonths);
      expect(result.current.dateRange).toBe(firstDateRange);
      expect(result.current.latestMonth).toBe(firstLatestMonth);
    });

    it('should recompute when data changes', () => {
      const { result, rerender } = renderHook(({ data }) => useDataMetadata(data), {
        initialProps: { data: mockData },
      });

      const firstUniqueMonths = result.current.uniqueMonths;

      // Re-render with different data
      const newData: ImmigrationData[] = [
        { month: '2025-01', bureau: '101170', type: '20', status: '100000', value: 100 } as ImmigrationData,
      ];
      rerender({ data: newData });

      // Results should be different
      expect(result.current.uniqueMonths).not.toBe(firstUniqueMonths);
      expect(result.current.uniqueMonths).toEqual(['2025-01']);
    });
  });

  describe('edge cases', () => {
    it('should handle non-array data gracefully', () => {
      const { result } = renderHook(() => useDataMetadata('not-an-array' as unknown as ImmigrationData[]));

      expect(result.current.uniqueMonths).toEqual([]);
      expect(result.current.dateRange).toEqual({ min: '', max: '' });
      expect(result.current.latestMonth).toBe('');
    });

    it('should handle array with objects missing month property', () => {
      const invalidData = [{ bureau: '101170' }] as unknown as ImmigrationData[];

      const { result } = renderHook(() => useDataMetadata(invalidData));

      expect(result.current.uniqueMonths).toEqual([]);
    });

    it('should handle very large datasets efficiently', () => {
      // Create a large dataset with 10000 entries
      const largeData: ImmigrationData[] = Array.from({ length: 10000 }, (_, i) => ({
        month: `2024-${String((i % 12) + 1).padStart(2, '0')}`,
        bureau: '101170',
        type: '20',
        status: '100000',
        value: i,
      })) as ImmigrationData[];

      const startTime = performance.now();
      const { result } = renderHook(() => useDataMetadata(largeData));
      const endTime = performance.now();

      // Should complete in under 100ms even for large datasets
      expect(endTime - startTime).toBeLessThan(100);
      expect(result.current.uniqueMonths).toHaveLength(12);
    });
  });
});
