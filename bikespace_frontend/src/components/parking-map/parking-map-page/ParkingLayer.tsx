import React, {useEffect} from 'react';
import {Layer, Source, useMap} from 'react-map-gl/maplibre';
import type {SymbolLayer} from 'react-map-gl/maplibre';

import bollardIcon from '@/assets/icons/parking_map/bollard.png';

export function ParkingLayer() {
  const {current: map} = useMap();

  async function addImage(id: string, src: string) {
    const response = await map?.loadImage(src);
    if (!map?.hasImage(id)) map?.addImage(id, response!.data);
  }

  const bicycleParkingURL =
    'https://raw.githubusercontent.com/tallcoleman/new-parking-map/refs/heads/main/Display%20Files/all_sources.geojson';

  useEffect(() => {
    addImage('bollard', bollardIcon.src);
  }, [map]);
  const parkingLayer: SymbolLayer = {
    id: 'bicycle-parking',
    type: 'symbol',
    source: 'bicycle-parking',
    layout: {
      'icon-image': 'bollard',
      'icon-overlap': 'always',
      'icon-size': 1 / 20,
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
