import React from 'react';

import {useSubmissionsStore} from '@/store';

import {FeedSubmissionItem} from '../feed-submission-item';

import styles from './feed-submissions.module.scss';

// TODO: instead of limiting number of submissions by default, should implement pagination

export function FeedSubmissions() {
  const {submissions, focus, setFocus} = useSubmissionsStore(state => ({
    submissions: state.submissions,
    focus: state.focusedId,
    setFocus: state.setFocusedId,
  }));

  return (
    <div className={styles.feed}>
      <div className={styles.header}>
        <h2>Latest Submissions</h2>
      </div>
      <div className={styles.list}>
        {submissions.map(submission => (
          <FeedSubmissionItem
            key={submission.id}
            submission={submission}
            isFocused={submission.id === focus}
            handleClick={() => {
              setFocus(submission.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
