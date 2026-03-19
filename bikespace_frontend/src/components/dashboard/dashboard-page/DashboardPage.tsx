'use client';

import {useEffect} from 'react';
import dynamic from 'next/dynamic';

import {trackUmamiEvent} from '@/utils';

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
  const [selectedSubmissionInURL, setSelectedSubmissionInURL] =
    useSubmissionId();
  const [, setSidebarTab] = useSidebarTab();
  const {
    submissions,
    setSubmissions,
    selectedSubmission,
    setSelectedSubmission,
    filters,
  } = useStore(state => ({
    submissions: state.submissions,
    setSubmissions: state.setSubmissions,
    selectedSubmission: state.ui.submissions.selectedSubmission,
    setSelectedSubmission: state.ui.submissions.setSelectedSubmission,
    filters: state.filters,
  }));

  const singleSubmissionQuery = useSingleSubmissionQuery(selectedSubmission);
  const allSubmissionQuery = useSubmissionsQuery();
  const loadedSubmissions = allSubmissionQuery.data
    ? allSubmissionQuery.data
    : singleSubmissionQuery.data
      ? [singleSubmissionQuery.data]
      : [];

  const isFirstMarkerDataLoading = selectedSubmission
    ? singleSubmissionQuery.isLoading && allSubmissionQuery.isLoading
    : allSubmissionQuery.isLoading;

  // if a submission ID is specified in the URL on page load,
  // then set submission value from URL and set tab to 'feed'
  useEffect(() => {
    if (selectedSubmissionInURL !== null) {
      setSidebarTab(SidebarTab.Feed);
      setSelectedSubmission(selectedSubmissionInURL);
      setSelectedSubmissionInURL(null);
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

  useEffect(() => {
    if (selectedSubmission === null) return;

    trackUmamiEvent('focus_submission', {submission_id: selectedSubmission});
  }, [selectedSubmission]);

  return (
    <main className={styles.dashboardPage}>
      <Sidebar />
      <Map
        submissions={submissions}
        isFirstMarkerDataLoading={isFirstMarkerDataLoading}
      />
    </main>
  );
}
