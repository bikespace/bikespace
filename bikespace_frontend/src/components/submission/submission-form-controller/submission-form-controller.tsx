import React from 'react';
import {render, screen} from '@testing-library/react';
import {FormProvider, useForm} from 'react-hook-form';

import {SubmissionSchema} from '../schema';

import {SubmissionFormController} from './SubmissionFormController';

interface MockControllerProps {
  step: number;
}

const MockController = ({step}: MockControllerProps) => {
  const form = useForm<SubmissionSchema>({
    defaultValues: {
      issues: [],
    },
  });

  return (
    <FormProvider {...form}>
      <form>
        <SubmissionFormController step={step} setStep={jest.fn()} />
      </form>
    </FormProvider>
  );
};

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
    render(<MockController step={0} />);

    expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled();
  });
});
