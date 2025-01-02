import React, {useEffect} from 'react';
import {Layer, Source, useMap} from 'react-map-gl/maplibre';
import type {SymbolLayer} from 'react-map-gl/maplibre';

import bollardIcon from '@/assets/icons/parking_map/bollard.png';
import standsIcon from '@/assets/icons/parking_map/stands.png';
import rackIcon from '@/assets/icons/parking_map/rack.png';
import twoTierIcon from '@/assets/icons/parking_map/two_tier.png';
import wallLoopsIcon from '@/assets/icons/parking_map/wall_loops.png';
import nullIcon from '@/assets/icons/parking_map/null.png';

const smallSize = 1 / 25;
const largeSize = 1 / 10;
const icons = [
  {id: 'bollard', src: bollardIcon.src, size: smallSize},
  {id: 'stands', src: standsIcon.src, size: smallSize},
  {id: 'rack', src: rackIcon.src, size: largeSize},
  {id: 'two-tier', src: twoTierIcon.src, size: largeSize},
  {id: 'wall_loops', src: wallLoopsIcon.src, size: largeSize},
  {id: 'no_icon', src: nullIcon.src, size: smallSize},
];
const iconSizeLookup = Object.fromEntries(
  icons.map(icon => [icon.id, icon.size])
);

export function ParkingLayer() {
  const {current: map} = useMap();

  async function addImage(id: string, src: string) {
    const response = await map?.loadImage(src);
    if (!map?.hasImage(id)) map?.addImage(id, response!.data);
  }

  const bicycleParkingURL =
    'https://raw.githubusercontent.com/tallcoleman/new-parking-map/refs/heads/main/Display%20Files/all_sources.geojson';

  useEffect(() => {
    icons.map(({id, src}) => addImage(id, src));
  }, [map]);
  const parkingLayer: SymbolLayer = {
    id: 'bicycle-parking',
    type: 'symbol',
    source: 'bicycle-parking',
    layout: {
      'icon-image': [
        'case',
        ['in', ['get', 'bicycle_parking'], ['literal', icons.map(x => x.id)]],
        ['get', 'bicycle_parking'],
        'no_icon',
      ],
      'icon-overlap': 'always',
      'icon-size': [
        'coalesce',
        ['get', ['get', 'bicycle_parking'], ['literal', iconSizeLookup]],
        smallSize,
      ],
      'text-field': ['get', 'capacity'],
      'text-size': 12,
      'text-anchor': 'top',
      'text-offset': [0, 1],
      'text-overlap': 'always',
    },
  };

  return (
    <Source id="bicycle-parking" type="geojson" data={bicycleParkingURL}>
      <Layer {...parkingLayer} />
    </Source>
  );
}
