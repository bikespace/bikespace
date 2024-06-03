import React, {useState} from 'react';
import {render, screen} from '@testing-library/react';
import {Location} from './Location';
import {LocationLatLng} from '@/interfaces/Submission';
import '@testing-library/jest-dom';

describe('Test Location page componenet', () => {
  const [location, setLocation] = useState<LocationLatLng>({
    // default location is the City Hall
    latitude: 43.65322,
    longitude: -79.384452,
  });
  render(<Location location={location} onLocationChanged={setLocation} />);
  test('Location page title should be rendered properly', () => {
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'Where was the problem?'
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'Pin the location'
    );
  });
  // Add more tests for the compenents regarding the map
});
