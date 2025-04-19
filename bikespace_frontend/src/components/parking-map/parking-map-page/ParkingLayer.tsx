import React from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';
import type {CircleLayer, SymbolLayer} from 'react-map-gl/maplibre';

import {ExpressionSpecification} from 'maplibre-gl';

// access=* values that indicate that bicycle parking is open to the public
export const publicAccessTypes = ['yes', 'permissive', ''];

export function ParkingLayer() {
  const bicycleParkingURL =
    'https://raw.githubusercontent.com/bikespace/parking-map-data/refs/heads/main/Display%20Files/all_sources.geojson';

  const parkingLayerOpacity: ExpressionSpecification = [
    'interpolate',
    ['linear'],
    ['zoom'],
    16,
    0,
    16.05,
    ['case', ['boolean', ['feature-state', 'sidebar'], false], 0, 1],
  ];
  const parkingLayer: SymbolLayer = {
    id: 'bicycle-parking',
    type: 'symbol',
    source: 'bicycle-parking',
    layout: {
      'icon-image': [
        'match',
        ['to-string', ['get', 'access']],
        publicAccessTypes,
        'parking_unselected',
        'private_unselected',
      ],
      'icon-anchor': 'bottom',
      'icon-overlap': 'always',
      'icon-size': 40 / 140,
      'text-field': [
        'match',
        ['get', 'capacity'],
        '2',
        ' ',
        ['get', 'capacity'],
      ],
      'text-size': 8,
      'text-font': ['Open Sans Bold'],
      'text-anchor': 'top',
      'text-offset': [0, -2.6],
      'text-overlap': 'never',
      'text-ignore-placement': true,
      'text-optional': true,
    },
    paint: {
      'icon-opacity': parkingLayerOpacity,
      'text-opacity': parkingLayerOpacity,
    },
  };

  const parkingLayerDenseOpacity: ExpressionSpecification = [
    'interpolate',
    ['linear'],
    ['zoom'],
    16,
    ['case', ['boolean', ['feature-state', 'sidebar'], false], 0, 1],
    16.05,
    0,
  ];
  const parkingLayerDense: CircleLayer = {
    id: 'bicycle-parking-dense',
    type: 'circle',
    source: 'bicycle_parking',
    paint: {
      'circle-color': [
        'match',
        ['to-string', ['get', 'access']],
        publicAccessTypes,
        '#136329',
        '#b3b3b3',
      ],
      'circle-radius': 3,
      'circle-stroke-width': 2,
      'circle-stroke-color': 'white',
      'circle-opacity': parkingLayerDenseOpacity,
      'circle-stroke-opacity': parkingLayerDenseOpacity,
    },
  };

  return (
    <>
      <Source
        id="bicycle-parking"
        type="geojson"
        data={bicycleParkingURL}
        generateId={true}
      >
        <Layer {...parkingLayerDense} />
        <Layer {...parkingLayer} />
      </Source>
    </>
  );
}
