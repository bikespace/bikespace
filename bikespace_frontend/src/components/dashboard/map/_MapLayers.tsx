import type {LayerProps} from 'react-map-gl/maplibre';

export const unclusteredSubmissionsLayer: LayerProps = {
  id: 'bikeparking-submissions-unclustered',
  type: 'circle',
  // filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#11b4da',
    'circle-radius': 4,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff',
  },
};
