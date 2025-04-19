'use client';

import React, {useEffect, useState, useRef, ReactElement} from 'react';
import Map, {
  GeolocateControl,
  LngLatLike,
  MapLayerMouseEvent,
  MapRef,
  Marker,
  NavigationControl,
  PointLike,
} from 'react-map-gl/maplibre';
import {MapGeoJSONFeature, QueryRenderedFeaturesOptions} from 'maplibre-gl';

import {trackUmamiEvent} from '@/utils';
import {
  getCentroid,
  getSpriteImageWithTextOverlay,
  layoutOptions,
} from '@/utils/mapUtils';

import {Sidebar} from './Sidebar';
import {
  ParkingLayer,
  ParkingLayerLegend,
  publicAccessTypes,
} from './ParkingLayer';
import {BikeLaneLayer, BikeLaneLayerLegend} from './BikeLaneLayer';
import {ParkingFeatureDescription} from './parking-feature-description/ParkingFeatureDescription';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './parking-map-page.module.scss';

const parkingSpritePath = '/parking_sprites/parking_sprites';
import parkingSpriteImage from '@/public/parking_sprites/parking_sprites@2x.png';
import parkingSpriteJSON from '@/public/parking_sprites/parking_sprites@2x.json';

/*
  IMPORTANT NOTE: Several functions take advantage of the fact that state does not update until the next render to make updates to old and new values at the same time. See: https://react.dev/reference/react/useState#storing-information-from-previous-renders
*/

function uniqueBy(a: Array<Object>, getKey: Function): Array<Object> {
  const seen = new Set();
  return a.filter(item => {
    const k = getKey(item);
    return seen.has(k) ? false : seen.add(k);
  });
}

