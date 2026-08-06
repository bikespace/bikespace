'use client';

import React from 'react';

import {SubmissionHeader} from '@/components/submission/submission-header';
import {LoginForm} from '../login-form';

import styles from './login-page.module.scss';

export function LoginPage() {
  return (
    <div className={styles.loginPage}>
      <SubmissionHeader />
      <main>
        <LoginForm />
      </main>
    </div>
  );
}
