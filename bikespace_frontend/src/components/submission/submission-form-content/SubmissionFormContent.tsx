import React from 'react';
import dynamic from 'next/dynamic';

import {
  IssueType,
  LocationLatLng,
  ParkingDuration,
  SubmissionResponsePayload,
} from '@/interfaces/Submission';

import {Issue} from '../issue';
import {Time} from '../time';
import {Comments} from '../comments';
import {Summary} from '../summary';

import {LocationProps} from '../location';
import {OrderedComponentsType} from '../submission-form/SubmissionForm';

interface SubmissionFormContentProps {
  formOrder: OrderedComponentsType[];
  step: number;
  issues: IssueType[];
  setIssues: React.Dispatch<React.SetStateAction<IssueType[]>>;
  location: LocationLatLng;
  setLocation: React.Dispatch<React.SetStateAction<LocationLatLng>>;
  parkingDuration: ParkingDuration;
  setParkingDuration: React.Dispatch<React.SetStateAction<ParkingDuration>>;
  dateTime: Date;
  setDateTime: React.Dispatch<React.SetStateAction<Date>>;
  comments: string;
  setComments: React.Dispatch<React.SetStateAction<string>>;
  submissionStatus: SubmissionResponsePayload;
}

const Location = dynamic<LocationProps>(() => import('../location/Location'), {
  loading: () => <></>,
  ssr: false,
});

export function SubmissionFormContent({
  formOrder,
  step,
  issues,
  setIssues,
  location,
  setLocation,
  parkingDuration,
  setParkingDuration,
  dateTime,
  setDateTime,
  comments,
  setComments,
  submissionStatus,
}: SubmissionFormContentProps) {
  switch (formOrder[step].label) {
    case 'Issue':
      return <Issue issues={issues} onIssuesChanged={setIssues} />;
    case 'Location':
      return <Location location={location} setLocation={setLocation} />;
    case 'Time':
      return (
        <Time
          parkingDuration={parkingDuration}
          onParkingDurationChanged={setParkingDuration}
          dateTime={dateTime}
          onDateTimeChanged={setDateTime}
        />
      );
    case 'Comments':
      return <Comments comments={comments} onCommentsChanged={setComments} />;
    case 'Summary': {
      const submission = {
        issues: issues,
        location: location,
        parkingTime: {
          date: dateTime,
          parkingDuration: parkingDuration,
        },
        comments: comments,
      };

      return (
        <Summary submission={submission} submissionStatus={submissionStatus} />
      );
    }
    default:
      throw new Error('Undefined component set to load');
  }
}
