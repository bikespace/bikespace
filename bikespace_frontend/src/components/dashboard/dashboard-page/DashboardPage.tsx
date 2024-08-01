'use client';

import React, {useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import umami from '@umami/node';

import {UseQueryResult} from '@tanstack/react-query';

import {SubmissionApiPayload, SubmissionFilters} from '@/interfaces/Submission';

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

interface DashboardPageProps {
  queryResult: UseQueryResult<SubmissionApiPayload[], Error>;
}

const Map = dynamic<MapProps>(() => import('../map/Map'), {
  loading: () => <></>,
  ssr: false,
});

export function DashboardPage({queryResult}: DashboardPageProps) {
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
    const submissions = queryResult.data || [];

    if (submissions.length === 0) {
      setSubmissionsDateRange({
        first: null,
        last: null,
      });

      return;
    }

    setSubmissionsDateRange({
      first: new Date(submissions[submissions.length - 1].parking_time),
      last: new Date(submissions[0].parking_time),
    });
  }, [queryResult]);

  // Filter submissions effect
  useEffect(() => {
    const submissions = queryResult.data || [];

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
  }, [queryResult, filters]);

  useEffect(() => {
    if (focusedSubmissionId === null) return;

    umami.track('focus_submission', {submission_id: focusedSubmissionId});
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