export function ParkingMapPage() {
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const mapRef = useRef<MapRef>(null);
  const interactiveLayers = ['bicycle-parking'];

  // manage state of selected features
  const [sidebarFeatureList, setSidebarFeatureList] = useState<
    MapGeoJSONFeature[]
  >([]);
  const [mapFeatureList, setMapFeatureList] = useState<MapGeoJSONFeature[]>([]);
  const mapFeatureIDs = mapFeatureList.map(f => f.id);
  const [mapFeatureHovered, setMapFeatureHovered] = useState<
    MapGeoJSONFeature[]
  >([]);
  const mapFeatureHoveredIDs = mapFeatureHovered.map(f => f.id);
  const mapFeatureSelectedOrHovered = uniqueBy(
    [...mapFeatureList, ...mapFeatureHovered],
    (f: MapGeoJSONFeature) => f.id
  ) as Array<MapGeoJSONFeature>;

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
    const testCamera = mapRef.current!.cameraForBounds(
      [
        [boundsSW.lon, boundsSW.lat],
        [boundsNE.lon, boundsNE.lat],
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
        layers: interactiveLayers,
      } as QueryRenderedFeaturesOptions
    );
    setSidebarFeatureList(features);
    setMapFeatureList(features.length === 1 ? features : []);

    if (features.length > 0) {
      trackUmamiEvent('parking-map-feature-click');
      if (isOpen) {
        zoomAndFlyTo(features);
      } else {
        setIsOpen(true);
        mapRef.current!.once('resize', () => zoomAndFlyTo(features));
      }
    }

    // Update opacity of features that will be / were 'manually' rendered
    // (ParkingLayer style uses the 'sidebar' custom property to set opacity to 100%)
    if (sidebarFeatureList.length > 0) {
      for (const old_f of sidebarFeatureList) {
        mapRef.current!.setFeatureState(
          {source: old_f.source, id: old_f.id},
          {selected: false, sidebar: false}
        );
      }
    }
    if (features.length > 0) {
      for (const f of features) {
        mapRef.current!.setFeatureState(
          {source: f.source, id: f.id},
          {selected: features.length === 1, sidebar: true}
        );
      }
    }
  }

  function handleFeatureSelection(
    e: React.MouseEvent<HTMLElement>,
    f: MapGeoJSONFeature
  ) {
    if (e.type === 'click') {
      setMapFeatureList([f]);
      trackUmamiEvent('parking-map-sidebar-feature-click');
    } else {
      setMapFeatureHovered([f]);
    }

    // update map pin formatting
    for (const old_f of mapFeatureSelectedOrHovered) {
      mapRef.current!.setFeatureState(
        {source: old_f.source, id: old_f.id},
        {selected: false}
      );
    }
    mapRef.current!.setFeatureState(
      {source: f.source, id: f.id},
      {selected: true}
    );
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
    setMapFeatureHovered([]);

    for (const old_f of mapFeatureHovered) {
      mapRef.current!.setFeatureState(
        {source: old_f.source, id: old_f.id},
        {selected: false}
      );
    }
  }

  function addSprite() {
    mapRef.current!.setSprite(parkingSpritePath);
  }

  // show map pins as interactive when mouse is over them
  function handleMouseHover() {
    for (const layer of interactiveLayers) {
      mapRef.current!.on('mouseenter', layer, () => {
        mapRef.current!.getCanvas().style.cursor = 'pointer';
      });
      mapRef.current!.on('mouseleave', layer, () => {
        mapRef.current!.getCanvas().style.cursor = '';
      });
    }
  }

  function handleOnLoad() {
    addSprite();
    handleMouseHover();
  }

  const selectedMarkerLayoutProperties: Partial<layoutOptions> = {
    'icon-size': 44 / 140,
    'text-size': 8,
    'text-anchor': 'top',
    'text-offset': [0, -2.3],
    'text-font': ['Open Sans Bold'],
  };

  return (
    <main className={styles.parkingMapPage}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className={styles.sideBarContainer}>
          {/* <p>{`Zoom: ${zoomLevel}`}</p> */}
          <details
            className={styles.legend}
            open={!(sidebarFeatureList.length > 0)}
          >
            <summary>Legend</summary>
            <div className={styles.legendContent}>
              <ParkingLayerLegend />
              <BikeLaneLayerLegend />
            </div>
          </details>
          {sidebarFeatureList.length > 0 ? (
            sidebarFeatureList.map(f => (
              <ParkingFeatureDescription
                selected={
                  mapFeatureIDs.includes(f.id) && mapFeatureIDs.length === 1
                }
                hovered={
                  mapFeatureHoveredIDs.includes(f.id) &&
                  mapFeatureHoveredIDs.length === 1
                }
                feature={f}
                handleClick={handleFeatureSelection}
                handleHover={handleFeatureHover}
                handleUnHover={handleFeatureUnHover}
                key={f.id}
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
        initialViewState={{
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
          zoom: 12,
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.MAPTILER_API_KEY}`}
        onLoad={handleOnLoad}
        onClick={handleLayerClick}
        onZoomEnd={() =>
          setZoomLevel(Math.round((mapRef.current!.getZoom() ?? 0) * 10) / 10)
        }
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
              {getSpriteImageWithTextOverlay(
                parkingSpriteImage,
                parkingSpriteJSON,
                {
                  'icon-image': publicAccessTypes.includes(
                    feature.properties?.access ?? ''
                  )
                    ? 'parking_sidebar'
                    : 'private_sidebar',
                  'text-field':
                    feature.properties?.capacity &&
                    feature.properties?.capacity !== '2'
                      ? feature.properties.capacity
                      : '',
                  ...selectedMarkerLayoutProperties,
                } as layoutOptions
              )}
            </Marker>
          );
        })}
        {mapFeatureSelectedOrHovered.map(feature => {
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
              {getSpriteImageWithTextOverlay(
                parkingSpriteImage,
                parkingSpriteJSON,
                {
                  'icon-image': publicAccessTypes.includes(
                    feature.properties?.access ?? ''
                  )
                    ? 'parking_selected'
                    : 'private_selected',
                  'text-field':
                    feature.properties?.capacity &&
                    feature.properties?.capacity !== '2'
                      ? feature.properties.capacity
                      : '',
                  ...selectedMarkerLayoutProperties,
                } as layoutOptions
              )}
            </Marker>
          );
        })}
      </Map>
    </main>
  );
}
