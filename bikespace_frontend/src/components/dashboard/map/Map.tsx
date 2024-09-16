import React from 'react';
import MapGL, {
  GeolocateControl,
  AttributionControl,
} from 'react-map-gl/maplibre';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {MapCluster} from '../map-cluster';

import 'maplibre-gl/dist/maplibre-gl.css';

export interface MapProps {
  submissions: SubmissionApiPayload[];
}

function Map({submissions}: MapProps) {
  return (
    <MapGL
      initialViewState={{
        latitude: 43.733399,
        longitude: -79.376221,
        zoom: 14,
      }}
      attributionControl={false}
      mapStyle="https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=66ccf6226ef54ef38a6b97fe0b0e5d2e"
    >
      <AttributionControl customAttribution='&copy; Maps <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; Data <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' />
      <GeolocateControl
        trackUserLocation={false}
        onGeolocate={() => {
          trackUmamiEvent('locationfound');
        }}
        onError={e => {
          trackUmamiEvent('locationerror', {code: e.code, message: e.message});
        }}
        position="top-left"
      />
      <MapCluster submissions={submissions} />
    </MapGL>
  );
}

export default Map;
export {Map};
