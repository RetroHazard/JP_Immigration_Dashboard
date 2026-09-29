// Under "Show the math" the estimator's inputs fold behind a summary row, the
// only thing on screen naming the date in the field, so it must match it.
// The zone is set per test: under UTC, `new Date('…')` on a date-only string
// and a component-built Date are indistinguishable.
import { afterEach, describe, expect, it } from 'vitest';

import { localDateFromInput } from '../EstimationCard';

const ORIGINAL_TZ = process.env.TZ;

const inZone = (timeZone: string, assert: () => void): void => {
  process.env.TZ = timeZone;
  assert();
};

afterEach(() => {
  process.env.TZ = ORIGINAL_TZ;
});

describe('localDateFromInput', () => {
  it.each(['America/Los_Angeles', 'America/New_York', 'UTC', 'Europe/Berlin', 'Asia/Tokyo'])(
    'reads the input as its own calendar day in %s',
    (timeZone) => {
      inZone(timeZone, () => {
        const date = localDateFromInput('2025-06-15');
        expect([date.getFullYear(), date.getMonth() + 1, date.getDate()]).toEqual([2025, 6, 15]);
      });
    }
  );

  // A date-only ISO string parses as UTC midnight, the previous calendar day
  // west of UTC: the summary would read "Jun 14" for 2025-06-15 in the Americas.
  it('does not slip a day west of UTC, where a bare parse does', () => {
    inZone('America/Los_Angeles', () => {
      expect(new Date('2025-06-15').getDate()).toBe(14);
      expect(localDateFromInput('2025-06-15').getDate()).toBe(15);
    });
  });

  it('handles a month and year boundary', () => {
    inZone('America/Los_Angeles', () => {
      expect(localDateFromInput('2025-01-01').getDate()).toBe(1);
      expect(localDateFromInput('2025-01-01').getMonth()).toBe(0);
      expect(localDateFromInput('2025-01-01').getFullYear()).toBe(2025);
    });
  });
});
