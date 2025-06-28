import React from 'react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {DateRangeInterval} from '@/interfaces/Submission';

import {FilterDateRangeCustom} from './FilterDateRangeCustom';

// Mock timing to set failure state where the date corresponding to the current time differs between UTC and ET
const todayDate = new Date('2024-12-31T22:00:00');
jest.useFakeTimers({advanceTimers: true}).setSystemTime(todayDate);

const mockTrackUmamiEvent = jest.fn().mockName('mockTrackUmamiEvent');

jest.mock('@/utils', () => ({
  trackUmamiEvent: (...args: Parameters<typeof mockTrackUmamiEvent>) =>
    mockTrackUmamiEvent(...args),
}));

const mockSetFilters = jest.fn().mockName('mockSetFilters');
jest.mock('@/states/store', () => ({
  useStore: () => ({
    setFilters: mockSetFilters,
  }),
}));

describe('FilterDateRangeCustom', () => {
  const today = new Date();

  test('should render two date inputs and a button', () => {
    const {unmount} = render(<FilterDateRangeCustom />);

    const startDateInput = screen.getByLabelText('Start date:');
    expect(startDateInput.tagName).toEqual('INPUT');
    expect(startDateInput.getAttribute('type')).toEqual('date');
    expect(startDateInput.getAttribute('name')).toEqual('from');

    const endDateInput = screen.getByLabelText('End date:');
    expect(endDateInput.tagName).toEqual('INPUT');
    expect(endDateInput.getAttribute('type')).toEqual('date');
    expect(endDateInput.getAttribute('name')).toEqual('to');

    expect(screen.getByRole('button')).toHaveTextContent('Apply');

    // prevent state update 'act' error from form validation
    unmount();
  });

  test('initial date input values should be today', () => {
    const {unmount} = render(<FilterDateRangeCustom />);

    const todayDate = today.toISOString().substring(0, 10);

    const startDateInput = screen.getByLabelText('Start date:');
    expect(startDateInput).toHaveValue(todayDate);

    const endDateInput = screen.getByLabelText('End date:');
    expect(endDateInput).toHaveValue(todayDate);

    // prevent state update 'act' error from form validation
    unmount();
  });

  test('clicking submit should send a correct date filter range and trigger analytics', async () => {
    render(<FilterDateRangeCustom />);

    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    const startDateValue = new Date(year, month, day, 0, 0, 0, 0);
    const endDateValue = new Date(year, month, day, 23, 59, 59, 999);

    const user = userEvent.setup();
    const submitButton = screen.getByRole('button');

    await user.click(submitButton);

    expect(mockTrackUmamiEvent).toHaveBeenCalled();
    expect(mockSetFilters).toHaveBeenCalledWith({
      dateRange: {
        from: startDateValue,
        to: endDateValue,
      },
      dateRangeInterval: DateRangeInterval.CustomRange,
    });
  });

  test('typing in a date input changes the date', async () => {
    render(<FilterDateRangeCustom />);

    const testDate = '2024-02-02';

    const startDateInput = screen.getByLabelText('Start date:');
    // limitation of userEvent - have to clear before new input
    await userEvent.clear(startDateInput);
    await userEvent.type(startDateInput, testDate);

    expect(startDateInput).toHaveValue(testDate);
  });

  test('dates should be valid and the end date should always equal or exceed the start date', async () => {
    render(<FilterDateRangeCustom />);

    const user = userEvent.setup();
    const startDateInput = screen.getByLabelText('Start date:');
    const endDateInput = screen.getByLabelText('End date:');
    const submitBtn = screen.getByRole('button');

    await user.click(startDateInput);
    await user.clear(startDateInput);

    expect(submitBtn).toBeDisabled();

    await user.type(startDateInput, '2024-02-01');

    expect(startDateInput).toHaveValue('2024-02-01');
    expect(submitBtn).toBeEnabled();

    await user.click(endDateInput);
    await user.clear(endDateInput);

    expect(submitBtn).toBeDisabled();

    await user.type(endDateInput, '2024-02-01');

    expect(endDateInput).toHaveValue('2024-02-01');
    expect(submitBtn).toBeEnabled();

    await user.click(startDateInput);
    await user.clear(startDateInput);
    await user.type(startDateInput, '2024-03-01');

    expect(submitBtn).toBeDisabled();
  });
});
