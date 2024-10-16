import React from 'react';

import {useSubmissionFormContext} from '../schema';

import styles from './comments.module.scss';

export const Comments = () => {
  const {register} = useSubmissionFormContext();

  return (
    <div className={styles.submissionComments}>
      <h2>Comments</h2>
      <h3>Any additional comments you want to add...</h3>
      <textarea
        {...register('comments')}
        rows={10}
        cols={33}
        data-umami-event="comments-text-box"
      />
    </div>
  );
};
