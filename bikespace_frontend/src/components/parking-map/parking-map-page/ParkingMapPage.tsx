'use client';

import React, {useEffect, useState, useRef} from 'react';
import Map, {GeolocateControl, NavigationControl} from 'react-map-gl/maplibre';
import {bbox as getBBox} from '@turf/bbox';
import {featureCollection as getFeatureCollection} from '@turf/helpers';
import maplibregl from 'maplibre-gl';
import {Protocol} from 'pmtiles';
import {layers, namedFlavor} from '@protomaps/basemaps';

import {trackUmamiEvent} from '@/utils';
import GeocoderControl from '@/utils/map-utils/GeocoderControl';

import {Sidebar} from './sidebar/Sidebar';
import {
  ParkingFeatureDescription,
  parkingInteractiveLayers,
  ParkingLayer,
  ParkingLayerLegend,
} from '@/components/map-layers/parking';
import {
  BicycleNetworkLayer,
  BicycleNetworkLayerLegend,
} from '@/components/map-layers/BicycleNetwork';

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
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import styles from './parking-map-page.module.scss';

const parkingSpritePath = '/parking_sprites/parking_sprites';

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

export function ParkingMapPage() {
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

  // manage state of selected features
  const [parkingGroupSelected, setParkingGroupSelected] = useState<
    MapGeoJSONFeature[]
  >([]);
  const [parkingSelected, setParkingSelected] = useState<MapGeoJSONFeature[]>(
    []
  );
  const parkingSelectedIDs = parkingSelected.map(f => f.id);
  const [parkingHovered, setParkingHovered] = useState<MapGeoJSONFeature[]>([]);
  const parkingHoveredIDs = parkingHovered.map(f => f.id);
  const parkingSelectedOrHovered = uniqueBy(
    [...parkingSelected, ...parkingHovered],
    (f: MapGeoJSONFeature) => f.id
  ) as Array<MapGeoJSONFeature>;

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

  function handleLayerClick(e: MapLayerMouseEvent) {
    const features = mapRef.current!.queryRenderedFeatures(
      e.point as PointLike,
      {
        layers: parkingInteractiveLayers,
      } as QueryRenderedFeaturesOptions
    );
    setParkingGroupSelected(features);
    setParkingSelected(features.length === 1 ? features : []);

    if (features.length > 0) {
      trackUmamiEvent('parking-map-feature-click');
      if (sidebarIsOpen) {
        zoomAndFlyTo(features);
      } else {
        setSidebarIsOpen(true);
        mapRef.current!.once('resize', () => zoomAndFlyTo(features));
      }
    }
  }

  function handleFeatureSelection(
    e: React.MouseEvent<HTMLElement>,
    f: MapGeoJSONFeature
  ) {
    if (e.type === 'click') {
      setParkingSelected([f]);
      trackUmamiEvent('parking-map-sidebar-feature-click');
    } else {
      setParkingHovered([f]);
    }
  }

  function handleFeatureHover(
    e: React.MouseEvent<HTMLElement>,
    f: MapGeoJSONFeature
  ) {
    // don't apply hover highlighting on touch devices
    if (navigator.maxTouchPoints === 0) {
      handleFeatureSelection(e, f);
    }
  }

  function handleFeatureUnHover() {
    setParkingHovered([]);
  }

  function addSprite() {
    mapRef.current!.addSprite('parking', parkingSpritePath);
  }

  // show map pins as interactive when mouse is over them
  function handleMouseHover() {
    for (const layer of parkingInteractiveLayers) {
      mapRef.current!.on('mouseenter', layer, () => {
        mapRef.current!.getCanvas().style.cursor = 'pointer';
      });
      mapRef.current!.on('mouseleave', layer, () => {
        mapRef.current!.getCanvas().style.cursor = '';
      });
    }
  }

  function handleOnLoad() {
    // console log required for playwright testing
    if (process.env.NODE_ENV !== 'production') console.log('map loaded');
    addSprite();
    handleMouseHover();
  }

  return (
    <main className={styles.parkingMapPage}>
      <Sidebar isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen}>
        <div className={styles.sideBarContainer}>
          {/* <p>{`Zoom: ${zoomLevel}`}</p> */}
          <details
            className={styles.legend}
            open={!(parkingGroupSelected.length > 0)}
          >
            <summary>Legend</summary>
            <div className={styles.legendContent}>
              <ParkingLayerLegend />
              <BicycleNetworkLayerLegend />
            </div>
          </details>
          {parkingGroupSelected.length > 0 ? (
            parkingGroupSelected.map(f => (
              <ParkingFeatureDescription
                feature={f}
                key={f.id}
                selected={parkingSelectedIDs.includes(f.id)}
                hovered={parkingHoveredIDs.includes(f.id)}
                handleClick={handleFeatureSelection}
                handleHover={handleFeatureHover}
                handleUnHover={handleFeatureUnHover}
              />
            ))
          ) : (
            <p>
              Click on a feature to see more information or zoom in to see more
              details
            </p>
          )}
        </div>
      </Sidebar>
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
        onClick={handleLayerClick}
        // onZoomEnd={() =>
        //   setZoomLevel(Math.round((mapRef.current!.getZoom() ?? 0) * 10) / 10)
        // }
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
        <GeocoderControl position="top-right" />
        <BicycleNetworkLayer />
        <ParkingLayer
          selected={parkingSelectedOrHovered}
          groupSelected={parkingGroupSelected}
        />
      </Map>
    </main>
  );
}
