// src/hooks/useImmigrationData.test.ts
import { renderHook, waitFor } from '@testing-library/react';

import { mockEStatResponse } from '../__mocks__/mockEStatData';
import { mockImmigrationData } from '../__mocks__/mockImmigrationData';
import { transformData } from '../utils/dataTransform';
import { loadLocalData } from '../utils/loadLocalData';
import { useImmigrationData } from './useImmigrationData';

// Mock the utility functions
jest.mock('../utils/loadLocalData');
jest.mock('../utils/dataTransform');

const mockedLoadLocalData = loadLocalData as jest.MockedFunction<typeof loadLocalData>;
const mockedTransformData = transformData as jest.MockedFunction<typeof transformData>;

describe('useImmigrationData', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Suppress console.error for expected errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    jest.restoreAllMocks();
  });

  describe('successful data loading', () => {
    it('should initialize with loading state', () => {
      mockedLoadLocalData.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useImmigrationData());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should load and transform data successfully', async () => {
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(mockImmigrationData);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockImmigrationData);
      expect(result.current.error).toBeNull();
      expect(mockedLoadLocalData).toHaveBeenCalledTimes(1);
      expect(mockedTransformData).toHaveBeenCalledWith(mockEStatResponse);
    });

    it('should handle empty transformed data', async () => {
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue([]);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should call loadLocalData only once on mount', async () => {
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(mockImmigrationData);

      renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(mockedLoadLocalData).toHaveBeenCalledTimes(1);
      });
    });

    it('should call transformData with loaded data', async () => {
      const customData = { ...mockEStatResponse, custom: true };
      mockedLoadLocalData.mockResolvedValue(customData);
      mockedTransformData.mockReturnValue(mockImmigrationData);

      renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(mockedTransformData).toHaveBeenCalledWith(customData);
      });
    });
  });

  describe('null data handling', () => {
    it('should set error when loadLocalData returns null', async () => {
      mockedLoadLocalData.mockResolvedValue(null);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('No data available');
    });

    it('should not call transformData when loadLocalData returns null', async () => {
      mockedLoadLocalData.mockResolvedValue(null);

      renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(mockedTransformData).not.toHaveBeenCalled();
      });
    });

    it('should set loading to false after null data', async () => {
      mockedLoadLocalData.mockResolvedValue(null);

      const { result } = renderHook(() => useImmigrationData());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('should handle loadLocalData rejection', async () => {
      const errorMessage = 'Network error';
      mockedLoadLocalData.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle transformData throwing error', async () => {
      const errorMessage = 'Transform error';
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle error without message property', async () => {
      mockedLoadLocalData.mockRejectedValue('String error');

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // When error doesn't have .message property, fallback to generic message
      expect(result.current.error).toBe('Unknown error occurred');
      expect(result.current.data).toBeNull();
    });

    it('should set error message from caught errors', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      mockedLoadLocalData.mockRejectedValue(new Error('Caught error'));

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.error).toBe('Caught error');
      });
    });

    it('should handle TypeError from loadLocalData', async () => {
      const typeError = new TypeError('Type error occurred');
      mockedLoadLocalData.mockRejectedValue(typeError);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Type error occurred');
    });
  });

  describe('loading state transitions', () => {
    it('should transition from loading to loaded', async () => {
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(mockImmigrationData);

      const { result } = renderHook(() => useImmigrationData());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should transition from loading to error', async () => {
      mockedLoadLocalData.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useImmigrationData());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should set loading to false in finally block', async () => {
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(mockImmigrationData);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading to false even when error occurs', async () => {
      mockedLoadLocalData.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('hook return values', () => {
    it('should return object with data, loading, and error', () => {
      mockedLoadLocalData.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useImmigrationData());

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
    });

    it('should have correct types for return values', async () => {
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(mockImmigrationData);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(Array.isArray(result.current.data)).toBe(true);
      expect(typeof result.current.loading).toBe('boolean');
      expect(result.current.error).toBeNull();
    });

    it('should maintain data structure after loading', async () => {
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(mockImmigrationData);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.data).toBeTruthy();
      });

      expect(result.current.data?.[0]).toHaveProperty('month');
      expect(result.current.data?.[0]).toHaveProperty('bureau');
      expect(result.current.data?.[0]).toHaveProperty('type');
      expect(result.current.data?.[0]).toHaveProperty('value');
      expect(result.current.data?.[0]).toHaveProperty('status');
    });
  });

  describe('useEffect behavior', () => {
    it('should trigger data fetch on mount', () => {
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(mockImmigrationData);

      renderHook(() => useImmigrationData());

      expect(mockedLoadLocalData).toHaveBeenCalled();
    });

    it('should not trigger data fetch on re-render', async () => {
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(mockImmigrationData);

      const { rerender } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(mockedLoadLocalData).toHaveBeenCalledTimes(1);
      });

      // Re-render the hook
      rerender();

      // Should still be called only once
      expect(mockedLoadLocalData).toHaveBeenCalledTimes(1);
    });

    it('should handle unmount gracefully', async () => {
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(mockImmigrationData);

      const { unmount } = renderHook(() => useImmigrationData());

      unmount();

      // Should not throw error
      expect(mockedLoadLocalData).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined returned from loadLocalData', async () => {
      mockedLoadLocalData.mockResolvedValue(undefined as any);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('No data available');
    });

    it('should handle empty object from loadLocalData', async () => {
      mockedLoadLocalData.mockResolvedValue({});
      mockedTransformData.mockReturnValue([]);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle very large datasets', async () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        month: '2024-01',
        bureau: '101170',
        type: '20',
        value: i,
        status: '103000',
      }));

      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(largeData);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.data?.length).toBe(10000);
      });
    });

    it('should handle slow loadLocalData response', async () => {
      mockedLoadLocalData.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockEStatResponse), 100))
      );
      mockedTransformData.mockReturnValue(mockImmigrationData);

      const { result } = renderHook(() => useImmigrationData());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 200 });

      expect(result.current.data).toEqual(mockImmigrationData);
    });

    it('should handle transformData returning single item', async () => {
      const singleItem = [mockImmigrationData[0]];
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(singleItem);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.data).toEqual(singleItem);
      });
    });

    it('should handle error with missing message property', async () => {
      mockedLoadLocalData.mockRejectedValue({ code: 404 });

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Object without message property results in generic error message
      expect(result.current.error).toBe('Unknown error occurred');
      expect(result.current.data).toBeNull();
    });

    it('should maintain referential stability of data', async () => {
      const testData = mockImmigrationData;
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(testData);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.data).toBe(testData);
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work with real-world data flow', async () => {
      // Simulate real data flow
      mockedLoadLocalData.mockResolvedValue(mockEStatResponse);
      mockedTransformData.mockReturnValue(mockImmigrationData);

      const { result } = renderHook(() => useImmigrationData());

      // Initial state
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();

      // After loading
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeTruthy();
      expect(result.current.data?.length).toBeGreaterThan(0);
      expect(result.current.error).toBeNull();
    });

    it('should handle complete error scenario', async () => {
      const error = new Error('Complete failure');
      mockedLoadLocalData.mockRejectedValue(error);

      const { result } = renderHook(() => useImmigrationData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Complete failure');
    });
  });
});
