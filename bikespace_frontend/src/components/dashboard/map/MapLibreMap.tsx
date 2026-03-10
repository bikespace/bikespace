import React, {useEffect, useState, useRef} from 'react';
import Map, {
  GeolocateControl,
  NavigationControl,
  Source,
  Layer,
} from 'react-map-gl/maplibre';
import {bbox as getBBox} from '@turf/bbox';
import {featureCollection as getFeatureCollection} from '@turf/helpers';
import maplibregl from 'maplibre-gl';
import type {Map as MapLibreMap} from 'maplibre-gl';
import {Protocol} from 'pmtiles';
import {layers, namedFlavor} from '@protomaps/basemaps';

import {useStore} from '@/states/store';
import {SidebarTab, useSidebarTab, useSubmissionId} from '@/states/url-params';
import {useIsMobile} from '@/hooks/use-is-mobile';

import {trackUmamiEvent} from '@/utils';
import {
  defaultMapCenter,
  GeocoderSearch,
  getGeoJSONFromSubmissions,
} from '@/utils/map-utils';
import {SubmissionApiPayload} from '@/interfaces/Submission';

import {Spinner} from '@/components/shared-ui/spinner';
import {
  BicycleNetworkLayer,
  BicycleNetworkLayerLegend,
} from '@/components/map-layers/BicycleNetwork';

import {unclusteredSubmissionsLayer} from './_MapLayers';

import type {
  FilterSpecification,
  MapGeoJSONFeature,
  QueryRenderedFeaturesOptions,
} from 'maplibre-gl';
import type {
  MapLayerMouseEvent,
  MapRef,
  PointLike,
  MapStyle,
} from 'react-map-gl/maplibre';

import 'maplibre-gl/dist/maplibre-gl.css';

const submissionSpritePath = '/submission_sprites/submission_sprites';

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

export interface DashboardMapProps {
  submissions: SubmissionApiPayload[];
  isFirstMarkerDataLoading: boolean;
}

export function DashboardMap({
  submissions,
  isFirstMarkerDataLoading,
}: DashboardMapProps) {
  const mapRef = useRef<MapRef>(null);
  const isMobile = useIsMobile();

  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(true);
  const [selectedSubmissionId, setSelectedSubmissionId] = useSubmissionId();
  const [, setSidebarTab] = useSidebarTab();
  const {setIsSidebarOpen} = useStore(state => ({
    setIsSidebarOpen: state.ui.sidebar.setIsOpen,
  }));

  // enable backup map tiles
  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => {
      maplibregl.removeProtocol('pmtiles');
    };
  }, []);

  // set starting zoom and position
  const [defaultLocation, setDefaultLocation] = useState(defaultMapCenter);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      setDefaultLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  }, []);

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
    mapRef.current!.addSprite('submission', submissionSpritePath);
  }

  function handleOnLoad() {
    // console log required for playwright testing
    if (process.env.NODE_ENV !== 'production') console.log('map loaded');
    addSprite();

    // after styles load
    const map: MapLibreMap = mapRef.current!.getMap(); // maplibre-gl map instance
    map?.once('idle', () => setIsMapLoading(false)); // wait for styles to load, then set loading to false
  }

  return (
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
    >
      <NavigationControl position="top-left" />
      <GeolocateControl position="top-left" />
      <Source
        id="bikeparking-submissions"
        type="geojson"
        data={getGeoJSONFromSubmissions(submissions)}
        // cluster={true}
        // clusterMaxZoom={14}
        // clusterRadius={50}
      >
        <Layer {...unclusteredSubmissionsLayer} />
      </Source>
      {/* placed here to avoid covering the sidebar */}
      {/* <Spinner show={isMapLoading} overlay label="Loading map..." /> */}
    </Map>
  );
}
