'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {QueryClientProvider} from '@tanstack/react-query';

import {queryClient} from '@/config/query-client';
import {Spinner} from '@/components/shared-ui/spinner';
import {SubmissionHeader} from '@/components/submission/submission-header';

import styles from './profile-page.module.scss';

const ProfileDetails = dynamic(
  () => import('../profile-details/ProfileDetails'),
  {loading: () => <Spinner />, ssr: false}
);

export function UserProfilePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={styles.profilePage}>
        <SubmissionHeader />
        <main>
          <ProfileDetails />
        </main>
      </div>
    </QueryClientProvider>
  );
}
