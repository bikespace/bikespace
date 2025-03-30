import React from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';
import type {LineLayer} from 'react-map-gl/maplibre';

export function BikeLaneLayer() {
  const bikeLaneURL =
    'https://raw.githubusercontent.com/tallcoleman/new-parking-map/refs/heads/demo-map-app/demo_app/data/cycling-network.geojson';

  const bikeLaneLayer: LineLayer = {
    id: 'bicycle-lanes',
    type: 'line',
    source: 'bicycle-lanes',
    filter: [
      'match',
      ['get', 'INFRA_LOWORDER'],
      [
        'Sharrows - Wayfinding',
        'Sharrows - Arterial - Connector',
        'Signed Route (No Pavement Markings)',
        'Sharrows',
      ],
      false,
      true,
    ],
    layout: {
      'line-cap': 'round',
    },
    paint: {
      'line-width': 3,
      'line-color': [
        'match',
        ['get', 'INFRA_LOWORDER'],
        [
          'Cycle Track',
          'Cycle Track - Contraflow',
          'Bi-Directional Cycle Track',
        ],
        'hsl(137, 68%, 23%)',
        [
          'Multi-Use Trail - Boulevard',
          'Multi-Use Trail - Entrance',
          'Multi-Use Trail - Existing Connector',
          'Multi-Use Trail - Connector',
          'Multi-Use Trail',
          'Park Road',
        ],
        '#8c5535',
        ['Bike Lane - Buffered', 'Bike Lane', 'Bike Lane - Contraflow'],
        'hsl(137, 68%, 36%)',
        '#2c3b42',
      ],
    },
  };

  return (
    <Source id="bicycle-lanes" type="geojson" data={bikeLaneURL}>
      <Layer {...bikeLaneLayer} />
    </Source>
  );
}
