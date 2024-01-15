import React, {useState} from 'react';
import {render, screen} from '@testing-library/react';
import Time from '../src/components/Time';
import {ParkingDuration} from '../src/interfaces/Submission';

describe('Test Time page component', () => {
  const [parkingDuration, setParkingDuration] = useState<ParkingDuration>(
    ParkingDuration.Minutes
  );
  const [dateTime, setDateTime] = useState<Date>(new Date());
  render(
    <Time
      parkingDuration={parkingDuration}
      onParkingDurationChanged={setParkingDuration}
      dateTime={dateTime}
    />
  );
  test('time page title is rendered correctly', () => {
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
