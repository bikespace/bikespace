import React, {useEffect} from 'react';
import {useMap, MapContainer, TileLayer} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

import {MapMarker} from '../map-marker';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import * as styles from './map.module.scss';

interface MapProps {
  submissions: SubmissionApiPayload[];
}

export function Map({submissions}: MapProps) {
  return (
    <div className={styles.map}>
      <MapContainer
        center={[43.733399, -79.376221]}
        zoom={11}
        scrollWheelZoom={false}
        style={{height: '100%'}}
      >
        <TileLayer
          attribution='&copy; Maps <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; Data <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=66ccf6226ef54ef38a6b97fe0b0e5d2e"
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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

const MapHandler = () => {
  const map = useMap();

  useEffect(() => {
    const alertErrorMessage = (message: string) => {
      alert(message);
    };

    map
      .locate()
      .on('locationfound', e => {
        // this.analytics_event('locationfound');
        map.flyTo(e.latlng, map.getZoom());
      })
      .on('locationerror', err => {
        const code = err.code as 0 | 1 | 2 | 3;

        const message =
          CUSTOM_GEO_ERROR_MESSAGES[code] ||
          'Unknown error while trying to locate you';
        // this.analytics_event('locationerror', {code: err.code, message});
        alertErrorMessage(message);
      });
  }, []);

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
