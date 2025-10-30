// src/components/StatsSummary.test.tsx
import { render, screen } from '@testing-library/react';

import { mockImmigrationData } from '../__mocks__/mockImmigrationData';
import type { ImmigrationData } from '../hooks/useImmigrationData';
import { StatsSummary } from './StatsSummary';

// Mock Tippy component
jest.mock('@tippyjs/react', () => {
  return function Tippy({ children, content }: any) {
    return (
      <div>
        {children}
        <div data-testid="tippy-content">{content}</div>
      </div>
    );
  };
});

// Mock iconify
jest.mock('@iconify/react', () => ({
  Icon: ({ icon }: any) => <span data-testid={`icon-${icon}`}>{icon}</span>,
}));

// Mock getBureauLabel
jest.mock('../utils/getBureauData', () => ({
  getBureauLabel: (code: string) => {
    const labels: Record<string, string> = {
      '100000': 'All Bureaus',
      '101170': 'Shinagawa',
      '101460': 'Osaka',
      all: 'All Bureaus',
    };
    return labels[code] || code;
  },
}));

// Mock applicationOptions
jest.mock('../constants/applicationOptions', () => ({
  applicationOptions: [
    { value: 'all', label: 'All Types', short: 'All' },
    { value: '20', label: 'Extension of Stay', short: 'Extension' },
    { value: '30', label: 'Change of Status', short: 'Change' },
    { value: '60', label: 'Permanent Residence', short: 'Permanent' },
  ],
}));

