import {render, screen, waitFor} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from '@/config/query-client';

import {useUserQuery} from '@/hooks/use-user-query';
import {useAuthStore} from '@/states/store';
import LoginForm from './LoginForm';

// set up fetch mock
const originalFetch = global.fetch;
let fetchMock: jest.Mock;

const mockJsonResponse = (ok: boolean, body: unknown) =>
  ({ok, json: async () => body}) as Response;

// specific return values are set per test
jest.mock('@/hooks/use-user-query', () => ({
  useUserQuery: jest.fn(),
}));

// const mockSetAuthToken = jest.fn();
// let mockAuthToken: string | null = null;
// jest.mock('@/states/store', () => ({
//   useAuthStore: () => ({
//     authToken: mockAuthToken,
//     setAuthToken: mockSetAuthToken,
//   }),
// }));

beforeEach(() => {
  fetchMock = jest.fn();
  global.fetch = fetchMock;

  useAuthStore.setState({authToken: null});
  localStorage.clear();
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('LoginForm', () => {
  test('Logging out sets authToken to null', async () => {
    (useUserQuery as jest.Mock).mockReturnValue({
      isSuccess: true,
    });
    useAuthStore.setState({authToken: 'testauthtoken'});
    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>
    );

    const logoutButton = screen.getByRole('button', {name: /log\s?out/i});
    expect(logoutButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(logoutButton);

    expect(useAuthStore.getState().authToken).toBe(null);
  });

  test('Logging in makes a properly formed request to the API', async () => {
    (useUserQuery as jest.Mock).mockReturnValue({
      isSuccess: false,
    });
    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>
    );

    expect(screen.getByRole('button', {name: /log\s?in/i})).toBeInTheDocument();

    const user = userEvent.setup();
    const testEmail = 'testuser@test.com';
    const testPassword = 'testpassword';

    await user.type(screen.getByRole('textbox', {name: /email/i}), testEmail);
    await user.type(screen.getByLabelText(/password/i), testPassword);
    await user.click(screen.getByRole('button', {name: /log\s?in/i}));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/admin/login/?include_auth_token'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining(
          JSON.stringify({
            email: testEmail,
            password: testPassword,
          })
        ),
      })
    );
  });
});

// cases to cover:
// [x] logout calls clear token (already in e2e)
// [x] login calls api (already in e2e)
// [ ] password field error
// [ ] username field error
// [ ] other unknown error with 200 response
// [ ] error response
