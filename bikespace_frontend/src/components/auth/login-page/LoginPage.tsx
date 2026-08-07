'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import {Spinner} from '@/components/shared-ui/spinner';
import {SubmissionHeader} from '@/components/submission/submission-header';

import styles from './login-page.module.scss';

const LoginForm = dynamic(() => import('../login-form/LoginForm'), {
  loading: () => <Spinner />,
  ssr: false,
});

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
