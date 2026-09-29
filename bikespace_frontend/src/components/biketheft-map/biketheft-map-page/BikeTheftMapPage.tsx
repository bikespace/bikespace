'use client';
import React, {useEffect, useRef, useState} from 'react';
import Map, {GeolocateControl, NavigationControl} from 'react-map-gl/maplibre';
import maplibregl, {type GeoJSONSource} from 'maplibre-gl';
import {layers, namedFlavor} from '@protomaps/basemaps';
import {defaultMapCenter} from '@/utils/map-utils';
import {Sidebar} from '@/components/parking-map/parking-map-page/sidebar/Sidebar';
import {SidebarButton} from '@/components/shared-ui/sidebar-button';
import type {MapLayerMouseEvent, MapRef, MapStyle} from 'react-map-gl/maplibre';
import type {StolenBikeReport} from '@/interfaces/BikeTheftProperties';
import {BikeTheftStatusFilter} from '@/interfaces/BikeTheftProperties';

// Import geojson data for stolen bike reports
import {useBikeTheftDataQuery} from '@/hooks/use-bike-theft-data-query';
import {Protocol} from 'pmtiles';

// BikeTheft map layers and components
import {
  BikeTheftLayer,
  BIKE_THEFT_HIT_LAYER_ID,
  BIKE_THEFT_CLUSTER_LAYER_ID,
  BIKE_THEFT_SOURCE_ID,
} from '@/components/map-layers/bike-theft';
import {BikeTheftReportCard} from './BikeTheftReportCard';
import {BikeTheftGeocoderSearch} from './BikeTheftGeocoderSearch';
import {BikeTheftFiltersPanel} from './BikeTheftFiltersPanel';
import {BikeTheftLegendPanel} from './BikeTheftLegendPanel';

// Show the zoom controls and current location
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './Biketheft-map-page.module.scss';
import parkingStyles from '@/components/parking-map/parking-map-page/parking-map-page.module.scss';

// Mapstyle for backup map tiles when MapTiler API key is not available
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

// Create empty array for stolen bike reports to avoid undefined errors before data is loaded
const EMPTY_REPORTS: StolenBikeReport[] = [];
let pmtilesProtocolAdded = false;

// Function to ensure that the pmtiles protocol is added only once
function ensurePmtilesProtocol() {
  // Check if the pmtiles protocol has already been added to avoid adding it multiple times
  if (pmtilesProtocolAdded) return;
  const protocol = new Protocol();

  // Add the pmtiles protocol to maplibregl
  maplibregl.addProtocol('pmtiles', protocol.tile);

  // Update the flag to indicate that the pmtiles protocol has been added
  pmtilesProtocolAdded = true;
}

