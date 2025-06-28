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

const mockSubmission: SubmissionApiPayload = {
  id: 123,
  latitude: defaultMapCenter.latitude,
  longitude: defaultMapCenter.longitude,
  issues: [IssueType.Damaged],
  parking_time: '2025-01-01 23:00:00', // assumes UTC time
  parking_duration: ParkingDuration.Minutes,
  comments: 'test comment',
  submitted_datetime: '2025-02-01T01:00:00+00:00',
};

describe('FeedSubmissionItem', () => {
  test('Feed Submission Item date information should render correctly', () => {
    render(<FeedSubmissionItem submission={mockSubmission} />);
    const itemTitle = screen.getByRole('heading');
    expect(itemTitle.textContent === 'Wednesday, January 1, 2025');
    expect(
      itemTitle.getAttribute('title') ===
        'Encountered:  1/1/2025, 6:00:00 PM \nSubmitted:  1/31/2025, 8:00:00 PM'
    );
  });
});
