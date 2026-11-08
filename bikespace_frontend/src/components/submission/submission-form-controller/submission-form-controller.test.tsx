import React from 'react';
import {render, screen} from '@testing-library/react';
import {DefaultValues, FormProvider, useForm} from 'react-hook-form';

import {IssueType, ParkingDuration} from '@/interfaces/Submission';

import {
  SubmissionSchema,
  submissionSchemaResolver,
} from '../submission-form/schema';

import {SubmissionFormController} from './SubmissionFormController';

interface MockControllerProps {
  step: number;
  defaultValues?: DefaultValues<SubmissionSchema>;
}

const validDefaults: DefaultValues<SubmissionSchema> = {
  issues: [IssueType.Full],
  location: {latitude: 43.65, longitude: -79.38},
  parkingTime: {
    date: new Date(),
    parkingDuration: ParkingDuration.Minutes,
  },
  comments: '',
};

const MockController = ({
  step,
  defaultValues = validDefaults,
}: MockControllerProps) => {
  const form = useForm<SubmissionSchema>({
    defaultValues,
    resolver: submissionSchemaResolver,
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
    render(
      <MockController step={0} defaultValues={{...validDefaults, issues: []}} />
    );

    expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled();
  });

  test('Next button should be enabled on issues page if an issue is selected', () => {
    render(<MockController step={0} />);

    expect(screen.getByRole('button', {name: 'Next'})).toBeEnabled();
  });

  describe('when the date is invalid', () => {
    const invalidDateDefaults: DefaultValues<SubmissionSchema> = {
      ...validDefaults,
      parkingTime: {
        date: new Date(''),
        parkingDuration: ParkingDuration.Minutes,
      },
    };

    test('Next button should be disabled on the time page', () => {
      render(<MockController step={2} defaultValues={invalidDateDefaults} />);

      expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled();
    });

    test.each([
      [0, 'issues'],
      [1, 'location'],
    ])('Next button should be enabled on an earlier step (%i: %s)', step => {
      render(
        <MockController step={step} defaultValues={invalidDateDefaults} />
      );

      expect(screen.getByRole('button', {name: 'Next'})).toBeEnabled();
    });
  });
});
