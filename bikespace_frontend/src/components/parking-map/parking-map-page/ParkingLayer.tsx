import React, {useEffect} from 'react';
import {Layer, Source, useMap} from 'react-map-gl/maplibre';
import type {SymbolLayer} from 'react-map-gl/maplibre';

import parkingIcon from '@/assets/icons/parking_map/parking.png';
import parkingIconCovered from '@/assets/icons/parking_map/parking_covered.png';
import parkingIconPaid from '@/assets/icons/parking_map/parking_paid.png';
import parkingIconCoveredPaid from '@/assets/icons/parking_map/parking_covered_paid.png';

// examples of type-specific icons
import parkingIconRack from '@/assets/icons/parking_map/parking_rack.png';
import parkingIconBollard from '@/assets/icons/parking_map/parking_bollard.png';

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

export function ParkingLayer() {
  const {current: map} = useMap();

  async function addImage(id: string, src: string) {
    const response = await map?.loadImage(src);
    if (!map?.hasImage(id)) map?.addImage(id, response!.data);
  }

  const bicycleParkingURL =
    'https://raw.githubusercontent.com/tallcoleman/new-parking-map/refs/heads/main/Display%20Files/all_sources.geojson';

  useEffect(() => {
    addImage('parking_icon', parkingIcon.src);
    // icons.map(({id, src}) => addImage(id, src));
  }, [map]);
  const parkingLayer: SymbolLayer = {
    id: 'bicycle-parking',
    type: 'symbol',
    source: 'bicycle-parking',
    layout: {
      'icon-image': 'parking_icon',
      'icon-anchor': 'bottom',
      'icon-overlap': 'always',
      'icon-size': 1 / 10,
      'text-field': ['get', 'capacity'],
      'text-size': 8,
      'text-anchor': 'top',
      'text-offset': [0, 0.2],
      'text-overlap': 'always',
    },
  };

  return (
    <Source id="bicycle-parking" type="geojson" data={bicycleParkingURL}>
      <Layer {...parkingLayer} />
    </Source>
  );
}
