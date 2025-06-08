import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {Map} from 'maplibre-gl';

import type {MapRef} from 'react-map-gl/dist/esm/exports-maplibre';
import type {DefinedUseQueryResult} from '@tanstack/react-query';

import {GeocoderSearch} from './GeocoderSearch';

import testGeoSearchResult from '@/__test__/test_data/testGeoSearchResult.json';

jest.mock('maplibre-gl', () => {
  const mockMap = {
    addControl: jest.fn(),
    on: jest.fn(),
    remove: jest.fn(),
    getCenter: jest.fn(() => ({lng: -79.43, lat: 43.76})),
    flyTo: jest.fn(),
    // Add other methods you use as needed
  };
  const mockMarker = {
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  };
  return {
    Map: jest.fn(() => mockMap),
    Marker: jest.fn(() => mockMarker),
  };
});

const container = document.createElement('div');
const mockMap = new Map({container});
const mockMapRef = {...mockMap, getMap: () => mockMap} as MapRef;

const defaultGeocoderResponse = {
  isFetching: false,
  data: testGeoSearchResult,
  error: {
    name: 'test name',
    message: 'test message',
  },
} as Partial<DefinedUseQueryResult>;
const mockUseGeocoderQuery = jest.fn(() => defaultGeocoderResponse);
jest.mock('./_useGeocoderQuery', () => ({
  useGeocoderQuery: () => mockUseGeocoderQuery(),
}));

const mockTrackUmamiEvent = jest.fn().mockName('mockTrackUmamiEvent');
jest.mock('@/utils', () => {
  const originalModule = jest.requireActual('@/utils');
  return {
    __esModule: true,
    ...originalModule,
    trackUmamiEvent: (...args: Parameters<typeof mockTrackUmamiEvent>) =>
      mockTrackUmamiEvent(...args),
  };
});

describe('GeocoderSearch', () => {
  test('Component renders correctly with search and clear interactions', async () => {
    const user = userEvent.setup();
    render(
      <GeocoderSearch
        map={mockMapRef}
        isMinimized={false}
        setIsMinimized={jest.fn()}
      />
    );

    // expect no results when input is blank
    const searchBox = screen.getByRole('textbox');
    expect(screen.queryByRole('button')).toBeNull();

    // expect loading indicator while results are queried
    await user.type(searchBox, 'city');
    expect(searchBox.getAttribute('value')).toBe('city');
    await waitFor(() =>
      expect(screen.getByText(/searching/i)).toBeInTheDocument()
    );

    // results should load at some point
    await waitFor(() =>
      // one button for clear results plus n buttons for results themselves
      expect(screen.getAllByRole('button').length).toBeGreaterThan(1)
    );

    // clearing the results should remove all buttons and blank the input
    const clearResultsButton = screen.getByRole('button', {
      name: 'Clear Location Search',
    });
    await user.click(clearResultsButton);
    expect(screen.queryByRole('button')).toBeNull();
    expect(searchBox.getAttribute('value')).toBe('');
  });

  test('Component minimizes when requested', async () => {
    const user = userEvent.setup();
    const {rerender} = render(
      <GeocoderSearch
        map={mockMapRef}
        isMinimized={false}
        setIsMinimized={jest.fn()}
      />
    );

    // user searches for a query and clicks the first result
    const searchBox = screen.getByRole('textbox');
    await user.type(searchBox, 'city');
    await waitFor(() =>
      // one button for clear results plus n buttons for results themselves
      expect(screen.getAllByRole('button').length).toBeGreaterThan(1)
    );
    await user.click(screen.getAllByRole('button')[1]);

    // minimizing the component should update the input and remove results
    rerender(
      <GeocoderSearch
        map={mockMapRef}
        isMinimized={true}
        setIsMinimized={jest.fn()}
      />
    );
    const clearResultsButton = screen.getByRole('button', {
      name: 'Clear Location Search',
    });

    expect(screen.getAllByRole('button').length).toBe(2);
    expect(clearResultsButton).toBeInTheDocument();
    expect(searchBox.getAttribute('value')).toMatch(/city/i);

    // clearing the component while minimized should blank the input
    await user.click(clearResultsButton);
    expect(screen.queryByRole('button')).toBeNull();
    expect(searchBox.getAttribute('value')).toBe('');
  });

  test('Component shows error message when query is not successful', async () => {
    const user = userEvent.setup();
    render(
      <GeocoderSearch
        map={mockMapRef}
        isMinimized={false}
        setIsMinimized={jest.fn()}
      />
    );
    mockUseGeocoderQuery.mockReturnValue({
      ...defaultGeocoderResponse,
      data: undefined,
    });

    // user searches for a query and error message is shown
    const searchBox = screen.getByRole('textbox');
    await user.type(searchBox, 'city');
    await waitFor(() =>
      expect(screen.getByText(/search error/i)).toBeInTheDocument()
    );
  });

  test('Component informs user if no results are found', async () => {
    const user = userEvent.setup();
    render(
      <GeocoderSearch
        map={mockMapRef}
        isMinimized={false}
        setIsMinimized={jest.fn()}
      />
    );
    mockUseGeocoderQuery.mockReturnValue({
      ...defaultGeocoderResponse,
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    // user searches for a query that returns no results
    const searchBox = screen.getByRole('textbox');
    await user.type(searchBox, 'query with no results');
    await waitFor(() =>
      expect(screen.getByText(/no results/i)).toBeInTheDocument()
    );
  });
});
