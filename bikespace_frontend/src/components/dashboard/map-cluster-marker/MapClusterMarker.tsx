import {Marker} from 'react-map-gl';
import Supercluster from 'supercluster';
import {useMap} from 'react-map-gl';

import styles from './map-cluster-marker.module.scss';

interface MapClusterMarkerProps {
  id: number;
  latitude: number;
  longitude: number;
  count: number;
  totalCount: number;
  supercluster: Supercluster;
}

export function MapClusterMarker({
  id,
  latitude,
  longitude,
  count,
  totalCount,
  supercluster,
}: MapClusterMarkerProps) {
  const map = useMap();

  const markerSize = 10 + (count / totalCount) * 200;

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
