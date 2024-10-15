import React, {useState, useEffect} from 'react';
import dynamic from 'next/dynamic';
import {useForm, FormProvider} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';

import {
  IssueType,
  LocationLatLng,
  ParkingDuration,
  SubmissionPayload,
  SubmissionStatus,
  SubmissionResponsePayload,
} from '@/interfaces/Submission';

import {SubmissionSchema, submissionSchema} from './schema';

import {Issue} from '../issue';
import {Time} from '../time';
import {Comments} from '../comments';
import {Summary} from '../summary';
import {SubmissionProgressBar} from '../submission-progress-bar';
import {SubmissionFormController} from '../submission-form-controller';
import {SubmissionFormContent} from '../submission-form-content';

import {LocationProps} from '../location/Location';

import styles from './submission-form.module.scss';

const Location = dynamic<LocationProps>(() => import('../location/Location'), {
  loading: () => <></>,
  ssr: false,
});

// must use separate property for component labels in orderedComponents so that it isn't mangled during minification
export interface OrderedComponentsType {
  component: Function;
  label: string;
}

const orderedComponents = [
  {component: Issue, label: 'Issue'},
  {component: Location, label: 'Location'},
  {component: Time, label: 'Time'},
  {component: Comments, label: 'Comments'},
  {component: Summary, label: 'Summary'},
];

export function SubmissionForm() {
  const form = useForm<SubmissionSchema>({
    defaultValues: {
      issues: [],
      location: {
        // default location is the City Hall
        latitude: 43.65322,
        longitude: -79.384452,
      },
      parkingTime: {
        date: new Date(),
        parkingDuration: ParkingDuration.Minutes,
      },
      comments: '',
    },
    resolver: zodResolver(submissionSchema),
  });

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
    <FormProvider {...form}>
      <form className={styles.mainContent}>
        <header>
          <SubmissionProgressBar step={step} />
        </header>

        <section className={styles.mainContentBody}>
          <SubmissionFormContent
            formOrder={orderedComponents}
            step={step}
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
      </form>
    </FormProvider>
  );
}