// --- Main component ---
export function BikeTheftMapPage() {
  const {
    data: stolenBikeReports = EMPTY_REPORTS,
    isPending,
    isError,
    refetch,
  } = useBikeTheftDataQuery();

  // --- State variables ---
  const [defaultLocation, setDefaultLocation] = useState(defaultMapCenter);
  const [sidebarIsOpen, setSidebarIsOpen] = useState(true);
  const [geoSearchIsMinimized, setGeoSearchIsMinimized] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BikeTheftStatusFilter>(
    BikeTheftStatusFilter.All
  );

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Store multiple select reports
  const [selectedReports, setSelectedReports] = useState<StolenBikeReport[]>(
    []
  );

  // Location filter
  const [locationFilter, setLocationFilter] = useState('Outside'); // Default to "outside" to avoid showing all reports in the city when the map first loads

  useEffect(() => {
    setSelectedReports([]);
    setGeoSearchIsMinimized(false);
  }, [stolenBikeReports, statusFilter, startDate, endDate, locationFilter]);

  const latestReportDate = React.useMemo(
    () =>
      stolenBikeReports.reduce((latest, report) => {
        const date = report.date.slice(0, 10);
        return date > latest ? date : latest;
      }, ''),
    [stolenBikeReports]
  );

  const availableLocations = React.useMemo(() => {
    const locations = new Set(stolenBikeReports.map(r => r.location));
    return Array.from(locations).sort();
  }, [stolenBikeReports]);

  // --- Filter reports based on selected filters ---
  const filteredReports = React.useMemo(() => {
    return stolenBikeReports.filter(r => {
      if (
        statusFilter !== BikeTheftStatusFilter.All &&
        r.status !== statusFilter
      )
        return false;
      const date = r.date.slice(0, 10);
      // Filter by start and end dates if they are set
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      if (locationFilter !== 'all' && r.location !== locationFilter)
        return false;
      return true;
    });
  }, [stolenBikeReports, statusFilter, startDate, endDate, locationFilter]);

  // Map card
  const mapRef = useRef<MapRef>(null);
  const resultsCardRef = useRef<HTMLDivElement>(null);

  const mapStyle = process.env.MAPTILER_API_KEY
    ? `https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.MAPTILER_API_KEY}`
    : backupMapStyle;

  const mapStyleRoadLabelsLayer = process.env.MAPTILER_API_KEY
    ? 'Road labels'
    : 'roads_labels_major';

  // Add pmtiles protocol for backup map tiles when MapTiler API key is not available
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

  // Function to handle map click events and select a report if a pin is clicked
  async function handleMapClick(event: MapLayerMouseEvent) {
    // Clicked on a pin, find the corresponding report(s) and set them as selected
    const features = event.target.queryRenderedFeatures(event.point, {
      layers: [BIKE_THEFT_HIT_LAYER_ID, BIKE_THEFT_CLUSTER_LAYER_ID],
    });

    const cluster = features.find(
      feature => feature.properties?.cluster_id !== undefined
    );
    if (cluster && cluster.geometry.type === 'Point') {
      handleClearSelection();
      const source = event.target.getSource(
        BIKE_THEFT_SOURCE_ID
      ) as GeoJSONSource;
      try {
        const zoom = await source.getClusterExpansionZoom(
          Number(cluster.properties.cluster_id)
        );
        event.target.easeTo({
          center: [
            cluster.geometry.coordinates[0],
            cluster.geometry.coordinates[1],
          ],
          zoom,
        });
      } catch (error) {
        console.warn('Unable to expand bike theft cluster:', error);
      }
      return;
    }

    const clickedIds = new Set(
      features.map(feature => String(feature.properties?.id))
    );

    const reports = filteredReports.filter(report =>
      clickedIds.has(String(report.id))
    );

    setSelectedReports(reports);
    setGeoSearchIsMinimized(reports.length > 0);

    if (reports.length > 0) {
      setSidebarIsOpen(true);
      resultsCardRef.current?.scrollIntoView({behavior: 'smooth'});
    }
  }

  function handleClearSelection() {
    setSelectedReports([]);
    setGeoSearchIsMinimized(false);
  }

  return (
    <main className={styles.bikeTheftMapPage}>
      <Sidebar isOpen={sidebarIsOpen} setIsOpen={setSidebarIsOpen}>
        <div className={parkingStyles.sideBarContainer}>
          {isPending && <p role="status">Loading bike theft reports…</p>}
          {isError && (
            <div role="alert">
              <p>Unable to load bike theft reports.</p>
              <SidebarButton onClick={() => refetch()}>Try again</SidebarButton>
            </div>
          )}
          {/* --- Report detail card --- */}
          <BikeTheftReportCard
            selectedReports={selectedReports}
            cardRef={resultsCardRef}
            onClearSelection={handleClearSelection}
          />

          {/* --- Geocoder search --- */}
          <BikeTheftGeocoderSearch
            mapRef={mapRef}
            isMinimized={geoSearchIsMinimized}
            setIsMinimized={setGeoSearchIsMinimized}
          />

          {/* --- Filters --- */}
          <BikeTheftFiltersPanel
            statusFilter={statusFilter}
            latestReportDate={latestReportDate}
            startDate={startDate}
            endDate={endDate}
            locationFilter={locationFilter}
            availableLocations={availableLocations}
            reportCount={filteredReports.length}
            onStatusChange={setStatusFilter}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onLocationChange={setLocationFilter}
          />

          {/* --- Legend --- */}
          <BikeTheftLegendPanel />
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

        <BikeTheftLayer
          reports={filteredReports}
          selectedReports={selectedReports}
          beforeId={mapStyleRoadLabelsLayer}
        />
      </Map>
    </main>
  );
}
