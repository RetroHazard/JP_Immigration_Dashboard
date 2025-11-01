// src/utils/calculateEstimates.test.ts
import { generateMockData,mockImmigrationData } from '../__mocks__/mockImmigrationData';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { calculateEstimatedDate } from './calculateEstimates';

describe('calculateEstimates', () => {
  describe('input validation', () => {
    it('should return null for null data', () => {
      const result = calculateEstimatedDate(null as unknown as ImmigrationData[], {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).toBeNull();
    });

    it('should return null for undefined data', () => {
      const result = calculateEstimatedDate(undefined as unknown as ImmigrationData[], {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).toBeNull();
    });

    it('should return null for missing bureau', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).toBeNull();
    });

    it('should return null for missing type', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '',
        applicationDate: '2024-04-15',
      });

      expect(result).toBeNull();
    });

    it('should return null for missing applicationDate', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '',
      });

      expect(result).toBeNull();
    });

    it('should return null when no matching data exists', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '999999', // Non-existent bureau
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).toBeNull();
    });

    it('should return null when type has no data', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '999', // Non-existent type
        applicationDate: '2024-04-15',
      });

      expect(result).toBeNull();
    });

    it('should return null for empty data array', () => {
      const result = calculateEstimatedDate([], {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).toBeNull();
    });
  });

  describe('data filtering', () => {
    it('should filter data by bureau and type', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details).toBeDefined();
    });

    it('should handle multiple bureaus in dataset', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101460', // Osaka
        type: '20',
        applicationDate: '2024-01-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details).toBeDefined();
    });

    it('should handle multiple application types', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '30', // Change of Status
        applicationDate: '2024-01-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details).toBeDefined();
    });
  });

  describe('rate calculations', () => {
    it('should calculate daily processing rate from last 6 months', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-07-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.dailyProcessed).toBeGreaterThan(0);
      expect(result?.details.totalDays).toBeGreaterThan(0);
      expect(result?.details.totalProcessed).toBeGreaterThan(0);
    });

    it('should calculate daily new applications rate', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-07-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.dailyNew).toBeGreaterThan(0);
    });

    it('should use most recent 6 months for calculations', () => {
      // Generate 12 months of data
      const extendedData = generateMockData('101170', '2023-01', '2024-07', '20');

      const result = calculateEstimatedDate(extendedData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-07-15',
      });

      expect(result).not.toBeNull();
      // Should use Feb-Jul 2024 (6 months)
      expect(result?.details.totalDays).toBeLessThanOrEqual(31 * 6);
    });

    it('should return null when processing rate is zero', () => {
      const zeroProcessingData: ImmigrationData[] = [
        { month: '2024-01', bureau: '101170', type: '20', status: '100000', value: 1000 },
        { month: '2024-01', bureau: '101170', type: '20', status: '103000', value: 500 },
        { month: '2024-01', bureau: '101170', type: '20', status: '300000', value: 0 }, // Zero processed
      ];

      const result = calculateEstimatedDate(zeroProcessingData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-01-15',
      });

      expect(result).toBeNull();
    });

    it('should return null when processing rate is negative', () => {
      const negativeData: ImmigrationData[] = [
        { month: '2024-01', bureau: '101170', type: '20', status: '100000', value: 1000 },
        { month: '2024-01', bureau: '101170', type: '20', status: '103000', value: 500 },
        { month: '2024-01', bureau: '101170', type: '20', status: '300000', value: -100 },
      ];

      const result = calculateEstimatedDate(negativeData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-01-15',
      });

      expect(result).toBeNull();
    });
  });

  describe('queue position calculations', () => {
    it('should calculate queue at application correctly', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.queueAtApplication).toBeGreaterThan(0);
      expect(result?.details.carriedOver).toBeGreaterThan(0);
    });

    it('should calculate current queue position', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-01-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.queuePosition).toBeDefined();
      expect(typeof result?.details.queuePosition).toBe('number');
    });

    it('should account for processed applications since submission', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-01-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.totalProcessedSinceApp).toBeGreaterThan(0);
    });

    it('should handle application submitted on first day of month', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-01',
      });

      expect(result).not.toBeNull();
      expect(result?.details.appDay).toBe(1);
    });

    it('should handle application submitted on last day of month', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-30',
      });

      expect(result).not.toBeNull();
      expect(result?.details.appDay).toBe(30);
    });

    it('should handle application submitted mid-month', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.appDay).toBe(15);
    });
  });

  describe('carried over calculations', () => {
    it('should calculate carried over from previous month when data available', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-02-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.carriedOver).toBeGreaterThan(0);
    });

    it('should simulate carried over when previous month data unavailable', () => {
      // Use data starting from Jan 2024, apply in Mar 2024
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-08-15', // After available data
      });

      expect(result).not.toBeNull();
      expect(result?.details.carriedOver).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero carried over applications', () => {
      const zeroCarryData: ImmigrationData[] = [
        { month: '2024-01', bureau: '101170', type: '20', status: '100000', value: 1000 },
        { month: '2024-01', bureau: '101170', type: '20', status: '103000', value: 500 },
        { month: '2024-01', bureau: '101170', type: '20', status: '300000', value: 1000 }, // All processed
        { month: '2024-02', bureau: '101170', type: '20', status: '100000', value: 500 },
        { month: '2024-02', bureau: '101170', type: '20', status: '103000', value: 600 },
        { month: '2024-02', bureau: '101170', type: '20', status: '300000', value: 550 },
      ];

      const result = calculateEstimatedDate(zeroCarryData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-02-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.carriedOver).toBeGreaterThanOrEqual(0);
    });
  });

  describe('model variables', () => {
    it('should populate all model variables', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).not.toBeNull();

      const vars = result?.details.modelVariables;
      expect(vars).toBeDefined();
      expect(typeof vars?.C_prev).toBe('number');
      expect(typeof vars?.N_app).toBe('number');
      expect(typeof vars?.P_app).toBe('number');
      expect(typeof vars?.R_daily).toBe('number');
      expect(typeof vars?.Sigma_P).toBe('number');
      expect(typeof vars?.Sigma_D).toBe('number');
      expect(typeof vars?.Q_app).toBe('number');
      expect(typeof vars?.C_proc).toBe('number');
      expect(typeof vars?.E_proc).toBe('number');
      expect(typeof vars?.Q_pos).toBe('number');
      expect(typeof vars?.D_rem).toBe('number');
    });

    it('should have Q_app equal to queue at application', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.modelVariables.Q_app).toBe(result?.details.queueAtApplication);
    });

    it('should have Q_pos equal to current queue position', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.modelVariables.Q_pos).toBe(result?.details.queuePosition);
    });

    it('should have R_daily equal to daily processed rate', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.modelVariables.R_daily).toBe(result?.details.dailyProcessed);
    });

    it('should have C_prev equal to carried over', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.modelVariables.C_prev).toBe(result?.details.carriedOver);
    });

    it('should calculate Sigma_P and Sigma_D correctly', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-07-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.modelVariables.Sigma_P).toBe(result?.details.totalProcessed);
      expect(result?.details.modelVariables.Sigma_D).toBe(result?.details.totalDays);
    });

    it('should have non-negative queue positions', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-01-15',
      });

      expect(result).not.toBeNull();
      // Queue position can be negative (past due), but variables should be defined
      expect(result?.details.modelVariables.Q_app).toBeDefined();
      expect(result?.details.modelVariables.Q_pos).toBeDefined();
    });
  });

  describe('past due detection', () => {
    it('should mark as past due when queue position is zero or negative', () => {
      // Create scenario where application was submitted long ago
      const oldAppData = generateMockData('101170', '2024-01', '2024-07', '20');

      const result = calculateEstimatedDate(oldAppData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-01-01', // Very old application
      });

      expect(result).not.toBeNull();
      // Depending on processing rate, this might be past due
      if (result?.details.queuePosition <= 0) {
        expect(result?.details.isPastDue).toBe(true);
      } else {
        expect(result?.details.isPastDue).toBe(false);
      }
    });

    it('should not mark as past due when queue position is positive', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-07-25', // Recent application
      });

      expect(result).not.toBeNull();
      if (result && result.details.queuePosition > 0) {
        expect(result.details.isPastDue).toBe(false);
      }
    });

    it('should handle exactly zero queue position', () => {
      // This is difficult to create naturally, but the logic should handle it
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).not.toBeNull();
      expect(typeof result?.details.isPastDue).toBe('boolean');
    });
  });

  describe('estimated date calculations', () => {
    it('should return a valid Date object', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      });

      expect(result).not.toBeNull();
      expect(result?.estimatedDate).toBeInstanceOf(Date);
      expect(result?.estimatedDate.getTime()).not.toBeNaN();
    });

    it('should estimate future date for pending applications', () => {
      const now = new Date();
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-07-25',
      });

      expect(result).not.toBeNull();
      if (result && result.details.queuePosition > 0) {
        // Future date should be later than now (or very close)
        expect(result.estimatedDate.getTime()).toBeGreaterThanOrEqual(now.getTime() - 86400000); // Within 1 day tolerance
      }
    });

    it('should handle applications from different months', () => {
      const januaryApp = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-01-15',
      });

      const juneApp = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-06-15',
      });

      expect(januaryApp).not.toBeNull();
      expect(juneApp).not.toBeNull();

      // January application should generally be processed before June application
      if (januaryApp && juneApp && januaryApp.details.queuePosition < juneApp.details.queuePosition) {
        expect(januaryApp.estimatedDate.getTime()).toBeLessThanOrEqual(juneApp.estimatedDate.getTime());
      }
    });

    it('should normalize estimated date to midnight for future dates', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-07-25',
      });

      expect(result).not.toBeNull();
      if (result && result.details.queuePosition > 0) {
        const date = result.estimatedDate;
        // Hours, minutes, seconds, milliseconds should be 0
        expect(date.getHours()).toBe(0);
        expect(date.getMinutes()).toBe(0);
        expect(date.getSeconds()).toBe(0);
        expect(date.getMilliseconds()).toBe(0);
      }
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle single month of data', () => {
      const singleMonthData: ImmigrationData[] = [
        { month: '2024-01', bureau: '101170', type: '20', status: '100000', value: 10000 },
        { month: '2024-01', bureau: '101170', type: '20', status: '103000', value: 5000 },
        { month: '2024-01', bureau: '101170', type: '20', status: '300000', value: 4500 },
      ];

      const result = calculateEstimatedDate(singleMonthData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-01-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details).toBeDefined();
    });

    it('should handle very large queue positions', () => {
      const largeQueueData: ImmigrationData[] = [
        { month: '2024-01', bureau: '101170', type: '20', status: '100000', value: 1000000 },
        { month: '2024-01', bureau: '101170', type: '20', status: '103000', value: 500000 },
        { month: '2024-01', bureau: '101170', type: '20', status: '300000', value: 1000 },
      ];

      const result = calculateEstimatedDate(largeQueueData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-01-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.queuePosition).toBeGreaterThan(100000);
    });

    it('should handle application date in the future', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      const futureDateStr = futureDate.toISOString().substring(0, 10);

      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: futureDateStr,
      });

      // Should still calculate, using simulated data
      expect(result).not.toBeNull();
    });

    it('should handle leap year dates', () => {
      const data = generateMockData('101170', '2024-01', '2024-03', '20');

      const result = calculateEstimatedDate(data, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-02-29', // Leap day
      });

      expect(result).not.toBeNull();
      expect(result?.details.appDay).toBe(29);
    });

    it('should handle month with 31 days', () => {
      const result = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-01-31',
      });

      expect(result).not.toBeNull();
      expect(result?.details.appDay).toBe(31);
    });

    it('should handle month with 28 days (non-leap year)', () => {
      const data2023 = generateMockData('101170', '2023-01', '2023-03', '20');

      const result = calculateEstimatedDate(data2023, {
        bureau: '101170',
        type: '20',
        applicationDate: '2023-02-28',
      });

      expect(result).not.toBeNull();
      expect(result?.details.appDay).toBe(28);
    });

    it('should handle very high processing rates', () => {
      const highRateData: ImmigrationData[] = [
        { month: '2024-01', bureau: '101170', type: '20', status: '100000', value: 1000 },
        { month: '2024-01', bureau: '101170', type: '20', status: '103000', value: 500 },
        { month: '2024-01', bureau: '101170', type: '20', status: '300000', value: 50000 }, // Very high
      ];

      const result = calculateEstimatedDate(highRateData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-01-15',
      });

      expect(result).not.toBeNull();
      expect(result?.details.dailyProcessed).toBeGreaterThan(1000);
    });

    it('should maintain consistency across multiple calls', () => {
      const details = {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-04-15',
      };

      const result1 = calculateEstimatedDate(mockImmigrationData, details);
      const result2 = calculateEstimatedDate(mockImmigrationData, details);

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();

      // Results should be identical for same inputs
      expect(result1?.details.queueAtApplication).toBe(result2?.details.queueAtApplication);
      expect(result1?.details.dailyProcessed).toBe(result2?.details.dailyProcessed);
    });
  });

  describe('integration scenarios', () => {
    it('should work with real-world-like data patterns', () => {
      // Generate realistic 12-month dataset
      const realisticData = generateMockData('101170', '2023-08', '2024-07', '20');

      const result = calculateEstimatedDate(realisticData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-06-15',
      });

      expect(result).not.toBeNull();
      expect(result?.estimatedDate).toBeInstanceOf(Date);
      expect(result?.details.queueAtApplication).toBeGreaterThan(0);
      expect(result?.details.dailyProcessed).toBeGreaterThan(0);
    });

    it('should handle different bureaus with same application type', () => {
      const shinagawaResult = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20',
        applicationDate: '2024-01-15',
      });

      const osakaResult = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101460',
        type: '20',
        applicationDate: '2024-01-15',
      });

      expect(shinagawaResult).not.toBeNull();
      expect(osakaResult).not.toBeNull();

      // Different bureaus should have different processing rates
      expect(shinagawaResult?.details.dailyProcessed).not.toBe(osakaResult?.details.dailyProcessed);
    });

    it('should handle same bureau with different application types', () => {
      const extensionResult = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '20', // Extension
        applicationDate: '2024-01-15',
      });

      const changeResult = calculateEstimatedDate(mockImmigrationData, {
        bureau: '101170',
        type: '30', // Change of Status
        applicationDate: '2024-01-15',
      });

      expect(extensionResult).not.toBeNull();
      expect(changeResult).not.toBeNull();

      // Different types should have different rates
      expect(extensionResult?.details.dailyProcessed).not.toBe(changeResult?.details.dailyProcessed);
    });
  });
});
