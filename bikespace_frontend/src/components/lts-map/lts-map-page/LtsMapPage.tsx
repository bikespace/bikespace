'use client';

import React, {useEffect, useRef, useState} from 'react';
import Map, {
  GeolocateControl,
  Layer,
  NavigationControl,
  Source,
} from 'react-map-gl/maplibre';
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
  HeatmapLayer,
  LineLayer,
  MapLayerMouseEvent,
  MapRef,
  MapStyle,
} from 'react-map-gl/maplibre';
import type {FilterSpecification, MapGeoJSONFeature} from 'maplibre-gl';

import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './lts-map-page.module.scss';
import parkingStyles from '@/components/parking-map/parking-map-page/parking-map-page.module.scss';

import checkMark from '@/assets/icons/check-black.svg';

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

const ltsPmtilesUrl = `pmtiles://${process.env.DATA_LEVEL_OF_TRAFFIC_STRESS}`;
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

const ltsSelectedLayer: LineLayer = {
  id: 'lts-lines-selected',
  type: 'line',
  source: 'lts-selected',
  paint: {
    'line-width': {
      type: 'exponential',
      stops: [
        [10, 1.5],
        [16, 6],
      ],
    },
    'line-color': '#ff6f00',
  },
};

const fogOfWarFilter: FilterSpecification = [
  'in',
  ['get', 'lts'],
  ['literal', [1]],
];

const ltsFogOfWarLayer: HeatmapLayer = {
  id: 'lts-fog-of-war',
  type: 'heatmap',
  source: 'lts',
  'source-layer': ltsSourceLayer,
  paint: {
    'heatmap-intensity': 10,
    'heatmap-radius': [
      'interpolate',
      ['exponential', 2],
      ['zoom'],
      10,
      1,
      20,
      2048,
    ],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(0,0,0,0.5)',
      1,
      'rgba(0,0,0,0)',
    ],
  },
};

