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

const BASE_SIZE = 36;
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
        className={`${styles.marker} ${getSizeClassName(count)}`}
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

const getSizeClassName = (threshold: number) => {
  if (threshold <= 10) return styles.small;

  if (threshold <= 100) return styles.medium;

  return styles.large;
};
