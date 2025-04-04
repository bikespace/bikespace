import React from 'react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import {FormProvider, useForm} from 'react-hook-form';

import {SubmissionSchema} from '../submission-form/schema';

import {IssueType} from '@/interfaces/Submission';

import {Issue} from './Issue';

interface MockIssueProps {
  issues?: IssueType[];
}

const MockIssue = ({issues = []}: MockIssueProps) => {
  const form = useForm<SubmissionSchema>({
    defaultValues: {
      issues,
    },
  });

  return (
    <FormProvider {...form}>
      <form>
        <Issue />
      </form>
    </FormProvider>
  );
};

describe('Issues', () => {
  test('Issues page title should should have correct text', () => {
    render(<MockIssue />);
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'What were the issue(s)?'
    );
  });

  test('Issues page shows all the issue types', () => {
    render(<MockIssue />);

    expect(
      screen.getAllByRole('checkbox').map(c => c.getAttribute('value'))
    ).toEqual(expect.arrayContaining(Object.values(IssueType)));
  });

  test('Checking empty checkbox should check issue', async () => {
    render(<MockIssue />);

    const checkbox = screen.getAllByRole('checkbox')[0];

    const user = userEvent.setup();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  test('Checking checked checkbox should uncheck issue', async () => {
    render(<MockIssue issues={[IssueType.NotProvided]} />);

    const checkbox = screen.getAllByRole('checkbox')[0];

    const user = userEvent.setup();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });
});