export function LtsMapPage() {
  const [defaultLocation, setDefaultLocation] = useState(defaultMapCenter);
  const [selectedFeature, setSelectedFeature] =
    useState<MapGeoJSONFeature | null>(null);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(true);
  const [geoSearchIsMinimized, setGeoSearchIsMinimized] = useState(false);
  const [enabledLtsLevels, setEnabledLtsLevels] = useState<number[]>([
    1, 2, 3, 4,
  ]);
  const mapRef = useRef<MapRef>(null);
  const resultsCardRef = useRef<HTMLDivElement>(null);

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
      setGeoSearchIsMinimized(true);
      if (resultsCardRef.current) {
        resultsCardRef.current.scrollIntoView();
      }
      setSidebarIsOpen(true);
    } else {
      setSelectedFeature(null);
      setGeoSearchIsMinimized(false);
    }
  }

  const selectedFeatureProperties = selectedFeature?.properties ?? null;
  const selectedFeatureEntries = selectedFeatureProperties
    ? Object.entries(selectedFeatureProperties).filter(([key]) => key !== 'lts')
    : [];
  const selectedFeatureGeoJSON =
    selectedFeature?.geometry === undefined
      ? null
      : {
          type: 'Feature' as const,
          properties: selectedFeature.properties ?? {},
          geometry: selectedFeature.geometry,
        };

  return (
    <main className={styles.ltsMapPage}>
      <Sidebar isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen}>
        <div className={parkingStyles.sideBarContainer}>
          <div className={parkingStyles.ContentCard} ref={resultsCardRef}>
            <div className={parkingStyles.ContentHeading}>
              <h2 className={parkingStyles.cardHeading}>
                Level of Traffic Stress Map (LTS)
              </h2>
            </div>
            <p className={parkingStyles.cardBody}>
              Click a segment to view LTS details.
            </p>
            {selectedFeatureProperties ? (
              <div className={styles.selectedFeatureDetails}>
                <div>
                  <strong>LTS:</strong>{' '}
                  {String(selectedFeatureProperties.lts ?? 'N/A')}
                </div>
                <div key="selected-feature-name">
                  <strong>Name:</strong>{' '}
                  {String(selectedFeatureProperties.name)}
                </div>
                <div key="selected-feature-num-of-lanes">
                  <strong>Num of lanes:</strong>{' '}
                  {String(selectedFeatureProperties.lanes)}
                </div>
                <div key="selected-feature-max-speed">
                  <strong>Max Speed (km/h):</strong>{' '}
                  {String(selectedFeatureProperties.maxspeed)}
                </div>
                <div key="selected-feature-road-type">
                  <strong>Road type:</strong>{' '}
                  {String(selectedFeatureProperties.highway)}
                </div>
                <div key="selected-feature-lts-reasoning">
                  <strong>LTS reason:</strong>{' '}
                  {String(selectedFeatureProperties.message)}
                </div>
              </div>
            ) : (
              <p className={parkingStyles.cardBody}>No segment selected yet.</p>
            )}
            {selectedFeature ? (
              <SidebarButton
                onClick={() => {
                  setSelectedFeature(null);
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

          <SidebarDetailsDisclosure open>
            <summary>Filters</summary>
            <SidebarDetailsContent>
              <div>
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
                <div className={styles.filterButtonRow}>
                  {[1, 2, 3, 4].map(level => {
                    const isActive = enabledLtsLevels.includes(level);
                    return (
                      <SidebarButton
                        key={level}
                        className={isActive ? styles.filterButtonActive : ''}
                        onClick={() => toggleLtsLevel(level)}
                        aria-pressed={isActive}
                        style={{
                          paddingLeft: isActive ? 0 : 18,
                          paddingRight: 9,
                        }}
                      >
                        {isActive ? (
                          <img src={checkMark.src} alt="" width={18} />
                        ) : null}
                        LTS {level}
                      </SidebarButton>
                    );
                  })}
                </div>
              </div>
            </SidebarDetailsContent>
          </SidebarDetailsDisclosure>

          <SidebarDetailsDisclosure open>
            <summary>Legend</summary>
            <SidebarDetailsContent>
              <div>
                <div className={styles.legendList}>
                  <div className={styles.legendRow}>
                    <span
                      className={styles.legendSwatch}
                      style={{backgroundColor: '#2e7d32'}}
                      role="img"
                      aria-label="green"
                    />
                    <span className={styles.legendLabel}>LTS 1: Very Safe</span>
                  </div>
                  <div className={styles.legendRow}>
                    <span
                      className={styles.legendSwatch}
                      style={{backgroundColor: '#1e88e5'}}
                      role="img"
                      aria-label="blue"
                    />
                    <span className={styles.legendLabel}>
                      LTS 2: Mostly Safe
                    </span>
                  </div>
                  <div className={styles.legendRow}>
                    <span
                      className={styles.legendSwatch}
                      style={{backgroundColor: '#fdd835'}}
                      role="img"
                      aria-label="yellow"
                    />
                    <span className={styles.legendLabel}>
                      LTS 3: Somewhat Hazardous
                    </span>
                  </div>
                  <div className={styles.legendRow}>
                    <span
                      className={styles.legendSwatch}
                      style={{backgroundColor: '#e53935'}}
                      role="img"
                      aria-label="red"
                    />
                    <span className={styles.legendLabel}>
                      LTS 4: Very Hazardous
                    </span>
                  </div>
                </div>
              </div>
            </SidebarDetailsContent>
          </SidebarDetailsDisclosure>
          <SidebarDetailsDisclosure>
            <summary>How is LTS calculated</summary>
            <SidebarDetailsContent>
              <div>
                <p>
                  <strong>Level of Traffic Stress (LTS)</strong> is a rating
                  given to a road segment or crossing indicating the traffic
                  stress it imposes on bicyclists. Levels of traffic stress
                  range from 1 to 4 as follows:
                  <a href="#lts-source-1" className={styles.citationRef}>
                    [1]
                  </a>
                </p>
                <ul className={styles.ltsDescriptionList}>
                  <li>
                    <strong>LTS 1: </strong>Strong separation from all except
                    low speed, low volume traffic. Simple crossings. Suitable
                    for children.
                  </li>
                  <li>
                    <strong>LTS 2: </strong>Except in low speed / low volume
                    traffic situations, cyclists have their own place to ride
                    that that keeps them from having to interact with traffic
                    except at formal crossings. Physical separation from higher
                    speed and multilane traffic. Crossings that are adult to
                    negotiate. Corresponds to design criteria for Dutch bicycle
                    route facilities. A level of traffic stress that most adults
                    can tolerate, particularly those sometimes classified as
                    "interested but concerned".
                    <a href="#lts-source-2" className={styles.citationRef}>
                      [2]
                    </a>
                  </li>
                  <li>
                    <strong>LTS 3: </strong>
                    Involves interaction with moderate speed or multilane
                    traffic, or close proximity to higher speed traffic. A level
                    of traffic stress acceptable to those classified as
                    "enthused and confident."
                    <a href="#lts-source-2" className={styles.citationRef}>
                      [2]
                    </a>
                  </li>
                  <li>
                    <strong>LTS 4: </strong>Involves interaction with higher
                    speed traffic or close proximity to high speed traffic. A
                    level of stress acceptable only to those classified as
                    "strong and fearless."
                    <a href="#lts-source-2" className={styles.citationRef}>
                      [2]
                    </a>
                  </li>
                </ul>
                <p className={styles.ltsTextBlock}>
                  Source code used to generate the LTS data on this map:{' '}
                  <a
                    className={styles.blueLink}
                    href="https://github.com/bikespace/LTS-OSM"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub: bikespace/LTS-OSM
                  </a>
                  .
                  <a href="#lts-source-3" className={styles.citationRef}>
                    [3]
                  </a>
                </p>
                <p className={styles.ltsTextBlock}>
                  The code is a fork of Madeliene Bonsma-Fisher's implementation
                  of calculating LTS from OSM data
                  <a href="#lts-source-4" className={styles.citationRef}>
                    [4]
                  </a>
                  , which is itself adapted from Bike Ottawa's LTS code.
                  <a href="#lts-source-5" className={styles.citationRef}>
                    [5]
                  </a>
                </p>

                <div className={styles.citation}>
                  <h4>Sources</h4>
                  <ol className={styles.sourceList}>
                    <li id="lts-source-1">
                      Peter G. Furth,{' '}
                      <a
                        href="https://peterfurth.sites.northeastern.edu/level-of-traffic-stress/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Level of Traffic Stress
                      </a>{' '}
                      (Northeastern University)
                    </li>
                    <li id="lts-source-2">
                      Dill, J., & McNeil, N. (2013). Four types of cyclists?
                      Examining a typology to better understand bicycling
                      behavior and potential. Transportation Research Board 92nd
                      Annual Meeting.
                      <a
                        href="https://www1.coe.neu.edu/~pfurth/Other%20papers/Dill%202013%204%20types%20of%20cyclists%20TRR.pdf"
                        target="_blank"
                        rel="noreferrer"
                      >
                        https://www1.coe.neu.edu/~pfurth/Other%20papers/Dill%202013%204%20types%20of%20cyclists%20TRR.pdf
                      </a>
                    </li>
                    <li id="lts-source-3">
                      bikespace. (n.d.). LTS-OSM [Computer software]. GitHub.
                      <a
                        href="https://github.com/bikespace/LTS-OSM"
                        target="_blank"
                        rel="noreferrer"
                      >
                        https://github.com/bikespace/LTS-OSM
                      </a>
                    </li>
                    <li id="lts-source-4">
                      Bonsma, M. (n.d.). LTS-OSM (Version latest) [Computer
                      software]. GitHub.
                      <a
                        href="https://github.com/mbonsma/LTS-OSM"
                        target="_blank"
                        rel="noreferrer"
                      >
                        https://github.com/mbonsma/LTS-OSM
                      </a>
                    </li>
                    <li id="lts-source-5">
                      BikeOttawa. (n.d.). stressmodel [Computer software].
                      GitHub.
                      <a
                        href="https://github.com/BikeOttawa/stressmodel"
                        target="_blank"
                        rel="noreferrer"
                      >
                        https://github.com/BikeOttawa/stressmodel
                      </a>
                    </li>
                  </ol>
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
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
        <Source id="lts" type="vector" url={ltsPmtilesUrl}>
          <Layer {...ltsLineLayer} filter={ltsFilter} beforeId="Road labels" />
          <Layer {...ltsHitLayer} filter={ltsFilter} beforeId="Road labels" />
          <Layer {...ltsFogOfWarLayer} filter={fogOfWarFilter} />
        </Source>
        {selectedFeatureGeoJSON ? (
          <Source
            id="lts-selected"
            type="geojson"
            data={selectedFeatureGeoJSON}
          >
            <Layer {...ltsSelectedLayer} beforeId="Road labels" />
          </Source>
        ) : null}
      </Map>
    </main>
  );
}
