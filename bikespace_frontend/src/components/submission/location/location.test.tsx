import React from 'react';
import {render, screen} from '@testing-library/react';
import {faker} from '@faker-js/faker';

import {Location} from './Location';

describe('Test Location page component', () => {
  test('Title should be rendered properly', () => {
    render(
      <Location
        location={{
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        }}
        setLocation={jest.fn()}
      />
    );

    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'Where was the problem?'
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'Pin the location'
    );
  });
});
