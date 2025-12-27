import React from 'react';

import {useStore} from '@/states/store';

import {Spinner} from '@/components/shared-ui/spinner';

import {FeedSubmissionItem} from '../feed-submission-item';

import styles from './_SidebarContent.module.scss';

export function SidebarContentFeed() {
  const {submissions, isLoading} = useStore(state => ({
    submissions: state.submissions,
    isLoading: state.ui.loading.isFullDataLoading,
  }));

  return (
    <>
      <div className={styles.ContentHeading}>
        <h2 className={styles.cardHeading}>Latest Submissions</h2>
      </div>
      <div className={`${styles.ContentCard} ${styles.scrollableCard}`}>
        {[...submissions].reverse().map(submission => (
          <FeedSubmissionItem key={submission.id} submission={submission} />
        ))}
        <div className={styles.loadingIndicator}>
          {isLoading ? <Spinner label="Loading submissions..." /> : null}
        </div>
      </div>
    </>
  );
}
