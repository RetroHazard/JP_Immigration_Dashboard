import { describe, expect, it } from 'vitest';

import { getApplicationDetailsFromParams, isEstimatorPermalink } from '../urlApplicationDetails';

describe('isEstimatorPermalink', () => {
  it('returns false when no estimator date param is present', () => {
    expect(isEstimatorPermalink(new URLSearchParams(''))).toBe(false);
    // Bare chart-filter params are not estimator permalinks.
    expect(isEstimatorPermalink(new URLSearchParams('bureau=101170&type=60'))).toBe(false);
    expect(isEstimatorPermalink(new URLSearchParams('estBureau=101170'))).toBe(false);
  });

  it('returns true for a pinned application date, new or legacy name', () => {
    expect(isEstimatorPermalink(new URLSearchParams('estDate=2025-01-15'))).toBe(true);
    expect(isEstimatorPermalink(new URLSearchParams('applicationDate=2025-01-15'))).toBe(true);
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
      estBureau: '101170',
      estType: '60',
      estDate: '2025-01-15',
    });

    expect(getApplicationDetailsFromParams(params)).toEqual({
      bureau: '101170',
      type: '60',
      applicationDate: '2025-01-15',
    });
  });

  it('ignores the chart filter params, which share no names with the estimator', () => {
    const params = new URLSearchParams({ bureau: '101170', type: '60', chart: 'types' });

    expect(getApplicationDetailsFromParams(params)).toEqual({
      bureau: '',
      type: '',
      applicationDate: '',
    });
  });

  it('reads a pre-rename permalink that used the filter param names', () => {
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

  it('prefers the namespaced params when both new and legacy are present', () => {
    const params = new URLSearchParams({
      estBureau: '101580',
      estType: '20',
      estDate: '2025-03-01',
      bureau: '101170',
      type: '60',
      applicationDate: '2025-01-15',
    });

    expect(getApplicationDetailsFromParams(params)).toEqual({
      bureau: '101580',
      type: '20',
      applicationDate: '2025-03-01',
    });
  });

  it('drops a bureau that is not a known non-airport bureau', () => {
    const params = new URLSearchParams({ estBureau: 'not-a-real-bureau', estType: '60', estDate: '2025-01-15' });

    expect(getApplicationDetailsFromParams(params).bureau).toBe('');
  });

  it('drops an application type that is unknown or the "all" placeholder', () => {
    expect(getApplicationDetailsFromParams(new URLSearchParams({ estType: 'all' })).type).toBe('');
    expect(getApplicationDetailsFromParams(new URLSearchParams({ estType: 'not-a-type' })).type).toBe('');
  });

  it('drops a malformed or unparsable application date', () => {
    expect(getApplicationDetailsFromParams(new URLSearchParams({ estDate: 'not-a-date' })).applicationDate).toBe('');
    expect(getApplicationDetailsFromParams(new URLSearchParams({ estDate: '2025/01/15' })).applicationDate).toBe('');
  });
});
