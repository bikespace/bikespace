import {
  useForm,
  FormProvider,
  FieldErrors,
  UseFormReturn,
} from 'react-hook-form';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from '@/config/query-client';

import {ParkingDuration, IssueType} from '@/interfaces/Submission';
import {defaultMapCenter} from '@/utils/map-utils';
import {useUserQuery} from '@/hooks/use-user-query';

import {Summary} from './Summary';
import {formOrder} from '../constants';
import {SubmissionSchema} from '../submission-form/schema';
import {SubmissionFormController} from '../submission-form-controller';

import type {UserApiPayload} from '@/interfaces/User';

// Mock the form wrappers
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

// mock a logged in user; specific return values will be set per-test
const baseUser = {
  id: 1,
  active: true,
  first_name: 'Test',
  last_name: 'Person',
  username: 'testuser',
  email: 'testuser@example.com',
  confirmed_at: '2025-01-01T01:01.000',
} as UserApiPayload;

jest.mock('@/hooks/use-user-query', () => ({
  useUserQuery: jest.fn(),
}));

// mock page navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {};
  },
}));

describe('Summary', () => {
  test('Summary text should render correctly', () => {
    // mock no user logged in
    (useUserQuery as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: false,
    });

    const {unmount} = render(
      <QueryClientProvider client={queryClient}>
        <MockSummary />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'Summary'
    );
    expect(screen.getByText(/Issues:/i)).toBeInTheDocument();
    expect(screen.getByText(/Location:/i)).toBeInTheDocument();
    expect(screen.getByText(/Time:/i)).toBeInTheDocument();
    expect(screen.getByText(/Parking duration needed:/i)).toBeInTheDocument();
    expect(screen.getByText(/Comments:/i)).toBeInTheDocument();

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
        /something went wrong on our end processing your submission/i
      )
    ).toBeInTheDocument();
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
    expect(
      screen.getByText(/something went wrong beyond our expectations/i)
    ).toBeInTheDocument();
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

  test('When user details are being fetched, a loading indicator is shown', () => {
    // mock no user logged in
    (useUserQuery as jest.Mock).mockReturnValue({
      isFetching: true,
      isSuccess: false,
      isError: false,
    });

    const {unmount} = render(
      <QueryClientProvider client={queryClient}>
        <MockSummary />
      </QueryClientProvider>
    );

    const userDescription = screen.getByText(/submitting as/i).parentElement;
    expect(userDescription).toBeInTheDocument();
    expect(
      within(userDescription!).getByRole('status', {name: /loading/i})
    ).toBeInTheDocument();

    // prevent state update 'act' error from form validation
    unmount();
  });

  test('When a user is logged in, their username is shown', () => {
    // mock logged in user
    (useUserQuery as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: true,
      isError: false,
      data: baseUser,
    });

    const {unmount} = render(
      <QueryClientProvider client={queryClient}>
        <MockSummary />
      </QueryClientProvider>
    );

    const userDescription = screen.getByText(/submitting as/i).parentElement;
    expect(userDescription).toBeInTheDocument();
    expect(
      within(userDescription!).getByText(baseUser.username)
    ).toBeInTheDocument();

    // prevent state update 'act' error from form validation
    unmount();
  });

  test("When a logged in user's details fail to load, an error message is shown", () => {
    // mock failed query for logged in user
    (useUserQuery as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: true,
      failureReason: 'test failure message',
    });

    const {unmount} = render(
      <QueryClientProvider client={queryClient}>
        <MockSummary />
      </QueryClientProvider>
    );

    const userDescription = screen.getByText(/submitting as/i).parentElement;
    expect(userDescription).toBeInTheDocument();
    expect(
      within(userDescription!).getByText(/test failure message/)
    ).toBeInTheDocument();
    expect(
      within(userDescription!).getByText(/test failure message/)
    ).toHaveRole('status');

    // prevent state update 'act' error from form validation
    unmount();
  });
});
