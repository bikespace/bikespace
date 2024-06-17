import React, {useState} from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import {IssueType} from '@/interfaces/Submission';

import {Issue} from './Issue';

describe('Test Issues page component', () => {
  const [issues, setIssues] = useState<IssueType[]>([]);
  test('Issues page title should should have correct text', () => {
    render(<Issue issues={issues} onIssuesChanged={setIssues} />);
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'What was the issue?'
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'Choose at least one'
    );
  });
  test('Issues page shows all the issue types', () => {
    render(<Issue issues={issues} onIssuesChanged={setIssues} />);
    expect(
      screen.getAllByRole('checkbox').map(c => c.getAttribute('value'))
    ).toEqual(expect.arrayContaining(Object.values(IssueType)));
  });
});
