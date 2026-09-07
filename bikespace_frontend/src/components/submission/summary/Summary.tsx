import {useSubmissionFormContext} from '../submission-form/schema';
import Link from 'next/link';

import {useUserQuery} from '@/hooks/use-user-query';

import {AnimatedEllipses} from '@/components/shared-ui/animated-ellipses';

import styles from './summary.module.scss';
import submissionStyles from '../submission-form-controller/submission-form-controller.module.scss';

export const Summary = () => {
  const {
    watch,
    formState: {isSubmitSuccessful, errors},
  } = useSubmissionFormContext();
  const userQuery = useUserQuery();

  const submission = watch();
  const submissionId = watch('submissionId');

  const renderSummary = () => {
    if (errors.root?.serverError) {
      return (
        <>
          <h2>Oops!</h2>
          <p>
            Something went wrong on our end processing your submission, please
            try again later!
          </p>
        </>
      );
    } else if (errors.root?.unexpected) {
      return (
        <>
          <h2>Oops!</h2>
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
          <h2>Success</h2>
          <p>Your submission has been entered successfully!</p>
          <p>Thank You!</p>

          {submissionId ? (
            <Link href={`/dashboard?tab=feed&submission_id=${submissionId}`}>
              <button
                className={submissionStyles.primaryBtn}
                data-umami-event="view-issue-from-submission-confirmation"
              >
                View Your Submission
              </button>
            </Link>
          ) : (
            <Link href="/dashboard">
              <button
                className={submissionStyles.primaryBtn}
                data-umami-event="view-dashboard-from-submission-confirmation"
              >
                Go to Dashboard
              </button>
            </Link>
          )}
        </>
      );
    }

    return (
      <>
        <h2>Summary</h2>
        <div>
          {userQuery.isFetching ? (
            <p>
              <strong>Submitting as: </strong>
              <AnimatedEllipses />
            </p>
          ) : userQuery.isSuccess ? (
            <p>
              <strong>Submitting as: </strong>
              {userQuery.data.username}
            </p>
          ) : userQuery.isError ? (
            <p>
              <strong>Submitting as: </strong>
              <span role="status">{`Error fetching user details: ${userQuery.failureReason}`}</span>
            </p>
          ) : null}
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

  return (
    <div id="submission-summary" className={styles.summary}>
      {renderSummary()}
    </div>
  );
};
