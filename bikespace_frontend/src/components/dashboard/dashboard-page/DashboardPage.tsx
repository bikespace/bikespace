'use client';

import React, {useEffect} from 'react';
import dynamic from 'next/dynamic';
import {useSearchParams} from 'next/navigation';

import {trackUmamiEvent} from '@/utils';

import {useSubmissionsQuery} from '@/hooks';

import {useSubmissionsStore} from '@/store';
import {SidebarTab} from '@/store/slices';

import {Sidebar} from '../sidebar';
import {MapProps} from '../map';

import styles from './dashboard-page.module.scss';

const Map = dynamic<MapProps>(() => import('../map/Map'), {
  loading: () => <></>,
  ssr: false,
});

export function DashboardPage() {
  const queryResult = useSubmissionsQuery();
  const allSubmissions = queryResult.data || [];

  const {
    submissions,
    setSubmissions,
    filters,
    focusedId,
    setTab,
    setFocusedId,
  } = useSubmissionsStore(state => ({
    submissions: state.submissions,
    setSubmissions: state.setSubmissions,
    filters: state.filters,
    focusedId: state.focusedId,
    setTab: state.setTab,
    setFocusedId: state.setFocusedId,
  }));

  useEffect(() => {
    if (allSubmissions.length === 0) return;

    setSubmissions(allSubmissions);
  }, [allSubmissions]);

  // Filter submissions when filters state changes
  useEffect(() => {
    if (submissions.length === 0) return;

    const {dateRange, parkingDuration, issue, day} = filters;

    setSubmissions(
      allSubmissions.filter(
        submission =>
          (!dateRange ||
            (new Date(submission.parking_time) >= dateRange.from &&
              new Date(submission.parking_time) <= dateRange.to)) &&
          (parkingDuration.length === 0 ||
            parkingDuration.includes(submission.parking_duration)) &&
          (!issue || submission.issues.includes(issue)) &&
          (day === null || new Date(submission.parking_time).getDay() === day)
      )
    );
  }, [allSubmissions, filters]);

  useEffect(() => {
    if (focusedId === null) return;

    trackUmamiEvent('focus_submission', {submission_id: focusedId});
  }, [focusedId]);

  // update app state based on URL parameters
  const searchParams = useSearchParams();
  const paramTab = searchParams.get('tab') as SidebarTab;
  const paramID = Number(searchParams.get('id'));

  useEffect(() => {
    if (paramID) {
      setFocusedId(paramID);
      setTab(SidebarTab.Feed);
    } else if (Object.values(SidebarTab).includes(paramTab)) {
      setTab(paramTab);
    }
  }, [paramTab, paramID]);

  return (
    <main className={styles.dashboardPage}>
      <Sidebar />
      <Map submissions={submissions} />
    </main>
  );
}
