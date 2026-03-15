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
  SubmissionsLayer,
  handleMouseHover,
} from '@/components/map-layers/submissions';
import {
  BicycleNetworkLayer,
  BicycleNetworkLayerLegend,
} from '@/components/map-layers/BicycleNetwork';

import type {
  FilterSpecification,
  QueryRenderedFeaturesOptions,
} from 'maplibre-gl';
import type {
  MapGeoJSONFeature,
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
  mapRef: React.RefObject<MapRef>;
  isFirstMarkerDataLoading: boolean;
  handleClick: (e: MapLayerMouseEvent) => void;
}

function DashboardMap({
  submissions,
  mapRef,
  isFirstMarkerDataLoading,
  handleClick,
}: DashboardMapProps) {
  const isMobile = useIsMobile();

  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<MapGeoJSONFeature | null>(null);
  const [multiSelectedSubmissions, setMultiSelectedSubmissions] = useState<
    MapGeoJSONFeature[] | null
  >(null);
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

  // cancel loading spinner when any number of submissions are loaded
  useEffect(() => {
    if (!isFirstMarkerDataLoading) setIsMapLoading(false);
  }, [isFirstMarkerDataLoading]);

  function handleOnLoad() {
    // console log required for playwright testing
    if (process.env.NODE_ENV !== 'production') console.log('map loaded');
    mapRef.current!.addSprite('submission', submissionSpritePath);
    handleMouseHover(mapRef);
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
      onClick={handleClick}
    >
      <NavigationControl position="top-left" />
      <GeolocateControl position="top-left" />
      <SubmissionsLayer
        submissions={submissions}
        singleSelected={selectedSubmission}
        multiSelected={multiSelectedSubmissions}
      />
      {/* placed here to avoid covering the sidebar */}
      <Spinner show={isMapLoading} overlay label="Loading map..." />
    </Map>
  );
}

export default DashboardMap;
export {DashboardMap};
