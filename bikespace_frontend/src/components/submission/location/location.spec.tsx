import React, {useState} from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import {LocationLatLng} from '@/interfaces/Submission';

import {Location} from './Location';

describe('Test Location page component', () => {
  const [location, setLocation] = useState<LocationLatLng>({
    // default location is Toronto City Hall
    latitude: 43.65322,
    longitude: -79.384452,
  });
  test('Location page title should be rendered properly', () => {
    render(<Location location={location} onLocationChanged={setLocation} />);
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'Where was the problem?'
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'Pin the location'
    );
  });
  // Add more tests for the compenents regarding the map
});
