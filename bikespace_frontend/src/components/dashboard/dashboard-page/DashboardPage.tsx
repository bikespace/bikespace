'use client';

import React, {useEffect} from 'react';

import {trackUmamiEvent} from '@/utils';

import {useSubmissionsQuery} from '@/hooks';

import {useStore} from '@/states/store';
import {useSubmissionId} from '@/states/url-params';

import {Sidebar} from '../sidebar';
import {DashboardMap} from '../dashboard-map';

import styles from './dashboard-page.module.scss';

export function DashboardPage() {
  const queryResult = useSubmissionsQuery();
  const allSubmissions = queryResult.data?.features || [];

  const {submissions, setSubmissions, filters} = useStore(state => ({
    submissions: state.submissions,
    setSubmissions: state.setSubmissions,
    filters: state.filters,
  }));

  const [focusedId] = useSubmissionId();

  // Filter submissions when filters state changes
  useEffect(() => {
    if (allSubmissions.length === 0) return;

    const {dateRange, parkingDuration, issue, day} = filters;

    let subs = allSubmissions.slice();

    if (dateRange.from || dateRange.to)
      subs = subs.filter(s => {
        const d = new Date(s.properties.parking_time + '+00:00');

        return (
          (dateRange.from ? d >= dateRange.from : true) &&
          (dateRange.to ? d <= dateRange.to : true)
        );
      });

    if (parkingDuration.length !== 0)
      subs = subs.filter(s =>
        parkingDuration.includes(s.properties.parking_duration)
      );

    if (issue !== null)
      subs = subs.filter(s => s.properties.issues.includes(issue));

    if (day !== null)
      subs = subs.filter(
        s => new Date(s.properties.parking_time + '+00:00').getDay() === day
      );

    setSubmissions(subs);
  }, [allSubmissions, filters]);

  useEffect(() => {
    if (focusedId === null) return;

    trackUmamiEvent('focus_submission', {submission_id: focusedId});
  }, [focusedId]);

  return (
    <main className={styles.dashboardPage}>
      <Sidebar />
      <DashboardMap submissions={submissions} />
    </main>
  );
}
