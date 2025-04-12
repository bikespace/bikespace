'use client';

import React, {useEffect, useState, useRef, ReactElement} from 'react';
import Map, {
  GeolocateControl,
  MapLayerMouseEvent,
  NavigationControl,
  PointLike,
  Marker,
} from 'react-map-gl/maplibre';
import {StaticImageData} from 'next/image';
// import {trackUmamiEvent} from '@/utils';

import {Sidebar} from './Sidebar';
import {ParkingLayer, publicAccessTypes} from './ParkingLayer';
import {BikeLaneLayer} from './BikeLaneLayer';

import type {LngLatLike, MapRef} from 'react-map-gl/maplibre';
import type {LineString, Point} from 'geojson';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './parking-map-page.module.scss';
import {MapGeoJSONFeature, QueryRenderedFeaturesOptions} from 'maplibre-gl';
import {ParkingFeatureDescription} from './parking-feature-description/ParkingFeatureDescription';

import parkingSpriteImage from '@/public/parking_sprites/parking_sprites@2x.png';
import parkingSpriteJSON from '@/public/parking_sprites/parking_sprites@2x.json';

import networkProtected from '@/assets/icons/parking_map/legend/network_protected_lane.svg';
import networkPainted from '@/assets/icons/parking_map/legend/network_painted_lane.svg';
import networkTrail from '@/assets/icons/parking_map/legend/network_park_multiuse_trail.svg';
import networkUnknown from '@/assets/icons/parking_map/legend/network_unknown_lane.svg';
import networkSharrow from '@/assets/icons/parking_map/legend/network_sharrow_unprotected.svg';

/*
  IMPORTANT NOTE: Several functions take advantage of the fact that state does not update until the next render to make updates to old and new values at the same time. See: https://react.dev/reference/react/useState#storing-information-from-previous-renders
*/

interface spriteProperties {
  height: number;
  pixelRatio: number;
  width: number;
  x: number;
  y: number;
}

function getSpriteImage(
  imageName: string,
  imageScale: number,
  spriteImage: StaticImageData,
  spriteJSON: {[key: string]: spriteProperties}
): ReactElement {
  const properties = spriteJSON[imageName] as spriteProperties;
  return (
    <div
      style={{
        background: `url(${spriteImage.src}) -${
          (properties.x * imageScale) / properties.pixelRatio
        }px -${
          (properties.y * imageScale) / properties.pixelRatio
        }px no-repeat`,
        backgroundSize: `${
          (spriteImage.width * imageScale) / properties.pixelRatio
        }px ${(spriteImage.height * imageScale) / properties.pixelRatio}px`,
        display: 'inline-block',
        height: `${(properties.height * imageScale) / properties.pixelRatio}px`,
        width: `${(properties.width * imageScale) / properties.pixelRatio}px`,
      }}
    ></div>
  );
}

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
      testCamera?.zoom ?? 0,
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
          {selected: true, sidebar: true}
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

  function handleUnHover() {
    setMapFeatureHovered([]);

    for (const old_f of mapFeatureHovered) {
      mapRef.current!.setFeatureState(
        {source: old_f.source, id: old_f.id},
        {selected: false}
      );
    }
  }

  function addSprite() {
    mapRef.current!.setSprite('/parking_sprites/parking_sprites');
  }

  function getBikeParkingSprite(
    imageName: string,
    imageScale: number,
    textOverlay: string,
    textOverlayOptions: {
      'text-size': number;
      'text-anchor': 'top' | 'bottom';
      'text-offset': [number, number];
    }
  ): ReactElement {
    const [w, h] = textOverlayOptions['text-offset'];
    const fontSize = textOverlayOptions['text-size'];
    return (
      <div style={{position: 'relative'}}>
        {getSpriteImage(
          imageName,
          imageScale,
          parkingSpriteImage,
          parkingSpriteJSON
        )}
        <div
          style={{
            position: 'absolute',
            fontSize: fontSize,
            fontFamily: 'Open Sans',
            fontWeight: 'bold',
            ...(textOverlayOptions['text-anchor'] === 'top'
              ? {top: -h * fontSize * 0.9}
              : {bottom: -h * fontSize * 0.9}),
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          {textOverlay}
        </div>
      </div>
    );
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
              <h3>Bicycle Parking</h3>
              <p>Number on icons indicates capacity</p>
              <table className={styles.legendTable}>
                <thead>
                  <tr>
                    <th style={{textAlign: 'center'}}>Icon</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{textAlign: 'center'}}>
                      {getBikeParkingSprite(
                        'parking_unselected',
                        40 / 140,
                        '#',
                        {
                          'text-size': 8,
                          'text-anchor': 'top',
                          'text-offset': [0, -2.6],
                        }
                      )}
                    </td>
                    <td>Public bicycle parking</td>
                  </tr>
                  <tr>
                    <td style={{textAlign: 'center'}}>
                      {getBikeParkingSprite(
                        'private_unselected',
                        40 / 140,
                        '#',
                        {
                          'text-size': 8,
                          'text-anchor': 'top',
                          'text-offset': [0, -2.6],
                        }
                      )}
                    </td>
                    <td>Private bicycle parking</td>
                  </tr>
                </tbody>
              </table>
              <h3>Bicycle Network</h3>
              <table className={styles.legendTable}>
                <thead>
                  <tr>
                    <th style={{textAlign: 'center'}}>Style</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <img src={networkProtected.src} width={44} />
                    </td>
                    <td>Protected bike lane</td>
                  </tr>
                  <tr>
                    <td>
                      <img src={networkPainted.src} width={44} />
                    </td>
                    <td>Painted bike lane</td>
                  </tr>
                  <tr>
                    <td>
                      <img src={networkTrail.src} width={44} />
                    </td>
                    <td>Multi-use or park trail</td>
                  </tr>
                  <tr>
                    <td>
                      <img src={networkSharrow.src} width={44} />
                    </td>
                    <td>Unprotected bike route (e.g. sharrows)</td>
                  </tr>
                  <tr>
                    <td>
                      <img src={networkUnknown.src} width={44} />
                    </td>
                    <td>Unknown bike lane type</td>
                  </tr>
                </tbody>
              </table>
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
                handleHover={handleFeatureSelection}
                handleUnHover={handleUnHover}
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
              {getBikeParkingSprite(
                publicAccessTypes.includes(feature.properties?.access ?? '')
                  ? 'parking_sidebar'
                  : 'private_sidebar',
                44 / 140,
                feature.properties?.capacity &&
                  feature.properties?.capacity !== 2
                  ? feature.properties.capacity
                  : '',
                {
                  'text-size': 8,
                  'text-anchor': 'top',
                  'text-offset': [0, -2.3],
                }
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
              {getBikeParkingSprite(
                publicAccessTypes.includes(feature.properties?.access ?? '')
                  ? 'parking_selected'
                  : 'private_selected',
                44 / 140,
                feature.properties?.capacity &&
                  feature.properties?.capacity !== '2'
                  ? feature.properties.capacity
                  : '',
                {
                  'text-size': 8,
                  'text-anchor': 'top',
                  'text-offset': [0, -2.3],
                }
              )}
            </Marker>
          );
        })}
      </Map>
    </main>
  );
}
