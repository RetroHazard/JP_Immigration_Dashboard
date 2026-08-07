// Smoke tests for the residents dataset's chrome (jsdom).
// Same convention as components.smoke.test.tsx: expected text is read out of
// the English catalogue rather than repeated, so rewording a string doesn't
// quietly break the test.
import { describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';

import { en } from '../../i18n/locales/en';
import { renderWithProviders, screen } from '../../test-utils';
import type { ResidentRecord } from '../../utils/residentsData';
import {
  CHART_KEYS,
  CHARTS_BY_DATASET,
  datasetForChart,
  PROCESSING_CHARTS,
  RESIDENT_CHARTS,
} from '../common/ChartComponents';
import { ResidentFilterPanel } from '../ResidentFilterPanel';
import { ResidentsStatsSummary } from '../ResidentsStatsSummary';

const record = (period: string, status: string, nationality: string, value: number): ResidentRecord => ({
  period,
  status,
  nationality,
  value,
});

const DATA: ResidentRecord[] = [
  record('2025-06', '1430', '1230', 90),
  record('2025-06', '1380', '1360', 40),
  record('2025-12', '1430', '1230', 100),
  record('2025-12', '1380', '1360', 50),
];

describe('chart registry', () => {
  it('keys every chart uniquely across both datasets', () => {
    // The active dataset is derived from ?chart=, so a key shared between the
    // registries would make a permalink ambiguous.
    expect(CHART_KEYS).toHaveLength(new Set(CHART_KEYS).size);
  });

  it('maps each key back to the dataset that owns it', () => {
    for (const chart of PROCESSING_CHARTS) expect(datasetForChart(chart.key)).toBe('processing');
    for (const chart of RESIDENT_CHARTS) expect(datasetForChart(chart.key)).toBe('residents');
  });

  it('falls back to the processing dataset for an unknown key', () => {
    expect(datasetForChart('not-a-chart')).toBe('processing');
  });

  it('gives every chart a default range it actually offers', () => {
    for (const charts of Object.values(CHARTS_BY_DATASET)) {
      for (const chart of charts) {
        if (chart.ranges.length === 0) continue;
        expect(chart.ranges as readonly string[]).toContain(chart.defaultRange);
      }
    }
  });

  it('names the residents ranges in years, not months', () => {
    // '12' would read as twelve months and mean six years on a half-yearly
    // table — the ambiguity this naming exists to remove.
    const numeric = RESIDENT_CHARTS.flatMap((chart) => chart.ranges).filter((range) => /\d/.test(range));
    expect(numeric.every((range) => range.endsWith('y'))).toBe(true);
  });

  it('pairs the snapshot time control with an empty range list, and vice versa', () => {
    // A snapshot chart draws one period, so offering range windows would be
    // a lie; a range chart with no ranges would render no picker at all.
    for (const chart of RESIDENT_CHARTS) {
      expect(chart.timeControl === 'snapshot').toBe(chart.ranges.length === 0);
    }
  });
});

describe('ResidentsStatsSummary', () => {
  it('reports the latest period’s total and a half-over-half delta', () => {
    renderWithProviders(<ResidentsStatsSummary data={DATA} filters={{ region: 'all', nationality: 'all', group: 'all' }} />);
    expect(screen.getByText(en['residents.total'])).toBeTruthy();
    expect(screen.getByText('150')).toBeTruthy();
    // 150 vs 130, and worded for half-years rather than "MoM".
    expect(screen.getByText(en['residents.delta'].replace('{delta}', '+15.4%'))).toBeTruthy();
  });

  it('names the largest nationality and status', () => {
    renderWithProviders(<ResidentsStatsSummary data={DATA} filters={{ region: 'all', nationality: 'all', group: 'all' }} />);
    expect(screen.getByText(en['residents.topNationality'])).toBeTruthy();
    expect(screen.getByText('China')).toBeTruthy();
    expect(screen.getByText(/Permanent Resident/)).toBeTruthy();
  });

  it('renders nothing rather than crashing on empty data', () => {
    const { container } = renderWithProviders(
      <ResidentsStatsSummary data={[]} filters={{ region: 'all', nationality: 'all', group: 'all' }} />
    );
    expect(container.textContent).toBe('');
  });
});

describe('ResidentFilterPanel', () => {
  const renderPanel = (onChange = () => {}) =>
    renderWithProviders(
      <ResidentFilterPanel
        filters={{ region: 'all', nationality: 'all', group: 'all' }}
        onChange={onChange}
        filterConfig={{ region: true, nationality: true, group: true }}
        onReset={() => {}}
      />
    );

  it('labels all three selects and defaults them to "all"', () => {
    renderPanel();
    expect(screen.getByText(en['filters.region'])).toBeTruthy();
    expect(screen.getByText(en['filters.nationality'])).toBeTruthy();
    expect(screen.getByText(en['filters.residenceStatus'])).toBeTruthy();
    expect(screen.getByText(en['filters.allRegions'])).toBeTruthy();
    expect(screen.getByText(en['filters.allNationalities'])).toBeTruthy();
    expect(screen.getByText(en['filters.allCategories'])).toBeTruthy();
  });

  it('clears a nationality that falls outside a newly selected region', () => {
    let emitted: { region: string; nationality: string } | null = null;
    renderWithProviders(
      <ResidentFilterPanel
        // China selected, then the user switches the region to Europe.
        filters={{ region: 'all', nationality: '1230', group: 'all' }}
        onChange={(next) => {
          emitted = next;
        }}
        filterConfig={{ region: true, nationality: true, group: true }}
        onReset={() => {}}
      />
    );
    const regionSelect = screen.getByLabelText(en['filters.region']) as HTMLSelectElement;
    fireEvent.change(regionSelect, { target: { value: '2000' } });
    expect(emitted).toMatchObject({ region: '2000', nationality: 'all' });
  });

  it('keeps a nationality that belongs to the newly selected region', () => {
    let emitted: { region: string; nationality: string } | null = null;
    renderWithProviders(
      <ResidentFilterPanel
        filters={{ region: 'all', nationality: '1230', group: 'all' }}
        onChange={(next) => {
          emitted = next;
        }}
        filterConfig={{ region: true, nationality: true, group: true }}
        onReset={() => {}}
      />
    );
    const regionSelect = screen.getByLabelText(en['filters.region']) as HTMLSelectElement;
    fireEvent.change(regionSelect, { target: { value: '1000' } });
    expect(emitted).toMatchObject({ region: '1000', nationality: '1230' });
  });

  it('disables the reset button while the filters are untouched', () => {
    renderPanel();
    const reset = screen.getByLabelText(en['filters.reset']) as HTMLButtonElement;
    expect(reset.disabled).toBe(true);
  });

  it('enables reset once a filter moves off its default', () => {
    renderWithProviders(
      <ResidentFilterPanel
        filters={{ region: 'all', nationality: '1230', group: 'all' }}
        onChange={() => {}}
        filterConfig={{ region: true, nationality: true, group: true }}
        onReset={() => {}}
      />
    );
    expect((screen.getByLabelText(en['filters.reset']) as HTMLButtonElement).disabled).toBe(false);
  });

  it('calls onReset when the button is pressed', () => {
    let reset = false;
    renderWithProviders(
      <ResidentFilterPanel
        filters={{ region: 'all', nationality: '1230', group: 'all' }}
        onChange={() => {}}
        filterConfig={{ region: true, nationality: true, group: true }}
        onReset={() => {
          reset = true;
        }}
      />
    );
    fireEvent.click(screen.getByLabelText(en['filters.reset']));
    expect(reset).toBe(true);
  });
});
