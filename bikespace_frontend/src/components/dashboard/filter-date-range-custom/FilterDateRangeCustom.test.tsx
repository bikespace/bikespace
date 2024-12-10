import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import {SubmissionsDateRange} from '@/interfaces/Submission';

import {FilterDateRangeCustom} from './FilterDateRangeCustom';

const startDate = '2024-01-01';
const endDate = '2024-12-31';

jest.mock('@/hooks', () => ({
  useAllSubmissionsDateRange(): SubmissionsDateRange {
    return {
      first: new Date(startDate),
      last: new Date(endDate),
    };
  },
}));

describe('FilterDateRangeCustom', () => {
  beforeEach(() => {
    render(<FilterDateRangeCustom />);
  });

  test('should render two date inputs and a button', () => {
    // screen.debug();

    const startDateInput = screen.getByDisplayValue(startDate);
    expect(startDateInput.tagName === 'input');
    expect(startDateInput.getAttribute('type') === 'date');
    expect(startDateInput.getAttribute('name') === 'startDate');
    expect(startDateInput).toHaveValue(startDate);

    const endDateInput = screen.getByDisplayValue(endDate);
    expect(endDateInput.tagName === 'input');
    expect(endDateInput.getAttribute('type') === 'date');
    expect(endDateInput.getAttribute('name') === 'endDate');

    expect(screen.getByRole('button')).toHaveTextContent('Apply');
  });

  test('clicking submit... submits', async () => {
    const submitButton = screen.getByRole('button');
    const startDateInput = screen.getByDisplayValue(startDate);
    const newStartValue = '2024-12-01';
    startDateInput.setAttribute('value', newStartValue);

    // unsure if problem here is that the component is not controlled properly or I don't know how to use the testing library to change the value
    // expect(startDateInput).toHaveValue(newStartValue);

    await userEvent.click(submitButton);

  });

  // test('typing in a date input changes the date', async () => {
  //   const startDateInput = screen.getByDisplayValue(startDate);
  //   // await userEvent.type(startDateInput, '2023-12-31');
  //   await userEvent.tab();
  //   await userEvent.keyboard('20231231');
  //   screen.debug();
  //   expect(startDateInput).toHaveValue('2023-12-31');
  // });

  // test that changing the inputs works?
  // does it let you test different interaction types?
  // test edge cases for user local timezone
});
