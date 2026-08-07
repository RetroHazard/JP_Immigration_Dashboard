import { describe, expect, it } from 'vitest';

import { parsePeriodParam, parseStatusParam } from '../residentUrlParams';

describe('parseStatusParam', () => {
  it('passes category tokens and all through', () => {
    expect(parseStatusParam('work')).toBe('work');
    expect(parseStatusParam('residency')).toBe('residency');
    expect(parseStatusParam('all')).toBe('all');
  });

  it('maps legacy status-code permalinks to their category', () => {
    expect(parseStatusParam('1430')).toBe('residency'); // 永住者
    expect(parseStatusParam('1380')).toBe('study'); // 留学
    expect(parseStatusParam('1270')).toBe('work'); // 特定技能1号
  });

  it('rejects anything else', () => {
    expect(parseStatusParam('9999')).toBeNull();
    expect(parseStatusParam('')).toBeNull();
    expect(parseStatusParam('WORK')).toBeNull();
  });
});

describe('parsePeriodParam', () => {
  it('accepts half-year keys only', () => {
    expect(parsePeriodParam('2025-12')).toBe('2025-12');
    expect(parsePeriodParam('2013-06')).toBe('2013-06');
  });

  it('rejects other months and garbage', () => {
    expect(parsePeriodParam('2025-03')).toBeNull();
    expect(parsePeriodParam('2025')).toBeNull();
    expect(parsePeriodParam('garbage')).toBeNull();
    expect(parsePeriodParam('2025-121')).toBeNull();
  });
});
