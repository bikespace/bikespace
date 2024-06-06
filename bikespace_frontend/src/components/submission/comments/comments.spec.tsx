import React, {useState} from 'react';
import {render, screen} from '@testing-library/react';
import {Comments} from './Comments';
import '@testing-library/jest-dom';

describe('Test the Comments component', () => {
  const [comments, setComments] = useState('');
  render(<Comments comments={comments} onCommentsChanged={setComments} />);

  test('Comments title should be rendered correctly', () => {
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      'Comments'
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'Any additional comments you want to add...'
    );
  });
});
