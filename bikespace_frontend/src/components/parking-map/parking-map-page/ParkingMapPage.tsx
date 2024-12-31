'use client';

import React, {useEffect, useState} from 'react';
import Map, {Marker, NavigationControl} from 'react-map-gl/maplibre';
// import dynamic from 'next/dynamic';

import {trackUmamiEvent} from '@/utils';

// import {useParkingMapQuery} from '@/hooks';

// import {useSubmissionsStore} from '@/states/store';
// import {useSubmissionId} from '@/states/url-params';

// import {Sidebar} from '../sidebar';
// import {MapProps} from '../map';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './parking-map-page.module.scss';

// const Map = dynamic<MapProps>(() => import('../map/Map'), {
//   loading: () => <></>,
//   ssr: false,
// });

export function ParkingMapPage() {
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
      </Map>
    </main>
  );
}
