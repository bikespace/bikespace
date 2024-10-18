import React from 'react';

import {useSubmissionFormContext} from '../schema';

import styles from './comments.module.scss';
import {FormSectionHeader} from '../form-section-header';

export const Comments = () => {
  const {register} = useSubmissionFormContext();

  return (
    <div className={styles.submissionComments}>
      <FormSectionHeader
        title="Comments"
        description="Any additional comments you want to add..."
        name="comments"
      />
      <textarea
        {...register('comments')}
        rows={10}
        cols={33}
        data-umami-event="comments-text-box"
      />
    </div>
  );
};
