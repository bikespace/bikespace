import React from 'react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import {SubmissionsDateRange, DateRangeInterval} from '@/interfaces/Submission';
import {FilterDateRange} from './FilterDateRange';

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

describe('FilterDateRange', () => {
  beforeEach(() => {
    render(<FilterDateRange />);
  });

  test('should render a select control with all the DateRangeInterval options', () => {
    const dateFilterSelect = screen.getByRole('combobox');
    expect(dateFilterSelect.tagName === 'select');
    expect(dateFilterSelect.getAttribute('name') === 'dateRange');

    const dateFilterOptions = screen.getAllByRole('option');
    expect(dateFilterOptions.map(opt => opt.getAttribute('value'))).toEqual(
      expect.arrayContaining(Object.values(DateRangeInterval))
    );
  });

  test('custom date input appears when Custom Range selected', async () => {
    const user = userEvent.setup();
    const dateFilterSelect = screen.getByRole('combobox');

    expect(screen.queryByTestId('FilterDateRangeCustom')).toBeNull();
    await user.selectOptions(dateFilterSelect, DateRangeInterval.CustomRange);
    expect(screen.getByTestId('FilterDateRangeCustom')).toBeInTheDocument();
  });
});
