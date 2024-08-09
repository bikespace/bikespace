'use client';

import React from 'react';

import {SubmissionHeader} from '../submission-header';
import {SubmissionForm} from '../submission-form';

import styles from './submission-page.module.scss';

export function SubmissionPage() {
  return (
    <div className={styles.submissionPage}>
      <SubmissionHeader />
      <main>
        <SubmissionForm />
      </main>
    </div>
  );
}
