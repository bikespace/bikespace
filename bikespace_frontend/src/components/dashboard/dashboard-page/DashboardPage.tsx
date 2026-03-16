'use client';

import {useEffect, useRef} from 'react';
import dynamic from 'next/dynamic';

import {handleMapClick} from '@/components/map-layers/submissions';

import {trackUmamiEvent} from '@/utils';

import {useSubmissionsQuery} from '@/hooks';
import {useSingleSubmissionQuery} from '@/hooks/use-single-submission-query';

import {useStore} from '@/states/store';
import {SidebarTab, useSubmissionId, useSidebarTab} from '@/states/url-params';

import {DashboardMapProps} from '../map/MapLibreMap';

import type {
  GeoJSONSource,
  MapGeoJSONFeature,
  Point,
  QueryRenderedFeaturesOptions,
} from 'maplibre-gl';
import type {
  MapLayerMouseEvent,
  MapRef,
  PointLike,
} from 'react-map-gl/maplibre';

import styles from './dashboard-page.module.scss';

// dynamically load the sidebar to avoid SSR in development
const Sidebar = dynamic(() => import('../sidebar/Sidebar'), {
  loading: () => <></>,
  ssr: false,
});

const DashboardMap = dynamic<DashboardMapProps>(
  () => import('../map/MapLibreMap'),
  {
    loading: () => <></>,
    ssr: false,
  }
);

export function DashboardPage() {
  const mapRef = useRef<MapRef>(null);

  const [focusedId, setFocusedId] = useSubmissionId();
  const [, setSidebarTab] = useSidebarTab();

  const singleSubmissionQuery = useSingleSubmissionQuery(focusedId);
  const allSubmissionQuery = useSubmissionsQuery();
  const loadedSubmissions = allSubmissionQuery.data
    ? allSubmissionQuery.data
    : singleSubmissionQuery.data
      ? [singleSubmissionQuery.data]
      : [];

  const {submissions, setSubmissions, filters} = useStore(state => ({
    submissions: state.submissions,
    setSubmissions: state.setSubmissions,
    filters: state.filters,
  }));

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

  async function handleClick(e: MapLayerMouseEvent) {
    const {singleSelected, multiSelected} = await handleMapClick(e, mapRef);

    if (singleSelected) {
      mapRef.current!.once('idle', () =>
        setFocusedId(singleSelected.properties.id)
      );
    }
  }

  return (
    <main className={styles.dashboardPage}>
      <Sidebar />
      <DashboardMap
        submissions={submissions}
        mapRef={mapRef}
        isFirstMarkerDataLoading={isFirstMarkerDataLoading}
        handleClick={handleClick}
      />
    </main>
  );
}
