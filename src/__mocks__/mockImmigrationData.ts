// src/__mocks__/mockImmigrationData.ts
// Mock transformed ImmigrationData for testing

import type { ApplicationTypeCode } from '../constants/applicationTypes';
import type { BureauCode } from '../constants/bureauCodes';
import type { ImmigrationData } from '../hooks/useImmigrationData';

export const mockImmigrationData: ImmigrationData[] = [
  // Shinagawa - Extension of Stay - January 2024
  {
    month: '2024-01',
    bureau: '101170',
    type: '20',
    status: '100000',
    value: 15000,
  },
  {
    month: '2024-01',
    bureau: '101170',
    type: '20',
    status: '103000',
    value: 8000,
  },
  {
    month: '2024-01',
    bureau: '101170',
    type: '20',
    status: '300000',
    value: 7500,
  },
  // Shinagawa - Extension of Stay - February 2024
  {
    month: '2024-02',
    bureau: '101170',
    type: '20',
    status: '100000',
    value: 15500,
  },
  {
    month: '2024-02',
    bureau: '101170',
    type: '20',
    status: '103000',
    value: 8200,
  },
  {
    month: '2024-02',
    bureau: '101170',
    type: '20',
    status: '300000',
    value: 7700,
  },
  // Shinagawa - Extension of Stay - March 2024
  {
    month: '2024-03',
    bureau: '101170',
    type: '20',
    status: '100000',
    value: 16000,
  },
  {
    month: '2024-03',
    bureau: '101170',
    type: '20',
    status: '103000',
    value: 8500,
  },
  {
    month: '2024-03',
    bureau: '101170',
    type: '20',
    status: '300000',
    value: 8000,
  },
  // Shinagawa - Extension of Stay - April 2024
  {
    month: '2024-04',
    bureau: '101170',
    type: '20',
    status: '100000',
    value: 16500,
  },
  {
    month: '2024-04',
    bureau: '101170',
    type: '20',
    status: '103000',
    value: 9000,
  },
  {
    month: '2024-04',
    bureau: '101170',
    type: '20',
    status: '300000',
    value: 8500,
  },
  // Shinagawa - Extension of Stay - May 2024
  {
    month: '2024-05',
    bureau: '101170',
    type: '20',
    status: '100000',
    value: 17000,
  },
  {
    month: '2024-05',
    bureau: '101170',
    type: '20',
    status: '103000',
    value: 9200,
  },
  {
    month: '2024-05',
    bureau: '101170',
    type: '20',
    status: '300000',
    value: 8700,
  },
  // Shinagawa - Extension of Stay - June 2024
  {
    month: '2024-06',
    bureau: '101170',
    type: '20',
    status: '100000',
    value: 17500,
  },
  {
    month: '2024-06',
    bureau: '101170',
    type: '20',
    status: '103000',
    value: 9500,
  },
  {
    month: '2024-06',
    bureau: '101170',
    type: '20',
    status: '300000',
    value: 9000,
  },
  // Shinagawa - Extension of Stay - July 2024
  {
    month: '2024-07',
    bureau: '101170',
    type: '20',
    status: '100000',
    value: 18000,
  },
  {
    month: '2024-07',
    bureau: '101170',
    type: '20',
    status: '103000',
    value: 9800,
  },
  {
    month: '2024-07',
    bureau: '101170',
    type: '20',
    status: '300000',
    value: 9300,
  },
  // Shinagawa - Change of Status - January 2024
  {
    month: '2024-01',
    bureau: '101170',
    type: '30',
    status: '100000',
    value: 5000,
  },
  {
    month: '2024-01',
    bureau: '101170',
    type: '30',
    status: '103000',
    value: 2500,
  },
  {
    month: '2024-01',
    bureau: '101170',
    type: '30',
    status: '300000',
    value: 2300,
  },
  // Shinagawa - Permanent Residence - January 2024
  {
    month: '2024-01',
    bureau: '101170',
    type: '60',
    status: '100000',
    value: 12000,
  },
  {
    month: '2024-01',
    bureau: '101170',
    type: '60',
    status: '103000',
    value: 3000,
  },
  {
    month: '2024-01',
    bureau: '101170',
    type: '60',
    status: '300000',
    value: 2800,
  },
  // Osaka - Extension of Stay - January 2024
  {
    month: '2024-01',
    bureau: '101460',
    type: '20',
    status: '100000',
    value: 8000,
  },
  {
    month: '2024-01',
    bureau: '101460',
    type: '20',
    status: '103000',
    value: 4000,
  },
  {
    month: '2024-01',
    bureau: '101460',
    type: '20',
    status: '300000',
    value: 3800,
  },
];

// Minimal dataset for basic testing
export const mockImmigrationDataMinimal: ImmigrationData[] = [
  {
    month: '2024-01',
    bureau: '101170',
    type: '20',
    status: '103000',
    value: 1000,
  },
];

// Dataset with edge cases
export const mockImmigrationDataEdgeCases: ImmigrationData[] = [
  // Zero values
  {
    month: '2024-01',
    bureau: '101170',
    type: '20',
    status: '100000',
    value: 0,
  },
  // Very large values
  {
    month: '2024-01',
    bureau: '101170',
    type: '20',
    status: '103000',
    value: 999999,
  },
  // Different bureau
  {
    month: '2024-01',
    bureau: '101350', // Nagoya
    type: '20',
    status: '103000',
    value: 500,
  },
];

// Helper function to generate mock data for a specific bureau and date range
export function generateMockData(
  bureau: BureauCode,
  startMonth: string,
  endMonth: string,
  applicationType: ApplicationTypeCode = '20'
): ImmigrationData[] {
  const data: ImmigrationData[] = [];
  const start = new Date(startMonth + '-01');
  const end = new Date(endMonth + '-01');

  const current = new Date(start);
  while (current <= end) {
    const month = current.toISOString().substring(0, 7);

    // Generate realistic values with some variation
    const baseCarried = 10000 + Math.floor(Math.random() * 5000);
    const baseNew = 5000 + Math.floor(Math.random() * 2000);
    const baseProcessed = baseNew * 0.9 + Math.floor(Math.random() * 500);

    data.push(
      {
        month,
        bureau,
        type: applicationType,
        status: '100000',
        value: baseCarried,
      },
      {
        month,
        bureau,
        type: applicationType,
        status: '103000',
        value: baseNew,
      },
      {
        month,
        bureau,
        type: applicationType,
        status: '300000',
        value: Math.floor(baseProcessed),
      }
    );

    current.setMonth(current.getMonth() + 1);
  }

  return data;
}