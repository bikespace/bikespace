import React from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';

import type {SymbolLayer} from 'react-map-gl/maplibre';
import type {ExpressionSpecification} from 'maplibre-gl';
import type {FeatureCollection} from 'geojson';

export const reportedIssuesSourceId = 'bicycle-parking-reports';

interface ReportedIssuesLayerProps {
  reportedFeatures: FeatureCollection;
}

// Purely a visual indicator - not included in parkingInteractiveLayers, so
// clicks still resolve against the underlying ParkingLayer feature beneath.
export function ReportedIssuesLayer({
  reportedFeatures,
}: ReportedIssuesLayerProps) {
  // only show badges once individual parking icons are visible, matching
  // the zoom threshold ParkingLayer uses to fade in its own icons
  const reportedIssuesOpacity: ExpressionSpecification = [
    'interpolate',
    ['linear'],
    ['zoom'],
    16,
    0,
    16.05,
    1,
  ];

  const reportedIssuesLayer: SymbolLayer = {
    id: 'bicycle-parking-reports',
    type: 'symbol',
    source: reportedIssuesSourceId,
    layout: {
      // MapLibre's SDF glyphs only cover the font's own character ranges
      // (see the font-fallback comment in ParkingLayer.tsx) - emoji/symbol
      // characters like a warning triangle silently fail to render, so
      // this uses a plain "!" instead.
      'text-field': '!',
      'text-size': 18,
      'text-offset': [1, -1],
      'text-anchor': 'center',
      'text-allow-overlap': true,
      'text-ignore-placement': true,
      // Open Sans Bold is not in the Protomaps backup tile glyph set
      'text-font': process.env.MAPTILER_API_KEY
        ? ['Open Sans Bold']
        : ['Noto Sans Medium'],
    },
    paint: {
      'text-opacity': reportedIssuesOpacity,
      'text-color': '#c62828',
      'text-halo-color': 'white',
      'text-halo-width': 1.5,
    },
  };

  return (
    <Source id={reportedIssuesSourceId} type="geojson" data={reportedFeatures}>
      <Layer {...reportedIssuesLayer} />
    </Source>
  );
}
