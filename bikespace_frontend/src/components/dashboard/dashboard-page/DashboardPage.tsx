'use client';

import React, {useEffect} from 'react';

import {trackUmamiEvent} from '@/utils';

import {useSubmissionsQuery} from '@/hooks';

import {useSubmissionsStore} from '@/states/store';
import {useSubmissionId} from '@/states/url-params';

import {Sidebar} from '../sidebar';
import {Map} from '../map';

import styles from './dashboard-page.module.scss';

export function DashboardPage() {
  const queryResult = useSubmissionsQuery();
  const allSubmissions = queryResult.data || [];

  const {submissions, setSubmissions, filters} = useSubmissionsStore(state => ({
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
