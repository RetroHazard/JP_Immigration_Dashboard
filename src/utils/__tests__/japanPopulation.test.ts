import { describe, expect, it } from 'vitest';

import { japanPopulationForPeriod } from '../../constants/japanPopulation';

describe('japanPopulationForPeriod', () => {
  it('returns the calendar-year estimate for a period', () => {
    expect(japanPopulationForPeriod('2012-12')).toBe(127_515_000);
    expect(japanPopulationForPeriod('2020-06')).toBe(126_146_000);
    expect(japanPopulationForPeriod('2025-12')).toBe(123_340_000);
  });

  it('clamps periods outside the table to the nearest known year', () => {
    // A new data release can precede the table's annual update.
    expect(japanPopulationForPeriod('2027-06')).toBe(japanPopulationForPeriod('2025-12'));
    expect(japanPopulationForPeriod('2005-12')).toBe(japanPopulationForPeriod('2012-06'));
  });
});
