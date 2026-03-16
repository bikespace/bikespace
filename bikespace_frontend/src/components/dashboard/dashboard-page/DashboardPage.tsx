'use client';

import {useEffect, useRef, useState} from 'react';
import dynamic from 'next/dynamic';

import Map, {GeolocateControl, NavigationControl} from 'react-map-gl/maplibre';

import {
  SubmissionsLayer,
  handleMouseHover,
  handleMapClick as handleMapClickBase,
} from '@/components/map-layers/submissions';
import {Spinner} from '@/components/shared-ui/spinner';

import {trackUmamiEvent} from '@/utils';
import {
  defaultMapCenter,
  backupMapStyle,
  addPMTilesProtocol,
} from '@/utils/map-utils';

import {useSubmissionsQuery} from '@/hooks';
import {useSingleSubmissionQuery} from '@/hooks/use-single-submission-query';

import {useStore} from '@/states/store';
import {SidebarTab, useSubmissionId, useSidebarTab} from '@/states/url-params';

import type {
  MapLayerMouseEvent,
  MapRef,
  MapGeoJSONFeature,
} from 'react-map-gl/maplibre';

import styles from './dashboard-page.module.scss';

// dynamically load the sidebar to avoid SSR in development
const Sidebar = dynamic(() => import('../sidebar/Sidebar'), {
  loading: () => <></>,
  ssr: false,
});

import 'maplibre-gl/dist/maplibre-gl.css';

const submissionSpritePath = '/submission_sprites/submission_sprites';

export function DashboardPage() {
  const mapRef = useRef<MapRef>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [focusedId, setFocusedId] = useSubmissionId();
  const [selectedSubmission, setSelectedSubmission] =
    useState<MapGeoJSONFeature | null>(null);
  const [multiSelectedSubmissions, setMultiSelectedSubmissions] = useState<
    MapGeoJSONFeature[] | null
  >(null);
  const [, setSidebarTab] = useSidebarTab();

  const singleSubmissionQuery = useSingleSubmissionQuery(focusedId);
  const allSubmissionQuery = useSubmissionsQuery();
  const loadedSubmissions = allSubmissionQuery.data
    ? allSubmissionQuery.data
    : singleSubmissionQuery.data
      ? [singleSubmissionQuery.data]
      : [];

  const {submissions, setSubmissions, filters, setIsSidebarOpen} = useStore(
    state => ({
      submissions: state.submissions,
      setSubmissions: state.setSubmissions,
      filters: state.filters,
      setIsSidebarOpen: state.ui.sidebar.setIsOpen,
    })
  );

  // enable backup map tiles
  useEffect(() => addPMTilesProtocol(), []);

  const mapStyle = process.env.MAPTILER_API_KEY
    ? `https://api.maptiler.com/maps/streets/style.json?key=${process.env.MAPTILER_API_KEY}`
    : backupMapStyle;

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

  const isFirstMarkerDataLoading = focusedId
    ? singleSubmissionQuery.isLoading && allSubmissionQuery.isLoading
    : allSubmissionQuery.isLoading;

  // set tab to 'feed' on page load if a submission ID is specified in the URL
  useEffect(() => {
    if (focusedId !== null) {
      setSidebarTab(SidebarTab.Feed);
    }
  }, []); // [] = run once on first load

  // Filter submissions when filters state changes
  useEffect(() => {
    if (loadedSubmissions.length === 0) return;

    const {dateRange, parkingDuration, issue, day} = filters;
    let subs = loadedSubmissions;

    if (dateRange.from || dateRange.to)
      subs = subs.filter(s => {
        const d = new Date(s.parking_time + '+00:00');

        return (
          (dateRange.from ? d >= dateRange.from : true) &&
          (dateRange.to ? d <= dateRange.to : true)
        );
      });

    if (parkingDuration.length !== 0)
      subs = subs.filter(s => parkingDuration.includes(s.parking_duration));

    if (issue !== null) subs = subs.filter(s => s.issues.includes(issue));

    if (day !== null)
      subs = subs.filter(
        s => new Date(s.parking_time + '+00:00').getDay() === day
      );

    setSubmissions(subs);
  }, [allSubmissionQuery.data, singleSubmissionQuery.data, filters]);

  function handleOnLoad() {
    // console log required for playwright testing
    if (process.env.NODE_ENV !== 'production') console.log('map loaded');
    mapRef.current!.addSprite('submission', submissionSpritePath);
    handleMouseHover(mapRef);
  }

  async function handleMapClick(e: MapLayerMouseEvent) {
    const {singleSelected, multiSelected} = await handleMapClickBase(e, mapRef);

    if (singleSelected) {
      mapRef.current!.once('idle', () =>
        setFocusedId(singleSelected.properties.id)
      );
    }
  }

  return (
    <main className={styles.dashboardPage}>
      <Sidebar />
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: defaultLocation.latitude,
          longitude: defaultLocation.longitude,
          zoom: zoomLevel,
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle={mapStyle}
        onLoad={handleOnLoad}
        onClick={handleMapClick}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
        <SubmissionsLayer
          submissions={submissions}
          singleSelected={selectedSubmission}
          multiSelected={multiSelectedSubmissions}
        />
        {/* placed here to avoid covering the sidebar */}
        <Spinner
          show={isFirstMarkerDataLoading}
          overlay
          label="Loading map..."
        />
      </Map>
    </main>
  );
}
