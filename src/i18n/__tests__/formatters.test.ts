// src/i18n/__tests__/formatters.test.ts
import { describe, expect, it } from 'vitest';

import { compactFmt, intFmt, setChartFormatterLocale, shortDateFmt } from '../../components/bklit/charts/chart-formatters';
import { createFormatters } from '../formatters';

const en = createFormatters('en-US');
const ja = createFormatters('ja-JP');

describe('createFormatters', () => {
  it('groups integers per locale', () => {
    expect(en.number(1234567)).toBe('1,234,567');
    expect(ja.number(1234567)).toBe('1,234,567');
  });

  it('takes a 0-100 percentage rather than a ratio', () => {
    expect(en.percent(75)).toBe('75.0%');
    expect(en.percent(75, 0)).toBe('75%');
  });

  it('abbreviates with each locale’s own convention', () => {
    // The hardcoded "k" this replaced is English-only; Japanese counts in 万.
    expect(en.compactNumber(12000)).toBe('12K');
    expect(ja.compactNumber(12000)).toBe('1.2万');
  });

  it('orders dates per locale', () => {
    const date = new Date(2026, 8, 22);
    expect(en.mediumDate(date)).toBe('Sep 22, 2026');
    expect(ja.mediumDate(date)).toBe('2026年9月22日');
    expect(en.monthYear(date)).toBe('Sep 2026');
    expect(ja.monthYear(date)).toBe('2026年9月');
  });

  it('returns the same instance for a repeated locale', () => {
    expect(createFormatters('en-US')).toBe(en);
  });
});

describe('vendored chart formatters', () => {
  it('follow the locale they are pointed at, keeping their export shape', () => {
    const date = new Date(2026, 8, 22);
    setChartFormatterLocale('en-US');
    expect(shortDateFmt.format(date)).toBe('Sep 22');
    setChartFormatterLocale('ja-JP');
    expect(shortDateFmt.format(date)).toBe('9月22日');
    // Restore, so ordering between test files can't leak.
    setChartFormatterLocale('en-US');
  });

  it('abbreviates y-axis ticks per locale, replacing the hardcoded "k" suffix', () => {
    setChartFormatterLocale('en-US');
    expect(compactFmt(200000)).toBe('200K');
    // The old `${n / 1000}k` rendered this as the awkward "1000k".
    expect(compactFmt(1000000)).toBe('1M');
    expect(intFmt(1234)).toBe('1,234');
    setChartFormatterLocale('ja-JP');
    expect(compactFmt(200000)).toBe('20万');
    expect(compactFmt(1000000)).toBe('100万');
    setChartFormatterLocale('en-US');
  });
});
