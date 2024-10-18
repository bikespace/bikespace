import React from 'react';
import {render, screen} from '@testing-library/react';
import {FormProvider, useForm} from 'react-hook-form';

import {SubmissionSchema} from '../schema';

import {Location} from './Location';

const MockLocation = () => {
  const form = useForm<SubmissionSchema>({
    defaultValues: {
      location: {
        latitude: 43.65322,
        longitude: -79.384452,
      },
    },
  });

  return (
    <FormProvider {...form}>
      <form>
        <Location handler={<></>} />
      </form>
    </FormProvider>
  );
};

describe('Test Location page component', () => {
  test('Title should be rendered properly', () => {
    render(<MockLocation />);

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'Where was the problem?'
    );
  });
});
