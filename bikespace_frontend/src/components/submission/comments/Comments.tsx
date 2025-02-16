import React from 'react';

import {useSubmissionFormContext} from '../submission-form/schema';

import {FormSectionHeader} from '../form-section-header';

import styles from './comments.module.scss';

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
