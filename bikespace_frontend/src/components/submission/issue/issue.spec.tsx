import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';

import {IssueType} from '@/interfaces/Submission';

import {Issue} from './Issue';

describe('Issues', () => {
  test('Issues page title should should have correct text', () => {
    render(<Issue issues={[]} onIssuesChanged={jest.fn()} />);
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'What was the issue?'
    );
    expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
      'Choose at least one'
    );
  });

  test('Issues page shows all the issue types', () => {
    render(<Issue issues={[]} onIssuesChanged={jest.fn()} />);
    expect(
      screen.getAllByRole('checkbox').map(c => c.getAttribute('value'))
    ).toEqual(expect.arrayContaining(Object.values(IssueType)));
  });

  test('Dispatches action when checkbox is clicked', () => {
    const onIssuesChanged = jest.fn();

    render(<Issue issues={[]} onIssuesChanged={onIssuesChanged} />);
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(onIssuesChanged).toHaveBeenCalledTimes(1);
  });

  test('Checkbox is unchecked when issue is absent from state array', () => {
    render(<Issue issues={[]} onIssuesChanged={jest.fn()} />);

    const checkbox = screen.getAllByRole('checkbox')[0];

    expect(checkbox).not.toBeChecked();
  });

  test('Checkbox is checked when issue is present in state array', async () => {
    render(
      <Issue issues={Object.values(IssueType)} onIssuesChanged={jest.fn()} />
    );

    const checkbox = screen.getAllByRole('checkbox')[0];

    expect(checkbox).toBeChecked();
  });
});
