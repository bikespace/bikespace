import React from 'react';
import Submission from '../interfaces/Submission';
import {SubmissionStatus} from '../interfaces/Submission';

const Summary = (props: {
  submission: Submission;
  submissionStatus: SubmissionStatus;
}) => {
  const submission = props.submission;
  const submissionStatus = props.submissionStatus;
  if (submissionStatus.status === 'summary') {
    return (
      <div id="submission-summary">
        <h1>Summary</h1>
        <div>
          <p>
            <strong>Issues:</strong> {submission.issues.join(', ').toString()}
          </p>
          <p>
            <strong>Location:</strong> {submission.location.latitude.toString()}
            , {submission.location.longitude.toString()}{' '}
          </p>
          <p>
            <strong>Time:</strong> {submission.parkingTime.date.toDateString()}{' '}
          </p>
          <p>
            <strong>Parking duration needed:</strong>{' '}
            {submission.parkingTime.parkingDuration}
          </p>
          <p>
            <strong>Comments:</strong> {submission.comments}
          </p>
        </div>
      </div>
    );
  } else if (submissionStatus.status === 'success') {
    return (
      <div id="submission-summary">
        <h1>Success</h1>
        <p>Your submission has been entered successfully!</p>
        <p>Thank You!</p>
      </div>
    );
  } else if (submissionStatus.status === 'error') {
    return (
      <div id="submission-summary">
        <h1>Oops</h1>
        <p>
          Something went wrong on our end processing your submission, please try
          again later!
        </p>
      </div>
    );
  } else {
    return (
      <div id="submission-summary">
        <h1>Oops!</h1>
        <p>
          Something went wrong beyond our expectations. Please try again later,
          and report this bug to the developers :(
        </p>
      </div>
    );
  }
};

export default Summary;
