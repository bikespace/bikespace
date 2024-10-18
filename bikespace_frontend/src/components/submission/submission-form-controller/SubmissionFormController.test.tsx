import React from 'react';
import {render, screen} from '@testing-library/react';

import {SubmissionFormController} from './SubmissionFormController';

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
    render(<SubmissionFormController step={0} setStep={jest.fn()} />);

    expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled();
  });
});
