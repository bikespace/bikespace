import {Marker} from 'react-map-gl';
import Supercluster from 'supercluster';
import {useMap} from 'react-map-gl';

import styles from './map-cluster-marker.module.scss';

interface MapMarkerClusterProps {
  id: number;
  latitude: number;
  longitude: number;
  count: number;
  totalCount: number;
  supercluster: Supercluster;
}

const BASE_SIZE = 20;
const SCALE_FACTOR = 100;

export function MapMarkerCluster({
  id,
  latitude,
  longitude,
  count,
  totalCount,
  supercluster,
}: MapMarkerClusterProps) {
  const map = useMap();

  const countRatio = count / totalCount;

  const markerSize = BASE_SIZE + countRatio * SCALE_FACTOR;

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      onClick={() => {
        const zoom = supercluster.getClusterExpansionZoom(id);

        map.current?.flyTo({
          center: [longitude, latitude],
          zoom,
        });
      }}
    >
      <div
        className={`${styles.marker} ${getSizeClassName(countRatio)}`}
        style={{
          width: `${markerSize}px`,
          height: `${markerSize}px`,
        }}
      >
        {count}
      </div>
    </Marker>
  );
}

const getSizeClassName = (ratio: number) => {
  if (ratio <= 0.1) return styles.small;

  if (ratio <= 0.5) return styles.medium;

  return styles.large;
};
