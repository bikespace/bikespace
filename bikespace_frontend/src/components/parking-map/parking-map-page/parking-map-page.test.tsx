import React, {forwardRef} from 'react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from '@/config/query-client';

import {ParkingMapPage, uniqueBy} from './ParkingMapPage';

jest.mock('react-map-gl/maplibre', () => ({
  __esModule: true,
  // eslint-disable-next-line react/display-name
  default: forwardRef((props, ref) => <></>), // Map is default export
  GeolocateControl: () => <></>,
  NavigationControl: () => <></>,
}));

jest.mock('@/utils/map-utils/geocoder-search/_useGeocoderQuery', () => ({
  useGeocoderQuery: jest.fn(),
}));

describe('uniqueBy', () => {
  test('uniqueBy returns a Set of unique objects based on comparing the value returned by a custom function', () => {
    interface TestObject {
      a: number;
      b: number;
    }
    const testInput: TestObject[] = [
      {a: 1, b: 1},
      {a: 1, b: 2},
      {a: 2, b: 3},
    ];
    const uniqueInput = uniqueBy(testInput, (x: TestObject) => x.a);
    expect(uniqueInput).toHaveLength(2);
  });
});

describe('ParkingMapPage', () => {
  test('All ParkingMapPage images on first load have alt text', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ParkingMapPage />
      </QueryClientProvider>
    );
    expect(
      screen
        .getAllByRole('img')
        .map(img => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toBeTruthy();
  });

  test('Details pane toggle has correct accessibility descriptions', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <ParkingMapPage />
      </QueryClientProvider>
    );

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
