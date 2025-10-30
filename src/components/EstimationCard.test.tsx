// src/components/EstimationCard.test.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { generateMockData, mockImmigrationData } from '../__mocks__/mockImmigrationData';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { EstimationCard } from './EstimationCard';

// Mock the calculateEstimatedDate function
const mockCalculateEstimatedDate = jest.fn();
jest.mock('../utils/calculateEstimates', () => ({
  calculateEstimatedDate: (data: any, details: any) => mockCalculateEstimatedDate(data, details),
}));

// Mock FilterInput component
jest.mock('./common/FilterInput', () => ({
  FilterInput: ({
    type,
    label,
    value,
    onChange,
    options,
    includeDefaultOption,
    defaultOptionLabel,
    filterFn,
    min,
    max,
  }: any) => {
    if (type === 'select') {
      const filteredOptions = filterFn ? options?.filter(filterFn) : options;
      return (
        <div data-testid={`filter-input-${label.toLowerCase().replace(/\s+/g, '-')}`}>
          <label>{label}</label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            data-testid={`select-${label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {includeDefaultOption && <option value="">{defaultOptionLabel}</option>}
            {filteredOptions?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }
    if (type === 'date') {
      return (
        <div data-testid={`filter-input-${label.toLowerCase().replace(/\s+/g, '-')}`}>
          <label>{label}</label>
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={min}
            max={max}
            data-testid={`input-${label.toLowerCase().replace(/\s+/g, '-')}`}
          />
        </div>
      );
    }
    return null;
  },
}));

// Mock FormulaTooltip component
jest.mock('./common/FormulaTooltip', () => ({
  FormulaTooltip: ({ children }: any) => <div data-testid="formula-tooltip">{children}</div>,
  variableExplanations: {
    D_rem: 'Days remaining',
    Q_pos: 'Queue position',
    R_daily: 'Daily rate',
    C_proc: 'Confirmed processed',
    E_proc: 'Estimated processed',
    Sigma_P: 'Sum processed',
    Sigma_D: 'Sum days',
    Q_app: 'Queue at application',
    C_prev: 'Previous carryover',
    N_app: 'New applications',
    P_app: 'Processed at application',
  },
}));

// Mock react-katex
jest.mock('react-katex', () => ({
  BlockMath: ({ math }: any) => <div data-testid="block-math">{math}</div>,
}));

// Mock iconify
jest.mock('@iconify/react', () => ({
  Icon: ({ icon }: any) => <span data-testid={`icon-${icon}`}>{icon}</span>,
}));

// Mock getBureauData
jest.mock('../utils/getBureauData', () => ({
  nonAirportBureaus: [
    { value: '101170', label: 'Shinagawa' },
    { value: '101460', label: 'Osaka' },
  ],
}));

// Mock applicationOptions
jest.mock('../constants/applicationOptions', () => ({
  applicationOptions: [
    { value: 'all', label: 'All Types' },
    { value: '20', label: 'Extension of Stay' },
    { value: '30', label: 'Change of Status' },
  ],
}));

describe('EstimationCard', () => {
  const mockOnCollapse = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to return null by default
    mockCalculateEstimatedDate.mockReturnValue(null);
  });

  describe('rendering - drawer variant', () => {
    it('should render with drawer variant by default', () => {
      render(<EstimationCard data={mockImmigrationData} />);

      expect(screen.getByText('Processing Time Estimator')).toBeInTheDocument();
      expect(screen.getByText('Immigration Bureau')).toBeInTheDocument();
      expect(screen.getByText('Application Type')).toBeInTheDocument();
      expect(screen.getByText('Application Date')).toBeInTheDocument();
    });

    it('should render close button for drawer variant', () => {
      render(<EstimationCard data={mockImmigrationData} variant="drawer" onClose={mockOnClose} />);

      const closeIcon = screen.getByTestId('icon-ci:close-md');
      expect(closeIcon).toBeInTheDocument();
    });

    it('should call onClose when close button clicked in drawer variant', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} variant="drawer" onClose={mockOnClose} />);

      const closeButton = screen.getByTestId('icon-ci:close-md').closest('button');
      await user.click(closeButton!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should render estimator-container class', () => {
      const { container } = render(<EstimationCard data={mockImmigrationData} />);

      expect(container.querySelector('.estimator-container')).toBeInTheDocument();
    });
  });

  describe('rendering - expandable variant', () => {
    it('should render collapsed state when isExpanded is false', () => {
      render(
        <EstimationCard
          data={mockImmigrationData}
          variant="expandable"
          isExpanded={false}
          onCollapse={mockOnCollapse}
        />
      );

      expect(screen.getByText('Processing Time Estimator')).toBeInTheDocument();
      expect(screen.queryByText('Immigration Bureau')).not.toBeInTheDocument();
      expect(screen.queryByText('Application Type')).not.toBeInTheDocument();

      // Should show chevron icons
      const chevrons = screen.getAllByTestId('icon-ci:chevron-left-duo');
      expect(chevrons).toHaveLength(2);
    });

    it('should render expanded state when isExpanded is true', () => {
      render(
        <EstimationCard
          data={mockImmigrationData}
          variant="expandable"
          isExpanded={true}
          onCollapse={mockOnCollapse}
        />
      );

      expect(screen.getByText('Processing Time Estimator')).toBeInTheDocument();
      expect(screen.getByText('Immigration Bureau')).toBeInTheDocument();
      expect(screen.getByText('Application Type')).toBeInTheDocument();
    });

    it('should call onCollapse when collapse button clicked in expandable variant', async () => {
      const user = userEvent.setup();
      render(
        <EstimationCard
          data={mockImmigrationData}
          variant="expandable"
          isExpanded={true}
          onCollapse={mockOnCollapse}
        />
      );

      const collapseButton = screen.getByTestId('icon-ci:chevron-right-duo').closest('button');
      await user.click(collapseButton!);

      expect(mockOnCollapse).toHaveBeenCalledTimes(1);
    });

    it('should call onCollapse when collapsed card clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <EstimationCard
          data={mockImmigrationData}
          variant="expandable"
          isExpanded={false}
          onCollapse={mockOnCollapse}
        />
      );

      const collapsedCard = container.querySelector('.flex.h-full.cursor-pointer');
      await user.click(collapsedCard!);

      expect(mockOnCollapse).toHaveBeenCalledTimes(1);
    });
  });

  describe('filter inputs', () => {
    it('should render bureau select with correct options', () => {
      render(<EstimationCard data={mockImmigrationData} />);

      const bureauSelect = screen.getByTestId('select-immigration-bureau');
      expect(bureauSelect).toBeInTheDocument();

      // Check for default option
      expect(within(bureauSelect).getByText('Select Bureau')).toBeInTheDocument();

      // Check for bureau options
      expect(within(bureauSelect).getByText('Shinagawa')).toBeInTheDocument();
      expect(within(bureauSelect).getByText('Osaka')).toBeInTheDocument();
    });

    it('should render application type select with correct options', () => {
      render(<EstimationCard data={mockImmigrationData} />);

      const typeSelect = screen.getByTestId('select-application-type');
      expect(typeSelect).toBeInTheDocument();

      // Check for default option
      expect(within(typeSelect).getByText('Select Type')).toBeInTheDocument();

      // Check for type options (should exclude 'all')
      expect(within(typeSelect).getByText('Extension of Stay')).toBeInTheDocument();
      expect(within(typeSelect).getByText('Change of Status')).toBeInTheDocument();
      expect(within(typeSelect).queryByText('All Types')).not.toBeInTheDocument();
    });

    it('should render date input', () => {
      render(<EstimationCard data={mockImmigrationData} />);

      const dateInput = screen.getByTestId('input-application-date');
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    it('should update bureau when selected', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} />);

      const bureauSelect = screen.getByTestId('select-immigration-bureau');
      await user.selectOptions(bureauSelect, '101170');

      expect(bureauSelect).toHaveValue('101170');
      expect(mockCalculateEstimatedDate).toHaveBeenCalledWith(
        mockImmigrationData,
        expect.objectContaining({ bureau: '101170' })
      );
    });

    it('should update application type when selected', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} />);

      const typeSelect = screen.getByTestId('select-application-type');
      await user.selectOptions(typeSelect, '20');

      expect(typeSelect).toHaveValue('20');
      expect(mockCalculateEstimatedDate).toHaveBeenCalledWith(
        mockImmigrationData,
        expect.objectContaining({ type: '20' })
      );
    });

    it('should update application date when changed', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} />);

      const dateInput = screen.getByTestId('input-application-date');
      await user.type(dateInput, '2024-03-15');

      expect(mockCalculateEstimatedDate).toHaveBeenCalledWith(
        mockImmigrationData,
        expect.objectContaining({ applicationDate: '2024-03-15' })
      );
    });

    it('should preserve other values when one input changes', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} />);

      const bureauSelect = screen.getByTestId('select-immigration-bureau');
      await user.selectOptions(bureauSelect, '101170');

      const typeSelect = screen.getByTestId('select-application-type');
      await user.selectOptions(typeSelect, '20');

      expect(mockCalculateEstimatedDate).toHaveBeenLastCalledWith(
        mockImmigrationData,
        expect.objectContaining({
          bureau: '101170',
          type: '20',
          applicationDate: '',
        })
      );
    });
  });

  describe('date range calculation', () => {
    it('should calculate correct min date from data', () => {
      render(<EstimationCard data={mockImmigrationData} />);

      const dateInput = screen.getByTestId('input-application-date');
      expect(dateInput).toHaveAttribute('min', '2024-01');
    });

    it('should set max date to current date', () => {
      // Mock current date
      const mockDate = new Date('2024-10-30T00:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      render(<EstimationCard data={mockImmigrationData} />);

      const dateInput = screen.getByTestId('input-application-date');
      expect(dateInput).toHaveAttribute('max', '2024-10-30');

      jest.restoreAllMocks();
    });

    it('should handle empty data array', () => {
      render(<EstimationCard data={[]} />);

      const dateInput = screen.getByTestId('input-application-date');
      expect(dateInput).toHaveAttribute('min', '');
      expect(dateInput).toHaveAttribute('max', expect.any(String));
    });

    it('should handle single month of data', () => {
      const singleMonthData: ImmigrationData[] = [
        {
          month: '2024-06',
          bureau: '101170',
          type: '20',
          status: '103000',
          value: 1000,
        },
      ];

      render(<EstimationCard data={singleMonthData} />);

      const dateInput = screen.getByTestId('input-application-date');
      expect(dateInput).toHaveAttribute('min', '2024-06');
    });

    it('should memoize date range calculation', () => {
      const { rerender } = render(<EstimationCard data={mockImmigrationData} />);

      const dateInput1 = screen.getByTestId('input-application-date');
      const min1 = dateInput1.getAttribute('min');

      // Rerender with same data
      rerender(<EstimationCard data={mockImmigrationData} />);

      const dateInput2 = screen.getByTestId('input-application-date');
      const min2 = dateInput2.getAttribute('min');

      expect(min1).toBe(min2);
    });
  });

  describe('estimation result display', () => {
    it('should not display estimation when result is null', () => {
      mockCalculateEstimatedDate.mockReturnValue(null);

      render(<EstimationCard data={mockImmigrationData} />);

      expect(screen.queryByText('Estimated Completion Date')).not.toBeInTheDocument();
    });

    it('should display estimation result when available', () => {
      const mockResult = {
        estimatedDate: new Date('2024-12-15'),
        details: {
          isPastDue: false,
          modelVariables: {
            C_prev: 10000,
            N_app: 5000,
            P_app: 4000,
            Q_app: 11000,
            C_proc: 2000,
            E_proc: 3000,
            Q_pos: 6000,
            R_daily: 250.5,
            Sigma_P: 50000,
            Sigma_D: 200,
            D_rem: 24,
          },
        },
      };

      mockCalculateEstimatedDate.mockReturnValue(mockResult);

      render(<EstimationCard data={mockImmigrationData} />);

      expect(screen.getByText('Estimated Completion Date')).toBeInTheDocument();
      expect(screen.getByText('December 15, 2024')).toBeInTheDocument();
    });

    it('should display date in correct format', () => {
      const mockResult = {
        estimatedDate: new Date('2024-06-30'),
        details: {
          isPastDue: false,
          modelVariables: {
            C_prev: 10000,
            N_app: 5000,
            P_app: 4000,
            Q_app: 11000,
            C_proc: 2000,
            E_proc: 3000,
            Q_pos: 6000,
            R_daily: 250,
            Sigma_P: 50000,
            Sigma_D: 200,
            D_rem: 24,
          },
        },
      };

      mockCalculateEstimatedDate.mockReturnValue(mockResult);

      render(<EstimationCard data={mockImmigrationData} />);

      // Should format as "Month Day, Year"
      expect(screen.getByText('June 30, 2024')).toBeInTheDocument();
    });

    it('should apply indigo color for on-time estimation', () => {
      const mockResult = {
        estimatedDate: new Date('2024-12-15'),
        details: {
          isPastDue: false,
          modelVariables: {
            C_prev: 10000,
            N_app: 5000,
            P_app: 4000,
            Q_app: 11000,
            C_proc: 2000,
            E_proc: 3000,
            Q_pos: 6000,
            R_daily: 250,
            Sigma_P: 50000,
            Sigma_D: 200,
            D_rem: 24,
          },
        },
      };

      mockCalculateEstimatedDate.mockReturnValue(mockResult);

      render(<EstimationCard data={mockImmigrationData} />);

      const dateElement = screen.getByText('December 15, 2024');
      expect(dateElement).toHaveClass('text-indigo-600');
      expect(dateElement).toHaveClass('dark:text-indigo-500');
    });

    it('should apply amber color for past due estimation', () => {
      const mockResult = {
        estimatedDate: new Date('2024-01-15'),
        details: {
          isPastDue: true,
          modelVariables: {
            C_prev: 10000,
            N_app: 5000,
            P_app: 4000,
            Q_app: 11000,
            C_proc: 2000,
            E_proc: 3000,
            Q_pos: 6000,
            R_daily: 250,
            Sigma_P: 50000,
            Sigma_D: 200,
            D_rem: 24,
          },
        },
      };

      mockCalculateEstimatedDate.mockReturnValue(mockResult);

      render(<EstimationCard data={mockImmigrationData} />);

      const dateElement = screen.getByText('January 15, 2024');
      expect(dateElement).toHaveClass('text-amber-600');
      expect(dateElement).toHaveClass('dark:text-amber-500');
    });

    it('should display disclaimer text', () => {
      const mockResult = {
        estimatedDate: new Date('2024-12-15'),
        details: {
          isPastDue: false,
          modelVariables: {
            C_prev: 10000,
            N_app: 5000,
            P_app: 4000,
            Q_app: 11000,
            C_proc: 2000,
            E_proc: 3000,
            Q_pos: 6000,
            R_daily: 250,
            Sigma_P: 50000,
            Sigma_D: 200,
            D_rem: 24,
          },
        },
      };

      mockCalculateEstimatedDate.mockReturnValue(mockResult);

      render(<EstimationCard data={mockImmigrationData} />);

      expect(
        screen.getByText(/This is an/, { exact: false })
      ).toBeInTheDocument();
      expect(screen.getByText(/estimate/)).toBeInTheDocument();
      expect(
        screen.getByText(/based on current processing rates/, { exact: false })
      ).toBeInTheDocument();
    });
  });

  describe('show details toggle', () => {
    const mockResult = {
      estimatedDate: new Date('2024-12-15'),
      details: {
        isPastDue: false,
        modelVariables: {
          C_prev: 10000,
          N_app: 5000,
          P_app: 4000,
          Q_app: 11000,
          C_proc: 2000,
          E_proc: 3000,
          Q_pos: 6000,
          R_daily: 250.5,
          Sigma_P: 50000,
          Sigma_D: 200,
          D_rem: 24,
        },
      },
    };

    beforeEach(() => {
      mockCalculateEstimatedDate.mockReturnValue(mockResult);
    });

    it('should show "Show Details" button by default', () => {
      render(<EstimationCard data={mockImmigrationData} />);

      expect(screen.getByText('Show Details')).toBeInTheDocument();
      expect(screen.getByTestId('icon-material-symbols:info-outline')).toBeInTheDocument();
    });

    it('should toggle to show details when clicked', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} />);

      const toggleButton = screen.getByText('Show Details');
      await user.click(toggleButton);

      expect(screen.getByText('Show Filters')).toBeInTheDocument();
      expect(screen.getByTestId('icon-material-symbols:settings')).toBeInTheDocument();
    });

    it('should hide filters when showing details', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} />);

      const toggleButton = screen.getByText('Show Details');
      await user.click(toggleButton);

      // Filter inputs should be hidden
      expect(screen.queryByText('Immigration Bureau')).not.toBeInTheDocument();
      expect(screen.queryByText('Application Type')).not.toBeInTheDocument();
      expect(screen.queryByText('Application Date')).not.toBeInTheDocument();
    });

    it('should show filters when hiding details', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} />);

      // Show details
      const showButton = screen.getByText('Show Details');
      await user.click(showButton);

      // Hide details
      const hideButton = screen.getByText('Show Filters');
      await user.click(hideButton);

      // Filter inputs should be visible
      expect(screen.getByText('Immigration Bureau')).toBeInTheDocument();
      expect(screen.getByText('Application Type')).toBeInTheDocument();
      expect(screen.getByText('Application Date')).toBeInTheDocument();
    });

    it('should display formula tooltips when details shown', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} />);

      const toggleButton = screen.getByText('Show Details');
      await user.click(toggleButton);

      const tooltips = screen.getAllByTestId('formula-tooltip');
      expect(tooltips.length).toBeGreaterThan(0);
    });

    it('should display block math formulas when details shown', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} />);

      const toggleButton = screen.getByText('Show Details');
      await user.click(toggleButton);

      const formulas = screen.getAllByTestId('block-math');
      expect(formulas.length).toBeGreaterThan(0);
    });

    it('should display model variables in formulas', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} />);

      const toggleButton = screen.getByText('Show Details');
      await user.click(toggleButton);

      const formulas = screen.getAllByTestId('block-math');
      const formulaTexts = formulas.map((f) => f.textContent);

      // Check that variables are displayed
      expect(formulaTexts.some((text) => text?.includes('6000'))).toBe(true); // Q_pos
      expect(formulaTexts.some((text) => text?.includes('250.50'))).toBe(true); // R_daily
      expect(formulaTexts.some((text) => text?.includes('24'))).toBe(true); // D_rem
    });
  });

  describe('past due warning', () => {
    it('should show warning when application is past due', async () => {
      const user = userEvent.setup();
      const mockResult = {
        estimatedDate: new Date('2024-01-15'),
        details: {
          isPastDue: true,
          modelVariables: {
            C_prev: 10000,
            N_app: 5000,
            P_app: 4000,
            Q_app: 11000,
            C_proc: 2000,
            E_proc: 3000,
            Q_pos: 6000,
            R_daily: 250,
            Sigma_P: 50000,
            Sigma_D: 200,
            D_rem: 24,
          },
        },
      };

      mockCalculateEstimatedDate.mockReturnValue(mockResult);

      render(<EstimationCard data={mockImmigrationData} />);

      // Show details to see warning
      const toggleButton = screen.getByText('Show Details');
      await user.click(toggleButton);

      expect(
        screen.getByText(/Based on expected processing rates/, { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/completion of this application may be past due/, { exact: false })
      ).toBeInTheDocument();
    });

    it('should not show warning when application is not past due', async () => {
      const user = userEvent.setup();
      const mockResult = {
        estimatedDate: new Date('2024-12-15'),
        details: {
          isPastDue: false,
          modelVariables: {
            C_prev: 10000,
            N_app: 5000,
            P_app: 4000,
            Q_app: 11000,
            C_proc: 2000,
            E_proc: 3000,
            Q_pos: 6000,
            R_daily: 250,
            Sigma_P: 50000,
            Sigma_D: 200,
            D_rem: 24,
          },
        },
      };

      mockCalculateEstimatedDate.mockReturnValue(mockResult);

      render(<EstimationCard data={mockImmigrationData} />);

      const toggleButton = screen.getByText('Show Details');
      await user.click(toggleButton);

      expect(
        screen.queryByText(/completion of this application may be past due/, { exact: false })
      ).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle data updates', () => {
      const { rerender } = render(<EstimationCard data={mockImmigrationData} />);

      const newData = generateMockData('101170', '2024-01', '2024-12', '20');
      rerender(<EstimationCard data={newData} />);

      expect(mockCalculateEstimatedDate).toHaveBeenCalledWith(newData, expect.any(Object));
    });

    it('should handle empty applicationDetails gracefully', () => {
      mockCalculateEstimatedDate.mockReturnValue(null);

      render(<EstimationCard data={mockImmigrationData} />);

      expect(mockCalculateEstimatedDate).toHaveBeenCalledWith(mockImmigrationData, {
        bureau: '',
        type: '',
        applicationDate: '',
      });
    });

    it('should memoize estimation calculation', () => {
      const { rerender } = render(<EstimationCard data={mockImmigrationData} />);

      const callCount1 = mockCalculateEstimatedDate.mock.calls.length;

      // Rerender with same data and details
      rerender(<EstimationCard data={mockImmigrationData} />);

      const callCount2 = mockCalculateEstimatedDate.mock.calls.length;

      // Should not recalculate if data and details haven't changed
      expect(callCount2).toBe(callCount1);
    });

    it('should handle very large model variable values', async () => {
      const user = userEvent.setup();
      const mockResult = {
        estimatedDate: new Date('2025-12-31'),
        details: {
          isPastDue: false,
          modelVariables: {
            C_prev: 999999,
            N_app: 888888,
            P_app: 777777,
            Q_app: 1111110,
            C_proc: 666666,
            E_proc: 555555,
            Q_pos: 444444,
            R_daily: 9999.99,
            Sigma_P: 8888888,
            Sigma_D: 777,
            D_rem: 44,
          },
        },
      };

      mockCalculateEstimatedDate.mockReturnValue(mockResult);

      render(<EstimationCard data={mockImmigrationData} />);

      const toggleButton = screen.getByText('Show Details');
      await user.click(toggleButton);

      // Should handle large numbers without crashing
      expect(screen.getByText('December 31, 2025')).toBeInTheDocument();
    });

    it('should handle zero model variable values', async () => {
      const user = userEvent.setup();
      const mockResult = {
        estimatedDate: new Date('2024-12-15'),
        details: {
          isPastDue: false,
          modelVariables: {
            C_prev: 0,
            N_app: 0,
            P_app: 0,
            Q_app: 0,
            C_proc: 0,
            E_proc: 0,
            Q_pos: 0,
            R_daily: 0,
            Sigma_P: 0,
            Sigma_D: 0,
            D_rem: 0,
          },
        },
      };

      mockCalculateEstimatedDate.mockReturnValue(mockResult);

      render(<EstimationCard data={mockImmigrationData} />);

      const toggleButton = screen.getByText('Show Details');
      await user.click(toggleButton);

      // Should handle zero values without crashing
      expect(screen.getByText('December 15, 2024')).toBeInTheDocument();
    });

    it('should handle missing onCollapse callback', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} variant="expandable" isExpanded={true} />);

      const collapseButton = screen.getByTestId('icon-ci:chevron-right-duo').closest('button');

      // Should not throw when clicked
      await expect(user.click(collapseButton!)).resolves.not.toThrow();
    });

    it('should handle missing onClose callback', async () => {
      const user = userEvent.setup();
      render(<EstimationCard data={mockImmigrationData} variant="drawer" />);

      const closeButton = screen.getByTestId('icon-ci:close-md').closest('button');

      // Should not throw when clicked
      await expect(user.click(closeButton!)).resolves.not.toThrow();
    });
  });

  describe('accessibility', () => {
    it('should render with proper heading hierarchy', () => {
      render(<EstimationCard data={mockImmigrationData} />);

      const heading = screen.getByRole('heading', { name: 'Processing Time Estimator' });
      expect(heading).toBeInTheDocument();
    });

    it('should render buttons with proper semantics', () => {
      render(<EstimationCard data={mockImmigrationData} variant="drawer" onClose={mockOnClose} />);

      const button = screen.getByTestId('icon-ci:close-md').closest('button');
      expect(button).toBeInTheDocument();
      expect(button?.tagName).toBe('BUTTON');
    });

    it('should render show details button as a button element', () => {
      const mockResult = {
        estimatedDate: new Date('2024-12-15'),
        details: {
          isPastDue: false,
          modelVariables: {
            C_prev: 10000,
            N_app: 5000,
            P_app: 4000,
            Q_app: 11000,
            C_proc: 2000,
            E_proc: 3000,
            Q_pos: 6000,
            R_daily: 250,
            Sigma_P: 50000,
            Sigma_D: 200,
            D_rem: 24,
          },
        },
      };

      mockCalculateEstimatedDate.mockReturnValue(mockResult);

      render(<EstimationCard data={mockImmigrationData} />);

      const toggleButton = screen.getByText('Show Details');
      expect(toggleButton.tagName).toBe('BUTTON');
    });
  });
});
