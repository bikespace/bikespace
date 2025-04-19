import React, {useEffect} from 'react';
import {Layer, Source, useMap} from 'react-map-gl/maplibre';
import type {CircleLayer, SymbolLayer} from 'react-map-gl/maplibre';

import {ExpressionSpecification} from 'maplibre-gl';

/*
Use the stuff below with:

'icon-image': [
  'case',
  ['in', ['get', 'bicycle_parking'], ['literal', icons.map(x => x.id)]],
  ['get', 'bicycle_parking'],
  'no_icon',
]

'icon-size': [
  'coalesce',
  ['get', ['get', 'bicycle_parking'], ['literal', iconSizeLookup]],
  smallSize,
],
 */

// const smallSize = 1 / 25;
// const largeSize = 1 / 10;
// const icons = [
//   {id: 'bollard', src: bollardIcon.src, size: smallSize},
//   {id: 'stands', src: standsIcon.src, size: smallSize},
//   {id: 'rack', src: rackIcon.src, size: largeSize},
//   {id: 'two-tier', src: twoTierIcon.src, size: largeSize},
//   {id: 'wall_loops', src: wallLoopsIcon.src, size: largeSize},
//   {id: 'no_icon', src: nullIcon.src, size: smallSize},
// ];
// const iconSizeLookup = Object.fromEntries(
//   icons.map(icon => [icon.id, icon.size])
// );

export const publicAccessTypes = ['yes', 'permissive', ''];

export function ParkingLayer() {
  const {current: map} = useMap();

  async function addImage(id: string, src: string) {
    const response = await map?.loadImage(src);
    if (!map?.hasImage(id)) map?.addImage(id, response!.data);
  }

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
        <Layer {...parkingLayer} />
        <Layer {...parkingLayerDense} />
      </Source>
    </>
  );
}
