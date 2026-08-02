import React from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';

import type {LineLayerSpecification} from 'react-map-gl/maplibre';

import styles from './legend-tables.module.scss';

import networkProtected from '@/assets/icons/bicycle_network/network_protected_lane.svg';
import networkPainted from '@/assets/icons/bicycle_network/network_painted_lane.svg';
import networkTrail from '@/assets/icons/bicycle_network/network_park_multiuse_trail.svg';
import networkUnknown from '@/assets/icons/bicycle_network/network_unknown_lane.svg';
import networkSharrow from '@/assets/icons/bicycle_network/network_sharrow_unprotected.svg';

const bikeLaneTypes = {
  protected: [
    'Cycle Track',
    'Cycle Track - Contraflow',
    'Bi-Directional Cycle Track',
  ],
  painted: [
    'Bike Lane',
    'Bike Lane - Buffered',
    'Bike Lane - Contraflow',
    'Contra-Flow Bike Lane',
    'Contraflow',
  ],
  multiUseTrails: [
    'Multi-Use Trail',
    'Multi-Use Trail - Boulevard',
    'Multi-Use Trail - Connector',
    'Multi-Use Trail - Entrance',
    'Multi-Use Trail - Existing Connector',
    'Park Road',
  ],
  unprotectedConnectors: [
    'Sharrows',
    'Sharrows - Arterial',
    'Sharrows - Arterial - Connector',
    'Sharrows - Wayfinding',
    'Signed Route (No Pavement Markings)',
  ],
};

interface BicycleNetworkLayerProps {
  beforeId?: string;
  firstLayerId?: string;
  lastLayerId?: string;
  background?: 'light' | 'dark';
}

export function BicycleNetworkLayer({
  beforeId,
  firstLayerId = 'bicycle-lanes-first',
  lastLayerId = 'bicycle-lanes-last',
  background = 'light',
}: BicycleNetworkLayerProps) {
  const bicycleNetworkURL = process.env.DATA_BICYCLE_NETWORK;

  const bikespaceStyleLight: LineLayerSpecification = {
    id: firstLayerId,
    type: 'line',
    source: 'bicycle-lanes',
    layout: {
      'line-cap': 'round',
    },
    paint: {
      'line-width': 3,
      'line-dasharray': [
        'match',
        ['get', 'INFRA_HIGHORDER'],
        bikeLaneTypes.unprotectedConnectors,
        ['literal', [1, 2]],
        ['literal', [1, 0]], // no dash
      ],
      'line-color': [
        'match',
        ['get', 'INFRA_HIGHORDER'],
        bikeLaneTypes.protected,
        'hsl(137, 68%, 23%)',
        bikeLaneTypes.multiUseTrails,
        '#8c5535',
        bikeLaneTypes.painted,
        'hsl(137, 68%, 36%)',
        bikeLaneTypes.unprotectedConnectors,
        'hsl(137, 56%, 62%)',
        '#2c3b42',
      ],
    },
  };

  const mississaugaStyle: LineLayerSpecification = {
    id: firstLayerId,
    type: 'line',
    source: 'bicycle-lanes',
    layout: {
      'line-cap': 'round',
      'line-sort-key': [
        'match',
        ['get', 'INFRA_HIGHORDER'],
        bikeLaneTypes.protected,
        4,
        bikeLaneTypes.multiUseTrails,
        3,
        bikeLaneTypes.painted,
        2,
        bikeLaneTypes.unprotectedConnectors,
        1,
        0,
      ],
    },
    paint: {
      'line-width': 3,
      'line-dasharray': [
        'match',
        ['get', 'INFRA_HIGHORDER'],
        bikeLaneTypes.unprotectedConnectors,
        // [dash, gap]; both are scaled by line width
        // round line-cap adds 1 width to dash and subtracts 1 width to gap
        ['literal', [(6 - 3) / 3, (6 + 3) / 3]],
        ['literal', [1, 0]], // no dash
      ],
      'line-color': [
        'match',
        ['get', 'INFRA_HIGHORDER'],
        bikeLaneTypes.protected,
        'rgb(162, 166, 169)',
        bikeLaneTypes.multiUseTrails,
        'rgb(223, 237, 211)',
        bikeLaneTypes.painted,
        'rgb(1, 164, 80)',
        bikeLaneTypes.unprotectedConnectors,
        'rgb(1, 164, 80)',
        '#2c3b42',
      ],
    },
  };

  const mississaugaStyleOutline: LineLayerSpecification = {
    id:
      background === 'dark'
        ? 'bicycle-network-mississauga-style-outline'
        : lastLayerId,
    type: 'line',
    source: 'bicycle-lanes',
    filter: [
      'in',
      ['get', 'INFRA_HIGHORDER'],
      [
        'literal',
        [...bikeLaneTypes.protected, ...bikeLaneTypes.multiUseTrails],
      ],
    ],
    layout: {
      'line-cap': 'round',
    },
    paint: {
      'line-width': 2,
      'line-gap-width': 3,
      'line-color': 'rgb(1, 164, 80)',
    },
  };

  const contrastOutline: LineLayerSpecification = {
    id: lastLayerId,
    type: 'line',
    source: 'bicycle-lanes',
    layout: {
      'line-cap': 'round',
    },
    paint: {
      'line-width': 1,
      'line-gap-width': [
        'match',
        ['get', 'INFRA_HIGHORDER'],
        bikeLaneTypes.protected,
        7,
        bikeLaneTypes.multiUseTrails,
        7,
        bikeLaneTypes.painted,
        3,
        bikeLaneTypes.unprotectedConnectors,
        3,
        3,
      ],
      'line-color': 'white',
      'line-dasharray': [
        'match',
        ['get', 'INFRA_HIGHORDER'],
        bikeLaneTypes.unprotectedConnectors,
        // [dash, gap]; both are scaled by line width
        // round line-cap adds 1 width to dash and subtracts 1 width to gap
        ['literal', [(6 - 3) / 1, (6 + 3) / 1]],
        ['literal', [1, 0]], // no dash
      ],
    },
  };

  return (
    <Source
      id="bicycle-network"
      type="geojson"
      data={bicycleNetworkURL!}
      attribution="City of Toronto"
    >
      {background === 'dark' ? (
        <Layer {...contrastOutline} beforeId={beforeId} />
      ) : null}
      <Layer {...mississaugaStyleOutline} beforeId={beforeId} />
      <Layer {...mississaugaStyle} beforeId={beforeId} />
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
