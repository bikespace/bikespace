import React from 'react';
import {render, screen} from '@testing-library/react';

import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from '@/config/query-client';

import {useUserQuery} from '@/hooks/use-user-query';

import ProfileDetails from './ProfileDetails';

import type {UserApiPayload} from '@/interfaces/User';

const baseUser = {
  id: 1,
  active: true,
  first_name: 'Test',
  last_name: 'Person',
  username: 'testuser',
  email: 'testuser@example.com',
  confirmed_at: '2025-01-01T01:01.000',
} as UserApiPayload;

// specific return values are set per test
jest.mock('@/hooks/use-user-query', () => ({
  useUserQuery: jest.fn(),
}));

// mock a logged in user
jest.mock('@/states/store', () => ({
  useAuthStore: () => ({
    authToken: '1234',
    setAuthToken: jest.fn(),
  }),
}));

describe('ProfileDetails', () => {
  test('Logged in user has a first and last name', () => {
    // render with mocked user details
    (useUserQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isSuccess: true,
      isError: false,
      data: baseUser,
    });
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileDetails />
      </QueryClientProvider>
    );

    expect(
      screen.getByRole('heading', {name: 'Test Person'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /log\s?out/i})
    ).toBeInTheDocument();
  });

  test('Logged in user only has a first name', () => {
    // render with mocked user details
    (useUserQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isSuccess: true,
      isError: false,
      data: {...baseUser, last_name: null},
    });
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileDetails />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', {name: 'Test'})).toBeInTheDocument();
  });

  test('Logged in user only has a last name', () => {
    // render with mocked user details
    (useUserQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isSuccess: true,
      isError: false,
      data: {...baseUser, first_name: null},
    });
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileDetails />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', {name: 'Person'})).toBeInTheDocument();
  });

  test('Logged in user only has no first or last name', () => {
    // render with mocked user details
    (useUserQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isSuccess: true,
      isError: false,
      data: {...baseUser, first_name: null, last_name: null},
    });
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileDetails />
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', {name: 'testuser'})).toBeInTheDocument();
  });
});
