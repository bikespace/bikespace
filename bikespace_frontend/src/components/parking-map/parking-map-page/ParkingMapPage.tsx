'use client';

import React, {useEffect, useState, useRef} from 'react';
import Map, {
  GeolocateControl,
  Layer,
  Source,
  NavigationControl,
  // useMap,
} from 'react-map-gl/maplibre';
import type {SymbolLayer} from 'react-map-gl/maplibre';
import {trackUmamiEvent} from '@/utils';

// import {useParkingMapQuery} from '@/hooks';
// import {Sidebar} from '../sidebar';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './parking-map-page.module.scss';
import bollardIcon from '@/assets/icons/bollard.png';
import {Map as MaplibreMap} from 'maplibre-gl';

export function ParkingMapPage() {
  const mapRef = useRef<MaplibreMap>(null);
  const {current: map} = mapRef;

  async function addImage(id: string, src: string) {
    const response = await map?.loadImage(src);
    map?.addImage(id, response!.data);
  }

  const [defaultLocation, setDefaultLocation] = useState({
    latitude: 43.65322,
    longitude: -79.384452,
  });
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setDefaultLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  }, []);

  const bicycleParkingURL =
    'https://raw.githubusercontent.com/tallcoleman/new-parking-map/refs/heads/main/Display%20Files/all_sources.geojson';

  useEffect(() => {
    addImage('bollard', bollardIcon.src);
  }, [map]);
  const parkingLayer: SymbolLayer = {
    id: 'bicycle-parking',
    type: 'symbol',
    source: 'bicycle-parking',
    layout: {
      'icon-image': 'bollard',
      'icon-overlap': 'always',
      'icon-size': 1 / 20,
      'text-field': ['get', 'capacity'],
      'text-size': 12,
      'text-anchor': 'top',
      'text-offset': [0, 1],
      'text-overlap': 'always',
    },
  };

  return (
    <main className={styles.parkingMapPage}>
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
          zoom: 14,
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.MAPTILER_API_KEY}`}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
        <Source id="bicycle-parking" type="geojson" data={bicycleParkingURL}>
          <Layer {...parkingLayer} />
        </Source>
      </Map>
    </main>
  );
}
