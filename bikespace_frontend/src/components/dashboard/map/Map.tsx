import React, {useEffect, useRef, useState, useMemo} from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {useWindowSize} from '@uidotdev/usehooks';

import {useStore} from '@/states/store';
import {trackUmamiEvent} from '@/utils';
import {SidebarTab, useSidebarTab, useSubmissionId} from '@/states/url-params';

import {MapMarker} from '../map-marker';
import {LeafletLocateControl} from '../leaflet-locate-control';

import type {
  Marker as LeafletMarker,
  Map as lMap,
  MarkerClusterGroup as lMarkerClusterGroup,
} from 'leaflet';
import type {SubmissionApiPayload} from '@/interfaces/Submission';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import styles from './map.module.scss';
import './leaflet.scss';
import {wrapperFullWidth} from '@/styles/variablesTS';

const CUSTOM_GEO_ERROR_MESSAGES = {
  // leaflet internally uses 0 to denote missing Geolocation API
  // ref: https://github.com/Leaflet/Leaflet/blob/00e0534cd9aa723d10a652146311efd9ce990b46/src/map/Map.js#L632
  0: 'GPS is not supported in your browser.',
  1: 'Please allow location access.',
  // happens when: location is disabled at OS-level / when GPS has other errors
  2: 'Had trouble locating you. Please turn on / restart your GPS or try another device.',
  3: 'It took too long to locate you. Please try again.',
};

export interface MapProps {
  submissions: SubmissionApiPayload[];
}

type MarkerRefs = Record<number, LeafletMarker>;

function Map({submissions}: MapProps) {
  const mapRef: React.LegacyRef<lMap> = useRef(null);
  const clusterRef = useRef<lMarkerClusterGroup>(null);
  const markerRefs = useRef<MarkerRefs>({});

  const [doneLoading, setDoneLoading] = useState(false);
  const windowSize = useWindowSize();
  const [currentSidebarTab, setSidebarTab] = useSidebarTab();
  const {isOpen, setIsOpen} = useStore(state => state.ui.sidebar);
  const [focusedId] = useSubmissionId();

  // On load, centre map on user location, unless a submission is already selected
  useEffect(() => {
    if (!mapRef.current) return;

    if (focusedId === null) {
      mapRef.current
        .locate()
        .on('locationfound', e => {
          trackUmamiEvent('locationfound');

          mapRef.current!.flyTo(e.latlng, mapRef.current!.getZoom());

          // Stop location tracking after location found
          mapRef.current!.stopLocate();
        })
        .on('locationerror', err => {
          const code = err.code as 0 | 1 | 2 | 3;

          const message =
            CUSTOM_GEO_ERROR_MESSAGES[code] ||
            'Unknown error while trying to locate you';

          trackUmamiEvent('locationerror', {code: err.code, message});
        });
    }
  }, [mapRef.current]);

  // Ensure map still fills the available space when sidebar opens/closes or window resizes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.invalidateSize();
  }, [isOpen, currentSidebarTab, window]);

  // Centre marker on selection
  useEffect(() => {
    if (!mapRef.current || !clusterRef.current || !focusedId) return;

    if (windowSize.width && windowSize.width <= wrapperFullWidth) {
      setSidebarTab(SidebarTab.Feed);
      setIsOpen(true);
    }

    const currentSubmission = markerRefs.current[focusedId];
    clusterRef.current.zoomToShowLayer(currentSubmission, () => {
      currentSubmission.openPopup();
    });
  }, [focusedId, doneLoading]);

  return (
    <MapContainer
      center={[43.733399, -79.376221]}
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
      />
      <MarkerClusterGroup chunkedLoading ref={clusterRef}>
        {submissions.map((submission, index) => {
          return (
            <MapMarker
              key={submission.id}
              submission={submission}
              ref={(m: LeafletMarker) => {
                markerRefs.current[submission.id] = m;
                if (index === submissions.length - 1 && !doneLoading) {
                  setDoneLoading(true);
                }
              }}
            />
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

export default Map;
export {Map};
