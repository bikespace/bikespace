import React, {useState, useEffect} from 'react';

import {
  IssueType,
  LocationLatLng,
  ParkingDuration,
  SubmissionPayload,
  SubmissionStatus,
  SubmissionResponsePayload,
} from '@/interfaces/Submission';

import {
  Issue,
  Location,
  Time,
  Comments,
  Summary,
  SubmissionProgressBar,
  SubmissionFormController,
  SubmissionFormContent,
} from '@/components/submission';

import * as styles from './submission-form.module.scss';

const orderedComponents = [Issue, Location, Time, Comments, Summary].map(
  fn => fn.name
);

export function SubmissionForm() {
  const [issues, setIssues] = useState<IssueType[]>([]);
  const [location, setLocation] = useState<LocationLatLng>({
    // default location is the City Hall
    latitude: 43.65322,
    longitude: -79.384452,
  });

  const [parkingDuration, setParkingDuration] = useState<ParkingDuration>(
    ParkingDuration.Minutes
  );
  const [dateTime, setDateTime] = useState<Date>(new Date());
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [comments, setComments] = useState('');

  const parkingTime = {date: dateTime, parkingDuration: parkingDuration};

  const submission = {
    issues: issues,
    location: location,
    parkingTime: parkingTime,
    comments: comments,
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoaded(true);
      },
      () => {
        setLocationLoaded(true);
      }
    );
  }, []);

  const [step, setStep] = useState(0);

  const submissionPayload: SubmissionPayload = {
    latitude: submission.location.latitude,
    longitude: submission.location.longitude,
    issues: submission.issues,
    parking_time: submission.parkingTime.date,
    parking_duration: submission.parkingTime.parkingDuration,
    comments: submission.comments,
  };
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionResponsePayload>({
      status: SubmissionStatus.Summary,
    });

  return (
    <div className={styles.mainContent}>
      <header>
        <SubmissionProgressBar step={step} />
      </header>

      <section className={styles.mainContentBody}>
        <SubmissionFormContent
          formOrder={orderedComponents}
          step={step}
          issues={issues}
          setIssues={setIssues}
          location={location}
          setLocation={setLocation}
          parkingDuration={parkingDuration}
          setParkingDuration={setParkingDuration}
          dateTime={dateTime}
          setDateTime={setDateTime}
          comments={comments}
          setComments={setComments}
          submissionStatus={submissionStatus}
        />
      </section>

      <footer>
        <SubmissionFormController
          locationLoaded={locationLoaded}
          step={step}
          setStep={setStep}
          submissionPayload={submissionPayload}
          setSubmissionStatus={setSubmissionStatus}
          formOrder={orderedComponents}
          submissionStatus={submissionStatus}
        />
      </footer>
    </div>
  );
}
