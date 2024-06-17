import React, {useState} from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import {Comments} from './Comments';

describe('Comments', () => {
  const [comments, setComments] = useState('');

  test('Comments title should be rendered correctly', () => {
    render(<Comments comments={comments} onCommentsChanged={setComments} />);
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      'Comments'
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'Any additional comments you want to add...'
    );
  });
});
