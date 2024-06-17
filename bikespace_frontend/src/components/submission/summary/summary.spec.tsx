import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {faker} from '@faker-js/faker';

import {
  IssueType,
  Submission,
  ParkingDuration,
  SubmissionStatus,
} from '@/interfaces/Submission';

import {Summary} from './Summary';

const submission = {
  issues: faker.helpers.arrayElements(Object.values(IssueType)),
  location: {
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
  },
  parkingTime: {
    date: new Date(),
    parkingDuration: faker.helpers.arrayElement(Object.values(ParkingDuration)),
  },
  comments: faker.lorem.paragraph(),
} satisfies Submission;

describe('Summary', () => {
  beforeEach(() => {
    faker.seed(123);
  });

  test('summary text should render correctly', () => {
    render(
      <Summary
        submission={submission}
        submissionStatus={{status: SubmissionStatus.Summary}}
      />
    );

    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      'Summary'
    );
    expect(screen.getByText(/Issues:/i));
    expect(screen.getByText(/Location:/i));
    expect(screen.getByText(/Time:/i));
    expect(screen.getByText(/Parking duration needed:/i));
    expect(screen.getByText(/Comments:/i));
  });

  test('success status should render correct message', () => {
    render(
      <Summary
        submission={submission}
        submissionStatus={{status: SubmissionStatus.Success}}
      />
    );

    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      'Success'
    );
  });
});
