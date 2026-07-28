// src/utils/__tests__/getBureauData.test.ts
// The airport branch offices used to be identified by testing the English
// label for 'airport'. They now carry an explicit `isAirport` flag, and this
// pins the resulting set: it gates the global airport toggle, the bureau
// dropdown, and URL-state validation, so a wrong answer here is a silently
// wrong nationwide total.
import { describe, expect, it } from 'vitest';

import { bureauOptions } from '../../constants/bureauOptions';
import { en } from '../../i18n/locales/en';
import { AIRPORT_BUREAU_CODES } from '../getBureauData';

describe('AIRPORT_BUREAU_CODES', () => {
  it('is exactly Narita, Haneda, Kansai, and Chubu', () => {
    expect([...AIRPORT_BUREAU_CODES].sort()).toEqual(['101190', '101200', '101370', '101480']);
  });

  it('matches what the old label-based test would have found', () => {
    const byLabel = bureauOptions
      .map((option) => option.value)
      .filter((code) => en[`bureau.${code}` as keyof typeof en].toLowerCase().includes('airport'))
      .sort();
    expect([...AIRPORT_BUREAU_CODES].sort()).toEqual(byLabel);
  });
});

describe('bureau catalogue coverage', () => {
  it('names every bureau, with an abbreviation', () => {
    const missing = bureauOptions.flatMap((option) =>
      [`bureau.${option.value}`, `bureau.${option.value}.short`].filter((key) => !(key in en))
    );
    expect(missing).toEqual([]);
  });
});
