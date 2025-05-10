import React from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';

import type {CircleLayer, LineLayer} from 'react-map-gl/maplibre';
import type {FilterSpecification} from 'maplibre-gl';

export function PanoramaxImageryLayer() {
  const opacity = 0.7;

  const dateFilterYear = '2025';

  const imageryCircleLayer: CircleLayer = {
    id: 'panoramax-imagery-nodes',
    type: 'circle',
    source: 'panoramax-imagery',
    'source-layer': 'pictures',
    filter: ['in', dateFilterYear, ['get', 'ts']],
    paint: {
      'circle-color': '#00a0cc',
      'circle-radius': 5,
      'circle-stroke-width': 2,
      'circle-stroke-color': 'white',
      'circle-opacity': opacity,
      'circle-stroke-opacity': opacity,
    },
  };

  const imageryLineLayer: LineLayer = {
    id: 'panoramax-imagery-ways',
    type: 'line',
    source: 'panoramax-imagery',
    'source-layer': 'sequences',
    filter: ['in', dateFilterYear, ['get', 'date']],
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
    filter: ['in', dateFilterYear, ['get', 'date']],
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
      <Layer {...imageryLineLayer} />
      <Layer {...imageryLineOutlineLayer} />
      <Layer {...imageryCircleLayer} />
    </Source>
  );
}
