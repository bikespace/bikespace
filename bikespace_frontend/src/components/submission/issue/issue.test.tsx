import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {FormProvider, useForm} from 'react-hook-form';

import {SubmissionSchema} from '../schema';

import {IssueType} from '@/interfaces/Submission';

import {Issue} from './Issue';

interface MockFormProps {
  issues?: IssueType[];
}

const MockForm = ({issues = []}: MockFormProps) => {
  const form = useForm<SubmissionSchema>({
    defaultValues: {
      issues,
    },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={jest.fn()}>
        <Issue />
      </form>
    </FormProvider>
  );
};

describe('Issues', () => {
  test('Issues page title should should have correct text', () => {
    render(<MockForm />);
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'What was the issue?'
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'Choose at least one'
    );
  });

  test('Issues page shows all the issue types', () => {
    render(<MockForm />);
    expect(
      screen.getAllByRole('checkbox').map(c => c.getAttribute('value'))
    ).toEqual(expect.arrayContaining(Object.values(IssueType)));
  });

  test('Checking empty checkbox should check issue', () => {
    render(<MockForm />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  test('Checking checked checkbox should uncheck issue', async () => {
    render(<MockForm issues={[IssueType.NotProvided]} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });
});
