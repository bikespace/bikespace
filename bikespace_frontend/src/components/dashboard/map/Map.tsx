import React, {useEffect, useRef, useState} from 'react';

import {MapContainer, TileLayer} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {
  Marker as LeafletMarker,
  Map as lMap,
  MarkerClusterGroup as LeafletMarkerClusterGroup,
} from 'leaflet';

import {useStore} from '@/states/store';
import {SidebarTab, useSidebarTab, useSubmissionId} from '@/states/url-params';
import {useIsMobile} from '@/hooks/use-is-mobile';

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
  isFirstMarkerDataLoading: boolean;
}

type MarkerRefs = Record<number, LeafletMarker>;

function Map({submissions, isFirstMarkerDataLoading}: MapProps) {
  const mapRef: React.LegacyRef<lMap> = useRef(null);
  const clusterRef = useRef<LeafletMarkerClusterGroup>(null);
  const markerRefs = useRef<MarkerRefs>({});
  const isMobile = useIsMobile();
  const [selectedSubmissionId, setSelectedSubmissionId] = useSubmissionId();
  const [, setSidebarTab] = useSidebarTab();
  const {setIsSidebarOpen} = useStore(state => ({
    setIsSidebarOpen: state.ui.sidebar.setIsOpen,
  }));

  const [markersReady, setMarkersReady] = useState(false);
  const [tilesReady, setTilesReady] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Track whether the map is fully loaded using the initialized hook
  useEffect(() => {
    if (
      !initialized &&
      !isFirstMarkerDataLoading &&
      tilesReady &&
      (submissions.length === 0 || markersReady)
    ) {
      setInitialized(true);
    }
  }, [isFirstMarkerDataLoading, tilesReady, markersReady, submissions.length]);

  // handle marker click on mobile
  function handleMarkerClick(submissionId: number) {
    if (isMobile) {
      setSelectedSubmissionId(submissionId);
      setSidebarTab(SidebarTab.Feed);
      setIsSidebarOpen(true);
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
        {submissions.map((submission, index) => {
          return (
            <MapMarker
              key={submission.id}
              submission={submission}
              doneLoading={markersReady}
              clusterRef={clusterRef}
              isSelected={submission.id == selectedSubmissionId}
              onClick={() => handleMarkerClick(submission.id)}
              // track when the last marker is rendered
              ref={(m: LeafletMarker) => {
                markerRefs.current[submission.id] = m;
                if (index === submissions.length - 1 && !initialized) {
                  setMarkersReady(true);
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
