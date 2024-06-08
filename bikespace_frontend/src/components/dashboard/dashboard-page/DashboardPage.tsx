import React, {useState, useEffect} from 'react';

import {SubmissionApiPayload, SubmissionFilters} from '@/interfaces/Submission';

import {
  SubmissionFiltersContext,
  SubmissionsContext,
  TabContext,
  SubmissionsDateRangeContext,
  SubmissionsDateRangeContextData,
} from '../context';

import {DashboardHeader} from '../dashboard-header';
import {Map} from '../map';
import {Noscript} from '../noscript';
import {Sidebar} from '../sidebar';

import * as styles from './dashboard-page.module.scss';

interface DashboardPageProps {
  submissions: SubmissionApiPayload[];
}

export function DashboardPage({submissions}: DashboardPageProps) {
  const [tab, setTab] = useState<string>('data');
  const [filters, setFilters] = useState<SubmissionFilters>({
    dateRange: null,
    parkingDuration: null,
  });
  const [submissionsDateRange, setSubmissionsDateRange] =
    useState<SubmissionsDateRangeContextData>({
      first: null,
      last: null,
    });
  const [filteredSubmissions, setFilteredSubmissions] =
    useState<SubmissionApiPayload[]>(submissions);

  // Filter submissions effect
  useEffect(() => {
    const submissionDates = submissions.map(
      submission => new Date(submission.parking_time)
    );

    submissionDates.sort((a, b) => a.getTime() - b.getTime());

    setSubmissionsDateRange({
      first: submissionDates[0],
      last: submissionDates[submissionDates.length - 1],
    });

    const {dateRange, parkingDuration} = filters;

    if (dateRange === null && parkingDuration === null)
      return setFilteredSubmissions(submissions);

    if (dateRange && parkingDuration)
      return setFilteredSubmissions(
        submissions
          .filter(
            submission =>
              new Date(submission.parking_time) >= dateRange.from &&
              new Date(submission.parking_time) <= dateRange.to
          )
          .filter(submission =>
            parkingDuration.includes(submission.parking_duration)
          )
      );

    if (dateRange)
      return setFilteredSubmissions(
        submissions.filter(
          submission =>
            new Date(submission.parking_time) >= dateRange.from &&
            new Date(submission.parking_time) <= dateRange.to
        )
      );

    if (parkingDuration)
      return setFilteredSubmissions(
        submissions.filter(submission =>
          parkingDuration.includes(submission.parking_duration)
        )
      );
  }, [submissions, filters]);

  return (
    <SubmissionsDateRangeContext.Provider value={submissionsDateRange}>
      <SubmissionsContext.Provider value={filteredSubmissions}>
        <TabContext.Provider value={{tab, setTab}}>
          <SubmissionFiltersContext.Provider value={{filters, setFilters}}>
            <div className={styles.dashboardPage}>
              <DashboardHeader />
              <main className={styles.main}>
                <Sidebar />
                <Map submissions={filteredSubmissions} />
              </main>
              <Noscript />
            </div>
          </SubmissionFiltersContext.Provider>
        </TabContext.Provider>
      </SubmissionsContext.Provider>
    </SubmissionsDateRangeContext.Provider>
  );
}
