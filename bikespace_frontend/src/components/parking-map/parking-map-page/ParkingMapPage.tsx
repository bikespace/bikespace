'use client';

import React, {useEffect, useState, useRef} from 'react';
import Map, {
  GeolocateControl,
  MapLayerMouseEvent,
  NavigationControl,
  PointLike,
  Marker,
} from 'react-map-gl/maplibre';
// import {trackUmamiEvent} from '@/utils';

import {Sidebar} from './Sidebar';
import {ParkingLayer} from './ParkingLayer';
import {BikeLaneLayer} from './BikeLaneLayer';

import type {MapRef} from 'react-map-gl/maplibre';
import type {Point} from 'geojson';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './parking-map-page.module.scss';
import {MapGeoJSONFeature, QueryRenderedFeaturesOptions} from 'maplibre-gl';
import {ParkingFeatureDescription} from './parking-feature-description/ParkingFeatureDescription';

import parkingSidebarIcon from '@/assets/icons/parking_map/parking_sidebar.png';
import parkingSelectedIcon from '@/assets/icons/parking_map/parking_selected.png';

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

  const [sidebarFeatureList, setSidebarFeatureList] = useState<
    MapGeoJSONFeature[]
  >([]);
  const [mapFeatureList, setMapFeatureList] = useState<MapGeoJSONFeature[]>([]);
  const sidebarFeatureIDs = sidebarFeatureList.map(f => f.id);
  const mapFeatureIDs = mapFeatureList.map(f => f.id);
  const mapRef = useRef<MapRef>(null);

  function handleLayerClick(e: MapLayerMouseEvent) {
    const map = e.target;
    const features = map.queryRenderedFeatures(
      e.point as PointLike,
      {
        layers: ['bicycle-parking'],
      } as QueryRenderedFeaturesOptions
    );
    setSidebarFeatureList(features);
    setMapFeatureList(features);
    console.log(features);

    if (sidebarFeatureList.length > 0) {
      for (const f of sidebarFeatureList) {
        map.setFeatureState(
          {source: f.source, id: f.id},
          {selected: false, sidebar: false}
        );
      }
    }
    if (features.length > 0) {
      for (const f of features) {
        map.setFeatureState(
          {source: f.source, id: f.id},
          {selected: true, sidebar: true}
        );
      }
    }
  }

  // TODOs:
  // - document decision on dealing with past state in the handler vs prev state. See: https://react.dev/reference/react/useState#storing-information-from-previous-renders
  // - improve map render for two levels of feature state: one for selected cluster, one for drill down using sidebar. FeatureState can be any abitrary KV pair.
  // - also needs a flyto
  // - also needs a hover state to see which item on the sidebar is the one being selected?
  function handleFeatureDescriptionClick(
    e: React.MouseEvent<HTMLElement>,
    f: MapGeoJSONFeature
  ) {
    const map = mapRef.current;
    if (!map) return;

    setMapFeatureList([f]);

    if (sidebarFeatureList.length > 0) {
      for (const f of sidebarFeatureList) {
        map.setFeatureState({source: f.source, id: f.id}, {selected: false});
      }
    }
    map.setFeatureState({source: f.source, id: f.id}, {selected: true});
  }

  function addSprite() {
    const map = mapRef.current;
    if (!map) return;

    map?.setSprite('/parking_map/parking_sprites');
  }

  return (
    <main className={styles.parkingMapPage}>
      <Sidebar>
        <div className={styles.sideBarContainer}>
          {sidebarFeatureList.length > 0
            ? sidebarFeatureList.map(f => (
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
        onLoad={addSprite}
        onClick={handleLayerClick}
        ref={mapRef}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
        <BikeLaneLayer />
        <ParkingLayer />
        {sidebarFeatureList.map(feature => {
          const geometry = feature.geometry as Point;
          const [long, lat] = geometry.coordinates;
          return (
            <Marker
              key={feature.id}
              latitude={lat}
              longitude={long}
              anchor="bottom"
              offset={[0, 6]}
            >
              <img src={parkingSidebarIcon.src} height={42} />
            </Marker>
          );
        })}
        {mapFeatureList.map(feature => {
          const geometry = feature.geometry as Point;
          const [long, lat] = geometry.coordinates;
          return (
            <Marker
              key={feature.id}
              latitude={lat}
              longitude={long}
              anchor="bottom"
              offset={[0, 6]}
            >
              <img src={parkingSelectedIcon.src} height={42} />
            </Marker>
          );
        })}
      </Map>
    </main>
  );
}
