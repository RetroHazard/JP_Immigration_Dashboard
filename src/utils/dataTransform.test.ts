// src/utils/dataTransform.test.ts
import { transformData } from './dataTransform';
import { mockEStatResponse, mockEStatMinimal, mockEStatEmpty } from '../__mocks__/mockEStatData';

describe('dataTransform', () => {
  describe('transformData', () => {
    it('should transform e-Stat data to ImmigrationData format', () => {
      const result = transformData(mockEStatResponse);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check structure of first item
      const firstItem = result[0];
      expect(firstItem).toHaveProperty('month');
      expect(firstItem).toHaveProperty('bureau');
      expect(firstItem).toHaveProperty('type');
      expect(firstItem).toHaveProperty('value');
      expect(firstItem).toHaveProperty('status');
    });

    it('should convert time code to YYYY-MM format', () => {
      const result = transformData(mockEStatMinimal);

      expect(result).toHaveLength(1);
      expect(result[0].month).toBe('2024-01');
    });

    it('should extract bureau code from @cat03', () => {
      const result = transformData(mockEStatMinimal);

      expect(result[0].bureau).toBe('101170');
    });

    it('should extract application type from @cat02', () => {
      const result = transformData(mockEStatMinimal);

      expect(result[0].type).toBe('20');
    });

    it('should extract status code from @cat01', () => {
      const result = transformData(mockEStatMinimal);

      expect(result[0].status).toBe('103000');
    });

    it('should parse value from $ field', () => {
      const result = transformData(mockEStatMinimal);

      expect(result[0].value).toBe(1000);
    });

    it('should handle array of VALUE objects', () => {
      const result = transformData(mockEStatResponse);

      // mockEStatResponse has multiple VALUE entries
      expect(result.length).toBeGreaterThan(1);
    });

    it('should handle single VALUE object', () => {
      const result = transformData(mockEStatMinimal);

      expect(result).toHaveLength(1);
    });

    it('should return empty array for empty VALUE', () => {
      const result = transformData(mockEStatEmpty);

      expect(result).toEqual([]);
    });

    it('should return empty array for malformed data', () => {
      const malformedData = {
        GET_STATS_DATA: {
          STATISTICAL_DATA: {},
        },
      };

      const result = transformData(malformedData as any);

      expect(result).toEqual([]);
    });

    it('should handle missing DATA_INF gracefully', () => {
      const invalidData = {
        GET_STATS_DATA: {
          STATISTICAL_DATA: {
            DATA_INF: null,
          },
        },
      };

      const result = transformData(invalidData as any);

      expect(result).toEqual([]);
    });

    it('should process multiple months of data', () => {
      const result = transformData(mockEStatResponse);

      // Extract unique months
      const months = new Set(result.map((item) => item.month));

      expect(months.size).toBeGreaterThan(1);
      expect(months.has('2024-01')).toBe(true);
      expect(months.has('2024-02')).toBe(true);
    });

    it('should process multiple bureaus', () => {
      const result = transformData(mockEStatResponse);

      // Extract unique bureaus
      const bureaus = new Set(result.map((item) => item.bureau));

      expect(bureaus.size).toBeGreaterThan(1);
      expect(bureaus.has('101170')).toBe(true); // Shinagawa
      expect(bureaus.has('101460')).toBe(true); // Osaka
    });

    it('should process multiple application types', () => {
      const result = transformData(mockEStatResponse);

      // Extract unique types
      const types = new Set(result.map((item) => item.type));

      expect(types.size).toBeGreaterThan(1);
      expect(types.has('20')).toBe(true); // Extension
      expect(types.has('30')).toBe(true); // Change of Status
      expect(types.has('60')).toBe(true); // Permanent Residence
    });

    it('should process multiple status codes', () => {
      const result = transformData(mockEStatResponse);

      // Extract unique statuses
      const statuses = new Set(result.map((item) => item.status));

      expect(statuses.size).toBe(3);
      expect(statuses.has('100000')).toBe(true); // Carried over
      expect(statuses.has('103000')).toBe(true); // New applications
      expect(statuses.has('300000')).toBe(true); // Processed
    });
  });
});
