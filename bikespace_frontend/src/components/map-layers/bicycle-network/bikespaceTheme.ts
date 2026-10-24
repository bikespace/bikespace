/**
 * Original theme used on BikeSpace bicycle parking map
 */

import type {LineLayerSpecification} from 'react-map-gl/maplibre';

// BikeSpace Theme Legend SVGs
import networkProtectedBikeSpace from '@/assets/icons/bicycle_network/network_bikespace_protected_lane.svg';
import networkPaintedBikeSpace from '@/assets/icons/bicycle_network/network_bikespace_painted_lane.svg';
import networkTrailBikeSpace from '@/assets/icons/bicycle_network/network_bikespace_park_multiuse_trail.svg';
import networkUnknownBikeSpace from '@/assets/icons/bicycle_network/network_bikespace_unknown_lane.svg';
import networkSharrowBikeSpace from '@/assets/icons/bicycle_network/network_bikespace_sharrow_unprotected.svg';

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

export const getBikeSpaceStyleLayer = (id: string): LineLayerSpecification => ({
  id: id,
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
});

export const getBikeSpaceContrastOutlineLayer = (
  id: string
): LineLayerSpecification => ({
  id: id,
  type: 'line',
  source: 'bicycle-lanes',
  layout: {
    'line-cap': 'round',
  },
  paint: {
    'line-width': 3 + 2,
    'line-color': 'white',
  },
});

export const bikeSpaceStyleLegendEntries = [
  {
    key: 'protected',
    icon: networkProtectedBikeSpace.src,
    alt: 'dark green line',
    description: 'Protected bike lane',
  },
  {
    key: 'painted',
    icon: networkPaintedBikeSpace.src,
    alt: 'green line',
    description: 'Painted bike lane',
  },
  {
    key: 'trail',
    icon: networkTrailBikeSpace.src,
    alt: 'brown line',
    description: 'Multi-use or park trail',
  },
  {
    key: 'sharrow',
    icon: networkSharrowBikeSpace.src,
    alt: 'light green dashed line',
    description: 'Unprotected bike route (e.g. sharrows)',
  },
  {
    key: 'unknown',
    icon: networkUnknownBikeSpace.src,
    alt: 'dark grey line',
    description: 'Unknown bike lane type',
  },
];
