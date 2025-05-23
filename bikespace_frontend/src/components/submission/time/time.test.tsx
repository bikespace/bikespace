import React from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {FormProvider, useForm} from 'react-hook-form';

import {SubmissionSchema} from '../submission-form/schema';

import {ParkingDuration} from '@/interfaces/Submission';

import {Time} from './Time';

const MockForm = () => {
  const form = useForm<SubmissionSchema>({
    defaultValues: {
      parkingTime: {
        date: new Date(),
        parkingDuration: ParkingDuration.Minutes,
      },
    },
  });

  return (
    <FormProvider {...form}>
      <form>
        <Time />
      </form>
    </FormProvider>
  );
};

describe('Time', () => {
  test('Page title is rendered correctly', () => {
    render(<MockForm />);
    expect(
      screen.getAllByRole('heading', {
        level: 2,
        name: /when did this happen\?/i,
      })
    );
    expect(
      screen.getAllByRole('heading', {
        level: 2,
        name: /how long did you need to park\?/i,
      })
    );
    expect(screen.getByText(/minutes/i));
    expect(screen.getByText(/hours/i));
    expect(screen.getByText(/overnight/i));
    expect(screen.getByText(/multiday/i));
  });

  test('Changing parking duration correctly updates state', async () => {
    render(<MockForm />);

    const radios = screen.getAllByRole('radio');
    const radio = radios[1];

    const user = userEvent.setup();

    await user.click(radio);

    expect(radio).toBeChecked();
  });

  test('Changing parking time correctly updates state', () => {
    render(<MockForm />);

    const inputDate = '2024-06-17T00:00';

    const dateTime = screen.getByLabelText('When did this happen?');

    act(() => {
      fireEvent.change(dateTime, {target: {value: inputDate}});
    });

    expect(dateTime).toHaveValue(inputDate);
  });
});
