import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {Map} from 'maplibre-gl';

import type {MapRef} from 'react-map-gl/dist/esm/exports-maplibre';

import {GeocoderSearch} from './GeocoderSearch';

import testGeoSearchResult from '@/__test__/test_data/testGeoSearchResult.json';

jest.mock('maplibre-gl', () => {
  const mockMap = {
    addControl: jest.fn(),
    on: jest.fn(),
    remove: jest.fn(),
    getCenter: jest.fn(() => ({lng: -79.43, lat: 43.76})),
    // Add other methods you use as needed
  };
  return {
    Map: jest.fn(() => mockMap),
  };
});

const container = document.createElement('div');
const mockMap = new Map({container});
const mockMapRef = {...mockMap, getMap: () => mockMap} as MapRef;

jest.mock('./_useGeocoderQuery', () => ({
  useGeocoderQuery: jest.fn(() => ({
    isFetching: false,
    data: testGeoSearchResult,
    // error:
  })),
}));

describe('GeocoderSearch', () => {
  test('Render GeocoderSearch', async () => {
    const user = userEvent.setup();
    render(
      <GeocoderSearch
        map={mockMapRef}
        isMinimized={false}
        setIsMinimized={jest.fn()}
      />
    );

    const searchBox = screen.getByRole('textbox');
    await user.type(searchBox, 'city');
    await waitFor(() =>
      expect(screen.getAllByRole('button').length).toBeGreaterThan(1)
    );

    screen.debug();
  });
});
