import React from 'react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {Map} from 'maplibre-gl';

import {ParkingMapFilter} from './ParkingMapFilter';
import {defaultEnabledFilterProperties} from './parking-map-filter-default-properties';

import testParkingData from '@/__test__/test_data/testParkingData.json';

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
  data: testParkingData.features,
} as Partial<DefinedUseQueryResult>;
const mockUseParkingDataQuery = jest.fn(
  () => defaultUseParkingDataQueryResponse
);

jest.mock('@/hooks', () => ({
  useParkingDataQuery: () => mockUseParkingDataQuery(),
}));

const mockSetFilter = jest.fn();

describe('ParkingMapFilter', () => {
  test('ParkingMapFilter defaults and basic functionality', async () => {
    render(<ParkingMapFilter mapRef={mockMapRef} setFilter={mockSetFilter} />);

    // by default, filter combobox should only show enabled properties specified in parking-map-filter-default-properties.ts
    expect(defaultEnabledFilterProperties.map(p => p.key)).toEqual(
      expect.arrayContaining(
        screen.getAllByRole('option').map(el => el.getAttribute('value'))
      )
    );

    const propertyComboBox: HTMLSelectElement = screen.getByRole('combobox');
    const propertyCheckBoxesBicycleParking: HTMLInputElement[] =
      screen.getAllByRole('checkbox');

    // filter should load bicycle_parking attribute by default
    expect(propertyComboBox.value).toBe('bicycle_parking');
    expect(
      propertyCheckBoxesBicycleParking.map(c => c.getAttribute('name'))
    ).toEqual(expect.arrayContaining(['bollard', 'lockers', 'rack']));

    // clear all button should deselect all checkboxes and update the filter
    await userEvent.click(screen.getByRole('button', {name: /clear all/i}));
    expect(
      propertyCheckBoxesBicycleParking
        .map(c => c.checked)
        .every(x => x === false)
    ).toBe(true);
    expect(mockSetFilter).toHaveBeenCalledWith([
      'in',
      ['get', 'bicycle_parking'],
      ['literal', []], // nothing selected
    ]);

    // select all button should select all checkboxes and update the filter
    await userEvent.click(screen.getByRole('button', {name: /select all/i}));
    expect(
      propertyCheckBoxesBicycleParking
        .map(c => c.checked)
        .every(x => x === true)
    ).toBe(true);
    expect(mockSetFilter).toHaveBeenCalledWith(true);

    // un-checking one checkbox should update the filter
    await userEvent.click(screen.getByRole('checkbox', {name: /rack/i}));
    expect(mockSetFilter).toHaveBeenCalledWith([
      'in',
      ['get', 'bicycle_parking'],
      ['literal', ['bollard', 'lockers']], // excludes 'rack'
    ]);

    // filter should update options shown when user selects a different property and reset the Map filter
    await userEvent.selectOptions(propertyComboBox, 'access');
    expect(mockSetFilter).toHaveBeenCalledWith(true);
    expect(propertyComboBox.value).toBe('access');
    const propertyCheckBoxesAccess: HTMLInputElement[] =
      screen.getAllByRole('checkbox');
    expect(propertyCheckBoxesAccess.map(c => c.getAttribute('name'))).toEqual(
      expect.arrayContaining(['yes', 'customers'])
    );
  });

  test('ParkingMapFilter with onlyShowEnabledFilterProperties=false shows all properties', () => {
    render(
      <ParkingMapFilter
        mapRef={mockMapRef}
        setFilter={mockSetFilter}
        onlyShowEnabledFilterProperties={false}
      />
    );

    const enabledProperties = new Set(
      screen.getAllByRole('option').map(el => el.getAttribute('value'))
    );
    const defaultProperties = new Set(
      defaultEnabledFilterProperties.map(p => p.key)
    );
    const expectedProperties = new Set(
      testParkingData.features.flatMap(f => Object.keys(f.properties))
    );

    // properties list should have some properties in the defaults list and some that are not
    expect(
      enabledProperties.intersection(defaultProperties).size
    ).toBeGreaterThan(0);
    expect(
      enabledProperties.difference(defaultProperties).size
    ).toBeGreaterThan(0);

    // all of the expected properties should be enabled
    expect(enabledProperties.intersection(expectedProperties).size).toEqual(
      expectedProperties.size
    );
  });
});
