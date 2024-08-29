import React, {useRef, useState} from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {Marker as LeafletMarker} from 'leaflet';
import {useWindowSize} from '@uidotdev/usehooks';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {MapMarker} from '../map-marker';
import {LeafletLocateControl} from '../leaflet-locate-control';
import {MapHandler} from '../map-handler';

import styles from './map.module.scss';
import './leaflet.scss';

export interface MapProps {
  submissions: SubmissionApiPayload[];
}

type MarkerRefs = Record<number, LeafletMarker>;

function Map({submissions}: MapProps) {
  const mapRef = useRef(null);
  const clusterRef = useRef(null);
  const [doneLoading, setDoneLoading] = useState(false);
  const markerRefs = useRef<MarkerRefs>({});

  const windowSize = useWindowSize();

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
      <MapHandler />
    </MapContainer>
  );
}

export default Map;
export {Map};
