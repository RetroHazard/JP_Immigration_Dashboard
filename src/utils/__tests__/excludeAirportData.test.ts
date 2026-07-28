import { describe, expect, it } from 'vitest';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { excludeAirportData } from '../excludeAirportData';

const entry = (overrides: Partial<ImmigrationData>): ImmigrationData => ({
  month: '2025-06',
  bureau: '100000',
  type: '20',
  status: '103000',
  value: 100,
  ...overrides,
});

describe('excludeAirportData', () => {
  const data: ImmigrationData[] = [
    // Nationwide: 1000 received, 800 processed
    entry({ value: 1000 }),
    entry({ status: '300000', value: 800 }),
    // Shinagawa (already excludes its branches via build-time deaggregation)
    entry({ bureau: '101170', value: 600 }),
    // Narita Airport: 100 received, 90 processed
    entry({ bureau: '101190', value: 100 }),
    entry({ bureau: '101190', status: '300000', value: 90 }),
    // Haneda Airport, other month: 50 received
    entry({ bureau: '101200', month: '2025-05', value: 50 }),
    entry({ month: '2025-05', value: 500 }),
  ];

  const result = excludeAirportData(data);

  it('drops the airport rows themselves', () => {
    expect(result.every((row) => !['101190', '101200', '101370', '101480'].includes(row.bureau))).toBe(true);
  });

  it('subtracts airport volumes from the nationwide aggregate, per month/type/status', () => {
    const nationwideJunReceived = result.find(
      (row) => row.bureau === '100000' && row.month === '2025-06' && row.status === '103000'
    );
    const nationwideJunProcessed = result.find(
      (row) => row.bureau === '100000' && row.month === '2025-06' && row.status === '300000'
    );
    const nationwideMay = result.find((row) => row.bureau === '100000' && row.month === '2025-05');
    expect(nationwideJunReceived?.value).toBe(1000 - 100);
    expect(nationwideJunProcessed?.value).toBe(800 - 90);
    expect(nationwideMay?.value).toBe(500 - 50);
  });

  it('leaves regular bureau rows untouched', () => {
    expect(result.find((row) => row.bureau === '101170')?.value).toBe(600);
  });

  it('returns data unchanged in content when there are no airport rows', () => {
    const clean = [entry({ value: 1000 }), entry({ bureau: '101170', value: 600 })];
    expect(excludeAirportData(clean)).toEqual(clean);
  });
});
