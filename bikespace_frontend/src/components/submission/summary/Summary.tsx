import React from 'react';

import {useSubmissionFormContext} from '../schema';

import styles from './summary.module.scss';

export const Summary = () => {
  const {
    watch,
    formState: {isSubmitSuccessful, errors},
  } = useSubmissionFormContext();

  const submission = watch();

  const renderSummary = () => {
    if (errors.root?.serverError) {
      return (
        <>
          <h1>Oops!</h1>
          <p>
            Something went wrong on our end processing your submission, please
            try again later!
          </p>
        </>
      );
    } else if (errors.root?.unexpected) {
      return (
        <>
          <h1>Oops!</h1>
          <p>
            Something went wrong beyond our expectations. Please try again
            later, and report this bug to the developers :
          </p>
        </>
      );
    }

    if (isSubmitSuccessful) {
      return (
        <>
          <h1>Success</h1>
          <p>Your submission has been entered successfully!</p>
          <p>Thank You!</p>
        </>
      );
    }

    return (
      <>
        <h1>Summary</h1>
        <div>
          <p>
            <strong>Issues: </strong>
            {submission.issues.join(', ')}
          </p>
          <p>
            <strong>Location: </strong>
            {`${submission.location.latitude}, ${submission.location.longitude}`}
          </p>
          <p>
            <strong>Time: </strong>
            {submission.parkingTime.date.toDateString()}
          </p>
          <p>
            <strong>Parking duration needed: </strong>
            {submission.parkingTime.parkingDuration}
          </p>
          <p>
            <strong>Comments: </strong>
            {submission.comments}
          </p>
        </div>
      </>
    );
  };

  return <div className={styles.summary}>{renderSummary()}</div>;
};
