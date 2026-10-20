import type {CircleLayer, SymbolLayer} from 'react-map-gl/maplibre';

export const BIKE_THEFT_SOURCE_ID = 'stolen-bikes';
export const BIKE_THEFT_SELECTED_SOURCE_ID = 'stolen-bikes-selected';
export const BIKE_THEFT_LAYER_ID = 'stolen-pins';
export const BIKE_THEFT_HIT_LAYER_ID = 'stolen-pins-hit';
export const BIKE_THEFT_SELECTED_LAYER_ID = 'stolen-pins-selected';
export const BIKE_THEFT_COUNTS_SOURCE_ID = 'stolen-bike-counts';
export const BIKE_THEFT_COUNTS_LAYER_ID = 'stolen-bike-count-labels';
export const BIKE_THEFT_CLUSTER_LAYER_ID = 'stolen-bike-clusters';
export const BIKE_THEFT_CLUSTER_MAX_ZOOM = 14;

// Cluster layer
export const stolenClustersLayer: CircleLayer = {
  id: BIKE_THEFT_CLUSTER_LAYER_ID,
  type: 'circle',
  source: BIKE_THEFT_SOURCE_ID,
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'case',
      ['==', ['get', 'recoveredCount'], ['get', 'point_count']],
      '#2e7d32',
      ['==', ['get', 'stolenCount'], ['get', 'point_count']],
      '#e53935',
      '#2E6FA0',
    ],
    'circle-radius': ['step', ['get', 'point_count'], 20, 10, 25, 100, 32],
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': 2,
  },
};

// --- Map layer for stolen bike clustercounts ---
export const stolenClusterCountsLayer: SymbolLayer = {
  id: 'stolen-bike-cluster-counts',
  type: 'symbol',
  source: BIKE_THEFT_SOURCE_ID,
  filter: ['has', 'point_count'],
  layout: {
    'text-field': ['to-string', ['get', 'point_count_abbreviated']],
    'text-font': process.env.MAPTILER_API_KEY
      ? ['Open Sans Bold']
      : ['Noto Sans Medium'],
    'text-size': 16,
    'text-allow-overlap': true,
    'text-ignore-placement': true,
  },
  paint: {'text-color': '#ffffff'},
};

// --- Map layer for stolen bike counts ---
export const stolenCountsLayer: SymbolLayer = {
  id: BIKE_THEFT_COUNTS_LAYER_ID,
  minzoom: BIKE_THEFT_CLUSTER_MAX_ZOOM + 1,
  type: 'symbol',
  source: BIKE_THEFT_COUNTS_SOURCE_ID,
  layout: {
    'text-field': ['to-string', ['get', 'count']],
    'text-font': process.env.MAPTILER_API_KEY
      ? ['Open Sans Bold']
      : ['Noto Sans Medium'],
    'text-size': 16,
    'text-allow-overlap': true,
    'text-ignore-placement': true,
  },
  paint: {'text-color': '#ffffff'},
};

// --- Map layer for stolen bike pins ---
export const stolenPinsLayer: CircleLayer = {
  id: BIKE_THEFT_LAYER_ID,
  filter: ['!', ['has', 'point_count']],
  type: 'circle',
  source: BIKE_THEFT_SOURCE_ID,
  paint: {
    'circle-radius': {
      type: 'exponential',
      stops: [
        [10, 10],
        [16, 18],
      ],
    },
    'circle-color': [
      'match',
      ['get', 'locationStatus'],
      'mixed',
      '#2E6FA0',
      'recovered',
      '#2e7d32',
      '#e53935', // default: stolen
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 0.85,
  },
};

export const stolenPinsHitLayer: CircleLayer = {
  id: BIKE_THEFT_HIT_LAYER_ID,
  filter: ['!', ['has', 'point_count']],
  type: 'circle',
  source: BIKE_THEFT_SOURCE_ID,
  paint: {
    'circle-radius': 16,
    'circle-color': '#000000',
    'circle-opacity': 0,
  },
};

// Select layer for stolen bike pins
export const stolenPinsSelectedLayer: CircleLayer = {
  id: BIKE_THEFT_SELECTED_LAYER_ID,
  type: 'circle',
  source: BIKE_THEFT_SELECTED_SOURCE_ID,
  paint: {
    'circle-radius': {
      type: 'exponential',
      stops: [
        [10, 12],
        [16, 20],
      ],
    },
    'circle-color': '#FF9D50',
    'circle-stroke-width': 3,
    'circle-stroke-color': '#FFFFFF',
    'circle-opacity': 1,
  },
};
