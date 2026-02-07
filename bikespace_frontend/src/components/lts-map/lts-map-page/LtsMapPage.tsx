'use client';

import React, {useEffect, useRef, useState} from 'react';
import Map, {Layer, Popup, Source} from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import {Protocol} from 'pmtiles';
import {layers, namedFlavor} from '@protomaps/basemaps';

import {defaultMapCenter, GeocoderSearch} from '@/utils/map-utils';

import {Sidebar} from '@/components/parking-map/parking-map-page/sidebar/Sidebar';
import {
  SidebarDetailsDisclosure,
  SidebarDetailsContent,
} from '@/components/shared-ui/sidebar-details-disclosure';
import {SidebarButton} from '@/components/shared-ui/sidebar-button';

import type {
  LineLayer,
  MapLayerMouseEvent,
  MapRef,
  MapStyle,
} from 'react-map-gl/maplibre';
import type {FilterSpecification, MapGeoJSONFeature} from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './lts-map-page.module.scss';
import parkingStyles from '@/components/parking-map/parking-map-page/parking-map-page.module.scss';

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
    'line-width': {
      type: 'exponential',
      stops: [
        [10, 0.01],
        [16, 3],
      ],
    },
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
  const [sidebarIsOpen, setSidebarIsOpen] = useState(true);
  const [geoSearchIsMinimized, setGeoSearchIsMinimized] = useState(false);
  const [enabledLtsLevels, setEnabledLtsLevels] = useState<number[]>([
    1, 2, 3, 4,
  ]);
  const mapRef = useRef<MapRef>(null);

  const ltsFilter: FilterSpecification =
    enabledLtsLevels.length === 0
      ? ['==', ['get', 'lts'], -1]
      : ['in', ['get', 'lts'], ['literal', enabledLtsLevels]];

  function toggleLtsLevel(level: number) {
    setEnabledLtsLevels(prev => {
      if (prev.includes(level)) {
        return prev.filter(v => v !== level);
      }
      return [...prev, level].sort((a, b) => a - b);
    });
  }

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
      setGeoSearchIsMinimized(true);
    } else {
      setSelectedFeature(null);
      setSelectedLngLat(null);
      setGeoSearchIsMinimized(false);
    }
  }

  return (
    <main className={styles.ltsMapPage}>
      <Sidebar isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen}>
        <div className={parkingStyles.sideBarContainer}>
          <div className={parkingStyles.ContentCard}>
            <div className={parkingStyles.ContentHeading}>
              <h2 className={parkingStyles.cardHeading}>
                Level of Traffic Stress Map (LTS)
              </h2>
            </div>
            <p className={parkingStyles.cardBody}>
              Click a segment to view LTS details.
            </p>
            {selectedFeature ? (
              <SidebarButton
                onClick={() => {
                  setSelectedFeature(null);
                  setSelectedLngLat(null);
                  setGeoSearchIsMinimized(false);
                }}
              >
                Clear Selection
              </SidebarButton>
            ) : null}
          </div>
          <GeocoderSearch
            mapRef={mapRef}
            isMinimized={geoSearchIsMinimized}
            setIsMinimized={setGeoSearchIsMinimized}
            selectResultEvent="lts-map-select-geosearch-result"
            clearSearchEvent="lts-map-clear-geosearch"
            geosearchErrorEvent="lts-map-geosearch-error"
          />

          <SidebarDetailsDisclosure>
            <summary>Filters</summary>
            <SidebarDetailsContent>
              <div className={parkingStyles.ContentCard}>
                <div className={styles.filterButtonRow}>
                  {[1, 2, 3, 4].map(level => {
                    const isActive = enabledLtsLevels.includes(level);
                    return (
                      <SidebarButton
                        key={level}
                        className={isActive ? styles.filterButtonActive : ''}
                        onClick={() => toggleLtsLevel(level)}
                        aria-pressed={isActive}
                      >
                        LTS {level}
                      </SidebarButton>
                    );
                  })}
                </div>
                <div className={styles.filterButtonRow}>
                  <SidebarButton
                    onClick={() => setEnabledLtsLevels([1, 2, 3, 4])}
                  >
                    Show All
                  </SidebarButton>
                  <SidebarButton onClick={() => setEnabledLtsLevels([])}>
                    Clear All
                  </SidebarButton>
                </div>
              </div>
            </SidebarDetailsContent>
          </SidebarDetailsDisclosure>

          <SidebarDetailsDisclosure>
            <summary>Legend</summary>
            <SidebarDetailsContent>
              <div className={parkingStyles.ContentCard}>
                <div className={styles.legendList}>
                  <div className={styles.legendRow}>
                    <span
                      className={styles.legendSwatch}
                      style={{backgroundColor: '#2e7d32'}}
                    />
                    <span className={styles.legendLabel}>LTS 1</span>
                  </div>
                  <div className={styles.legendRow}>
                    <span
                      className={styles.legendSwatch}
                      style={{backgroundColor: '#1e88e5'}}
                    />
                    <span className={styles.legendLabel}>LTS 2</span>
                  </div>
                  <div className={styles.legendRow}>
                    <span
                      className={styles.legendSwatch}
                      style={{backgroundColor: '#fdd835'}}
                    />
                    <span className={styles.legendLabel}>LTS 3</span>
                  </div>
                  <div className={styles.legendRow}>
                    <span
                      className={styles.legendSwatch}
                      style={{backgroundColor: '#e53935'}}
                    />
                    <span className={styles.legendLabel}>LTS 4</span>
                  </div>
                </div>
              </div>
            </SidebarDetailsContent>
          </SidebarDetailsDisclosure>
        </div>
      </Sidebar>
      <Map
        ref={mapRef}
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
          <Layer {...ltsLineLayer} filter={ltsFilter} beforeId="Road labels" />
          <Layer {...ltsHitLayer} filter={ltsFilter} beforeId="Road labels" />
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
