'use client';

import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';

import {queryClient} from '@/config/query-client';

import {SubmissionHeader} from '../submission-header';
import {SubmissionForm} from '../submission-form';

import backgroundImage from '@/assets/images/bikespace-background-desktop.jpeg';

import styles from './submission-page.module.scss';

export function SubmissionPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.submissionPage}>
        <SubmissionHeader />
        <main style={{backgroundImage: `url(${backgroundImage.src})`}}>
          <SubmissionForm />
        </main>
      </div>
    </QueryClientProvider>
  );
}
