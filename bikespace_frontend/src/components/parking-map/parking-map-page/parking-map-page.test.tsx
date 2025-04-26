import React, {forwardRef} from 'react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {ParkingMapPage} from './ParkingMapPage';

jest.mock('react-map-gl/maplibre', () => ({
  __esModule: true,
  default: forwardRef((props, ref) => <></>), // Map is default export
  GeolocateControl: () => <></>,
  NavigationControl: () => <></>,
}));

describe('ParkingMapPage', () => {
  test('All ParkingMapPage images on first load have alt text', () => {
    render(<ParkingMapPage />);
    expect(
      screen
        .getAllByRole('img')
        .map(img => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toBeTruthy();
  });

  test('Details pane toggle has correct accessibility descriptions', async () => {
    const user = userEvent.setup();
    render(<ParkingMapPage />);

    // no interaction
    const paneToggle = screen.getByRole('button', {
      name: /close details pane/i,
    });
    expect(paneToggle).toHaveAttribute('aria-expanded', 'true');

    // click -> close
    await user.click(paneToggle);
    expect(paneToggle).toHaveAccessibleName(/open details pane/i);
    expect(paneToggle).toHaveAttribute('aria-expanded', 'false');

    // click -> open
    await user.click(paneToggle);
    expect(paneToggle).toHaveAccessibleName(/close details pane/i);
    expect(paneToggle).toHaveAttribute('aria-expanded', 'true');
  });
});
