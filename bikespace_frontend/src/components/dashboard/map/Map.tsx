import React, {useEffect, useRef, useState} from 'react';

import {MapContainer, TileLayer} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

import {useStore} from '@/states/store';
import {SidebarTab, useSidebarTab} from '@/states/url-params';
import {useIsMobile} from '@/hooks/use-is-mobile';

import {defaultMapCenter} from '@/utils/map-utils';

import {Spinner} from '@/components/shared-ui/spinner';

import {MapMarker} from '../map-marker';
import {LeafletLocateControl} from '../leaflet-locate-control';
import {MapHandler} from '../map-handler';

import type {
  Marker as LeafletMarker,
  Map as lMap,
  MarkerClusterGroup as LeafletMarkerClusterGroup,
} from 'leaflet';
import type {SubmissionApiPayload} from '@/interfaces/Submission';

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
  const [, setSidebarTab] = useSidebarTab();

  const {setIsSidebarOpen, selectedSubmission, setSelectedSubmission} =
    useStore(state => ({
      setIsSidebarOpen: state.ui.sidebar.setIsOpen,
      selectedSubmission: state.ui.submissions.selectedSubmission,
      setSelectedSubmission: state.ui.submissions.setSelectedSubmission,
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
      markersReady
    ) {
      setInitialized(true);
    }
  }, [isFirstMarkerDataLoading, tilesReady, markersReady, submissions.length]);

  // handle marker click on mobile
  function handleMarkerClick(submissionId: number) {
    if (isMobile) {
      setSelectedSubmission(submissionId);
      setSidebarTab(SidebarTab.Feed);
      setIsSidebarOpen(true);
    }
  }

  // zoom to pin and open popup when a new submission is selected
  useEffect(() => {
    if (!markersReady || !selectedSubmission) return;
    const currentMarker = markerRefs.current[selectedSubmission];
    clusterRef.current!.zoomToShowLayer(currentMarker, () => {
      currentMarker.openPopup();
    });
  }, [selectedSubmission, submissions, markersReady]);

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
              isSelected={submission.id === selectedSubmission}
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
