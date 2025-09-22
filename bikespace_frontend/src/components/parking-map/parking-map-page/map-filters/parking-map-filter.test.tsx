import React, {forwardRef} from 'react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {Map} from 'maplibre-gl';

import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from '@/config/query-client';

import {ParkingMapFilter} from './ParkingMapFilter';

import type {RefObject} from 'react';
import type {MapRef} from 'react-map-gl/dist/esm/exports-maplibre';
import type {DefinedUseQueryResult} from '@tanstack/react-query';

jest.mock('maplibre-gl', () => {
  const mockMap = {
    addControl: jest.fn(),
    on: jest.fn(),
    remove: jest.fn(),
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
const mockMapRef = {
  current: {...mockMap, getMap: () => mockMap},
} as RefObject<MapRef>;

// Mock useParkingDataQuery
const defaultUseParkingDataQueryResponse = {
  status: 'success',
  data: {},
} as Partial<DefinedUseQueryResult>;

jest.mock('@/hooks', () => ({
  useParkingDataQuery: () => jest.fn(() => defaultUseParkingDataQueryResponse),
}));

const mockSetFilter = jest.fn();

describe('ParkingMapFilter', () => {
  test('ParkingMapFilter', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ParkingMapFilter mapRef={mockMapRef} setFilter={mockSetFilter} />
      </QueryClientProvider>
    );

    // Todo - add testing logic
    screen.debug();
  });
});
