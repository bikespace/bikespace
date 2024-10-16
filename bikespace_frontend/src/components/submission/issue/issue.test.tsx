import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';

import {IssueType} from '@/interfaces/Submission';

import {Issue} from './Issue';

describe('Issues', () => {
  test('Issues page title should should have correct text', () => {
    render(<Issue />);
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'What was the issue?'
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'Choose at least one'
    );
  });

  test('Issues page shows all the issue types', () => {
    render(<Issue />);
    expect(
      screen.getAllByRole('checkbox').map(c => c.getAttribute('value'))
    ).toEqual(expect.arrayContaining(Object.values(IssueType)));
  });

  test('Dispatches action when checkbox is clicked', () => {
    const onIssuesChanged = jest.fn();

    render(<Issue />);
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(onIssuesChanged).toHaveBeenCalledTimes(1);
  });

  test('Checking empty checkbox should add issue to array', () => {
    const onIssuesChanged = jest.fn();

    render(<Issue />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    expect(onIssuesChanged).toHaveBeenCalledWith([IssueType.NotProvided]);
  });

  test('Checking checked checkbox should remove issue to array', async () => {
    const onIssuesChanged = jest.fn();

    render(<Issue />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(onIssuesChanged).toHaveBeenCalledWith([]);
  });
});
