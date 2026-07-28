import { describe, expect, it } from 'vitest';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { computeEfficiencyPoints, median, nationwideCompletionRate } from '../processingEfficiency';

const entry = (overrides: Partial<ImmigrationData>): ImmigrationData => ({
  month: '2025-06',
  bureau: '101170',
  type: '20',
  status: '103000', // newly received
  value: 100,
  ...overrides,
});

const data: ImmigrationData[] = [
  // Nationwide aggregate: 1000 received, 800 processed
  entry({ bureau: '100000', value: 1000 }),
  entry({ bureau: '100000', status: '300000', value: 800 }),
  // Shinagawa: 600 received, 450 processed
  entry({ bureau: '101170', value: 600 }),
  entry({ bureau: '101170', status: '300000', value: 450 }),
  // Narita Airport: 100 received, 90 processed
  entry({ bureau: '101190', value: 100 }),
  entry({ bureau: '101190', status: '300000', value: 90 }),
];

describe('computeEfficiencyPoints', () => {
  it('produces one point per bureau with data, with the completion rate derived from received/processed', () => {
    const points = computeEfficiencyPoints(data, { bureau: 'all', type: 'all' }, 'all', false);
    expect(points.map((p) => p.code).sort()).toEqual(['101170', '101190']);

    const shinagawa = points.find((p) => p.code === '101170');
    expect(shinagawa?.received).toBe(600);
    expect(shinagawa?.processed).toBe(450);
    expect(shinagawa?.rate).toBeCloseTo(75);
  });

  it('marks airport offices and outlines them with their parent region color', () => {
    const points = computeEfficiencyPoints(data, { bureau: 'all', type: 'all' }, 'all', false);
    const narita = points.find((p) => p.code === '101190');
    const shinagawa = points.find((p) => p.code === '101170');
    expect(narita?.isAirport).toBe(true);
    expect(shinagawa?.isAirport).toBe(false);
    // Airport outline = parent's full-strength color, fill = a tint of it
    expect(narita?.outline).toBe(shinagawa?.color);
    expect(narita?.color).not.toBe(narita?.outline);
  });

  it('excludes the nationwide aggregate row from the breakdown', () => {
    const points = computeEfficiencyPoints(data, { bureau: 'all', type: 'all' }, 'all', false);
    expect(points.every((p) => p.code !== '100000')).toBe(true);
  });
});

describe('nationwideCompletionRate', () => {
  it('uses the official nationwide aggregate row', () => {
    expect(nationwideCompletionRate(data, { bureau: 'all', type: 'all' }, 'all')).toBeCloseTo(80);
  });

  it('returns null when the aggregate has no intake', () => {
    expect(nationwideCompletionRate([], { bureau: 'all', type: 'all' }, 'all')).toBeNull();
  });
});

describe('median', () => {
  it('handles odd and even counts', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
  });
});
