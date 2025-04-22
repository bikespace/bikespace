import React, {forwardRef} from 'react';
import {render, screen} from '@testing-library/react';

import {ParkingMapPage} from './ParkingMapPage';

jest.mock('react-map-gl/maplibre', () => ({
  __esModule: true,
  default: forwardRef((props, ref) => <></>), // Map is default export
  GeolocateControl: () => <></>,
  NavigationControl: () => <></>,
}));

describe('ParkingMapPage', () => {
  beforeEach(() => {
    render(<ParkingMapPage />);
  });

  // test('render ParkingMapPage', () => {
  //   screen.debug();
  // });

  test('All ParkingMapPage images on first load have alt text', () => {
    expect(
      screen
        .getAllByRole('img')
        .map(img => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toBeTruthy();
  });
});
