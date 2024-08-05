import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';

import {SubmissionFormController} from './SubmissionFormController';
import {
  SubmissionPayload,
  SubmissionStatus,
  SubmissionResponsePayload,
} from '@/interfaces/Submission';

// Mock useRouter:
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
    };
  },
}));

describe('SubmissionFormController', () => {
  test('Next button should be disabled on issues page if no issue is selected', () => {
    const mockSubmissionPayload = {issues: []} as unknown as SubmissionPayload;
    const mockSubmissionResponsePayload = {
      status: SubmissionStatus.Summary,
    } as SubmissionResponsePayload;
    render(
      <SubmissionFormController
        locationLoaded={true}
        step={0}
        setStep={jest.fn()}
        submissionPayload={mockSubmissionPayload}
        setSubmissionStatus={jest.fn()}
        formOrder={['Issue', 'Location', 'Time', 'Comments', 'Summary']}
        submissionStatus={mockSubmissionResponsePayload}
      />
    );
    expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled();
  });
});
