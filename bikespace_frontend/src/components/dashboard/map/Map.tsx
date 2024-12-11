import React, {useState, useRef} from 'react';
import MapGL, {
  GeolocateControl,
  AttributionControl,
  ScaleControl,
} from 'react-map-gl/maplibre';
import {BBox} from 'geojson';

import {SubmissionApiPayload} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {MapMarkers} from '../map-markers';

import 'maplibre-gl/dist/maplibre-gl.css';
export interface MapProps {
  submissions: SubmissionApiPayload[];
}

export interface Viewport {
  zoom: number;
  bounds: BBox | undefined;
  longitude: number;
  latitude: number;
}

function Map({submissions}: MapProps) {
  const mapRef = useRef(null);

  const [viewport, setViewport] = useState<Viewport>({
    latitude: 43.733399,
    longitude: -79.376221,
    zoom: 12,
    bounds: undefined,
  });

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        latitude: viewport.latitude,
        longitude: viewport.longitude,
        zoom: viewport.zoom,
      }}
      attributionControl={false}
      style={{width: '100%', height: '100%'}}
      mapStyle="https://api.thunderforest.com/styles/atlas/style.json?apikey=66ccf6226ef54ef38a6b97fe0b0e5d2e"
      onZoomEnd={e => {
        setViewport(state => ({...state, zoom: e.viewState.zoom}));
      }}
      onMoveEnd={e => {
        setViewport(state => ({
          ...state,
          latitude: e.viewState.latitude,
          longitude: e.viewState.longitude,
          bounds: e.target.getBounds().toArray().flat() as BBox,
        }));
      }}
      onLoad={e => {
        setViewport(state => ({
          ...state,
          bounds: e.target.getBounds().toArray().flat() as BBox,
        }));
      }}
    >
      <AttributionControl customAttribution='&copy; Maps <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; Data <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' />
      <GeolocateControl
        trackUserLocation={false}
        onGeolocate={position => {
          setViewport(state => ({
            ...state,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));

          trackUmamiEvent('locationfound');
        }}
        onError={e => {
          trackUmamiEvent('locationerror', {code: e.code, message: e.message});
        }}
        position="top-left"
      />
      <ScaleControl />
      {viewport.bounds && (
        <MapMarkers submissions={submissions} viewport={viewport} />
      )}
    </MapGL>
  );
}

export default Map;
export {Map};
