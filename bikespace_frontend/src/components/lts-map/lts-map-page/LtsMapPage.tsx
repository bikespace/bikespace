'use client';

import React, {useEffect, useState} from 'react';
import Map, {Layer, Popup, Source} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import {Protocol} from 'pmtiles';
import {layers, namedFlavor} from '@protomaps/basemaps';

import {defaultMapCenter} from '@/utils/map-utils';

import type {
  LineLayer,
  MapLayerMouseEvent,
  MapStyle,
} from 'react-map-gl/maplibre';
import type {MapGeoJSONFeature} from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './lts-map-page.module.scss';

let pmtilesProtocolAdded = false;
function ensurePmtilesProtocol() {
  if (pmtilesProtocolAdded) return;
  const protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile);
  pmtilesProtocolAdded = true;
}

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

const ltsPmtilesUrl =
  'pmtiles://https://pub-04bdbe3e39bc434bb5fae50c14232971.r2.dev/lts_toronto_filtered_1_4.pmtiles';
const ltsSourceLayer = 'lts_toronto_filtered_1_4';

const ltsLineLayer: LineLayer = {
  id: 'lts-lines',
  type: 'line',
  source: 'lts',
  'source-layer': ltsSourceLayer,
  paint: {
    'line-width': 3,
    'line-color': [
      'match',
      ['get', 'lts'],
      1,
      '#2e7d32',
      2,
      '#1e88e5',
      3,
      '#fdd835',
      4,
      '#e53935',
      '#2c3b42',
    ],
  },
};

const ltsHitLayer: LineLayer = {
  id: 'lts-lines-hit',
  type: 'line',
  source: 'lts',
  'source-layer': ltsSourceLayer,
  paint: {
    'line-width': 12,
    'line-color': '#000000',
    'line-opacity': 0,
  },
};

export function LtsMapPage() {
  const [defaultLocation, setDefaultLocation] = useState(defaultMapCenter);
  const [selectedFeature, setSelectedFeature] =
    useState<MapGeoJSONFeature | null>(null);
  const [selectedLngLat, setSelectedLngLat] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  useEffect(() => {
    ensurePmtilesProtocol();
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setDefaultLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  }, []);

  function handleOnLoad() {
    if (process.env.NODE_ENV !== 'production') console.log('lts map loaded');
  }

  function handleMapClick(event: MapLayerMouseEvent) {
    const features = event.target.queryRenderedFeatures(event.point, {
      layers: ['lts-lines-hit'],
    });
    if (features.length > 0) {
      setSelectedFeature(features[0]);
      setSelectedLngLat({lng: event.lngLat.lng, lat: event.lngLat.lat});
    } else {
      setSelectedFeature(null);
      setSelectedLngLat(null);
    }
  }

  return (
    <main className={styles.ltsMapPage}>
      <Map
        mapLib={maplibregl}
        initialViewState={{
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
          zoom: 12,
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle={
          process.env.MAPTILER_API_KEY
            ? `https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.MAPTILER_API_KEY}`
            : backupMapStyle
        }
        onLoad={handleOnLoad}
        onClick={handleMapClick}
        onError={event => {
          if (process.env.NODE_ENV !== 'production') {
            console.error('LTS map error', event.error);
          }
        }}
      >
        <Source id="lts" type="vector" url={ltsPmtilesUrl}>
          <Layer {...ltsLineLayer} beforeId="Road labels" />
          <Layer {...ltsHitLayer} beforeId="Road labels" />
        </Source>
        {selectedFeature && selectedLngLat ? (
          <Popup
            longitude={selectedLngLat.lng}
            latitude={selectedLngLat.lat}
            closeOnClick={false}
            onClose={() => {
              setSelectedFeature(null);
              setSelectedLngLat(null);
            }}
          >
            <div>
              <div>
                <strong>LTS:</strong> {String(selectedFeature.properties?.lts)}
              </div>
              <pre style={{marginTop: 8, maxHeight: 240, overflow: 'auto'}}>
                {JSON.stringify(selectedFeature.properties, null, 2)}
              </pre>
            </div>
          </Popup>
        ) : null}
      </Map>
    </main>
  );
}
