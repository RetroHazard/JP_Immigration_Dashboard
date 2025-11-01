// src/components/FilterPanel.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { logger } from '../utils/logger';
import { FilterPanel } from './FilterPanel';

// Mock the logger module
jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock FilterInput component
jest.mock('./common/FilterInput', () => ({
  FilterInput: ({ label, value, onChange, disabled, options }: any) => (
    <div data-testid={`filter-input-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        data-testid={`select-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

describe('FilterPanel', () => {
  const mockData = [
    { month: '2024-01' },
    { month: '2024-02' },
    { month: '2024-03' },
    { month: '2024-04' },
  ];

  const defaultFilters = {
    bureau: 'all',
    type: 'all',
  };

  const defaultFilterConfig = {
    bureau: true,
    appType: true,
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render filter inputs', () => {
      render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(screen.getByText('Immigration Bureau')).toBeInTheDocument();
      expect(screen.getByText('Application Type')).toBeInTheDocument();
    });

    it('should display date range note', () => {
      render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(screen.getByText(/Data is available from/)).toBeInTheDocument();
    });

    it('should render with base-container class', () => {
      const { container } = render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(container.querySelector('.base-container')).toBeInTheDocument();
    });

    it('should render filter-block container', () => {
      const { container } = render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(container.querySelector('.filter-block')).toBeInTheDocument();
    });
  });

  describe('date range calculation', () => {
    it('should calculate correct date range from data', () => {
      render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(screen.getByText(/January 2024 through April 2024/)).toBeInTheDocument();
    });

    it('should handle single month of data', () => {
      const singleMonthData = [{ month: '2024-06' }];

      render(
        <FilterPanel
          data={singleMonthData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(screen.getByText(/June 2024 through June 2024/)).toBeInTheDocument();
    });

    it('should handle empty data array', () => {
      render(
        <FilterPanel
          data={[]}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(logger.debug).toHaveBeenCalledWith('No valid data provided');
      // Empty data should show empty date strings
      const dateNote = screen.getByText(/Data is available from/);
      expect(dateNote).toBeInTheDocument();
      expect(dateNote.textContent).toContain('through');
    });

    it('should handle null data', () => {
      render(
        <FilterPanel
          data={null as any}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(logger.debug).toHaveBeenCalledWith('No valid data provided');
    });

    it('should handle data with no valid months', () => {
      const invalidData = [{ month: '' }, { month: null as any }, { month: undefined as any }];

      render(
        <FilterPanel
          data={invalidData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(logger.debug).toHaveBeenCalledWith('No valid months found in data');
    });

    it('should filter out falsy month values', () => {
      const dataWithFalsyMonths = [
        { month: '2024-01' },
        { month: '' },
        { month: null as any },
        { month: '2024-03' },
      ];

      render(
        <FilterPanel
          data={dataWithFalsyMonths}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(screen.getByText(/January 2024 through March 2024/)).toBeInTheDocument();
    });

    it('should handle unsorted months', () => {
      const unsortedData = [{ month: '2024-12' }, { month: '2024-01' }, { month: '2024-06' }];

      render(
        <FilterPanel
          data={unsortedData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(screen.getByText(/January 2024 through December 2024/)).toBeInTheDocument();
    });

    it('should handle duplicate months', () => {
      const duplicateData = [
        { month: '2024-01' },
        { month: '2024-01' },
        { month: '2024-02' },
        { month: '2024-02' },
      ];

      render(
        <FilterPanel
          data={duplicateData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(screen.getByText(/January 2024 through February 2024/)).toBeInTheDocument();
    });
  });

  describe('date formatting', () => {
    it('should format dates correctly', () => {
      render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(screen.getByText(/January 2024/)).toBeInTheDocument();
      expect(screen.getByText(/April 2024/)).toBeInTheDocument();
    });

    it('should handle different months', () => {
      const differentMonths = [{ month: '2023-12' }, { month: '2024-06' }];

      render(
        <FilterPanel
          data={differentMonths}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(screen.getByText(/December 2023/)).toBeInTheDocument();
      expect(screen.getByText(/June 2024/)).toBeInTheDocument();
    });

    it('should format empty string as empty', () => {
      render(
        <FilterPanel
          data={[]}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      // Empty dates should result in empty strings
      const text = screen.getByText(/Data is available from/);
      expect(text.textContent).toContain('through');
    });
  });

  describe('filter interaction', () => {
    it('should call onChange when bureau filter changes', async () => {
      const user = userEvent.setup();

      render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      const bureauSelect = screen.getByTestId('select-immigration-bureau');
      await user.selectOptions(bureauSelect, 'all');

      expect(mockOnChange).toHaveBeenCalledWith({
        bureau: 'all',
        type: 'all',
      });
    });

    it('should call onChange when application type filter changes', async () => {
      const user = userEvent.setup();

      render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      const typeSelect = screen.getByTestId('select-application-type');
      await user.selectOptions(typeSelect, 'all');

      expect(mockOnChange).toHaveBeenCalledWith({
        bureau: 'all',
        type: 'all',
      });
    });

    it('should preserve other filter values when one changes', async () => {
      const user = userEvent.setup();
      const customFilters = { bureau: '101170', type: '20' };

      render(
        <FilterPanel
          data={mockData}
          filters={customFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      const bureauSelect = screen.getByTestId('select-immigration-bureau');
      await user.selectOptions(bureauSelect, '101460');

      expect(mockOnChange).toHaveBeenCalledWith({
        bureau: '101460',
        type: '20', // Type should be preserved
      });
    });
  });

  describe('filter config (disabled states)', () => {
    it('should disable bureau filter when filterConfig.bureau is false', () => {
      const disabledBureauConfig = { bureau: false, appType: true };

      render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={disabledBureauConfig}
        />
      );

      const bureauSelect = screen.getByTestId('select-immigration-bureau');
      expect(bureauSelect).toBeDisabled();
    });

    it('should disable app type filter when filterConfig.appType is false', () => {
      const disabledTypeConfig = { bureau: true, appType: false };

      render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={disabledTypeConfig}
        />
      );

      const typeSelect = screen.getByTestId('select-application-type');
      expect(typeSelect).toBeDisabled();
    });

    it('should enable both filters when filterConfig allows', () => {
      render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      const bureauSelect = screen.getByTestId('select-immigration-bureau');
      const typeSelect = screen.getByTestId('select-application-type');

      expect(bureauSelect).not.toBeDisabled();
      expect(typeSelect).not.toBeDisabled();
    });

    it('should disable both filters when filterConfig disallows', () => {
      const allDisabledConfig = { bureau: false, appType: false };

      render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={allDisabledConfig}
        />
      );

      const bureauSelect = screen.getByTestId('select-immigration-bureau');
      const typeSelect = screen.getByTestId('select-application-type');

      expect(bureauSelect).toBeDisabled();
      expect(typeSelect).toBeDisabled();
    });
  });

  describe('edge cases', () => {
    it('should handle non-array data', () => {
      render(
        <FilterPanel
          data={'not-an-array' as any}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(logger.debug).toHaveBeenCalledWith('No valid data provided');
    });

    it('should handle undefined data', () => {
      render(
        <FilterPanel
          data={undefined as any}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(logger.debug).toHaveBeenCalledWith('No valid data provided');
    });

    it('should memoize date range calculation', () => {
      const { rerender } = render(
        <FilterPanel
          data={mockData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      const initialText = screen.getByText(/Data is available from/).textContent;

      // Rerender with same data
      rerender(
        <FilterPanel
          data={mockData}
          filters={{ bureau: '101170', type: '20' }}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      const afterText = screen.getByText(/Data is available from/).textContent;

      // Text should be the same since data hasn't changed
      expect(initialText).toBe(afterText);
    });

    it('should handle data with additional properties', () => {
      const extendedData = [
        { month: '2024-01', extra: 'data' },
        { month: '2024-02', foo: 'bar' },
      ];

      render(
        <FilterPanel
          data={extendedData as any}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(screen.getByText(/January 2024 through February 2024/)).toBeInTheDocument();
    });

    it('should handle very long date ranges', () => {
      const longRangeData = [{ month: '2020-01' }, { month: '2024-12' }];

      render(
        <FilterPanel
          data={longRangeData}
          filters={defaultFilters}
          onChange={mockOnChange}
          filterConfig={defaultFilterConfig}
        />
      );

      expect(screen.getByText(/January 2020 through December 2024/)).toBeInTheDocument();
    });
  });
});
