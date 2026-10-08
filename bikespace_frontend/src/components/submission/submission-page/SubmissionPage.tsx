'use client';

import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';

import {queryClient} from '@/config/query-client';

import {SubmissionHeader} from '../submission-header';
import {SubmissionForm} from '../submission-form';

import styles from './submission-page.module.scss';

export function SubmissionPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.submissionPage}>
        <SubmissionHeader />
        <main>
          <SubmissionForm />
        </main>
      </div>
    </QueryClientProvider>
  );
}
