'use client';

import {useEffect} from 'react';
import dynamic from 'next/dynamic';

import {useSubmissionsQuery} from '@/hooks';
import {useSingleSubmissionQuery} from '@/hooks/use-single-submission-query';

import {useStore} from '@/states/store';
import {SidebarTab, useSubmissionId, useSidebarTab} from '@/states/url-params';

import {MapProps} from '../map';

import styles from './dashboard-page.module.scss';

// dynamically load the sidebar to avoid SSR in development
const Sidebar = dynamic(() => import('../sidebar/Sidebar'), {
  loading: () => <></>,
  ssr: false,
});

const Map = dynamic<MapProps>(() => import('../map/Map'), {
  loading: () => <></>,
  ssr: false,
});

export function DashboardPage() {
  const [focusedId] = useSubmissionId();
  const [, setSidebarTab] = useSidebarTab();

  const singleSubmissionQuery = useSingleSubmissionQuery(focusedId);
  const allSubmissionQuery = useSubmissionsQuery();
  const loadedSubmissions = allSubmissionQuery.data
    ? allSubmissionQuery.data
    : singleSubmissionQuery.data
      ? [singleSubmissionQuery.data]
      : [];

  const {
    submissions,
    setSubmissions,
    filters,
    setIsFirstMarkerDataLoading,
    setIsFullDataLoading,
  } = useStore(state => ({
    submissions: state.submissions,
    setSubmissions: state.setSubmissions,
    filters: state.filters,
    setIsFirstMarkerDataLoading: state.ui.loading.setIsFirstMarkerDataLoading,
    setIsFullDataLoading: state.ui.loading.setIsFullDataLoading,
  }));

  // track if enough data has loaded to render the first map markers
  useEffect(() => {
    setIsFirstMarkerDataLoading(
      focusedId
        ? singleSubmissionQuery.isLoading && allSubmissionQuery.isLoading
        : allSubmissionQuery.isLoading
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleSubmissionQuery.isLoading, allSubmissionQuery.isLoading]);

  // track if full data has loaded
  useEffect(() => {
    setIsFullDataLoading(allSubmissionQuery.isLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSubmissionQuery.isLoading]);

  // set tab to 'feed' on page load if a submission ID is specified in the URL
  useEffect(() => {
    if (focusedId !== null) {
      setSidebarTab(SidebarTab.Feed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedSubmissions.length, filters]);

  return (
    <main className={styles.dashboardPage}>
      <Sidebar />
      <Map submissions={submissions} />
    </main>
  );
}
