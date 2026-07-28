// Smoke tests for redesigned components (jsdom).
import { FileStack } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { ChartDataTable } from '../ChartDataTable';
import { SeriesLegend } from '../common/SeriesLegend';
import { StatCard } from '../common/StatCard';

const entry = (overrides: Partial<ImmigrationData>): ImmigrationData => ({
  month: '2025-06',
  bureau: '100000',
  type: '20',
  status: '103000',
  value: 100,
  ...overrides,
});

describe('StatCard', () => {
  it('renders title, formatted value, and MoM delta', () => {
    render(
      <StatCard
        title="Total Applications"
        subtitle="Nationwide"
        value={12345}
        formatValue={(v) => Math.round(v).toLocaleString('en-US')}
        color="blue"
        icon={FileStack}
        delta={{ percent: 3.2, direction: 'neutral' }}
      />
    );
    expect(screen.getByText('Total Applications')).toBeTruthy();
    expect(screen.getByText('12,345')).toBeTruthy();
    expect(screen.getByText(/\+3\.2% MoM/)).toBeTruthy();
  });
});

describe('SeriesLegend', () => {
  it('renders one entry per series', () => {
    render(
      <SeriesLegend
        items={[
          { id: 'received', label: 'Received', color: 'var(--chart-1)' },
          { id: 'processed', label: 'Processed', color: 'var(--chart-2)', shape: 'line' },
        ]}
      />
    );
    expect(screen.getByText('Received')).toBeTruthy();
    expect(screen.getByText('Processed')).toBeTruthy();
  });
});

describe('ChartDataTable', () => {
  it('opens the table and shows monthly sums for the nationwide scope', () => {
    const data = [
      entry({ status: '103000', value: 500 }),
      entry({ status: '300000', value: 400 }),
      entry({ bureau: '101170', status: '103000', value: 200 }), // excluded: nationwide scope
    ];
    render(<ChartDataTable data={data} filters={{ bureau: 'all', type: 'all' }} range="all" />);

    fireEvent.click(screen.getByText('View data table'));
    expect(screen.getByText('2025-06')).toBeTruthy();
    expect(screen.getByText('500')).toBeTruthy();
    expect(screen.getByText('400')).toBeTruthy();
    expect(screen.queryByText('200')).toBeNull();
    expect(screen.getByText('Download CSV')).toBeTruthy();
  });
});
