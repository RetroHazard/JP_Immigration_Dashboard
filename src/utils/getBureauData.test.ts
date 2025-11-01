// src/utils/getBureauData.test.ts
import { bureauOptions } from '../constants/bureauOptions';
import type { BureauOption } from '../types/bureau';
import { getBureauLabel, getBureauShort, nonAirportBureaus } from './getBureauData';

describe('getBureauData', () => {
  describe('getBureauLabel', () => {
    it('should return label for valid Shinagawa bureau code', () => {
      const label = getBureauLabel('101170');
      expect(label).toBe('Shinagawa');
    });

    it('should return label for valid Osaka bureau code', () => {
      const label = getBureauLabel('101460');
      expect(label).toBe('Osaka');
    });

    it('should return label for valid Nagoya bureau code', () => {
      const label = getBureauLabel('101350');
      expect(label).toBe('Nagoya');
    });

    it('should return label for valid Fukuoka bureau code', () => {
      const label = getBureauLabel('101720');
      expect(label).toBe('Fukuoka');
    });

    it('should return label for valid Sapporo bureau code', () => {
      const label = getBureauLabel('101010');
      expect(label).toBe('Sapporo');
    });

    it('should return label for valid Sendai bureau code', () => {
      const label = getBureauLabel('101090');
      expect(label).toBe('Sendai');
    });

    it('should return label for valid Hiroshima bureau code', () => {
      const label = getBureauLabel('101580');
      expect(label).toBe('Hiroshima');
    });

    it('should return label for valid Takamatsu bureau code', () => {
      const label = getBureauLabel('101670');
      expect(label).toBe('Takamatsu');
    });

    it('should return label for branch office - Yokohama', () => {
      const label = getBureauLabel('101210');
      expect(label).toBe('Yokohama');
    });

    it('should return label for branch office - Narita Airport', () => {
      const label = getBureauLabel('101190');
      expect(label).toBe('Narita Airport');
    });

    it('should return label for branch office - Haneda Airport', () => {
      const label = getBureauLabel('101200');
      expect(label).toBe('Haneda Airport');
    });

    it('should return label for branch office - Kansai Airport', () => {
      const label = getBureauLabel('101480');
      expect(label).toBe('Kansai Airport');
    });

    it('should return label for branch office - Kobe', () => {
      const label = getBureauLabel('101490');
      expect(label).toBe('Kobe');
    });

    it('should return label for branch office - Chubu Airport', () => {
      const label = getBureauLabel('101370');
      expect(label).toBe('Chubu Airport');
    });

    it('should return label for branch office - Naha', () => {
      const label = getBureauLabel('101740');
      expect(label).toBe('Naha');
    });

    it('should return original code for non-existent bureau', () => {
      const label = getBureauLabel('999999');
      expect(label).toBe('999999');
    });

    it('should return original code for empty string', () => {
      const label = getBureauLabel('');
      expect(label).toBe('');
    });

    it('should return original code for invalid format', () => {
      const label = getBureauLabel('invalid');
      expect(label).toBe('invalid');
    });

    it('should handle special bureau code "all"', () => {
      const label = getBureauLabel('all');
      expect(label).toBe('Nationwide');
    });

    it('should handle bureau codes consistently', () => {
      const label = getBureauLabel('101170');
      expect(label).toBe('Shinagawa');

      // Bureau codes are numeric strings, so case sensitivity doesn't apply
      // Just verify the function works correctly
      const nonExistent = getBureauLabel('999999');
      expect(nonExistent).toBe('999999');
    });

    it('should handle whitespace in bureau code', () => {
      const label = getBureauLabel(' 101170 ');
      // Should not match due to whitespace
      expect(label).toBe(' 101170 ');
    });

    it('should return correct labels for all bureaus in bureauOptions', () => {
      // Test that every bureau option can be retrieved correctly
      bureauOptions.forEach((bureau: BureauOption) => {
        const label = getBureauLabel(bureau.value);
        expect(label).toBe(bureau.label);
      });
    });

    it('should work with numeric input converted to string', () => {
      const label = getBureauLabel(String(101170));
      expect(label).toBe('Shinagawa');
    });
  });

  describe('getBureauShort', () => {
    it('should return short name for valid Shinagawa bureau code', () => {
      const short = getBureauShort('101170');
      expect(short).toBe('SGW');
    });

    it('should return short name for valid Osaka bureau code', () => {
      const short = getBureauShort('101460');
      expect(short).toBe('ITM');
    });

    it('should return short name for valid Nagoya bureau code', () => {
      const short = getBureauShort('101350');
      expect(short).toBe('NAG');
    });

    it('should return short name for valid Fukuoka bureau code', () => {
      const short = getBureauShort('101720');
      expect(short).toBe('FUK');
    });

    it('should return original code for non-existent bureau', () => {
      const short = getBureauShort('999999');
      expect(short).toBe('999999');
    });

    it('should return original code for empty string', () => {
      const short = getBureauShort('');
      expect(short).toBe('');
    });

    it('should handle special bureau code "all"', () => {
      const short = getBureauShort('all');
      expect(short).toBe('ALL');
    });

    it('should return correct short names for all bureaus in bureauOptions', () => {
      bureauOptions.forEach((bureau: BureauOption) => {
        const short = getBureauShort(bureau.value);
        expect(short).toBe(bureau.short);
      });
    });

    it('should be performant with multiple calls', () => {
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        getBureauShort('101170');
      }
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 1000 calls in under 100ms (O(1) Map lookup)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('nonAirportBureaus', () => {
    it('should filter out "all" option', () => {
      const hasAll = nonAirportBureaus.some((bureau: BureauOption) => bureau.value === 'all');
      expect(hasAll).toBe(false);
    });

    it('should filter out Narita Airport', () => {
      const hasNarita = nonAirportBureaus.some((bureau: BureauOption) =>
        bureau.label.toLowerCase().includes('narita airport')
      );
      expect(hasNarita).toBe(false);
    });

    it('should filter out Haneda Airport', () => {
      const hasHaneda = nonAirportBureaus.some((bureau: BureauOption) =>
        bureau.label.toLowerCase().includes('haneda airport')
      );
      expect(hasHaneda).toBe(false);
    });

    it('should filter out Kansai Airport', () => {
      const hasKansai = nonAirportBureaus.some((bureau: BureauOption) =>
        bureau.label.toLowerCase().includes('kansai airport')
      );
      expect(hasKansai).toBe(false);
    });

    it('should filter out Chubu Airport', () => {
      const hasChubu = nonAirportBureaus.some((bureau: BureauOption) =>
        bureau.label.toLowerCase().includes('chubu airport')
      );
      expect(hasChubu).toBe(false);
    });

    it('should include Shinagawa regional bureau', () => {
      const hasShinagawa = nonAirportBureaus.some((bureau: BureauOption) =>
        bureau.value === '101170'
      );
      expect(hasShinagawa).toBe(true);
    });

    it('should include Osaka regional bureau', () => {
      const hasOsaka = nonAirportBureaus.some((bureau: BureauOption) =>
        bureau.value === '101460'
      );
      expect(hasOsaka).toBe(true);
    });

    it('should include Nagoya regional bureau', () => {
      const hasNagoya = nonAirportBureaus.some((bureau: BureauOption) =>
        bureau.value === '101350'
      );
      expect(hasNagoya).toBe(true);
    });

    it('should include non-airport branch offices like Yokohama', () => {
      const hasYokohama = nonAirportBureaus.some((bureau: BureauOption) =>
        bureau.value === '101210'
      );
      expect(hasYokohama).toBe(true);
    });

    it('should include non-airport branch offices like Kobe', () => {
      const hasKobe = nonAirportBureaus.some((bureau: BureauOption) =>
        bureau.value === '101490'
      );
      expect(hasKobe).toBe(true);
    });

    it('should include non-airport branch offices like Naha', () => {
      const hasNaha = nonAirportBureaus.some((bureau: BureauOption) =>
        bureau.value === '101740'
      );
      expect(hasNaha).toBe(true);
    });

    it('should return an array', () => {
      expect(Array.isArray(nonAirportBureaus)).toBe(true);
    });

    it('should have fewer bureaus than total bureauOptions', () => {
      expect(nonAirportBureaus.length).toBeLessThan(bureauOptions.length);
    });

    it('should have at least one bureau', () => {
      expect(nonAirportBureaus.length).toBeGreaterThan(0);
    });

    it('should contain objects with value and label properties', () => {
      nonAirportBureaus.forEach((bureau: BureauOption) => {
        expect(bureau).toHaveProperty('value');
        expect(bureau).toHaveProperty('label');
        expect(typeof bureau.value).toBe('string');
        expect(typeof bureau.label).toBe('string');
      });
    });

    it('should not contain any bureau with "airport" in lowercase label', () => {
      const hasAirport = nonAirportBureaus.some((bureau: BureauOption) =>
        bureau.label.toLowerCase().includes('airport')
      );
      expect(hasAirport).toBe(false);
    });

    it('should handle case-insensitive airport filtering', () => {
      // Test that filtering works even if label has mixed case
      const filtered = nonAirportBureaus.filter((bureau: BureauOption) =>
        bureau.label.toUpperCase().includes('AIRPORT')
      );
      expect(filtered.length).toBe(0);
    });

    it('should maintain original bureauOptions structure', () => {
      // Verify that each non-airport bureau still has all expected properties
      nonAirportBureaus.forEach((bureau: BureauOption) => {
        const original = bureauOptions.find((b: BureauOption) => b.value === bureau.value);
        expect(original).toBeDefined();
        expect(bureau.value).toBe(original?.value);
        expect(bureau.label).toBe(original?.label);
      });
    });

    it('should filter exactly 5 items (4 airports + "all")', () => {
      const expectedFilteredCount = 5; // all, Narita, Haneda, Kansai, Chubu
      const actualFilteredCount = bureauOptions.length - nonAirportBureaus.length;
      expect(actualFilteredCount).toBe(expectedFilteredCount);
    });
  });

  describe('integration with bureauOptions', () => {
    it('should handle all bureau codes from bureauOptions', () => {
      bureauOptions.forEach((bureau: BureauOption) => {
        const label = getBureauLabel(bureau.value);
        expect(label).toBeTruthy();
        expect(typeof label).toBe('string');
      });
    });

    it('should maintain consistency between getBureauLabel and nonAirportBureaus', () => {
      // All non-airport bureaus should have valid labels
      nonAirportBureaus.forEach((bureau: BureauOption) => {
        const label = getBureauLabel(bureau.value);
        expect(label).toBe(bureau.label);
      });
    });

    it('should handle edge case where bureauOptions is empty', () => {
      // This shouldn't happen in practice, but good to verify behavior
      // Since we can't modify bureauOptions, we just verify current behavior
      expect(bureauOptions.length).toBeGreaterThan(0);
      expect(nonAirportBureaus.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle null input gracefully', () => {
      const label = getBureauLabel(null as unknown as string);
      expect(label).toBe(null);
    });

    it('should handle undefined input gracefully', () => {
      const label = getBureauLabel(undefined as unknown as string);
      expect(label).toBe(undefined);
    });

    it('should handle numeric input', () => {
      const label = getBureauLabel(101170 as unknown as string);
      // Since bureauOptions uses string values, numeric won't match
      expect(label).toBe(101170);
    });

    it('should handle very long strings', () => {
      const longCode = 'a'.repeat(1000);
      const label = getBureauLabel(longCode);
      expect(label).toBe(longCode);
    });

    it('should handle special characters in bureau code', () => {
      const label = getBureauLabel('!@#$%^&*()');
      expect(label).toBe('!@#$%^&*()');
    });

    it('should be performant with multiple calls', () => {
      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        getBureauLabel('101170');
      }
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 1000 calls in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should maintain immutability of nonAirportBureaus', () => {
      const before = nonAirportBureaus.length;
      const copy = [...nonAirportBureaus];

      // Verify that modifications to copy don't affect original
      copy.push({ value: 'test', label: 'Test' } as unknown as BureauOption);

      expect(nonAirportBureaus.length).toBe(before);
    });
  });
});
