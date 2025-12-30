import React, {useEffect, useRef, useState} from 'react';

import {MapContainer, TileLayer} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster'; // add MarkerClusterGroup to leaflet namespace
import {
  Map as LeafletMap,
  MarkerClusterGroup as LeafletMarkerClusterGroup,
} from 'leaflet';

import {useStore} from '@/states/store';
import {useSubmissionId, SidebarTab, useSidebarTab} from '@/states/url-params';

import {trackUmamiEvent} from '@/utils';
import {defaultMapCenter} from '@/utils/map-utils';
import {SubmissionApiPayload} from '@/interfaces/Submission';

import {Spinner} from '@/components/shared-ui/spinner';

import {MapMarker} from '../map-marker';
import {LeafletLocateControl} from '../leaflet-locate-control';
import {MapHandler} from '../map-handler';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

import styles from './map.module.scss';
import {wrapperFullWidth} from '@/styles/variablesTS';
import './leaflet.scss';

export interface MapProps {
  submissions: SubmissionApiPayload[];
}

function Map({submissions}: MapProps) {
  const mapRef = useRef<LeafletMap>(null);
  const clusterRef = useRef<LeafletMarkerClusterGroup>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useSubmissionId();
  const [, setSidebarTab] = useSidebarTab();

  const [tilesReady, setTilesReady] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const {isQueryLoading, setIsSidebarOpen} = useStore(state => ({
    isQueryLoading: state.ui.loading.isFirstMarkerDataLoading,
    setIsSidebarOpen: state.ui.sidebar.setIsOpen,
  }));

  // Track whether the map is fully loaded using the initialized hook
  useEffect(() => {
    if (!initialized && !isQueryLoading && tilesReady && clusterRef.current) {
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQueryLoading, tilesReady, clusterRef]);

  // handle marker click on mobile
  function handleMarkerClick(submissionId: number) {
    if (window.innerWidth <= wrapperFullWidth) {
      setSelectedSubmissionId(submissionId);
      setSidebarTab(SidebarTab.Feed);
      setIsSidebarOpen(true);
      trackUmamiEvent('focus_submission', {submission_id: submissionId});
    }
  }

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
        {submissions.map(submission => {
          return (
            <MapMarker
              key={submission.id}
              submission={submission}
              clusterRef={clusterRef}
              isSelected={submission.id === selectedSubmissionId}
              onClick={() => handleMarkerClick(submission.id)}
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
