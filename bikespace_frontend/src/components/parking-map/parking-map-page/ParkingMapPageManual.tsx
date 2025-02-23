'use client';

import React, {useEffect, useState, useMemo} from 'react';
import Map, {
  GeolocateControl,
  NavigationControl,
  Marker,
  // useMap,
} from 'react-map-gl/maplibre';
import type {SymbolLayer} from 'react-map-gl/maplibre';
import type {Point} from 'geojson';
import {trackUmamiEvent} from '@/utils';

import {useParkingMapQuery} from '@/hooks';
// import {Sidebar} from '../sidebar';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './parking-map-page.module.scss';
import parkingIcon from '@/assets/icons/parking_map/parking.png';

export function ParkingMapPageManual() {
  const {status, data, error} = useParkingMapQuery();
  useEffect(() => {
    if (status !== 'success') return;
    console.log(data);
  }, [data]);

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

  const parkingMarkers = useMemo(() => {
    if (status !== 'success') return null;
    const markers = data.map((feature, index) => {
      const geometry = feature.geometry as Point;
      const [long, lat] = geometry.coordinates;
      return (
        <Marker key={index} latitude={lat} longitude={long}>
          <img src={parkingIcon.src} height={16} />
        </Marker>
      );
    });
    return markers;
  }, [data]);

  return (
    <main className={styles.parkingMapPage}>
      <Map
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
        {parkingMarkers}
      </Map>
    </main>
  );
}
