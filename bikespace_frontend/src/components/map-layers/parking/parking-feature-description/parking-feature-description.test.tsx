import React from 'react';
import {render, screen} from '@testing-library/react';

import {ParkingFeatureDescription} from './ParkingFeatureDescription';

import type {FeatureCollection} from 'geojson';

import testParkingDataSrc from '@/__test__/test_data/testParkingData.json';

const testParkingData = testParkingDataSrc as FeatureCollection;

const handleClick = jest.fn();
const handleHover = jest.fn();
const handleUnHover = jest.fn();

describe('ParkingFeatureDescription', () => {
  beforeEach(() => {
    render(
      <ParkingFeatureDescription
        selected={false}
        hovered={false}
        feature={testParkingData.features[0]}
        handleClick={handleClick}
        handleHover={handleHover}
        handleUnHover={handleUnHover}
      />
    );
  });

  test('Render ParkingFeatureDescription', () => {
    screen.debug();
  });
});
