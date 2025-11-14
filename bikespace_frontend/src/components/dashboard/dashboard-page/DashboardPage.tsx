'use client';

import {useEffect} from 'react';
import dynamic from 'next/dynamic';

import {trackUmamiEvent} from '@/utils';

import {useSubmissionsQuery} from '@/hooks';
import {useSingleSubmissionQuery} from '@/hooks/use-single-submission-query';

import {useStore} from '@/states/store';
import {useSubmissionId} from '@/states/url-params';

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

  const singleSubmissionQuery = useSingleSubmissionQuery(focusedId);
  const allSubmissionQuery = useSubmissionsQuery();

  const singleSubmission = singleSubmissionQuery.data;
  const allSubmissions = allSubmissionQuery.data || [];

  const {submissions, setSubmissions, filters} = useStore(state => ({
    submissions: state.submissions,
    setSubmissions: state.setSubmissions,
    filters: state.filters,
  }));

  useEffect(() => {
    if (focusedId !== null && singleSubmission) {
      setSubmissions([singleSubmission]);
      return;
    }
  }, [focusedId, singleSubmission]);

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
  }, [allSubmissions, filters, focusedId, setSubmissions]);

  useEffect(() => {
    if (focusedId === null) return;

    trackUmamiEvent('focus_submission', {submission_id: focusedId});
  }, [focusedId]);

  return (
    <main className={styles.dashboardPage}>
      <Sidebar />
      <Map submissions={submissions}/>
    </main>
  );
}
