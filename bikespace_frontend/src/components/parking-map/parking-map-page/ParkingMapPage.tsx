'use client';

import React, {useEffect, useState} from 'react';
import Map, {
  GeolocateControl,
  MapLayerMouseEvent,
  NavigationControl,
  PointLike,
} from 'react-map-gl/maplibre';
// import {trackUmamiEvent} from '@/utils';

import {Sidebar} from './Sidebar';
import {ParkingLayer} from './ParkingLayer';
import {BikeLaneLayer} from './BikeLaneLayer';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './parking-map-page.module.scss';
import {MapGeoJSONFeature, QueryRenderedFeaturesOptions} from 'maplibre-gl';
import {ParkingFeatureDescription} from './parking-feature-description/ParkingFeatureDescription';

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

  const [featureList, setFeatureList] = useState<MapGeoJSONFeature[]>([]);

  function handleClick(e: MapLayerMouseEvent) {
    const features = e.target.queryRenderedFeatures(
      e.point as PointLike,
      {layers: ['bicycle-parking']} as QueryRenderedFeaturesOptions
    );
    console.log(features);
    setFeatureList(features);
  }

  return (
    <main className={styles.parkingMapPage}>
      <Sidebar>
        <div className={styles.sideBarContainer}>
          {featureList.length > 0
            ? featureList.map(f => <ParkingFeatureDescription feature={f} />)
            : 'Click on a feature to see more information'}
        </div>
      </Sidebar>
      <Map
        initialViewState={{
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
          zoom: 12,
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.MAPTILER_API_KEY}`}
        onClick={handleClick}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
        <BikeLaneLayer />
        <ParkingLayer />
      </Map>
    </main>
  );
}
