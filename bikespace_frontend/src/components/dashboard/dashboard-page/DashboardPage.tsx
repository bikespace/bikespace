'use client';

import React, {useState, useEffect} from 'react';
import dynamic from 'next/dynamic';

import {SubmissionApiPayload, SubmissionFilters} from '@/interfaces/Submission';

import {trackUmamiEvent} from '@/utils';

import {useSubmissionsQuery} from '@/hooks';

import {
  SubmissionFiltersContext,
  SubmissionsContext,
  TabContext,
  SubmissionsDateRangeContext,
  type SubmissionsDateRangeContextData,
  FocusedSubmissionIdContext,
  SidebarTab,
} from '@/context';

import {Sidebar} from '../sidebar';
import {MapProps} from '../map';

import styles from './dashboard-page.module.scss';

const Map = dynamic<MapProps>(() => import('../map/Map'), {
  loading: () => <></>,
  ssr: false,
});

export function DashboardPage() {
  const {data} = useSubmissionsQuery();
  const submissions = data || [];

  const [tab, setTab] = useState<SidebarTab>(SidebarTab.Data);

  const [filters, setFilters] = useState<SubmissionFilters>({
    dateRange: null,
    dateRangeInterval: null,
    parkingDuration: [],
    issue: null,
    day: null,
  });

  const [submissionsDateRange, setSubmissionsDateRange] =
    useState<SubmissionsDateRangeContextData>({
      first: null,
      last: null,
    });

  const [filteredSubmissions, setFilteredSubmissions] = useState<
    SubmissionApiPayload[]
  >([]);

  const [focusedSubmissionId, setFocusedSubmissionId] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (submissions.length === 0) return;

    setSubmissionsDateRange({
      first: new Date(submissions[submissions.length - 1].parking_time),
      last: new Date(submissions[0].parking_time),
    });
  }, [submissions]);

  // Filter submissions effect
  useEffect(() => {
    if (submissions.length === 0) return;

    const {dateRange, parkingDuration, issue, day} = filters;

    setFilteredSubmissions(
      submissions.filter(
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
  }, [submissions, filters]);

  useEffect(() => {
    if (focusedSubmissionId === null) return;

    trackUmamiEvent('focus_submission', {submission_id: focusedSubmissionId});
  }, [focusedSubmissionId]);

  return (
    <SubmissionsDateRangeContext.Provider value={submissionsDateRange}>
      <SubmissionsContext.Provider value={filteredSubmissions}>
        <FocusedSubmissionIdContext.Provider
          value={{
            focus: focusedSubmissionId,
            setFocus: setFocusedSubmissionId,
          }}
        >
          <TabContext.Provider value={{tab, setTab}}>
            <SubmissionFiltersContext.Provider value={{filters, setFilters}}>
              <main className={styles.dashboardPage}>
                <Sidebar />
                <Map submissions={filteredSubmissions} />
              </main>
            </SubmissionFiltersContext.Provider>
          </TabContext.Provider>
        </FocusedSubmissionIdContext.Provider>
      </SubmissionsContext.Provider>
    </SubmissionsDateRangeContext.Provider>
  );
}
