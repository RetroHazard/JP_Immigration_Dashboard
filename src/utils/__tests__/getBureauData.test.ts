// src/utils/__tests__/getBureauData.test.ts
// The airport branch offices used to be identified by testing the English
// label for 'airport'. They now carry an explicit `isAirport` flag, and this
// pins the resulting set: it gates the global airport toggle, the bureau
// dropdown, and URL-state validation, so a wrong answer here is a silently
// wrong nationwide total.
import { describe, expect, it } from 'vitest';

import { bureauOptions } from '../../constants/bureauOptions';
import { AIRPORT_BUREAU_CODES, getBureauLabel, nonAirportBureaus } from '../getBureauData';

describe('AIRPORT_BUREAU_CODES', () => {
  it('is exactly Narita, Haneda, Kansai, and Chubu', () => {
    expect([...AIRPORT_BUREAU_CODES].sort()).toEqual(['101190', '101200', '101370', '101480']);
  });

  it('matches what the old label-based test would have found', () => {
    const byLabel = bureauOptions
      .filter((option) => option.label.toLowerCase().includes('airport'))
      .map((option) => option.value)
      .sort();
    expect([...AIRPORT_BUREAU_CODES].sort()).toEqual(byLabel);
  });
});

describe('nonAirportBureaus', () => {
  it('drops the nationwide aggregate and every airport office', () => {
    expect(nonAirportBureaus.map((option) => option.value)).not.toContain('all');
    for (const code of AIRPORT_BUREAU_CODES) {
      expect(nonAirportBureaus.map((option) => option.value)).not.toContain(code);
    }
    expect(nonAirportBureaus).toHaveLength(bureauOptions.length - 1 - AIRPORT_BUREAU_CODES.size);
  });
});

describe('getBureauLabel', () => {
  it('resolves a known code', () => {
    expect(getBureauLabel('101460')).toBe('Osaka');
  });

  it('falls back to the code itself when unknown', () => {
    expect(getBureauLabel('999999')).toBe('999999');
  });
});
