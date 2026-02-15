import React from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';

import type {SymbolLayer, LineLayer} from 'react-map-gl/maplibre';
import type {FilterSpecification} from 'maplibre-gl';

export function PanoramaxImageryLayer() {
  const opacity = 0.7;

  const minYear = 2025;
  const imageType = 'equirectangular';

  const imagerySymbolLayer: SymbolLayer = {
    id: 'panoramax-imagery-nodes',
    type: 'symbol',
    source: 'panoramax-imagery',
    'source-layer': 'pictures',
    filter: [
      'all',
      ['>=', ['to-number', ['slice', ['get', 'ts'], 0, 4]], minYear],
      ['==', ['get', 'type'], imageType],
    ],
    layout: {
      'icon-image': 'imagery_map:arrow-up-circle-blue',
      'icon-anchor': 'center',
      'icon-overlap': 'always',
      // 'icon-size': 40 / 140,
      'icon-rotate': ['get', 'heading'],
    },
    paint: {
      // 'icon-opacity': opacity,
    },
  };

  const imageryLineLayer: LineLayer = {
    id: 'panoramax-imagery-ways',
    type: 'line',
    source: 'panoramax-imagery',
    'source-layer': 'sequences',
    filter: [
      'all',
      ['>=', ['to-number', ['slice', ['get', 'date'], 0, 4]], minYear],
      ['==', ['get', 'type'], imageType],
    ],
    layout: {
      'line-cap': 'round',
    },
    paint: {
      'line-width': 5,
      'line-color': '#00a0cc',
      'line-opacity': opacity,
    },
  };

  const imageryLineOutlineLayer: LineLayer = {
    id: 'panoramax-imagery-ways-outline',
    type: 'line',
    source: 'panoramax-imagery',
    'source-layer': 'sequences',
    filter: [
      'all',
      ['>=', ['to-number', ['slice', ['get', 'date'], 0, 4]], minYear],
      ['==', ['get', 'type'], imageType],
    ],
    layout: {
      'line-cap': 'round',
    },
    paint: {
      'line-width': 2,
      'line-color': 'white',
      'line-gap-width': 5,
      'line-opacity': opacity,
    },
  };

  return (
    <Source
      id="panoramax-imagery"
      type="vector"
      tiles={['https://api.panoramax.xyz/api/map/{z}/{x}/{y}.mvt']}
    >
      <Layer {...imageryLineOutlineLayer} />
      <Layer {...imageryLineLayer} />
      <Layer {...imagerySymbolLayer} />
    </Source>
  );
}
