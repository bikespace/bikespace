import React, {useRef} from 'react';
import {MapContainer, TileLayer} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
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

function Map({submissions}: MapProps) {
  const mapRef = useRef(null);

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
      <MarkerClusterGroup chunkedLoading>
        {submissions.map(submission => (
          <MapMarker
            key={submission.id}
            submission={submission}
            windowWidth={windowSize.width}
          />
        ))}
      </MarkerClusterGroup>
      <MapHandler />
    </MapContainer>
  );
}

export default Map;
export {Map};
