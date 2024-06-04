import React from 'react';

import {
  IssueType,
  LocationLatLng,
  ParkingDuration,
} from '@/interfaces/Submission';

import {
  Issue,
  Location,
  Time,
  Comments,
  Summary,
} from '@/components/submission';

interface SubmissionFormContentProps {
  formOrder: string[];
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
  submissionStatus: {status: string};
}

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
  switch (formOrder[step]) {
    case Issue.name:
      return <Issue issues={issues} onIssuesChanged={setIssues} />;
    case Location.name:
      return <Location location={location} onLocationChanged={setLocation} />;
    case Time.name:
      return (
        <Time
          parkingDuration={parkingDuration}
          onParkingDurationChanged={setParkingDuration}
          dateTime={dateTime}
          onDateTimeChanged={setDateTime}
        />
      );
    case Comments.name:
      return <Comments comments={comments} onCommentsChanged={setComments} />;
    case Summary.name: {
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
