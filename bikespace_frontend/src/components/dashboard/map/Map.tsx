import React, {useCallback, useEffect, useRef, useState} from 'react';

import {MapContainer, TileLayer} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

import {useStore} from '@/states/store';
import {SidebarTab, useSidebarTab} from '@/states/url-params';
import {useIsMobile} from '@/hooks/use-is-mobile';

import {defaultMapCenter, getRasterTileLayerProps} from '@/utils/map-utils';

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
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
// react-leaflet-cluster v4 no longer imports its own CSS.
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

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
  const tileLayerProps = getRasterTileLayerProps(process.env.MAPTILER_API_KEY);

  const isMobile = useIsMobile();
  const [, setSidebarTab] = useSidebarTab();

  const {setIsSidebarOpen, selectedSubmission, setSelectedSubmission} =
    useStore(state => ({
      setIsSidebarOpen: state.ui.sidebar.setIsOpen,
      selectedSubmission: state.ui.submissions.selectedSubmission,
      setSelectedSubmission: state.ui.submissions.setSelectedSubmission,
    }));

  // react-leaflet-cluster v4 buffers each <Marker>'s addLayer call and flushes
  // them in a microtask as one addLayers() call. With `chunkedLoading`,
  // addLayers() processes markers in time-boxed chunks spread over several
  // macrotasks, so a marker can exist (and have a ref) well before it is placed
  // in a cluster. `chunkProgress` is the only signal that clustering finished.
  //
  // clustersReady: the first batch of markers has been fully clustered.
  // isClusteringDoneRef: the most recent addLayers() call has finished.
  // pendingZoomRef: a zoom to run once the in-progress addLayers() finishes.
  const [clustersReady, setClustersReady] = useState(false);
  const isClusteringDoneRef = useRef(false);
  const pendingZoomRef = useRef<(() => void) | null>(null);

  const handleChunkProgress = useCallback(
    (processed: number, total: number) => {
      const done = processed === total;
      isClusteringDoneRef.current = done;
      if (!done) return;
      setClustersReady(true);
      const pendingZoom = pendingZoomRef.current;
      pendingZoomRef.current = null;
      pendingZoom?.();
    },
    []
  );

  const [tilesReady, setTilesReady] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // With no submissions, addLayers() is never called, so chunkProgress never
  // fires; treat an empty result as ready.
  const markersReady =
    !isFirstMarkerDataLoading && (clustersReady || submissions.length === 0);

  // Track whether the map is fully loaded using the initialized hook
  useEffect(() => {
    if (!initialized && tilesReady && markersReady) {
      setInitialized(true);
    }
  }, [initialized, tilesReady, markersReady]);

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
    if (!clustersReady || !selectedSubmission) return;

    const zoomToSelected = () => {
      const currentMarker = markerRefs.current[selectedSubmission];
      const cluster = clusterRef.current;
      if (!currentMarker || !cluster || !cluster.hasLayer(currentMarker)) {
        return;
      }
      cluster.zoomToShowLayer(currentMarker, () => {
        currentMarker.openPopup();
      });
    };

    // Child effects run before this one, so markers added in this commit are
    // still in react-leaflet-cluster's buffer. Wait one macrotask for the
    // buffer to flush; its first addLayers() chunk runs synchronously and calls
    // chunkProgress. If more chunks remain, defer the zoom until the last one,
    // otherwise zoomToShowLayer can act on a marker that has no cluster parent
    // yet (and throw) or on stale cluster bounds.
    const timeoutId = setTimeout(() => {
      if (isClusteringDoneRef.current) {
        zoomToSelected();
      } else {
        pendingZoomRef.current = zoomToSelected;
      }
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      pendingZoomRef.current = null;
    };
  }, [selectedSubmission, submissions, clustersReady]);

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
        {...tileLayerProps}
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
      <MarkerClusterGroup
        chunkedLoading
        chunkProgress={handleChunkProgress}
        ref={clusterRef}
      >
        {submissions.map(submission => {
          return (
            <MapMarker
              key={submission.id}
              submission={submission}
              isSelected={submission.id === selectedSubmission}
              onClick={() => handleMarkerClick(submission.id)}
              ref={(m: LeafletMarker | null) => {
                if (m) markerRefs.current[submission.id] = m;
                else delete markerRefs.current[submission.id];
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
