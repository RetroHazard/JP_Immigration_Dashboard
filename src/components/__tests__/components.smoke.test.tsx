// Smoke tests for redesigned components (jsdom).
// Assertions read their expected text out of the English catalogue rather than
// repeating it, so extracting or rewording a string doesn't quietly break the
// test — only removing the key does.
import { FileStack } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { en } from '../../i18n/locales/en';
import { renderWithProviders, screen } from '../../test-utils';
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
    renderWithProviders(
      <StatCard
        title={en['stats.totalApplications']}
        subtitle={en['bureau.all']}
        value={12345}
        formatValue={(v) => Math.round(v).toLocaleString('en-US')}
        color="blue"
        icon={FileStack}
        delta={{ percent: 3.2, direction: 'neutral' }}
      />
    );
    expect(screen.getByText(en['stats.totalApplications'])).toBeTruthy();
    expect(screen.getByText('12,345')).toBeTruthy();
    expect(screen.getByText(en['stats.momDelta'].replace('{delta}', '+3.2%'))).toBeTruthy();
  });
});

describe('SeriesLegend', () => {
  it('renders one entry per series', () => {
    renderWithProviders(
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
  const data = [
    entry({ status: '103000', value: 500 }),
    entry({ status: '300000', value: 400 }),
    entry({ bureau: '101170', status: '103000', value: 200 }), // excluded: nationwide scope
  ];

  it('opens the table and shows monthly sums for the nationwide scope', () => {
    renderWithProviders(<ChartDataTable data={data} filters={{ bureau: 'all', type: 'all' }} range="all" />);

    fireEvent.click(screen.getByText(en['table.view']));
    expect(screen.getByText('2025-06')).toBeTruthy();
    expect(screen.getByText('500')).toBeTruthy();
    expect(screen.getByText('400')).toBeTruthy();
    expect(screen.queryByText('200')).toBeNull();
    expect(screen.getByText(en['table.downloadCsv'])).toBeTruthy();
  });

  it('renders the same English text under an untranslated locale', () => {
    // ja.ts has no `table.*` keys yet, so this exercises the fallback path an
    // in-progress translation depends on — nothing should render as a raw key.
    renderWithProviders(<ChartDataTable data={data} filters={{ bureau: 'all', type: 'all' }} range="all" />, {
      locale: 'ja',
    });
    expect(screen.getByText(en['table.view'])).toBeTruthy();
    expect(screen.queryByText('table.view')).toBeNull();
  });
});