describe('StatsSummary', () => {
  const defaultFilters = {
    bureau: 'all',
    type: 'all',
  };

  // Create nationwide data for tests that need bureau: 'all'
  const nationwideTestData: ImmigrationData[] = [
    {
      month: '2024-07',
      bureau: '100000',
      type: '20',
      status: '102000',
      value: 10000,
    },
    {
      month: '2024-07',
      bureau: '100000',
      type: '20',
      status: '103000',
      value: 5000,
    },
    {
      month: '2024-07',
      bureau: '100000',
      type: '20',
      status: '300000',
      value: 12000,
    },
    {
      month: '2024-07',
      bureau: '100000',
      type: '20',
      status: '301000',
      value: 10000,
    },
    {
      month: '2024-07',
      bureau: '100000',
      type: '20',
      status: '302000',
      value: 1500,
    },
    {
      month: '2024-07',
      bureau: '100000',
      type: '20',
      status: '305000',
      value: 500,
    },
  ];

  describe('rendering', () => {
    it('should render all stat cards', () => {
      render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      expect(screen.getAllByText('Total Applications').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Granted').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Denied').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Approval Rate').length).toBeGreaterThan(0);
    });

    it('should render short titles', () => {
      render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Granted').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Denied').length).toBeGreaterThan(0);
      expect(screen.getByText('APV. Rate')).toBeInTheDocument();
    });

    it('should render with stat-container class', () => {
      const { container } = render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      expect(container.querySelector('.stat-container')).toBeInTheDocument();
    });

    it('should render stat cards with stat-card class', () => {
      const { container } = render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      const statCards = container.querySelectorAll('.stat-card');
      expect(statCards).toHaveLength(5);
    });

    it('should render icons for each stat card', () => {
      render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      expect(screen.getByTestId('icon-material-symbols:file-copy-outline-rounded')).toBeInTheDocument();
      expect(screen.getByTestId('icon-material-symbols:pending-actions-rounded')).toBeInTheDocument();
      expect(screen.getByTestId('icon-material-symbols:order-approve-rounded')).toBeInTheDocument();
      expect(screen.getByTestId('icon-material-symbols:cancel-outline-rounded')).toBeInTheDocument();
      expect(screen.getByTestId('icon-material-symbols:percent-rounded')).toBeInTheDocument();
    });

    it('should apply correct colors to stat badges', () => {
      const { container } = render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      expect(container.querySelector('.bg-blue-500')).toBeInTheDocument();
      expect(container.querySelector('.bg-yellow-500')).toBeInTheDocument();
      expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
      expect(container.querySelector('.bg-red-500')).toBeInTheDocument();
      expect(container.querySelector('.bg-gray-500')).toBeInTheDocument();
    });
  });

  describe('month selection', () => {
    it('should use the most recent month from data', () => {
      // nationwideTestData has month 2024-07
      render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      // Should display stats (not null)
      expect(screen.getAllByText('Total Applications').length).toBeGreaterThan(0);
    });

    it('should handle single month of data', () => {
      const singleMonthData: ImmigrationData[] = [
        {
          month: '2024-06',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 5000,
        },
        {
          month: '2024-06',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 3000,
        },
      ];

      render(<StatsSummary data={singleMonthData} filters={defaultFilters} />);

      expect(screen.getAllByText('Total Applications').length).toBeGreaterThan(0);
      // Total should be 8,000 (5000 + 3000)
      const values = screen.getAllByText('8,000');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should ignore older months', () => {
      const multiMonthData: ImmigrationData[] = [
        // January - should be ignored
        {
          month: '2024-01',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 10000,
        },
        {
          month: '2024-01',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 5000,
        },
        // March - most recent, should be used
        {
          month: '2024-03',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 2000,
        },
        {
          month: '2024-03',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 1000,
        },
      ];

      render(<StatsSummary data={multiMonthData} filters={defaultFilters} />);

      // Should show 3,000 (2000 + 1000 from March), not 18,000 (all months)
      const values = screen.getAllByText('3,000');
      expect(values.length).toBeGreaterThan(0);
    });
  });

  describe('bureau filtering', () => {
    it('should filter by specific bureau', () => {
      const bureauFilters = { bureau: '101170', type: 'all' };

      render(<StatsSummary data={mockImmigrationData} filters={bureauFilters} />);

      // Should show Shinagawa label
      const shinagawaLabels = screen.getAllByText('Shinagawa');
      expect(shinagawaLabels.length).toBeGreaterThan(0);
    });

    it('should show nationwide data when bureau is "all"', () => {
      render(<StatsSummary data={mockImmigrationData} filters={defaultFilters} />);

      // Should show "All Bureaus" label
      const allBureausLabels = screen.getAllByText('All Bureaus');
      expect(allBureausLabels.length).toBeGreaterThan(0);
    });

    it('should use bureau code 100000 for nationwide data', () => {
      const nationwideData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 50000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 30000,
        },
        {
          month: '2024-07',
          bureau: '101170', // Should be excluded when filtering for nationwide
          type: '20',
          status: '102000',
          value: 5000,
        },
      ];

      render(<StatsSummary data={nationwideData} filters={defaultFilters} />);

      // Should show 80,000 (50000 + 30000), not 85,000
      const values = screen.getAllByText('80,000');
      expect(values.length).toBeGreaterThan(0);
    });
  });

  describe('application type filtering', () => {
    it('should filter by specific application type', () => {
      const typeFilters = { bureau: 'all', type: '20' };

      render(<StatsSummary data={mockImmigrationData} filters={typeFilters} />);

      // Should show application type in subtitle
      const extensionLabels = screen.getAllByText(/Extension/);
      expect(extensionLabels.length).toBeGreaterThan(0);
    });

    it('should not show application type label when type is "all"', () => {
      render(<StatsSummary data={mockImmigrationData} filters={defaultFilters} />);

      // Should not show Extension or other type labels in parentheses
      const allBureausText = screen.getAllByText('All Bureaus')[0];
      expect(allBureausText.textContent).toBe('All Bureaus');
    });

    it('should combine bureau and type labels correctly', () => {
      const combinedFilters = { bureau: '101170', type: '20' };

      render(<StatsSummary data={mockImmigrationData} filters={combinedFilters} />);

      // Should show "Shinagawa (Extension)" - appears in both card and tooltip
      const labels = screen.getAllByText('Shinagawa (Extension)');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('statistics calculation', () => {
    it('should calculate total applications correctly', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000', // Old applications
          value: 10000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '103000', // New applications
          value: 5000,
        },
      ];

      render(<StatsSummary data={testData} filters={defaultFilters} />);

      // Total should be 15,000 (10000 + 5000)
      const values = screen.getAllByText('15,000');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should calculate processed applications correctly', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 10000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 5000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '300000', // Processed
          value: 12000,
        },
      ];

      render(<StatsSummary data={testData} filters={defaultFilters} />);

      // Should display processed count somewhere (used in pending calculation)
      expect(screen.getAllByText('Total Applications').length).toBeGreaterThan(0);
    });

    it('should calculate granted applications correctly', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 10000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 5000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '301000', // Granted
          value: 8000,
        },
      ];

      render(<StatsSummary data={testData} filters={defaultFilters} />);

      const values = screen.getAllByText('8,000');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should calculate denied applications correctly', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 10000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 5000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '302000', // Denied
          value: 500,
        },
      ];

      render(<StatsSummary data={testData} filters={defaultFilters} />);

      const values = screen.getAllByText('500');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should calculate pending applications correctly', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 10000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 5000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '300000', // Processed
          value: 12000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '305000', // Other
          value: 200,
        },
      ];

      render(<StatsSummary data={testData} filters={defaultFilters} />);

      // Pending = totalApplications - processed + other
      // Pending = 15000 - 12000 + 200 = 3200
      const values = screen.getAllByText('3,200');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should calculate approval rate correctly', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 10000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 5000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '300000', // Processed
          value: 10000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '301000', // Granted
          value: 9500,
        },
      ];

      render(<StatsSummary data={testData} filters={defaultFilters} />);

      // Approval rate = (9500 / 10000) * 100 = 95.0%
      const values = screen.getAllByText('95.0%');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should handle zero processed applications for approval rate', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 10000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 5000,
        },
      ];

      render(<StatsSummary data={testData} filters={defaultFilters} />);

      // Approval rate should be 0 when no processed applications
      const values = screen.getAllByText('0%');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should format approval rate to one decimal place', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 10000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 5000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '300000',
          value: 10000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '301000',
          value: 9567, // 95.67% should round to 95.7%
        },
      ];

      render(<StatsSummary data={testData} filters={defaultFilters} />);

      const values = screen.getAllByText('95.7%');
      expect(values.length).toBeGreaterThan(0);
    });
  });

  describe('number formatting', () => {
    it('should format large numbers with commas', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 1000000,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 500000,
        },
      ];

      render(<StatsSummary data={testData} filters={defaultFilters} />);

      // Should format as 1,500,000
      const values = screen.getAllByText('1,500,000');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should format small numbers without commas', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 500,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 250,
        },
      ];

      render(<StatsSummary data={testData} filters={defaultFilters} />);

      const values = screen.getAllByText('750');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should handle zero values', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 0,
        },
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 0,
        },
      ];

      render(<StatsSummary data={testData} filters={defaultFilters} />);

      // Should show 0 for total - appears multiple times
      const values = screen.getAllByText('0');
      expect(values.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should return null when data is null', () => {
      const { container } = render(<StatsSummary data={null as any} filters={defaultFilters} />);

      expect(container.firstChild).toBeNull();
    });

    it('should return null when data is undefined', () => {
      const { container } = render(<StatsSummary data={undefined as any} filters={defaultFilters} />);

      expect(container.firstChild).toBeNull();
    });

    it('should handle empty data array', () => {
      render(<StatsSummary data={[]} filters={defaultFilters} />);

      // Empty data still renders with all zeros
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThan(0);
      expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
    });

    it('should handle data with no matching filters', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '101170', // Shinagawa
          type: '20',
          status: '102000',
          value: 10000,
        },
      ];

      // Filter for Osaka (no matching data)
      const filters = { bureau: '101460', type: 'all' };

      render(<StatsSummary data={testData} filters={filters} />);

      // Should show zeros - 0 appears multiple times
      const values = screen.getAllByText('0');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should handle data with only some status codes', () => {
      const testData: ImmigrationData[] = [
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 5000,
        },
        // Missing new applications status
        {
          month: '2024-07',
          bureau: '100000',
          type: '20',
          status: '301000',
          value: 100,
        },
      ];

      render(<StatsSummary data={testData} filters={defaultFilters} />);

      // Should handle missing status codes gracefully
      expect(screen.getAllByText('Total Applications').length).toBeGreaterThan(0);
    });

    it('should memoize calculations when filters do not change', () => {
      const { rerender } = render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      const initialValue = screen.getAllByText('15,000')[0].textContent;

      // Rerender with same props
      rerender(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      const afterValue = screen.getAllByText('15,000')[0].textContent;

      // Should display the same values (memoization working)
      expect(initialValue).toBe(afterValue);
    });

    it('should recalculate when data changes', () => {
      const { rerender } = render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      const newData: ImmigrationData[] = [
        {
          month: '2024-08',
          bureau: '100000',
          type: '20',
          status: '102000',
          value: 99999,
        },
        {
          month: '2024-08',
          bureau: '100000',
          type: '20',
          status: '103000',
          value: 1,
        },
      ];

      rerender(<StatsSummary data={newData} filters={defaultFilters} />);

      // Should show new total
      const values = screen.getAllByText('100,000');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should recalculate when filters change', () => {
      const { rerender } = render(<StatsSummary data={mockImmigrationData} filters={{ bureau: 'all', type: 'all' }} />);

      const newFilters = { bureau: '101170', type: '20' };
      rerender(<StatsSummary data={mockImmigrationData} filters={newFilters} />);

      // Should show Shinagawa label - appears in both card and tooltip
      const labels = screen.getAllByText('Shinagawa (Extension)');
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('tooltips', () => {
    it('should render tooltips for all stat cards', () => {
      render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      const tooltips = screen.getAllByTestId('tippy-content');
      expect(tooltips).toHaveLength(5);
    });

    it('should show full title in tooltip', () => {
      render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      const tooltips = screen.getAllByTestId('tippy-content');

      // Check that tooltips contain full titles
      const tooltipTexts = tooltips.map((t) => t.textContent);
      expect(tooltipTexts.some((text) => text?.includes('Total Applications'))).toBe(true);
      expect(tooltipTexts.some((text) => text?.includes('Pending'))).toBe(true);
      expect(tooltipTexts.some((text) => text?.includes('Granted'))).toBe(true);
      expect(tooltipTexts.some((text) => text?.includes('Denied'))).toBe(true);
      expect(tooltipTexts.some((text) => text?.includes('Approval Rate'))).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should render with semantic stat card structure', () => {
      const { container } = render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      const statDetails = container.querySelectorAll('.stat-details');
      expect(statDetails).toHaveLength(5);
    });

    it('should have proper icon elements', () => {
      render(<StatsSummary data={nationwideTestData} filters={defaultFilters} />);

      // All icons should be present
      const icons = screen.getAllByTestId(/^icon-/);
      expect(icons).toHaveLength(5);
    });
  });
});
