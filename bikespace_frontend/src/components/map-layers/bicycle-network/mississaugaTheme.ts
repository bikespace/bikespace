/**
 * Based on the theme used in the City of Mississauga PDF cycling map.
 *
 * This style does not implement two of the options used in that map:
 * - Unpaved Multi-Use Paths (brown dotted ovals) - not possible because the City of Toronto data does not currently return data on whether paths are unpaved.
 * - Great Lakes Waterfront Trail / Trans Canada Trail (same schema, but with blue colours instead of green) - not possible because the City of Toronto data does not indicate membership in larger cycling network routes. In addition, this special coloration may not be desirable for the parking map, since wayfinding is not a primary goal.
 */

import type {LineLayerSpecification} from 'react-map-gl/maplibre';

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

export const getMississaugaStyleLayer = (
  id: string
): LineLayerSpecification => ({
  id: id,
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
});

export const getMississaugaStyleOutlineLayer = (
  id: string
): LineLayerSpecification => ({
  id: id,
  type: 'line',
  source: 'bicycle-lanes',
  filter: [
    'in',
    ['get', 'INFRA_HIGHORDER'],
    ['literal', [...bikeLaneTypes.protected, ...bikeLaneTypes.multiUseTrails]],
  ],
  layout: {
    'line-cap': 'round',
  },
  paint: {
    'line-width': 2,
    'line-gap-width': 3,
    'line-color': 'rgb(1, 164, 80)',
  },
});

export const getMississaugaContrastOutlineLayer = (
  id: string
): LineLayerSpecification => ({
  id: id,
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
});

export const mississaugaStyleLegendEntries = [
  {
    key: 'protected',
    icon: networkProtectedMississauga.src,
    alt: 'grey line with a green casing',
    description: 'Protected bike lane',
  },
  {
    key: 'painted',
    icon: networkPaintedMississauga.src,
    alt: 'green line',
    description: 'Painted bike lane',
  },
  {
    key: 'trail',
    icon: networkTrailMississauga.src,
    alt: 'light green line with a green casing',
    description: 'Multi-use or park trail',
  },
  {
    key: 'sharrow',
    icon: networkSharrowMississauga.src,
    alt: 'green dashed line',
    description: 'Unprotected bike route (e.g. sharrows)',
  },
  {
    key: 'unknown',
    icon: networkUnknownMississauga.src,
    alt: 'dark grey line',
    description: 'Unknown bike lane type',
  },
];
