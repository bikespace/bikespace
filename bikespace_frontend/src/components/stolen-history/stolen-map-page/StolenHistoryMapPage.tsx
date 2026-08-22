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
  CircleLayer,
  MapLayerMouseEvent,
  MapRef,
  MapStyle,
} from 'react-map-gl/maplibre';

// Todo: Add Filter, date, location, bike type

// Show the zoom in-out/current locaiton
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './stolen-map-page.module.scss';
import parkingStyles from '@/components/parking-map/parking-map-page/parking-map-page.module.scss';

// --- PMTiles setup ---
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

// --- Stolen bike report type ---
export interface StolenBikeReport {
  id: string;
  date: string; // ISO date string e.g. "2024-03-15"
  location: string; // Human-readable address or area
  bikeType: string; // e.g. "Road bike", "Mountain bike"
  color: string;
  description: string;
  status: 'stolen' | 'recovered';
  latitude: number;
  longitude: number;
}

// Import stolen bike reports from the repo dataset.
import stolenBikeReportsData from '../../../../../datasets/stolen-report/stolen_bike_reports.json';

const stolenBikeReports: StolenBikeReport[] =
  stolenBikeReportsData as StolenBikeReport[];

// --- Map layer for stolen bike pins ---
const stolenPinsLayer: CircleLayer = {
  id: 'stolen-pins',
  type: 'circle',
  source: 'stolen-bikes',
  paint: {
    'circle-radius': {
      type: 'exponential',
      stops: [
        [10, 5],
        [16, 12],
      ],
    },
    'circle-color': [
      'match',
      ['get', 'status'],
      'recovered',
      '#2e7d32',
      '#e53935', // default: stolen
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 0.85,
  },
};

const stolenPinsHitLayer: CircleLayer = {
  id: 'stolen-pins-hit',
  type: 'circle',
  source: 'stolen-bikes',
  paint: {
    'circle-radius': 16,
    'circle-color': '#000000',
    'circle-opacity': 0,
  },
};

const stolenPinsSelectedLayer: CircleLayer = {
  id: 'stolen-pins-selected',
  type: 'circle',
  source: 'stolen-bikes-selected',
  paint: {
    'circle-radius': {
      type: 'exponential',
      stops: [
        [10, 7],
        [16, 16],
      ],
    },
    'circle-color': '#ff6f00',
    'circle-stroke-width': 3,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 0.9,
  },
};

// --- GeoJSON helpers ---
function reportsToGeoJSON(reports: StolenBikeReport[]) {
  return {
    type: 'FeatureCollection' as const,
    features: reports.map(r => ({
      type: 'Feature' as const,
      properties: {
        id: r.id,
        date: r.date,
        location: r.location,
        bikeType: r.bikeType,
        color: r.color,
        description: r.description,
        status: r.status,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [r.longitude, r.latitude],
      },
    })),
  };
}

function reportToSelectedGeoJSON(report: StolenBikeReport) {
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: {id: report.id, status: report.status},
        geometry: {
          type: 'Point' as const,
          coordinates: [report.longitude, report.latitude],
        },
      },
    ],
  };
}

// --- Status badge helper ---
function StatusBadge({status}: {status: StolenBikeReport['status']}) {
  const isRecovered = status === 'recovered';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: isRecovered ? '#e8f5e9' : '#ffebee',
        color: isRecovered ? '#2e7d32' : '#c62828',
        border: `1px solid ${isRecovered ? '#a5d6a7' : '#ef9a9a'}`,
      }}
    >
      {isRecovered ? '✓ Recovered' : '✗ Stolen'}
    </span>
  );
}

