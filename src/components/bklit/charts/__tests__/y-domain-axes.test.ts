// Per-axis y-domain resolution. Two things are load-bearing here: an axis a
// caller pinned must arrive at the scale untouched, and the stacked-bar total
// must keep describing the primary axis once a second axis exists — the case
// that silently regressed before.
import { describe, expect, it } from 'vitest';

import type { LineConfig } from '../chart-context';
import { computeComposedYScaleDomainMax } from '../composed-chart';
import { computeYDomainsByAxis, niceYDomain } from '../y-domain-utils';

const line = (dataKey: string, yAxisId?: string): LineConfig => ({
  dataKey,
  stroke: 'var(--chart-1)',
  strokeWidth: 2,
  ...(yAxisId ? { yAxisId } : {}),
});

describe('computeYDomainsByAxis', () => {
  it('passes each axis id to the resolver so it can answer per axis', () => {
    const seen: string[] = [];
    computeYDomainsByAxis({
      lines: [line('count'), line('rate', 'right')],
      resolveDomain: (_keys, axisId) => {
        seen.push(axisId);
        return [0, 1];
      },
    });
    expect(seen.sort()).toEqual(['left', 'right']);
  });

  it('normalizes an omitted or empty axis id onto the left axis — a numeric id stays its own', () => {
    const domains = computeYDomainsByAxis({
      lines: [line('a'), line('b', ''), line('c', '0')],
      resolveDomain: (keys) => [0, keys.length],
    });
    // 'a' and 'b' land on left; '0' is its own id, so left carries two keys.
    // (No Recharts-style default-axis coercion for numeric ids here.)
    expect(domains.left).toEqual(niceYDomain([0, 2]));
    expect(domains['0']).toEqual(niceYDomain([0, 1]));
  });

  it('hands a pinned domain through verbatim — no nice(), no padding', () => {
    const domains = computeYDomainsByAxis({
      lines: [line('count'), line('rate', 'right')],
      pinnedDomains: { right: [0, 100] },
      // A resolver that would pad past 100 the way the count axis does.
      resolveDomain: () => [0, 97 * 1.1],
    });
    expect(domains.right).toEqual([0, 100]);
  });

  it('keeps a pinned axis even when no series is left on it', () => {
    const domains = computeYDomainsByAxis({
      lines: [line('count')],
      pinnedDomains: { right: [0, 100] },
      resolveDomain: () => [0, 500],
    });
    expect(domains.right).toEqual([0, 100]);
  });

  it('falls back to a 0-100 left domain when there are no series at all', () => {
    const domains = computeYDomainsByAxis({ lines: [], resolveDomain: () => [0, 1] });
    expect(domains.left).toEqual(niceYDomain([0, 100]));
  });
});

describe('computeComposedYScaleDomainMax', () => {
  const data = [{ pending: 400, received: 620, rate: 95 }];
  const barKeys = ['pending', 'received'];

  it('measures the stack total, not its tallest segment', () => {
    expect(computeComposedYScaleDomainMax(data, [], barKeys)).toBe(1020);
  });

  // The primary axis must not be stretched by a series measured in percent.
  it('ignores a line on a secondary axis', () => {
    const huge = [{ ...data[0], rate: 999_999 }];
    expect(computeComposedYScaleDomainMax(huge, [line('rate', 'right')], barKeys)).toBe(1020);
  });

  it('still grows for a line on the primary axis', () => {
    expect(computeComposedYScaleDomainMax(data, [line('target')], barKeys)).toBe(1020);
    expect(
      computeComposedYScaleDomainMax([{ ...data[0], target: 2000 }], [line('target')], barKeys)
    ).toBe(2000);
  });

  it('returns undefined for all-zero data so the caller can fall back', () => {
    expect(computeComposedYScaleDomainMax([{ pending: 0, received: 0 }], [], barKeys)).toBeUndefined();
  });
});
