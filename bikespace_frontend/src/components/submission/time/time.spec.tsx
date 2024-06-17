import React, {useState} from 'react';
import {render, screen} from '@testing-library/react';

import {ParkingDuration} from '@/interfaces/Submission';

import {Time} from './Time';

describe('Time', () => {
  const [parkingDuration, setParkingDuration] = useState<ParkingDuration>(
    ParkingDuration.Minutes
  );
  const [dateTime] = useState<Date>(new Date());
  test('time page title is rendered correctly', () => {
    render(
      <Time
        parkingDuration={parkingDuration}
        onParkingDurationChanged={setParkingDuration}
        dateTime={dateTime}
        onDateTimeChanged={() => {}}
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
});
