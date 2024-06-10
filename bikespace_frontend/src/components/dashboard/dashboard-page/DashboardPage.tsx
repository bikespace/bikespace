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
    issue: null,
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

    const {dateRange, parkingDuration, issue} = filters;

    setFilteredSubmissions(
      submissions.filter(
        submission =>
          (dateRange
            ? new Date(submission.parking_time) >= dateRange.from &&
              new Date(submission.parking_time) <= dateRange.to
            : true) &&
          (parkingDuration && parkingDuration.length > 0
            ? parkingDuration.includes(submission.parking_duration)
            : true) &&
          (issue ? submission.issues.includes(issue) : true)
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
