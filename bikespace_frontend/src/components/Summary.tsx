import React from "react";
import Submission from "../interfaces/Submission";

const Summary = (props: { submision: Submission }) => {
  const submission = props.submision;

  return (
    <div id="submission-summary">
      <h1>Summary</h1>
      <div>
        <p><strong>Issues:</strong> {submission.issues.join(', ').toString()}</p>
        <p><strong>Location:</strong> {submission.location.latitude.toString()}, {submission.location.longitude.toString()} </p>
        <p><strong>Time:</strong> { submission.parkingTime.date.toDateString()} </p>
        <p><strong>Parking duration needed:</strong> {submission.parkingTime.parkingDuration}</p>
        <p><strong>Comments:</strong> {submission.comments}</p>
      </div>
    </div>
  );
};

export default Summary;