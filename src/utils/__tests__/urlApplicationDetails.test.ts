import { describe, expect, it } from 'vitest';

import { getApplicationDetailsFromParams, hasPermalinkParams } from '../urlApplicationDetails';

describe('hasPermalinkParams', () => {
  it('returns false when no permalink params are present', () => {
    expect(hasPermalinkParams(new URLSearchParams(''))).toBe(false);
    expect(hasPermalinkParams(new URLSearchParams('unrelated=1'))).toBe(false);
  });

  it('returns true when any single permalink param is present', () => {
    expect(hasPermalinkParams(new URLSearchParams('bureau=1'))).toBe(true);
    expect(hasPermalinkParams(new URLSearchParams('type=60'))).toBe(true);
    expect(hasPermalinkParams(new URLSearchParams('applicationDate=2025-01-01'))).toBe(true);
  });
});

describe('getApplicationDetailsFromParams', () => {
  it('defaults every field to an empty string when the URL has no params', () => {
    expect(getApplicationDetailsFromParams(new URLSearchParams(''))).toEqual({
      bureau: '',
      type: '',
      applicationDate: '',
    });
  });

  it('passes through a fully valid permalink', () => {
    const params = new URLSearchParams({
      bureau: '101170',
      type: '60',
      applicationDate: '2025-01-15',
    });

    expect(getApplicationDetailsFromParams(params)).toEqual({
      bureau: '101170',
      type: '60',
      applicationDate: '2025-01-15',
    });
  });

  it('drops a bureau that is not a known non-airport bureau', () => {
    const params = new URLSearchParams({ bureau: 'not-a-real-bureau', type: '60', applicationDate: '2025-01-15' });

    expect(getApplicationDetailsFromParams(params).bureau).toBe('');
  });

  it('drops an application type that is unknown or the "all" placeholder', () => {
    expect(getApplicationDetailsFromParams(new URLSearchParams({ type: 'all' })).type).toBe('');
    expect(getApplicationDetailsFromParams(new URLSearchParams({ type: 'not-a-type' })).type).toBe('');
  });

  it('drops a malformed or unparsable application date', () => {
    expect(
      getApplicationDetailsFromParams(new URLSearchParams({ applicationDate: 'not-a-date' })).applicationDate
    ).toBe('');
    expect(
      getApplicationDetailsFromParams(new URLSearchParams({ applicationDate: '2025/01/15' })).applicationDate
    ).toBe('');
  });
});
