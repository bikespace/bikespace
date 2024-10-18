import React from 'react';
import userEvent from '@testing-library/user-event';
import {render, screen} from '@testing-library/react';
import {faker} from '@faker-js/faker';
import {FormProvider, useForm} from 'react-hook-form';

import {SubmissionSchema} from '../schema';

import {Comments} from './Comments';

const MockForm = () => {
  const form = useForm<SubmissionSchema>({
    defaultValues: {
      comments: '',
    },
  });

  return (
    <FormProvider {...form}>
      <form>
        <Comments />
      </form>
    </FormProvider>
  );
};

describe('Comments', () => {
  test('Comments title should be rendered correctly', () => {
    render(<MockForm />);
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'Comments'
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'Any additional comments you want to add...'
    );
  });

  test('Dispatch action should be triggered when user types', async () => {
    render(<MockForm />);

    const text = faker.string.alpha();

    const textarea = screen.getByRole('textbox');

    await userEvent.type(textarea, text);

    expect(textarea).toHaveDisplayValue(text);
  });
});
