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
import type {LineString, Point} from 'geojson';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './parking-map-page.module.scss';
import {MapGeoJSONFeature, QueryRenderedFeaturesOptions} from 'maplibre-gl';
import {ParkingFeatureDescription} from './parking-feature-description/ParkingFeatureDescription';

import parkingSidebarIcon from '@/assets/icons/parking_map/parking_sidebar.png';
import parkingSelectedIcon from '@/assets/icons/parking_map/parking_selected.png';

function getCentroid(feature: MapGeoJSONFeature) {
  if (feature.geometry.type === 'LineString') {
    const geometry = feature.geometry as LineString;
    return geometry.coordinates[0];
    /*
      NOTE: code below provides the centroid of a LineString, but this leads to inconsistent placement between the layer rendering and the manual marker rendering since MapLibre uses the first point instead of the centroid. I tried specifying setting the 'symbol-placement' layout property to 'line-center' for LineStrings but that property apparently doesn't support data expressions, which makes it impossible to specify for a mixed geometry layer of Points and LineStrings.
    */
    // const allLon = geometry.coordinates.map(coords => {
    //   const [lon, lat] = coords;
    //   return lon;
    // });
    // const allLat = geometry.coordinates.map(coords => {
    //   const [lon, lat] = coords;
    //   return lat;
    // });
    // // calculate centroid from average lon, lat
    // const centroid = [
    //   allLon.reduce((partial, l) => partial + l, 0) / allLon.length,
    //   allLat.reduce((partial, l) => partial + l, 0) / allLat.length,
    // ];
    // return centroid;
  }
  if (feature.geometry.type === 'Point') {
    const geometry = feature.geometry as Point;
    return geometry.coordinates;
  }
  throw new Error(
    `Error in getCentroid function: unhandled geometry type ${feature.geometry.type}`
  );
}

export function ParkingMapPage() {
  const mapRef = useRef<MapRef>(null);
  const map = mapRef.current;
  const interactiveLayers = ['bicycle-parking'];

  // zoom and position controls
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

  function zoomAndFlyTo(features: MapGeoJSONFeature[], zoomLevel = 18) {
    if (!map) return;

    // calculate bounds and test camera fit and center
    const allCoords = features.map(f => {
      const [lon, lat] = getCentroid(f);
      return {lon: lon, lat: lat};
    });
    const boundsSW = {
      lon: Math.min(...allCoords.map(coords => coords.lon)),
      lat: Math.min(...allCoords.map(coords => coords.lat)),
    };
    const boundsNE = {
      lon: Math.max(...allCoords.map(coords => coords.lon)),
      lat: Math.max(...allCoords.map(coords => coords.lat)),
    };
    const testCamera = map.cameraForBounds(
      [
        [boundsSW.lon, boundsSW.lat],
        [boundsNE.lon, boundsNE.lat],
      ],
      {padding: {top: 50, right: 10, left: 10, bottom: 10}}
    );

    // zoom in if currently more zoomed out than 15 unless the points don't fit
    zoomLevel = Math.min(
      testCamera?.zoom ?? 0,
      Math.max(zoomLevel, map.getZoom())
    );

    map.flyTo({
      center: testCamera?.center,
      zoom: zoomLevel,
    });
  }

  const [sidebarFeatureList, setSidebarFeatureList] = useState<
    MapGeoJSONFeature[]
  >([]);
  const [mapFeatureList, setMapFeatureList] = useState<MapGeoJSONFeature[]>([]);
  const sidebarFeatureIDs = sidebarFeatureList.map(f => f.id);
  const mapFeatureIDs = mapFeatureList.map(f => f.id);

  function handleLayerClick(e: MapLayerMouseEvent) {
    if (!map) return;
    const features = map.queryRenderedFeatures(
      e.point as PointLike,
      {
        layers: interactiveLayers,
      } as QueryRenderedFeaturesOptions
    );
    setSidebarFeatureList(features);
    setMapFeatureList(features);

    if (features.length > 0) zoomAndFlyTo(features);

    // mask out selected features that are manually rendered
    // (ParkingLayer style uses the 'sidebar' property to set opacity to 100%)
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
  // - also needs a hover state to see which item on the sidebar is the one being selected?
  function handleFeatureDescriptionClick(
    e: React.MouseEvent<HTMLElement>,
    f: MapGeoJSONFeature
  ) {
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
    if (!map) return;
    map.setSprite('/parking_map/parking_sprites');
  }

  // show map pins as interactive when mouse is over them
  function handleMouseHover() {
    if (!map) return;
    for (const layer of interactiveLayers) {
      map.on('mouseenter', layer, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layer, () => {
        map.getCanvas().style.cursor = '';
      });
    }
  }

  function handleOnLoad() {
    addSprite();
    handleMouseHover();
  }

  return (
    <main className={styles.parkingMapPage}>
      <Sidebar>
        <div className={styles.sideBarContainer}>
          {sidebarFeatureList.length > 0
            ? sidebarFeatureList.map(f => (
                <ParkingFeatureDescription
                  selected={
                    mapFeatureIDs.includes(f.id) && mapFeatureIDs.length === 1
                  }
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
        onLoad={handleOnLoad}
        onClick={handleLayerClick}
        ref={mapRef}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
        <BikeLaneLayer />
        <ParkingLayer />
        {sidebarFeatureList.map(feature => {
          const [lon, lat] = getCentroid(feature);
          return (
            <Marker
              key={feature.id}
              latitude={lat}
              longitude={lon}
              anchor="bottom"
              offset={[0, 6]}
              style={{cursor: 'pointer'}}
            >
              <img src={parkingSidebarIcon.src} height={44} />
            </Marker>
          );
        })}
        {mapFeatureList.map(feature => {
          const [lon, lat] = getCentroid(feature);
          return (
            <Marker
              key={feature.id}
              latitude={lat}
              longitude={lon}
              anchor="bottom"
              offset={[0, 6]}
              style={{cursor: 'pointer'}}
            >
              <img src={parkingSelectedIcon.src} height={44} />
            </Marker>
          );
        })}
      </Map>
    </main>
  );
}
