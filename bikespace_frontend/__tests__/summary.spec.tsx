import React, {useState} from 'react';
import {render, screen} from '@testing-library/react';
import Summary from '../src/components/Summary';
import {
  IssueType,
  LocationLatLng,
  ParkingDuration,
  SubmissionStatus,
} from '../src/interfaces/Submission';
import '@testing-library/jest-dom';

describe('Test the Summary component page', () => {
  const [issues, setIssues] = useState<IssueType[]>([
    IssueType.Abandoned,
    IssueType.Damaged,
  ]);
  const [location, setLocation] = useState<LocationLatLng>({
    // default location is the City Hall
    latitude: 43.65322,
    longitude: -79.384452,
  });
  const [parkingDuration, setParkingDuration] = useState<ParkingDuration>(
    ParkingDuration.Minutes
  );
  const [dateTime, setDateTime] = useState<Date>(new Date());
  const [comments, setComments] = useState('comments');
  const parkingTime = {date: dateTime, parkingDuration: parkingDuration};
  const submission = {
    issues: issues,
    location: location,
    parkingTime: parkingTime,
    comments: comments,
  };
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({
    status: 'summary',
  });
  render(
    <Summary submission={submission} submissionStatus={submissionStatus} />
  );
  test('summary text should render correctly', () => {
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      'Summary'
    );
    expect(screen.getByText(/issues:/i));
    expect(screen.getByText(/location:/i));
    expect(screen.getByText(/Time:/i));
    expect(screen.getByText(/Parking duration needed:/i));
    expect(screen.getByText(/Comments:/i));
  });
});
