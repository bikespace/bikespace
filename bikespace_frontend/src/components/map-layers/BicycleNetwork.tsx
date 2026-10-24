import React from 'react';
import {Layer, Source} from 'react-map-gl/maplibre';

import type {LineLayerSpecification} from 'react-map-gl/maplibre';

import styles from './legend-tables.module.scss';

// BikeSpace Theme Legend SVGs
import networkProtectedBikeSpace from '@/assets/icons/bicycle_network/network_bikespace_protected_lane.svg';
import networkPaintedBikeSpace from '@/assets/icons/bicycle_network/network_bikespace_painted_lane.svg';
import networkTrailBikeSpace from '@/assets/icons/bicycle_network/network_bikespace_park_multiuse_trail.svg';
import networkUnknownBikeSpace from '@/assets/icons/bicycle_network/network_bikespace_unknown_lane.svg';
import networkSharrowBikeSpace from '@/assets/icons/bicycle_network/network_bikespace_sharrow_unprotected.svg';

// Mississauga Theme Legend SVGs
import networkProtectedMississauga from '@/assets/icons/bicycle_network/network_mississauga_protected_lane.svg';
import networkPaintedMississauga from '@/assets/icons/bicycle_network/network_mississauga_painted_lane.svg';
import networkTrailMississauga from '@/assets/icons/bicycle_network/network_mississauga_park_multiuse_trail.svg';
import networkUnknownMississauga from '@/assets/icons/bicycle_network/network_mississauga_unknown_lane.svg';
import networkSharrowMississauga from '@/assets/icons/bicycle_network/network_mississauga_sharrow_unprotected.svg';

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

export type BicycleNetworkTheme = 'bikespace' | 'mississauga';

interface BicycleNetworkLayerProps {
  beforeId?: string;
  firstLayerId?: string;
  lastLayerId?: string;
  background?: 'light' | 'dark';
  theme?: BicycleNetworkTheme;
}

export function BicycleNetworkLayer({
  beforeId,
  firstLayerId = 'bicycle-lanes-first',
  lastLayerId = 'bicycle-lanes-last',
  background = 'light',
  theme = 'bikespace',
}: BicycleNetworkLayerProps) {
  const bicycleNetworkURL = process.env.DATA_BICYCLE_NETWORK;

  const bikespaceStyle: LineLayerSpecification = {
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
        // [dash, gap]; both are scaled by line width
        // round line-cap adds 1 width to dash and subtracts 1 width to gap
        ['literal', [(6 - 3) / 3, (6 + 3) / 3]],
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

  const bikespaceContrastOutline: LineLayerSpecification = {
    id: lastLayerId,
    type: 'line',
    source: 'bicycle-lanes',
    layout: {
      'line-cap': 'round',
    },
    paint: {
      'line-width': 3 + 2,
      'line-color': 'white',
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

  const mississaugaContrastOutline: LineLayerSpecification = {
    id: lastLayerId,
    type: 'line',
    source: 'bicycle-lanes',
    layout: {
      'line-cap': 'round',
    },
    paint: {
      'line-width': [
        'match',
        ['get', 'INFRA_HIGHORDER'],
        bikeLaneTypes.protected,
        7 + 2,
        bikeLaneTypes.multiUseTrails,
        7 + 2,
        bikeLaneTypes.painted,
        3 + 2,
        bikeLaneTypes.unprotectedConnectors,
        3 + 2,
        3 + 2,
      ],
      'line-color': 'white',
    },
  };

  return (
    // Source does not allow for nested fragments, so each component has to be evaluated and returned one by one
    <Source
      id="bicycle-network"
      type="geojson"
      data={bicycleNetworkURL!}
      attribution="City of Toronto"
    >
      {/* If BikeSpace theme is selected */}
      {theme === 'bikespace' && background === 'dark' ? (
        <Layer {...bikespaceContrastOutline} beforeId={bikespaceStyle.id} />
      ) : null}
      {theme === 'bikespace' ? (
        <Layer {...bikespaceStyle} beforeId={beforeId} />
      ) : null}

      {/* If Mississauga theme is selected */}
      {theme === 'mississauga' && background === 'dark' ? (
        <Layer
          {...mississaugaContrastOutline}
          beforeId={mississaugaStyleOutline.id}
        />
      ) : null}
      {theme === 'mississauga' ? (
        <Layer {...mississaugaStyleOutline} beforeId={mississaugaStyle.id} />
      ) : null}
      {theme === 'mississauga' ? (
        <Layer {...mississaugaStyle} beforeId={beforeId} />
      ) : null}
    </Source>
  );
}

export function BicycleNetworkLayerLegend({
  theme = 'bikespace',
}: {
  theme?: BicycleNetworkTheme;
}) {
  const legendEntries = [
    {
      key: 'protected',
      icon:
        theme === 'mississauga'
          ? networkProtectedMississauga.src
          : networkProtectedBikeSpace.src,
      alt:
        theme === 'mississauga'
          ? 'grey line with a green casing'
          : 'dark green line',
      description: 'Protected bike lane',
    },
    {
      key: 'painted',
      icon:
        theme === 'mississauga'
          ? networkPaintedMississauga.src
          : networkPaintedBikeSpace.src,
      alt: 'green line',
      description: 'Painted bike lane',
    },
    {
      key: 'trail',
      icon:
        theme === 'mississauga'
          ? networkTrailMississauga.src
          : networkTrailBikeSpace.src,
      alt:
        theme === 'mississauga'
          ? 'light green line with a green casing'
          : 'brown line',
      description: 'Multi-use or park trail',
    },
    {
      key: 'sharrow',
      icon:
        theme === 'mississauga'
          ? networkSharrowMississauga.src
          : networkSharrowBikeSpace.src,
      alt:
        theme === 'mississauga'
          ? 'green dashed line'
          : 'light green dashed line',
      description: 'Unprotected bike route (e.g. sharrows)',
    },
    {
      key: 'unknown',
      icon:
        theme === 'mississauga'
          ? networkUnknownMississauga.src
          : networkUnknownBikeSpace.src,
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
