'use client';

import React, {useEffect, useState, useRef} from 'react';
import Map, {GeolocateControl, NavigationControl} from 'react-map-gl/maplibre';
import {bbox as getBBox} from '@turf/bbox';
import {featureCollection as getFeatureCollection} from '@turf/helpers';
import maplibregl from 'maplibre-gl';
import {Protocol} from 'pmtiles';
import {layers, namedFlavor} from '@protomaps/basemaps';

import {trackUmamiEvent} from '@/utils';

import {Sidebar} from './sidebar/Sidebar';
import {PanoramaxImageryLayer} from '../panoramax/PanoramaxImagery';
import {BicycleNetworkLayer} from '@/components/map-layers/BicycleNetwork';

import type {
  MapGeoJSONFeature,
  QueryRenderedFeaturesOptions,
} from 'maplibre-gl';
import type {
  LngLatLike,
  MapLayerMouseEvent,
  MapRef,
  PointLike,
  MapStyle,
} from 'react-map-gl/maplibre';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './imagery-map-page.module.scss';

const imagerySpritePath = '/imagery_map_sprites/imagery_map_sprites';

const backupMapStyle: MapStyle = {
  version: 8,
  glyphs:
    'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
  sprite: 'https://protomaps.github.io/basemaps-assets/sprites/v4/light',
  sources: {
    protomaps: {
      type: 'vector',
      url: 'pmtiles://backup_map/toronto.pmtiles',
      attribution:
        '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
    },
  },
  layers: layers('protomaps', namedFlavor('light'), {lang: 'en'}),
};

export function uniqueBy(a: Array<Object>, getKey: Function): Array<Object> {
  const seen = new Set();
  return a.filter(item => {
    const k = getKey(item);
    return seen.has(k) ? false : seen.add(k);
  });
}

export function ImageryMapPage() {
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [sidebarIsOpen, setSidebarIsOpen] = useState<boolean>(true);

  const mapRef = useRef<MapRef>(null);

  // enable backup map tiles
  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  // set starting zoom and position
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
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter([
      defaultLocation.longitude,
      defaultLocation.latitude,
    ] as LngLatLike);
    mapRef.current.setZoom(14);
  }, [defaultLocation, mapRef.current]);

  function zoomAndFlyTo(features: MapGeoJSONFeature[], zoomLevel = 18) {
    // calculate bounds and test camera fit and center
    const [minLon, minLat, maxLon, maxLat] = getBBox(
      getFeatureCollection(features)
    );
    const testCamera = mapRef.current!.cameraForBounds(
      [
        [minLon, minLat],
        [maxLon, maxLat],
      ],
      {padding: {top: 50, right: 10, left: 10, bottom: 10}}
    );

    // zoom in if currently more zoomed out than default zoomLevel unless the points don't fit
    zoomLevel = Math.min(
      testCamera?.zoom ?? zoomLevel,
      Math.max(zoomLevel, mapRef.current!.getZoom())
    );

    mapRef.current!.flyTo({
      center: testCamera?.center,
      zoom: zoomLevel,
    });
  }

  function addSprite() {
    mapRef.current!.addSprite('imagery_map', imagerySpritePath);
  }

  function handleOnLoad() {
    addSprite();
    // console log required for playwright testing
    if (process.env.NODE_ENV !== 'production') console.log('map loaded');
  }

  return (
    <main className={styles.imageryMapPage}>
      {/* <Sidebar isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen}>
        <div className={styles.sideBarContainer}>
          <p>{`Zoom: ${zoomLevel}`}</p>
        </div>
      </Sidebar> */}
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
          zoom: zoomLevel,
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle={
          process.env.MAPTILER_API_KEY
            ? `https://api.maptiler.com/maps/streets/style.json?key=${process.env.MAPTILER_API_KEY}`
            : backupMapStyle
        }
        onLoad={handleOnLoad}
        // onClick={handleLayerClick}
        onZoomEnd={() =>
          setZoomLevel(Math.round((mapRef.current!.getZoom() ?? 0) * 10) / 10)
        }
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
        <BicycleNetworkLayer />
        <PanoramaxImageryLayer />
      </Map>
    </main>
  );
}
