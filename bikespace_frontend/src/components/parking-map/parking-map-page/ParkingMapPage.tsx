'use client';

import React, {useEffect, useState, useRef} from 'react';
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

import type {MapRef} from 'react-map-gl/maplibre';

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
  const mapRef = useRef<MapRef>(null);

  function handleLayerClick(e: MapLayerMouseEvent) {
    const map = e.target;
    const features = map.queryRenderedFeatures(
      e.point as PointLike,
      {layers: ['bicycle-parking']} as QueryRenderedFeaturesOptions
    );
    console.log(features);
    setFeatureList(features);

    if (featureList.length > 0) {
      for (const f of featureList) {
        map.setFeatureState({source: f.source, id: f.id}, {selected: false});
      }
    }
    if (features.length > 0) {
      for (const f of features) {
        map.setFeatureState({source: f.source, id: f.id}, {selected: true});
      }
    }
  }

  // TODOs:
  // - make code more DRY (have another state variable for the "prev" list and do useEffect for the clear/update on render?)
  // - add two levels of feature state: one for selected cluster, one for drill down using sidebar. FeatureState can be any abitrary KV pair.
  function handleFeatureDescriptionClick(
    e: React.MouseEvent<HTMLElement>,
    f: MapGeoJSONFeature
  ) {
    console.log(f);
    const map = mapRef.current;
    if (!map) return;

    setFeatureList([f]);

    if (featureList.length > 0) {
      for (const f of featureList) {
        map.setFeatureState({source: f.source, id: f.id}, {selected: false});
      }
    }
    map.setFeatureState({source: f.source, id: f.id}, {selected: true});
  }

  return (
    <main className={styles.parkingMapPage}>
      <Sidebar>
        <div className={styles.sideBarContainer}>
          {featureList.length > 0
            ? featureList.map(f => (
                <ParkingFeatureDescription
                  feature={f}
                  handleClick={handleFeatureDescriptionClick}
                  key={f.id}
                />
              ))
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
        onClick={handleLayerClick}
        ref={mapRef}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
        <BikeLaneLayer />
        <ParkingLayer />
      </Map>
    </main>
  );
}
