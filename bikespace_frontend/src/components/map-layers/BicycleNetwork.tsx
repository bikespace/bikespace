import React from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';

import type {LineLayer} from 'react-map-gl/maplibre';

import styles from './legend-tables.module.scss';

import networkProtected from '@/assets/icons/bicycle_network/network_protected_lane.svg';
import networkPainted from '@/assets/icons/bicycle_network/network_painted_lane.svg';
import networkTrail from '@/assets/icons/bicycle_network/network_park_multiuse_trail.svg';
import networkUnknown from '@/assets/icons/bicycle_network/network_unknown_lane.svg';
import networkSharrow from '@/assets/icons/bicycle_network/network_sharrow_unprotected.svg';

export function BicycleNetworkLayer({beforeId}: {beforeId?: string}) {
  const bicycleNetworkURL =
    'https://raw.githubusercontent.com/bikespace/parking-map-data/refs/heads/demo-map-app/demo_app/data/cycling-network.geojson';

  const bicycleLaneLayer: LineLayer = {
    id: 'bicycle-lanes',
    type: 'line',
    source: 'bicycle-lanes',
    filter: [
      'match',
      ['get', 'INFRA_HIGHORDER'],
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
        ['get', 'INFRA_HIGHORDER'],
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

  const bicycleRouteLayer: LineLayer = {
    id: 'bicycle-routes',
    type: 'line',
    source: 'bicycle-lanes',
    filter: [
      'match',
      ['get', 'INFRA_HIGHORDER'],
      [
        'Sharrows - Wayfinding',
        'Sharrows - Arterial - Connector',
        'Signed Route (No Pavement Markings)',
        'Sharrows',
      ],
      true,
      false,
    ],
    layout: {
      'line-cap': 'round',
    },
    paint: {
      'line-width': 3,
      'line-dasharray': [1, 2],
      'line-color': [
        'match',
        ['get', 'INFRA_HIGHORDER'],
        [
          'Sharrows - Wayfinding',
          'Sharrows - Arterial - Connector',
          'Signed Route (No Pavement Markings)',
          'Sharrows',
        ],
        'hsl(137, 56%, 62%)',
        '#2c3b42',
      ],
    },
  };

  return (
    <Source id="bicycle-network" type="geojson" data={bicycleNetworkURL}>
      <Layer {...bicycleLaneLayer} beforeId={beforeId} />
      <Layer {...bicycleRouteLayer} beforeId={beforeId} />
    </Source>
  );
}

export function BicycleNetworkLayerLegend() {
  const legendEntries = [
    {
      key: 'protected',
      icon: networkProtected.src,
      alt: 'dark green line',
      description: 'Protected bike lane',
    },
    {
      key: 'painted',
      icon: networkPainted.src,
      alt: 'green line',
      description: 'Painted bike lane',
    },
    {
      key: 'trail',
      icon: networkTrail.src,
      alt: 'brown line',
      description: 'Multi-use or park trail',
    },
    {
      key: 'sharrow',
      icon: networkSharrow.src,
      alt: 'light green dashed line',
      description: 'Unprotected bike route (e.g. sharrows)',
    },
    {
      key: 'unknown',
      icon: networkUnknown.src,
      alt: 'dark grey line',
      description: 'Unknown bike lane type',
    },
  ];
  return (
    <>
      <h3>Bicycle Network</h3>
      <table className={styles.legendTable}>
        <thead>
          <tr>
            <th style={{textAlign: 'center'}}>Style</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {legendEntries.map(entry => (
            <tr key={entry.key}>
              <td>
                <img src={entry.icon} alt={entry.alt} width={44} />
              </td>
              <td>{entry.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
