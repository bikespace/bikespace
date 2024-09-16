import {Marker} from 'react-map-gl';

import styles from './map-cluster-marker.module.scss';

interface MapClusterMarkerProps {
  latitude: number;
  longitude: number;
  count: number;
  totalCount: number;
}

export function MapClusterMarker({
  latitude,
  longitude,
  count,
  totalCount,
}: MapClusterMarkerProps) {
  const markerSize = 10 + (count / totalCount) * 20000;

  return (
    <Marker latitude={latitude} longitude={longitude}>
      <div
        className={styles.marker}
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
