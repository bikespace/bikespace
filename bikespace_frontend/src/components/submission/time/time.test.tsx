import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {faker} from '@faker-js/faker';

import {ParkingDuration} from '@/interfaces/Submission';

import {Time} from './Time';

describe('Time', () => {
  test('Page title is rendered correctly', () => {
    render(
      <Time
        parkingDuration={ParkingDuration.Minutes}
        onParkingDurationChanged={jest.fn()}
        dateTime={new Date()}
        onDateTimeChanged={jest.fn()}
      />
    );
    expect(
      screen.getByRole('heading', {
        name: /when did this happen\?/i,
      })
    );
    expect(
      screen.getByRole('group', {
        name: /how long did you need to park\?/i,
      })
    );
    expect(screen.getByText(/minutes/i));
    expect(screen.getByText(/hours/i));
    expect(screen.getByText(/overnight/i));
    expect(screen.getByText(/multiday/i));
  });

  test('Changing parking duration correctly updates state', () => {
    const onParkingDurationChanged = jest.fn();

    render(
      <Time
        parkingDuration={ParkingDuration.Minutes}
        onParkingDurationChanged={onParkingDurationChanged}
        dateTime={new Date()}
        onDateTimeChanged={jest.fn()}
      />
    );

    const radios = screen.getAllByRole('radio');

    fireEvent.click(radios[1]);
    expect(onParkingDurationChanged).toHaveBeenCalledWith(
      ParkingDuration.Hours
    );
  });

  test('Changing parking time correctly updates state', () => {
    const onDateTimeChanged = jest.fn();

    render(
      <Time
        parkingDuration={ParkingDuration.Minutes}
        onParkingDurationChanged={jest.fn()}
        dateTime={new Date()}
        onDateTimeChanged={onDateTimeChanged}
      />
    );

    const inputDate = '2024-06-17T00:00:00';

    const dateTime = screen.getByLabelText('When did this happen?');

    fireEvent.change(dateTime, {target: {value: inputDate}});
    expect(onDateTimeChanged).toHaveBeenCalledWith(new Date(inputDate));
  });
});
