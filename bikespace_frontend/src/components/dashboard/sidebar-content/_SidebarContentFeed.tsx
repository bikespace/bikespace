import React from 'react';

import {useStore} from '@/states/store';

import {FeedSubmissionItem} from '../feed-submission-item';

import styles from './_SidebarContent.module.scss';

export function SidebarContentFeed() {
  const submissions = useStore(state => state.submissions);

  return (
    <>
      <div className={styles.ContentHeading}>
        <h2 className={styles.cardHeading}>Latest Submissions</h2>
      </div>
      <div
        className={`${styles.ContentCard} ${styles.scrollableCard}`}
        data-testid="submissions-feed"
      >
        {[...submissions].reverse().map(submission => (
          <FeedSubmissionItem key={submission.id} submission={submission} />
        ))}
      </div>
    </>
  );
}
