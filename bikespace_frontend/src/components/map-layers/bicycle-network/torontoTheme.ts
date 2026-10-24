/**
 * Based on the theme used in the City of Toronto PDF cycling map.
 *
 * This style does not implement the one-way indicators from the City cycling map since the open data on the cycling network does not include them.
 */

import type {LineLayerSpecification} from 'react-map-gl/maplibre';

import {bikeSpaceStyleLegendEntries} from './bikespaceTheme';

const bikeLaneTypesToronto = {
  cycleTracks: [
    'Cycle Track',
    'Cycle Track - Contraflow',
    'Bi-Directional Cycle Track',
  ],
  bikeLanes: ['Bike Lane', 'Bike Lane - Buffered'],
  bikeLanesContraFlow: [
    'Bike Lane - Contraflow',
    'Contra-Flow Bike Lane',
    'Contraflow',
  ],
  unprotectedConnectors: [
    'Sharrows',
    'Sharrows - Arterial',
    'Sharrows - Arterial - Connector',
    'Sharrows - Wayfinding',
    'Signed Route (No Pavement Markings)',
  ],
  multiUseTrails: [
    'Multi-Use Trail',
    'Multi-Use Trail - Boulevard',
    'Multi-Use Trail - Connector',
    'Multi-Use Trail - Entrance',
    'Multi-Use Trail - Existing Connector',
  ],
  parkRoadwayConnections: ['Park Road'],
};

export const getTorontoStyleOverlayLayer = (
  id: string
): LineLayerSpecification => ({
  id: id,
  type: 'line',
  source: 'bicycle-lanes',
  filter: [
    'in',
    ['get', 'INFRA_HIGHORDER'],
    [
      'literal',
      [
        ...bikeLaneTypesToronto.bikeLanes,
        ...bikeLaneTypesToronto.bikeLanesContraFlow,
        ...bikeLaneTypesToronto.unprotectedConnectors,
        ...bikeLaneTypesToronto.parkRoadwayConnections,
      ],
    ],
  ],
  layout: {
    'line-cap': [
      'match',
      ['get', 'INFRA_HIGHORDER'],
      bikeLaneTypesToronto.bikeLanes,
      'square',
      'round',
    ],
  },
  paint: {
    'line-width': [
      'match',
      ['get', 'INFRA_HIGHORDER'],
      bikeLaneTypesToronto.bikeLanes,
      1,
      3,
    ],
    'line-color': 'white',
    'line-dasharray': [
      'match',
      ['get', 'INFRA_HIGHORDER'],
      bikeLaneTypesToronto.bikeLanes,
      ['literal', [1, 0]], // no dash
      // [dash, gap]; both are scaled by line width
      // round line-cap adds 1 width to dash and subtracts 1 width to gap
      ['literal', [(3 - 3) / 3, (3 + 3) / 3]],
    ],
  },
});

export const getTorontoStyleLayer = (id: string): LineLayerSpecification => ({
  id: id,
  type: 'line',
  source: 'bicycle-lanes',
  layout: {
    'line-cap': 'square',
  },
  paint: {
    'line-width': 5,
    'line-color': [
      'match',
      ['get', 'INFRA_HIGHORDER'],
      [
        ...bikeLaneTypesToronto.cycleTracks,
        ...bikeLaneTypesToronto.bikeLanes,
        ...bikeLaneTypesToronto.bikeLanesContraFlow,
      ],
      'rgb(0, 102, 179)',
      [
        ...bikeLaneTypesToronto.multiUseTrails,
        ...bikeLaneTypesToronto.parkRoadwayConnections,
      ],
      'rgb(245, 143, 31)',
      bikeLaneTypesToronto.unprotectedConnectors,
      'rgb(0, 178, 235)',
      '#2c3b42',
    ],
  },
});

export const getTorontoContrastOutlineLayer = (
  id: string
): LineLayerSpecification => ({
  id: id,
  type: 'line',
  source: 'bicycle-lanes',
  layout: {
    'line-cap': 'square',
  },
  paint: {
    'line-width': 7 + 2,
    'line-color': 'white',
  },
});

export const torontoStyleLegendEntries = bikeSpaceStyleLegendEntries;
