import {
  useForm,
  FormProvider,
  FieldErrors,
  UseFormReturn,
} from 'react-hook-form';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from '@/config/query-client';

import {ParkingDuration, IssueType} from '@/interfaces/Submission';
import {defaultMapCenter} from '@/utils/map-utils';

import {Summary} from './Summary';
import {formOrder} from '../constants';
import {SubmissionSchema} from '../submission-form/schema';
import {SubmissionFormController} from '../submission-form-controller';

interface WrapperProps {
  errors?: FieldErrors<SubmissionSchema>;
  onSubmit?: (form: UseFormReturn<SubmissionSchema>) => void;
}

const MockSummary = ({errors, onSubmit = jest.fn()}: WrapperProps) => {
  const form = useForm<SubmissionSchema>({
    defaultValues: {
      issues: [IssueType.Damaged],
      location: defaultMapCenter,
      parkingTime: {
        date: new Date(),
        parkingDuration: ParkingDuration.Minutes,
      },
      comments: '',
    },
    errors,
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(() => {
          onSubmit(form);
        })}
      >
        <Summary />
        <SubmissionFormController
          step={formOrder.length - 1}
          setStep={jest.fn()}
        />
      </form>
    </FormProvider>
  );
};

jest.mock('next/navigation', () => ({
  useRouter() {
    return {};
  },
}));

describe('Summary', () => {
  test('Summary text should render correctly', () => {
    const {unmount} = render(
      <QueryClientProvider client={queryClient}>
        <MockSummary />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'Summary'
    );
    expect(screen.getByText(/Issues:/i));
    expect(screen.getByText(/Location:/i));
    expect(screen.getByText(/Time:/i));
    expect(screen.getByText(/Parking duration needed:/i));
    expect(screen.getByText(/Comments:/i));

    // prevent state update 'act' error from form validation
    unmount();
  });

  test('Success response status should render correct message', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MockSummary />
      </QueryClientProvider>
    );

    const submitButton = screen.getByText('Submit');

    const user = userEvent.setup();

    await user.click(submitButton);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'Success'
    );
  });

  test('Error response status should render correct message', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MockSummary
          onSubmit={(form: UseFormReturn<SubmissionSchema>) => {
            form.setError('root.serverError', {message: 'Error'});
          }}
        />
      </QueryClientProvider>
    );

    const submitButton = screen.getByText('Submit');

    const user = userEvent.setup();

    await user.click(submitButton);

    expect(
      screen.getByText(
        /Something went wrong on our end processing your submission/
      )
    );
  });

  test('Unexpected response status should render correct message', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MockSummary
          onSubmit={(form: UseFormReturn<SubmissionSchema>) => {
            form.setError('root.unexpected', {message: 'Error'});
          }}
        />
      </QueryClientProvider>
    );

    const submitButton = screen.getByText('Submit');

    const user = userEvent.setup();

    await user.click(submitButton);

    expect(screen.getByText(/Something went wrong beyond our expectations/));
  });

  test('View Your Submission button links to correct dashboard URL when submissionId is present', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MockSummary
          onSubmit={(form: UseFormReturn<SubmissionSchema>) => {
            // simulate successful submission response including submissionId
            form.setValue('submissionId', '123');
          }}
        />
      </QueryClientProvider>
    );

    const user = userEvent.setup();

    // submit the form to reach the success state
    await user.click(screen.getByText('Submit'));

    // find the "View Your Submission" button text
    const buttonText = screen.getByText('View Your Submission');

    // get the surrounding link
    const link = buttonText.closest('a');

    expect(link).toHaveAttribute(
      'href',
      '/dashboard?tab=feed&submission_id=123'
    );
  });
});