// --- Main component ---
export function StolenHistoryMapPage() {
  const [defaultLocation, setDefaultLocation] = useState(defaultMapCenter);
  const [selectedReport, setSelectedReport] = useState<StolenBikeReport | null>(
    null
  );
  const [sidebarIsOpen, setSidebarIsOpen] = useState(true);
  const [geoSearchIsMinimized, setGeoSearchIsMinimized] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'stolen' | 'recovered'
  >('all');

  const mapRef = useRef<MapRef>(null);
  const resultsCardRef = useRef<HTMLDivElement>(null);

  const mapStyle = process.env.MAPTILER_API_KEY
    ? `https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.MAPTILER_API_KEY}`
    : backupMapStyle;

  const mapStyleRoadLabelsLayer = process.env.MAPTILER_API_KEY
    ? 'Road labels'
    : 'roads_labels_major';

  const filteredReports =
    statusFilter === 'all'
      ? stolenBikeReports
      : stolenBikeReports.filter(r => r.status === statusFilter);

  const allPinsGeoJSON = reportsToGeoJSON(filteredReports);
  const selectedPinGeoJSON = selectedReport
    ? reportToSelectedGeoJSON(selectedReport)
    : null;

  useEffect(() => {
    ensurePmtilesProtocol();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      position => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setDefaultLocation(nextLocation);
        mapRef.current?.flyTo({
          center: [nextLocation.longitude, nextLocation.latitude],
          zoom: 12,
          essential: true,
        });
      },
      error => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Geolocation failed:', error.message);
        }
      },
      {enableHighAccuracy: true, timeout: 10000}
    );
  }, []);

  function handleMapClick(event: MapLayerMouseEvent) {
    const features = event.target.queryRenderedFeatures(event.point, {
      layers: ['stolen-pins-hit'],
    });
    if (features.length > 0) {
      const clickedId = features[0].properties?.id;
      const report = stolenBikeReports.find(r => r.id === clickedId) ?? null;
      setSelectedReport(report);
      setGeoSearchIsMinimized(true);
      if (resultsCardRef.current) {
        resultsCardRef.current.scrollIntoView({behavior: 'smooth'});
      }
      setSidebarIsOpen(true);
    } else {
      setSelectedReport(null);
      setGeoSearchIsMinimized(false);
    }
  }

  function handleClearSelection() {
    setSelectedReport(null);
    setGeoSearchIsMinimized(false);
  }

  return (
    <main className={styles.stolenHistoryMapPage}>
      <Sidebar isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen}>
        <div className={parkingStyles.sideBarContainer}>
          {/* --- Report detail card --- */}
          <div className={parkingStyles.ContentCard} ref={resultsCardRef}>
            <div className={parkingStyles.ContentHeading}>
              <h2 className={parkingStyles.cardHeading}>Stolen Bike History</h2>
            </div>

            {selectedReport ? (
              <div className={styles.selectedFeatureDetails}>
                <div style={{marginBottom: 8}}>
                  <StatusBadge status={selectedReport.status} />
                </div>
                <div>
                  <strong>Date:</strong> {selectedReport.date}
                </div>
                <div>
                  <strong>Location:</strong> {selectedReport.location}
                </div>
                <div>
                  <strong>Bike Type:</strong> {selectedReport.bikeType}
                </div>
                <div>
                  <strong>Color:</strong> {selectedReport.color}
                </div>
                <div>
                  <strong>Description:</strong> {selectedReport.description}
                </div>
              </div>
            ) : (
              <p className={parkingStyles.cardBody}>
                Click a pin on the map to view report details.
              </p>
            )}

            {selectedReport ? (
              <SidebarButton onClick={handleClearSelection}>
                Clear Selection
              </SidebarButton>
            ) : null}
          </div>

          {/* --- Geocoder search --- */}
          <GeocoderSearch
            mapRef={mapRef}
            isMinimized={geoSearchIsMinimized}
            setIsMinimized={setGeoSearchIsMinimized}
            selectResultEvent="stolen-map-select-geosearch-result"
            clearSearchEvent="stolen-map-clear-geosearch"
            geosearchErrorEvent="stolen-map-geosearch-error"
          />

          {/* --- Filters --- */}
          <SidebarDetailsDisclosure open>
            <summary>Filters</summary>
            <SidebarDetailsContent>
              <div>
                <p style={{marginBottom: 6, fontWeight: 600}}>Status</p>
                <div className={styles.filterButtonRow}>
                  {(['all', 'stolen', 'recovered'] as const).map(s => (
                    <SidebarButton
                      key={s}
                      className={
                        statusFilter === s ? styles.filterButtonActive : ''
                      }
                      onClick={() => setStatusFilter(s)}
                      aria-pressed={statusFilter === s}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SidebarButton>
                  ))}
                </div>
                <p style={{marginTop: 10}}>
                  Showing <strong>{filteredReports.length}</strong> report
                  {filteredReports.length !== 1 ? 's' : ''}
                </p>
              </div>
            </SidebarDetailsContent>
          </SidebarDetailsDisclosure>

          {/* --- Legend --- */}
          <SidebarDetailsDisclosure open>
            <summary>Legend</summary>
            <SidebarDetailsContent>
              <div className={styles.legendList}>
                <div className={styles.legendRow}>
                  <span
                    className={styles.legendSwatch}
                    style={{backgroundColor: '#e53935', borderRadius: '50%'}}
                    role="img"
                    aria-label="red circle"
                  />
                  <span className={styles.legendLabel}>Stolen</span>
                </div>
                <div className={styles.legendRow}>
                  <span
                    className={styles.legendSwatch}
                    style={{backgroundColor: '#2e7d32', borderRadius: '50%'}}
                    role="img"
                    aria-label="green circle"
                  />
                  <span className={styles.legendLabel}>Recovered</span>
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
        mapStyle={mapStyle}
        onLoad={() => {
          if (process.env.NODE_ENV !== 'production')
            console.log('stolen map loaded');
        }}
        onClick={handleMapClick}
        onError={event => {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Stolen map error', event.error);
          }
        }}
        cursor={undefined}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />

        {/* All report pins */}
        <Source id="stolen-bikes" type="geojson" data={allPinsGeoJSON}>
          <Layer {...stolenPinsLayer} beforeId={mapStyleRoadLabelsLayer} />
          <Layer {...stolenPinsHitLayer} />
        </Source>

        {/* Selected pin highlight */}
        {selectedPinGeoJSON ? (
          <Source
            id="stolen-bikes-selected"
            type="geojson"
            data={selectedPinGeoJSON}
          >
            <Layer
              {...stolenPinsSelectedLayer}
              beforeId={mapStyleRoadLabelsLayer}
            />
          </Source>
        ) : null}
      </Map>
    </main>
  );
}
