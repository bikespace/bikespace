import React, {useState} from 'react';

import {render, screen} from '@testing-library/react';
import {Issue} from './Issue';
import {IssueType} from '../../../interfaces/Submission';
import '@testing-library/jest-dom';

describe('Test Issues page component', () => {
  const [issues, setIssues] = useState<IssueType[]>([]);
  render(<Issue issues={issues} onIssuesChanged={setIssues} />);
  test('Issues page title should title should have correct text', () => {
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'What was the issue?'
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'Choose at least one'
    );
  });
  //Need to add tests for the each of list of rendered issues
});
