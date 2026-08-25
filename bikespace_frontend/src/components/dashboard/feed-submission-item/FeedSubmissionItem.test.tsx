import {render, screen} from '@testing-library/react';

import {
  SubmissionApiPayload,
  IssueType,
  ParkingDuration,
} from '@/interfaces/Submission';
import {defaultMapCenter} from '@/utils/map-utils';

import {FeedSubmissionItem} from './FeedSubmissionItem';

jest.mock('next/navigation', () => ({
  useRouter() {
    return {};
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
}));

jest.mock('@/hooks/use-is-mobile', () => ({
  useIsMobile: jest.fn(),
}));

const mockSubmission: SubmissionApiPayload = {
  id: 123,
  latitude: defaultMapCenter.latitude,
  longitude: defaultMapCenter.longitude,
  issues: [IssueType.Damaged],
  parking_time: '2025-01-01 23:00:00', // assumes UTC time
  parking_duration: ParkingDuration.Minutes,
  comments: 'test comment',
  submitted_datetime: '2025-02-01T01:00:00+00:00',
  user: null,
};

describe('FeedSubmissionItem', () => {
  test('Feed Submission Item adds style class when focused', () => {
    render(
      <FeedSubmissionItem
        submission={mockSubmission}
        isFocused={true}
        onClick={jest.fn()}
      />
    );
    expect(screen.getByRole('button')).toHaveClass('focused');
  });

  test('Feed Submission Item date information should render correctly', () => {
    render(
      <FeedSubmissionItem
        submission={mockSubmission}
        isFocused={false}
        onClick={jest.fn()}
      />
    );
    const itemTitle = screen.getByRole('heading');
    expect(itemTitle.textContent === 'Wednesday, January 1, 2025');
    expect(
      itemTitle.getAttribute('title') ===
        'Encountered:  1/1/2025, 6:00:00 PM \nSubmitted:  1/31/2025, 8:00:00 PM'
    );
  });

  test('Feed Submission Item with null parking_duration and submitted_datetime handles the missing values gracefully', () => {
    render(
      <FeedSubmissionItem
        submission={{
          ...mockSubmission,
          // @ts-expect-error 2322
          parking_duration: null,
          submitted_datetime: null,
        }}
        isFocused={false}
        onClick={jest.fn()}
      />
    );
    expect(
      screen.queryByText(/wanted to park for/i)?.parentElement?.textContent
    ).toMatch(/unknown/i);
    const itemTitle = screen.getByRole('heading');
    expect(
      itemTitle.getAttribute('title') ===
        'Encountered:  1/1/2025, 6:00:00 PM \nSubmitted:  Not Recorded'
    );
  });

  test('Feed Submission Item without user does not render user line at all', () => {
    render(
      <FeedSubmissionItem
        submission={mockSubmission}
        isFocused={false}
        onClick={jest.fn()}
      />
    );
    expect(screen.queryByText(/submitted by/i)).not.toBeInTheDocument();
  });

  test('Feed Submission Item with user renders the username', () => {
    render(
      <FeedSubmissionItem
        submission={{...mockSubmission, user: 'testuser'}}
        isFocused={false}
        onClick={jest.fn()}
      />
    );
    expect(screen.queryByText(/submitted by testuser/i)).toBeInTheDocument();
  });
});
