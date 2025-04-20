import React from 'react';
import {render, screen} from '@testing-library/react';

import {ParkingMapPage} from './ParkingMapPage';

describe('ParkingMapPage', () => {
  beforeEach(() => {
    render(<ParkingMapPage />);
  });

  test('render ParkingMapPage', () => {
    screen.debug();
  });
});
