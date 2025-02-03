'use client';

import React, {useEffect, useRef, useState} from 'react';
import Map, {
  GeolocateControl,
  MapLayerMouseEvent,
  NavigationControl,
  Popup,
} from 'react-map-gl';
import mapboxgl from 'mapbox-gl';

import {trackUmamiEvent} from '@/utils';

import 'mapbox-gl/dist/mapbox-gl.css';

import type {MapRef} from 'react-map-gl';

interface PopUpDetails {
  lon: number;
  lat: number;
  feature: mapboxgl.MapboxGeoJSONFeature;
}

export default function Page() {
  const mapRef = useRef<MapRef>(null);
  const [popUp, setPopUp] = useState<PopUpDetails | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    map.on('mouseenter', 'bikeparking2-0-existing', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'bikeparking2-0-existing', () => {
      map.getCanvas().style.cursor = '';
    });
  }, [mapRef.current]);

  function handleClick(e: MapLayerMouseEvent) {
    if (!mapRef.current) return;
    const map = mapRef.current;

    trackUmamiEvent('parking-map-feature-click');

    const features = map.queryRenderedFeatures(e.point, {
      layers: ['bikeparking2-0-existing'],
    });
    if (!features.length) {
      setPopUp(null);
      return;
    }

    const feature = features[0];
    if (feature.geometry.type !== 'Point') {
      throw new Error(
        'Clicked bicycle parking feature did not have Point geometry'
      );
    }

    const [lon, lat] = feature.geometry.coordinates;
    setPopUp({
      lon: lon,
      lat: lat,
      feature: feature,
    });
  }

  function generatePopup({lon, lat, feature}: PopUpDetails) {
    let address;
    if (!feature.properties?.ADDRESSNUM || !feature.properties?.ADDRESSSTR) {
      address = 'Bicycle Parking';
    } else {
      address = `${feature.properties.ADDRESSNUM} ${feature.properties.ADDRESSSTR}`;
    }

    return (
      <Popup
        longitude={lon}
        latitude={lat}
        anchor="bottom"
        onClose={() => setPopUp(null)}
      >
        <h3>{address}</h3>
        <p>Type: {feature.properties?.ASSETTYPE ?? 'Unknown'}</p>
        <p>Road Side: {feature.properties?.SIDE ?? 'Unknown'}</p>
        <p>Ward: {feature.properties?.WARD ?? 'Unknown'}</p>
      </Popup>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken="pk.eyJ1Ijoib2otcyIsImEiOiJjamw3OGk2ZGYxMGRpM2txa2pjdnk0cmRrIn0.yGkgnv2YDDnrqDL5MO58Nw"
      initialViewState={{
        longitude: -79.378,
        latitude: 43.658,
        zoom: 13,
      }}
      style={{width: '100%', height: '100%'}}
      mapStyle="mapbox://styles/oj-s/cjn55n32z02il2tqw208pp8dh"
      onClick={handleClick}
    >
      {popUp ? generatePopup(popUp) : null}
      <NavigationControl position="top-left" />
      <GeolocateControl position="top-left" />
    </Map>
  );
}
