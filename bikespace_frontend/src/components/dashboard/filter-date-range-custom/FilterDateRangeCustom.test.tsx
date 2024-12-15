import React from 'react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import {SubmissionsDateRange, DateRangeInterval} from '@/interfaces/Submission';
import {
  FilterDateRangeCustom,
  formatHtmlDateValue,
} from './FilterDateRangeCustom';

const todayDate = formatHtmlDateValue(new Date());
const startDate = todayDate;
const endDate = todayDate;

/* `+ 'T00:00:00` and 'T23:59:59' are added here in part because of a known quirk with Date API - date-only text is interpreted as UTC and date-time text is interpreted in the user time zone. See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format */
const startDateValue = new Date(startDate + 'T00:00:00');
const endDateValue = new Date(endDate + 'T23:59:59.999');
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

describe('FilterDateRangeCustom', () => {
  beforeEach(() => {
    render(<FilterDateRangeCustom />);
  });

  test('should render two date inputs and a button', () => {
    const startDateInput = screen.getByLabelText('Start date:');
    expect(startDateInput.tagName === 'input');
    expect(startDateInput.getAttribute('type') === 'date');
    expect(startDateInput.getAttribute('name') === 'startDate');

    const endDateInput = screen.getByLabelText('End date:');
    expect(endDateInput.tagName === 'input');
    expect(endDateInput.getAttribute('type') === 'date');
    expect(endDateInput.getAttribute('name') === 'endDate');

    expect(screen.getByRole('button')).toHaveTextContent('Apply');
  });

  test('initial date input values should be today', () => {
    const startDateInput = screen.getByLabelText('Start date:');
    expect(startDateInput).toHaveValue(todayDate);

    const endDateInput = screen.getByLabelText('End date:');
    expect(endDateInput).toHaveValue(endDate);
  });

  test('clicking submit should send a correct date filter range and trigger analytics', async () => {
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button');
    await user.click(submitButton);
    expect(mockSetFilters).toHaveBeenCalledWith({
      dateRange: {
        from: startDateValue,
        to: endDateValue,
      },
      dateRangeInterval: DateRangeInterval.CustomRange,
    });
    expect(mockTrackUmamiEvent).toHaveBeenCalledWith('datefilter', {
      from: startDate,
      to: endDate,
      interval: DateRangeInterval.CustomRange,
    });
  });

  test('typing in a date input changes the date', async () => {
    const testInput = '2024-02-02';
    const startDateInput = screen.getByLabelText('Start date:');
    // limitation of userEvent - have to clear before new input
    await userEvent.clear(startDateInput);
    await userEvent.type(startDateInput, testInput);
    expect(startDateInput).toHaveValue(testInput);
  });

  /* Note that the min and max constraints are not testable, they only work with the browser UI, not for typing or changing the value directly */

  test('dates should be valid and the end date should always equal or exceed the start date', async () => {
    const user = userEvent.setup();
    const startDateInput = screen.getByLabelText('Start date:');
    const endDateInput = screen.getByLabelText('End date:');
    const submitButton = screen.getByRole('button');

    await user.clear(startDateInput);
    await user.type(startDateInput, '2024-02-01');
    expect(submitButton).toBeEnabled();

    await user.clear(endDateInput);
    expect(submitButton).toBeDisabled();
    await user.type(endDateInput, '2024-02-01');
    expect(endDateInput).toHaveValue('2024-02-01');
    expect(submitButton).toBeEnabled();

    await user.clear(startDateInput);
    expect(submitButton).toBeDisabled();
    await user.type(startDateInput, '2024-03-01');
    expect(submitButton).toBeDisabled();
  });
});
