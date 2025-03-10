import {useState, useRef, useEffect} from 'react';
import MapGL, {
  GeolocateControl,
  AttributionControl,
  ScaleControl,
  MapRef,
  ViewState,
} from 'react-map-gl/maplibre';
import {LngLatBoundsLike, Map as M} from 'maplibre-gl';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {MapMarkers} from '../map-markers';

import 'maplibre-gl/dist/maplibre-gl.css';

export interface MapProps {
  submissions: SubmissionApiPayload[];
}

function Map({submissions}: MapProps) {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    latitude: 43.733399,
    longitude: -79.376221,
    zoom: 12,
  });

  return (
    <MapGL
      ref={mapRef}
      {...viewState}
      attributionControl={false}
      style={{width: '100%', height: '100%'}}
      mapStyle="https://api.thunderforest.com/styles/atlas/style.json?apikey=66ccf6226ef54ef38a6b97fe0b0e5d2e"
      onZoomEnd={e => {
        setViewState(e.viewState);
      }}
      onMoveEnd={e => {
        setViewState(e.viewState);
      }}
    >
      <AttributionControl customAttribution='&copy; Maps <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; Data <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' />
      <GeolocateControl
        trackUserLocation={false}
        onGeolocate={position => {
          setViewState(state => ({
            ...state,
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
          }));

          trackUmamiEvent('locationfound');
        }}
        onError={e => {
          trackUmamiEvent('locationerror', {code: e.code, message: e.message});
        }}
        position="top-left"
      />
      <ScaleControl />
      <MapMarkers submissions={submissions} />
    </MapGL>
  );
}

export {Map};
