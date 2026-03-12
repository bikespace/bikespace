import type {LayerProps} from 'react-map-gl/maplibre';

export const clusteredSubmissionsLayer: LayerProps = {
  id: 'bikeparking-submissions-clustered',
  type: 'circle',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#68d487', // default cluster colour
      25,
      '#1d9a41',
      50,
      '#136329',
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      8 * 2, // default radius
      25, // increase radius when 25+ points
      8 * 2.5,
      50, // increase radius when 50+ points
      8 * 3,
    ],
  },
};

export const clusterCountsSubmissionsLayer: LayerProps = {
  id: 'bikeparking-submissions-cluster-counts',
  type: 'symbol',
  filter: ['has', 'point_count'],
  paint: {
    'text-color': [
      'step',
      ['get', 'point_count'],
      'black', // default cluster text colour
      25,
      'white',
      50,
      'white',
    ],
  },
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-size': 12,
    'text-font': process.env.MAPTILER_API_KEY
      ? ['Open Sans Bold']
      : ['Noto Sans Medium'],
  },
};

export const unclusteredSubmissionsLayer: LayerProps = {
  id: 'bikeparking-submissions-unclustered',
  type: 'symbol',
  filter: ['!', ['has', 'point_count']],
  layout: {
    'icon-image': [
      'case',
      // in order of rendering priority
      ['in', 'not_provided', ['get', 'issues']],
      'submission:icon_not_provided',
      ['in', 'damaged', ['get', 'issues']],
      'submission:icon_damaged',
      ['in', 'abandoned', ['get', 'issues']],
      'submission:icon_abandoned',
      ['in', 'other', ['get', 'issues']],
      'submission:icon_other',
      ['in', 'full', ['get', 'issues']],
      'submission:icon_full',
      // fallback
      'submission:icon_other',
    ],
    'icon-anchor': 'bottom',
    'icon-overlap': 'always',
    'icon-size': 40 / 140,
  },
  paint: {},
};
