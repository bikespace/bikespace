import React from 'react';
import {render, screen} from '@testing-library/react';

import {SubmissionFormController} from './SubmissionFormController';
import {
  SubmissionPayload,
  SubmissionStatus,
  SubmissionResponsePayload,
} from '@/interfaces/Submission';
import {OrderedComponentsType} from '../submission-form/SubmissionForm';

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
    const mockFormOrder = [
      'Issue',
      'Location',
      'Time',
      'Comments',
      'Summary',
    ].map(l => ({label: l}) as OrderedComponentsType);
    render(
      <SubmissionFormController
        step={0}
        setStep={jest.fn()}
        submissionPayload={mockSubmissionPayload}
        setSubmissionStatus={jest.fn()}
        formOrder={mockFormOrder}
        submissionStatus={mockSubmissionResponsePayload}
      />
    );
    expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled();
  });
});
