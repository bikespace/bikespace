import React from 'react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import {SubmissionsDateRange, DateRangeInterval} from '@/interfaces/Submission';
import {FilterDateRange} from './FilterDateRange';

// Mock today's date without needing to manually advance timings
const todayDate = new Date('2024-12-31T00:00:00');
jest.useFakeTimers({advanceTimers: true}).setSystemTime(todayDate);

/* `+ 'T00:00:00` and 'T23:59:59' are added here in part because of a known quirk with Date API - date-only text is interpreted as UTC and date-time text is interpreted in the user time zone. See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format */
const startDateValue = new Date('2024-01-01T00:00:00');
const endDateValue = new Date('2024-12-31T23:59:59.999');
const mockDateRange: SubmissionsDateRange = {
  first: startDateValue,
  last: endDateValue,
};

jest.mock('@/hooks', () => ({
  useAllSubmissionsDateRange: () => mockDateRange,
}));

const mockTrackUmamiEvent = jest.fn().mockName('mockTrackUmamiEvent');
jest.mock('@/utils', () => ({
  trackUmamiEvent: (...args: Parameters<typeof mockTrackUmamiEvent>) =>
    mockTrackUmamiEvent(...args),
}));

const mockSetFilters = jest.fn().mockName('mockSetFilters');
jest.mock('@/states/store', () => ({
  useSubmissionsStore: () => ({
    dateRange: mockDateRange,
    setFilters: mockSetFilters,
  }),
}));

const dateFilterInputs = {
  [DateRangeInterval.Last7Days]: {
    dateRange: {
      from: new Date('2024-12-25T00:00:00'),
      to: endDateValue,
    },
    dateRangeInterval: DateRangeInterval.Last7Days,
  },
  [DateRangeInterval.Last30Days]: {
    dateRange: {
      from: new Date('2024-12-02T00:00:00'),
      to: endDateValue,
    },
    dateRangeInterval: DateRangeInterval.Last30Days,
  },
  [DateRangeInterval.Last90Days]: {
    dateRange: {
      from: new Date('2024-10-03T00:00:00'),
      to: endDateValue,
    },
    dateRangeInterval: DateRangeInterval.Last90Days,
  },
  [DateRangeInterval.Last12Months]: {
    dateRange: {
      from: new Date('2024-01-01T00:00:00'),
      to: endDateValue,
    },
    dateRangeInterval: DateRangeInterval.Last12Months,
  },
  [DateRangeInterval.ThisYear]: {
    dateRange: {
      from: new Date('2024-01-01T00:00:00'),
      to: endDateValue,
    },
    dateRangeInterval: DateRangeInterval.ThisYear,
  },
  [DateRangeInterval.LastYear]: {
    dateRange: {
      from: new Date('2023-01-01T00:00:00'),
      to: new Date('2023-12-31T23:59:59.999'),
    },
    dateRangeInterval: DateRangeInterval.LastYear,
  },
};

describe('FilterDateRange', () => {
  beforeEach(() => {
    render(<FilterDateRange />);
  });

  test('should render a select control with all the DateRangeInterval options', () => {
    // screen.debug();
    const dateFilterSelect = screen.getByRole('combobox');
    expect(dateFilterSelect.tagName === 'select');
    expect(dateFilterSelect.getAttribute('name') === 'dateRange');

    const dateFilterOptions = screen.getAllByRole('option');
    expect(dateFilterOptions.map(opt => opt.getAttribute('value'))).toEqual(
      expect.arrayContaining(Object.values(DateRangeInterval))
    );
  });

  test('should set correct date ranges for each DateRangeInterval option', async () => {
    const user = userEvent.setup();
    const dateFilterSelect = screen.getByRole('combobox');

    for (const [interval, calledWith] of Object.entries(dateFilterInputs)) {
      await user.selectOptions(dateFilterSelect, interval);
      expect(mockSetFilters).toHaveBeenLastCalledWith(calledWith);
      expect(mockTrackUmamiEvent).toHaveBeenCalled();
      mockTrackUmamiEvent.mockClear();
    }
  });
});
