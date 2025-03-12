import {useState, useRef} from 'react';
import {
  Map,
  ViewState,
  MapRef,
  AttributionControl,
  GeolocateControl,
  ScaleControl,
  Source,
  Layer,
} from 'react-map-gl/maplibre';

import {SubmissionFeature} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {clusterLayer, clusterCountLayer, unclusteredPointLayer} from './layers';

import 'maplibre-gl/dist/maplibre-gl.css';

export interface DashboardMapProps {
  submissions: SubmissionFeature[];
}

export function DashboardMap({submissions}: DashboardMapProps) {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    latitude: 43.733399,
    longitude: -79.376221,
    zoom: 12,
  });

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        latitude: 43.733399,
        longitude: -79.376221,
        zoom: 12,
      }}
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
          // setViewState(state => ({
          //   ...state,
          //   longitude: position.coords.longitude,
          //   latitude: position.coords.latitude,
          // }));

          trackUmamiEvent('locationfound');
        }}
        onError={e => {
          trackUmamiEvent('locationerror', {code: e.code, message: e.message});
        }}
        position="top-left"
        showUserLocation={false}
      />
      <ScaleControl />
      <Source
        id="submissions"
        type="geojson"
        data={{
          type: 'FeatureCollection',
          features: submissions,
        }}
        cluster={true}
        clusterMaxZoom={16}
        clusterRadius={50}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredPointLayer} />
      </Source>
    </Map>
  );
}
