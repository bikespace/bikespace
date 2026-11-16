import {IssueType, ParkingDuration} from '@/interfaces/Submission';

import {submissionSchema} from './schema';

const validSubmission = {
  issues: [IssueType.Damaged],
  location: {latitude: 43.65, longitude: -79.38},
  parkingTime: {date: new Date(), parkingDuration: ParkingDuration.Minutes},
  comments: '',
};

describe('submissionSchema', () => {
  test('accepts a valid submission', () => {
    expect(submissionSchema.safeParse(validSubmission).success).toBe(true);
  });

  test('a cleared date and time shows a friendly message', () => {
    // Clearing the datetime-local input sets `new Date('')`, an Invalid Date
    const result = submissionSchema.safeParse({
      ...validSubmission,
      parkingTime: {...validSubmission.parkingTime, date: new Date('')},
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues
        .filter(issue => issue.path.join('.') === 'parkingTime.date')
        .map(issue => issue.message)
    ).toEqual(['Date and time are required.']);
  });
});
