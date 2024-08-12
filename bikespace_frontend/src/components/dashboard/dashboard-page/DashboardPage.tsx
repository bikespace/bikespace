'use client';

import React, {useEffect} from 'react';
import dynamic from 'next/dynamic';

import {trackUmamiEvent} from '@/utils';

import {useSubmissionsQuery} from '@/hooks';

import {useSubmissionsStore} from '@/states/store';

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

  const {submissions, setSubmissions, filters, focusedId} = useSubmissionsStore(
    state => ({
      submissions: state.submissions,
      setSubmissions: state.setSubmissions,
      filters: state.filters,
      focusedId: state.focusedId,
    })
  );

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

  return (
    <main className={styles.dashboardPage}>
      <Sidebar />
      <Map submissions={submissions} />
    </main>
  );
}
