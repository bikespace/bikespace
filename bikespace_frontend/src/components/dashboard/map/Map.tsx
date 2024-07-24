import React, {useEffect, useRef} from 'react';
import {useMap, MapContainer, TileLayer} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {useWindowSize} from '@uidotdev/usehooks';
import umami from '@umami/node';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {MapMarker} from '../map-marker';
import {LeafletLocateControl} from '../leaflet-locate-control';

import styles from './map.module.scss';
import './leaflet.scss';

export interface MapProps {
  submissions: SubmissionApiPayload[];
}

const tileLayers = {
  osm: (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  ),
  thunderforest: (
    <TileLayer
      attribution='&copy; Maps <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; Data <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      url="https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=66ccf6226ef54ef38a6b97fe0b0e5d2e"
    />
  ),
};

function Map({submissions}: MapProps) {
  const mapRef = useRef(null);

  return (
    <div className={styles.map}>
      <MapContainer
        center={[43.733399, -79.376221]}
        zoom={11}
        scrollWheelZoom
        style={{height: '100%'}}
        ref={mapRef}
      >
        <LeafletLocateControl />
        {tileLayers.thunderforest}
        <MapHandler />
        <MarkerClusterGroup chunkedLoading>
          {submissions.map(submission => (
            <MapMarker key={submission.id} submission={submission} />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

export default Map;
export {Map};

const MapHandler = () => {
  const map = useMap();

  const window = useWindowSize();

  useEffect(() => {
    map
      .locate()
      .on('locationfound', e => {
        umami.track('locationfound');
        map.flyTo(e.latlng, map.getZoom());
      })
      .on('locationerror', err => {
        const code = err.code as 0 | 1 | 2 | 3;

        const message =
          CUSTOM_GEO_ERROR_MESSAGES[code] ||
          'Unknown error while trying to locate you';

        umami.track('locationerror', {code: err.code, message});
        console.log(message);
      });
  }, []);

  useEffect(() => {
    map.invalidateSize();
  }, [window]);

  return null;
};

const CUSTOM_GEO_ERROR_MESSAGES = {
  // leaflet internally uses 0 to denote missing Geolocation API
  // ref: https://github.com/Leaflet/Leaflet/blob/00e0534cd9aa723d10a652146311efd9ce990b46/src/map/Map.js#L632
  0: 'GPS is not supported in your browser.',
  1: 'Please allow location access.',
  // happens when: location is disabled at OS-level / when GPS has other errors
  2: 'Had trouble locating you. Please turn on / restart your GPS or try another device.',
  3: 'It took too long to locate you. Please try again.',
};
