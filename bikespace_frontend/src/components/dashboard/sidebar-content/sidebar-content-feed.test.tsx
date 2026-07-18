import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  IssueType,
  ParkingDuration,
  SubmissionApiPayload,
} from '@/interfaces/Submission';
import {useStore} from '@/states/store';

import {FEED_PAGE_SIZE, SidebarContentFeed} from './_SidebarContentFeed';

jest.mock('@/hooks', () => ({
  useSubmissionsQuery: () => ({isLoading: false}),
}));

jest.mock('@/hooks/use-is-mobile', () => ({
  useIsMobile: () => false,
}));

jest.mock('../feed-submission-item', () => {
  const React = jest.requireActual('react');

  return {
    FeedSubmissionItem: React.forwardRef(
      (
        {
          submission,
          onClick,
        }: {
          submission: SubmissionApiPayload;
          onClick: React.MouseEventHandler<HTMLButtonElement>;
        },
        ref: React.ForwardedRef<HTMLButtonElement>
      ) => (
        <button ref={ref} onClick={onClick}>
          Submission {submission.id}
        </button>
      )
    ),
  };
});

const submissions: SubmissionApiPayload[] = Array.from(
  {length: 120},
  (_, index) => ({
    id: index + 1,
    latitude: 43.65,
    longitude: -79.38,
    issues: [IssueType.Damaged],
    parking_time: '2025-01-01 12:00:00',
    parking_duration: ParkingDuration.Minutes,
    comments: '',
    submitted_datetime: '2025-01-01T12:00:00+00:00',
  })
);

describe('SidebarContentFeed', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    useStore.getState().ui.submissions.setSelectedSubmission(null);
    useStore.getState().setSubmissions(submissions);
  });

  test('renders only the newest page of submissions initially', () => {
    render(<SidebarContentFeed />);

    expect(screen.getAllByText(/Submission \d+/)).toHaveLength(FEED_PAGE_SIZE);
    expect(screen.getByText('Submission 120')).toBeInTheDocument();
    expect(screen.queryByText('Submission 70')).not.toBeInTheDocument();
  });

  test('loads the next page on demand', async () => {
    const user = userEvent.setup();
    render(<SidebarContentFeed />);

    await user.click(
      screen.getByRole('button', {name: 'Load more submissions'})
    );

    expect(screen.getAllByText(/Submission \d+/)).toHaveLength(
      FEED_PAGE_SIZE * 2
    );
    expect(screen.getByText('Submission 70')).toBeInTheDocument();
  });

  test('expands the feed to reveal a selected older submission', () => {
    useStore.getState().ui.submissions.setSelectedSubmission(60);

    render(<SidebarContentFeed />);

    expect(screen.getByText('Submission 60')).toBeInTheDocument();
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
