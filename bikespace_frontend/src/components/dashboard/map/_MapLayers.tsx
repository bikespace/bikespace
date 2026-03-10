import type {LayerProps} from 'react-map-gl/maplibre';

export const unclusteredSubmissionsLayer: LayerProps = {
  id: 'bikeparking-submissions-unclustered',
  type: 'symbol',
  // filter: ['!', ['has', 'point_count']],
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
