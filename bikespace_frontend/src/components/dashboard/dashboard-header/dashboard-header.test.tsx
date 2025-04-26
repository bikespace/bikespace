import React from 'react';
import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {DashboardHeader} from './DashboardHeader';

jest.mock('@uidotdev/usehooks', () => ({
  useClickAway: jest.fn(),
}));

describe('DashboardHeader', () => {
  test('All DashboardHeader images have alt text', () => {
    render(<DashboardHeader />);
    expect(
      screen
        .getAllByRole('img')
        .map(img => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toBeTruthy();
  });

  test('Nav menu toggle has correct accessibility descriptions', async () => {
    const user = userEvent.setup();
    render(<DashboardHeader />);

    // no interaction
    const navMenuButton = screen.getByRole('button', {
      name: /show navigation menu/i,
    });
    expect(navMenuButton).toHaveAttribute('aria-expanded', 'false');

    // click -> open
    await user.click(navMenuButton);
    expect(navMenuButton).toHaveAccessibleName(/hide navigation menu/i);
    expect(navMenuButton).toHaveAttribute('aria-expanded', 'true');

    // click -> close
    await user.click(navMenuButton);
    expect(navMenuButton).toHaveAccessibleName(/show navigation menu/i);
    expect(navMenuButton).toHaveAttribute('aria-expanded', 'false');
  });
});
