import React, {useEffect, useRef, useState} from 'react';

import {MapContainer, TileLayer} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {
  Marker as LeafletMarker,
  Map as lMap,
  MarkerClusterGroup as LeafletMarkerClusterGroup,
} from 'leaflet';

import {useStore} from '@/states/store';

import {defaultMapCenter} from '@/utils/map-utils';
import {SubmissionApiPayload} from '@/interfaces/Submission';

import {Spinner} from '@/components/shared-ui/spinner';

import {MapMarker} from '../map-marker';
import {LeafletLocateControl} from '../leaflet-locate-control';
import {MapHandler} from '../map-handler';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import styles from './map.module.scss';
import './leaflet.scss';

export interface MapProps {
  submissions: SubmissionApiPayload[];
}

type MarkerRefs = Record<number, LeafletMarker>;

function Map({submissions}: MapProps) {
  const mapRef: React.LegacyRef<lMap> = useRef(null);
  const clusterRef = useRef<LeafletMarkerClusterGroup>(null);
  const markerRefs = useRef<MarkerRefs>({});

  const [markersReady, setMarkersReady] = useState(false);
  const [tilesReady, setTilesReady] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const {isQueryLoading} = useStore(state => ({
    isQueryLoading: state.ui.loading.isFirstMarkerDataLoading,
  }));

  // Track whether the map is fully loaded using the initialized hook
  useEffect(() => {
    if (
      !initialized &&
      !isQueryLoading &&
      tilesReady &&
      (submissions.length === 0 || markersReady)
    ) {
      setInitialized(true);
    }
  }, [isQueryLoading, tilesReady, markersReady, submissions.length]);

  return (
    <MapContainer
      center={[defaultMapCenter.latitude, defaultMapCenter.longitude]}
      zoom={11}
      scrollWheelZoom
      style={{width: '100%', height: '100%'}}
      ref={mapRef}
      className={styles.map}
    >
      <LeafletLocateControl />
      <TileLayer
        attribution='&copy; Maps <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; Data <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        url="https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=66ccf6226ef54ef38a6b97fe0b0e5d2e"
        maxZoom={20}
        eventHandlers={{
          loading: () => {
            if (!initialized) setTilesReady(false); // first load only
          },
          load: () => {
            if (!initialized) setTilesReady(true);
          },
          tileerror: () => {
            if (!initialized) setTilesReady(true); // treat as “ready enough”
          },
        }}
      />
      <MarkerClusterGroup chunkedLoading ref={clusterRef}>
        {submissions.map((submission, index) => {
          return (
            <MapMarker
              key={submission.id}
              submission={submission}
              doneLoading={markersReady}
              clusterRef={clusterRef}
              // track when the last marker is rendered
              ref={(m: LeafletMarker) => {
                // markerRefs.current[submission.id] = m;
                if (index === submissions.length - 1) {
                  setMarkersReady(true);
                } else if (index === 0) {
                  setMarkersReady(false);
                }
              }}
            />
          );
        })}
      </MarkerClusterGroup>
      <MapHandler />
      <Spinner
        show={!initialized}
        overlay
        label="Loading map..."
        style={{zIndex: 1000}}
      />
    </MapContainer>
  );
}

export default Map;
export {Map};
