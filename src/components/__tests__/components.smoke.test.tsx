// Smoke tests for redesigned components (jsdom).
// Assertions read their expected text out of the English catalogue rather than
// repeating it, so extracting or rewording a string doesn't quietly break the
// test — only removing the key does.
import { FileStack } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';

import type { ImmigrationData } from '../../hooks/useImmigrationData';
import { en } from '../../i18n/locales/en';
import { ja } from '../../i18n/locales/ja';
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
    renderWithProviders(
      <ChartDataTable
        table="intakeByMonth"
        chartKey="intake"
        data={data}
        filters={{ bureau: 'all', type: 'all' }}
        range="all"
      />
    );

    expect(screen.queryByRole('table')).toBeNull();
    fireEvent.click(screen.getByText(en['table.view']));
    expect(screen.getByText('2025-06')).toBeTruthy();
    expect(screen.getByText('500')).toBeTruthy();
    expect(screen.getByText('400')).toBeTruthy();
    expect(screen.queryByText('200')).toBeNull();
    expect(screen.getByText(en['table.downloadCsv'])).toBeTruthy();
  });

  it('renders the translated text under the Japanese locale', () => {
    // The catalogue reaches this component through the provider rather than a
    // prop, so this is what proves a locale switch actually lands in the DOM.
    // (The English-fallback path a partial locale depends on is covered
    // directly, with synthetic dictionaries, in i18n/__tests__/translate.test.ts.)
    renderWithProviders(
      <ChartDataTable
        table="intakeByMonth"
        chartKey="intake"
        data={data}
        filters={{ bureau: 'all', type: 'all' }}
        range="all"
      />,
      { locale: 'ja' }
    );
    expect(screen.getByText(ja['table.view']!)).toBeTruthy();
    expect(screen.queryByText(en['table.view'])).toBeNull();
    expect(screen.queryByText('table.view')).toBeNull();
  });

  it('follows the active chart rather than always showing intake', () => {
    // The reported bug, at the DOM: under Application Types the columns are
    // application types, and none of the intake statuses is among them.
    renderWithProviders(
      <ChartDataTable
        table="typesByMonth"
        chartKey="types"
        data={data}
        filters={{ bureau: 'all', type: 'all' }}
        range="all"
      />
    );
    fireEvent.click(screen.getByText(en['table.view']));
    expect(screen.getByText(en['appType.20'])).toBeTruthy();
    expect(screen.queryByText(en['metric.carriedOver'])).toBeNull();
  });

  it('swaps the row axis for a chart that breaks down by bureau', () => {
    renderWithProviders(
      <ChartDataTable
        table="shareByBureau"
        chartKey="share"
        data={data}
        filters={{ bureau: 'all', type: 'all' }}
        range="all"
      />
    );
    fireEvent.click(screen.getByText(en['table.view']));
    expect(screen.getByText(en['filters.bureau'])).toBeTruthy();
    expect(screen.getByText(en['bureau.101170'])).toBeTruthy();
    // The month axis is gone — the donut has no time dimension on screen.
    expect(screen.queryByText('2025-06')).toBeNull();
  });

  it('formats a percentage column through the locale formatter', () => {
    renderWithProviders(
      <ChartDataTable
        table="efficiencyByBureau"
        chartKey="efficiency"
        data={[
          entry({ bureau: '101170', status: '103000', value: 400 }),
          entry({ bureau: '101170', status: '300000', value: 300 }),
        ]}
        filters={{ bureau: 'all', type: 'all' }}
        range="all"
      />
    );
    fireEvent.click(screen.getByText(en['table.view']));
    expect(screen.getByText('75.0%')).toBeTruthy();
  });

  it('reports no data rather than an empty table', () => {
    renderWithProviders(
      <ChartDataTable
        table="intakeByMonth"
        chartKey="intake"
        data={[]}
        filters={{ bureau: 'all', type: 'all' }}
        range="all"
      />
    );
    fireEvent.click(screen.getByText(en['table.view']));
    expect(screen.getByText(en['common.noDataForFilters'])).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('downloads a file named for the chart, not one shared by every tab', () => {
    // jsdom implements neither, and the export used to produce a filename
    // identical across all seven charts.
    const downloads: string[] = [];
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }));
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloads.push(this.download);
      });

    renderWithProviders(
      <ChartDataTable
        table="typesByMonth"
        chartKey="types"
        data={data}
        filters={{ bureau: 'all', type: 'all' }}
        range="all"
      />
    );
    fireEvent.click(screen.getByText(en['table.view']));
    fireEvent.click(screen.getByText(en['table.downloadCsv']));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    // `nationwide`, not the `all` filter value or a bureau code — the name is
    // for whoever opens the file. See `bureauName` in utils/chartTables.ts.
    expect(downloads).toEqual(['immigration-stats_types_nationwide_all.csv']);

    click.mockRestore();
    vi.unstubAllGlobals();
  });
});
