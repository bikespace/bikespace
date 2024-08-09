import React from 'react';
import userEvent from '@testing-library/user-event';
import {render, screen} from '@testing-library/react';
import {faker} from '@faker-js/faker';

import {Comments} from './Comments';

describe('Comments', () => {
  test('Comments title should be rendered correctly', () => {
    render(<Comments comments="" onCommentsChanged={jest.fn()} />);
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'Comments'
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'Any additional comments you want to add...'
    );
  });

  test('Dispatch action should be triggered when user types', async () => {
    const onCommentsChanged = jest.fn();

    render(<Comments comments="" onCommentsChanged={onCommentsChanged} />);

    const text = faker.string.alpha();

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, text);
    expect(onCommentsChanged).toHaveBeenCalledTimes(text.length);
  });
});
