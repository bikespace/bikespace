import React, {useEffect, useRef, useState} from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {Marker as LeafletMarker, Map as lMap} from 'leaflet';
import {useWindowSize} from '@uidotdev/usehooks';

import {useStore} from '@/states/store';
import {defaultMapCenter} from '@/utils/map-utils';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import {SubmissionApiPayload} from '@/interfaces/Submission';
import {useSidebarTab} from '@/states/url-params';

import {MapMarker} from '../map-marker';
import {LeafletLocateControl} from '../leaflet-locate-control';
import {MapHandler} from '../map-handler';

import styles from './map.module.scss';
import loader from '@/styles/shared/loader.module.scss'
import './leaflet.scss';
import {Spinner} from "@/components/spinner/Spinner";

export interface MapProps {
  submissions: SubmissionApiPayload[];
}

type MarkerRefs = Record<number, LeafletMarker>;

function Map({submissions}: MapProps) {
  const mapRef: React.LegacyRef<lMap> = useRef(null);
  const clusterRef = useRef(null);
  const markerRefs = useRef<MarkerRefs>({});

  const [doneLoading, setDoneLoading] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const isMapLoading = !(doneLoading && tilesLoaded);

  const windowSize = useWindowSize();

  const [currentSidebarTab] = useSidebarTab();

  const isSidebarOpen = useStore(state => state.ui.sidebar.isOpen);

  // Ensure map still fills the available space when sidebar opens/closes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.invalidateSize();
  }, [isSidebarOpen, currentSidebarTab]);
  useEffect(() => {
    setDoneLoading(false);
  }, [submissions.length]);

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
          loading: () => setTilesLoaded(false),
          load: () => setTilesLoaded(true),
          tileerror: () => setTilesLoaded(true)
        }}
      />
      {tilesLoaded && ( // Tiles should be loaded before rendering markers
        <MarkerClusterGroup chunkedLoading ref={clusterRef}>
          {submissions.map((submission, index) => {
            return (
              <MapMarker
                key={submission.id}
                submission={submission}
                windowWidth={windowSize.width}
                doneLoading={doneLoading}
                clusterRef={clusterRef}
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
      )}
      <MapHandler />
      <Spinner show={isMapLoading} overlay label="Loading map..." style={{ zIndex: 1000}}/>
    </MapContainer>

  );
}

export default Map;
export {Map};
