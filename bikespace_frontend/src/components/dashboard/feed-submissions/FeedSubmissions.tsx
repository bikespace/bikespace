import React from 'react';

import {useStore} from '@/states/store';

import {FeedSubmissionItem} from '../feed-submission-item';

import styles from './feed-submissions.module.scss';

// TODO: instead of limiting number of submissions by default, should implement pagination

export function FeedSubmissions() {
  const submissions = useStore(state => state.submissions);

  return (
    <div className={styles.feed}>
      <div className={styles.header}>
        <h2>Latest Submissions</h2>
      </div>
      <div className={styles.list}>
        {[...submissions].reverse().map(submission => (
          <FeedSubmissionItem key={submission.id} submission={submission} />
        ))}
      </div>
    </div>
  );
}
