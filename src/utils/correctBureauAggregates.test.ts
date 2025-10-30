// src/utils/correctBureauAggregates.test.ts
import { mockEStatMinimal,mockEStatResponse } from '../__mocks__/mockEStatData';
import { type EStatData, type EStatValue,makeCorrectedAccessor } from './correctBureauAggregates';

describe('correctBureauAggregates', () => {
  describe('makeCorrectedAccessor', () => {
    it('should create accessor with correct methods', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      expect(accessor).toHaveProperty('getCorrectedValue');
      expect(accessor).toHaveProperty('isAggregateBureauCode');
      expect(accessor).toHaveProperty('getBranchCodes');
      expect(accessor).toHaveProperty('dimKeys');
      expect(typeof accessor.getCorrectedValue).toBe('function');
      expect(typeof accessor.isAggregateBureauCode).toBe('function');
      expect(typeof accessor.getBranchCodes).toBe('function');
      expect(Array.isArray(accessor.dimKeys)).toBe(true);
    });

    it('should extract correct dimension keys from data', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      expect(accessor.dimKeys).toContain('@time');
      expect(accessor.dimKeys).toContain('@cat01');
      expect(accessor.dimKeys).toContain('@cat02');
      expect(accessor.dimKeys).toContain('@cat03');
      expect(accessor.dimKeys).not.toContain('$');
      expect(accessor.dimKeys).not.toContain('@unit');
    });

    it('should handle single VALUE object', () => {
      const accessor = makeCorrectedAccessor(mockEStatMinimal as EStatData);

      expect(accessor).toBeDefined();
      expect(accessor.dimKeys.length).toBeGreaterThan(0);
    });
  });

  describe('getCorrectedValue', () => {
    it('should return original value for non-aggregate bureaus', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      // Yokohama (101210) is not an aggregate bureau
      const coord: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '101210', // Yokohama
        '@cat02': '20',
        '@cat01': '100000',
      };

      const value = accessor.getCorrectedValue(coord);
      expect(value).toBe(3000);
    });

    it('should subtract branch values for Shinagawa aggregate bureau', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      // Shinagawa (101170) is an aggregate bureau with branches: Yokohama, Narita, Haneda
      const coord: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '101170', // Shinagawa (aggregate)
        '@cat02': '20',
        '@cat01': '100000',
      };

      const value = accessor.getCorrectedValue(coord);

      // Original: 15000
      // Branches: Yokohama (3000) + Narita (500) + Haneda (400) = 3900
      // Corrected: 15000 - 3900 = 11100
      expect(value).toBe(11100);
    });

    it('should subtract branch values for Osaka aggregate bureau', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      // Osaka (101460) is an aggregate bureau with branches: Kansai Airport, Kobe
      const coord: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '101460', // Osaka (aggregate)
        '@cat02': '20',
        '@cat01': '100000',
      };

      const value = accessor.getCorrectedValue(coord);

      // Original: 8000
      // Branches: Kansai Airport (600) + Kobe (1200) = 1800
      // Corrected: 8000 - 1800 = 6200
      expect(value).toBe(6200);
    });

    it('should handle different status codes for same aggregate', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      // Shinagawa - New applications (103000)
      const newAppsCoord: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '101170',
        '@cat02': '20',
        '@cat01': '103000',
      };

      const newAppsValue = accessor.getCorrectedValue(newAppsCoord);

      // Original: 8000
      // Branches: Yokohama (1500) + Narita (300) + Haneda (200) = 2000
      // Corrected: 8000 - 2000 = 6000
      expect(newAppsValue).toBe(6000);

      // Shinagawa - Processed (300000)
      const processedCoord: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '101170',
        '@cat02': '20',
        '@cat01': '300000',
      };

      const processedValue = accessor.getCorrectedValue(processedCoord);

      // Original: 7500
      // Branches: Yokohama (1400) + Narita (280) + Haneda (190) = 1870
      // Corrected: 7500 - 1870 = 5630
      expect(processedValue).toBe(5630);
    });

    it('should handle different application types for same aggregate', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      // Shinagawa - Change of Status (30) - carried over
      const coord: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '101170',
        '@cat02': '30', // Change of Status
        '@cat01': '100000',
      };

      const value = accessor.getCorrectedValue(coord);

      // Since mock data doesn't have branch data for type 30,
      // the correction should return the base value
      expect(value).toBe(5000);
    });

    it('should return NaN for missing coordinates', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      const coord: Partial<EStatValue> = {
        '@time': '9999999999', // Non-existent time
        '@cat03': '101170',
        '@cat02': '20',
        '@cat01': '100000',
      };

      const value = accessor.getCorrectedValue(coord);
      expect(Number.isNaN(value)).toBe(true);
    });

    it('should return NaN for invalid bureau code', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      const coord: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '999999', // Non-existent bureau
        '@cat02': '20',
        '@cat01': '100000',
      };

      const value = accessor.getCorrectedValue(coord);
      expect(Number.isNaN(value)).toBe(true);
    });

    it('should memoize results for performance', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      const coord: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '101170',
        '@cat02': '20',
        '@cat01': '100000',
      };

      // First call - calculates
      const value1 = accessor.getCorrectedValue(coord);

      // Second call - should return memoized value
      const value2 = accessor.getCorrectedValue(coord);

      expect(value1).toBe(value2);
      expect(value1).toBe(11100);
    });

    it('should handle partial branch data gracefully', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      // Shinagawa - Permanent Residence (60) - has data but no branch data
      const coord: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '101170',
        '@cat02': '60', // Permanent Residence
        '@cat01': '100000',
      };

      const value = accessor.getCorrectedValue(coord);

      // Since branches don't have data for this type, subtotal is 0
      // Returns base value: 12000
      expect(value).toBe(12000);
    });

    it('should work correctly across different time periods', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      // Shinagawa - February 2024
      const coord: Partial<EStatValue> = {
        '@time': '2024000802', // February
        '@cat03': '101170',
        '@cat02': '20',
        '@cat01': '100000',
      };

      const value = accessor.getCorrectedValue(coord);

      // February data doesn't have branch entries in mock
      // So it should return the base value
      expect(value).toBe(15500);
    });
  });

  describe('isAggregateBureauCode', () => {
    it('should identify Shinagawa as aggregate bureau', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      expect(accessor.isAggregateBureauCode('101170')).toBe(true);
    });

    it('should identify Osaka as aggregate bureau', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      expect(accessor.isAggregateBureauCode('101460')).toBe(true);
    });

    it('should identify Nagoya as aggregate bureau', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      expect(accessor.isAggregateBureauCode('101350')).toBe(true);
    });

    it('should identify Fukuoka as aggregate bureau', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      expect(accessor.isAggregateBureauCode('101720')).toBe(true);
    });

    it('should return false for branch bureaus', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      expect(accessor.isAggregateBureauCode('101210')).toBe(false); // Yokohama
      expect(accessor.isAggregateBureauCode('101190')).toBe(false); // Narita
      expect(accessor.isAggregateBureauCode('101200')).toBe(false); // Haneda
      expect(accessor.isAggregateBureauCode('101480')).toBe(false); // Kansai Airport
      expect(accessor.isAggregateBureauCode('101490')).toBe(false); // Kobe
    });

    it('should return false for non-existent bureaus', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      expect(accessor.isAggregateBureauCode('999999')).toBe(false);
      expect(accessor.isAggregateBureauCode('')).toBe(false);
    });
  });

  describe('getBranchCodes', () => {
    it('should return branch codes for Shinagawa', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      const branches = accessor.getBranchCodes('101170');
      expect(branches).toEqual(['101190', '101200', '101210']);
    });

    it('should return branch codes for Osaka', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      const branches = accessor.getBranchCodes('101460');
      expect(branches).toEqual(['101480', '101490']);
    });

    it('should return branch codes for Nagoya', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      const branches = accessor.getBranchCodes('101350');
      expect(branches).toEqual(['101370']);
    });

    it('should return branch codes for Fukuoka', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      const branches = accessor.getBranchCodes('101720');
      expect(branches).toEqual(['101740']);
    });

    it('should return empty array for non-aggregate bureaus', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      expect(accessor.getBranchCodes('101210')).toEqual([]); // Yokohama
      expect(accessor.getBranchCodes('101190')).toEqual([]); // Narita
    });

    it('should return empty array for non-existent bureaus', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      expect(accessor.getBranchCodes('999999')).toEqual([]);
      expect(accessor.getBranchCodes('')).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle data with minimal structure', () => {
      const accessor = makeCorrectedAccessor(mockEStatMinimal as EStatData);

      const coord: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '101170',
        '@cat02': '20',
        '@cat01': '103000',
      };

      const value = accessor.getCorrectedValue(coord);

      // Minimal data has single entry, no branches
      // Should return base value: 1000
      expect(value).toBe(1000);
    });

    it('should handle empty partial coordinates gracefully', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      const coord: Partial<EStatValue> = {};
      const value = accessor.getCorrectedValue(coord);

      expect(Number.isNaN(value)).toBe(true);
    });

    it('should handle coordinates with undefined values', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      const coord: Partial<EStatValue> = {
        '@time': undefined,
        '@cat03': '101170',
        '@cat02': '20',
        '@cat01': '100000',
      };

      const value = accessor.getCorrectedValue(coord);
      expect(Number.isNaN(value)).toBe(true);
    });

    it('should maintain consistency across multiple calls with different coordinates', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      const coord1: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '101170',
        '@cat02': '20',
        '@cat01': '100000',
      };

      const coord2: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '101460',
        '@cat02': '20',
        '@cat01': '100000',
      };

      const value1 = accessor.getCorrectedValue(coord1);
      const value2 = accessor.getCorrectedValue(coord2);

      expect(value1).toBe(11100); // Shinagawa corrected
      expect(value2).toBe(6200);  // Osaka corrected
    });

    it('should handle branch bureaus that exist in aggregate mapping', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      // Kansai Airport is a branch of Osaka
      const coord: Partial<EStatValue> = {
        '@time': '2024000701',
        '@cat03': '101480', // Kansai Airport
        '@cat02': '20',
        '@cat01': '100000',
      };

      const value = accessor.getCorrectedValue(coord);

      // Branch bureau should return original value (no correction)
      expect(value).toBe(600);
    });
  });

  describe('integration with dataTransform', () => {
    it('should work correctly when used in transformation pipeline', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      // Simulate how dataTransform uses the accessor
      const values = (mockEStatResponse as EStatData).GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE;
      const valueArray = Array.isArray(values) ? values : [values];

      // Find a specific aggregate entry
      const shinagawaEntry = valueArray.find(
        (v) => v['@cat03'] === '101170' &&
               v['@time'] === '2024000701' &&
               v['@cat02'] === '20' &&
               v['@cat01'] === '100000'
      );

      expect(shinagawaEntry).toBeDefined();

      const correctedValue = accessor.getCorrectedValue(shinagawaEntry as Partial<EStatValue>);
      expect(correctedValue).toBe(11100);
    });

    it('should correctly identify all aggregate bureaus from bureauOptions', () => {
      const accessor = makeCorrectedAccessor(mockEStatResponse as EStatData);

      // All aggregate bureaus from AGGREGATE_MAPPING
      const aggregates = ['101170', '101350', '101460', '101720'];

      aggregates.forEach((code) => {
        expect(accessor.isAggregateBureauCode(code)).toBe(true);
      });
    });
  });
});
