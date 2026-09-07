import {render, screen} from '@testing-library/react';
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

  test('A password field error from the API is correctly shown to the user', async () => {
    (useUserQuery as jest.Mock).mockReturnValue({
      isSuccess: false,
    });
    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>
    );

    expect(screen.getByRole('button', {name: /log\s?in/i})).toBeInTheDocument();

    fetchMock.mockReturnValue(
      mockJsonResponse(false, {
        response: {
          errors: ['Invalid password'],
          field_errors: {
            password: ['Invalid password'],
          },
        },
      })
    );

    const user = userEvent.setup();
    const testEmail = 'testuser@test.com';
    const testPassword = 'wrongpassword';

    await user.type(screen.getByRole('textbox', {name: /email/i}), testEmail);
    await user.type(screen.getByLabelText(/password/i), testPassword);
    await user.click(screen.getByRole('button', {name: /log\s?in/i}));

    expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInvalid();
    expect(
      screen.getByLabelText(/password/i).getAttribute('aria-describedby')
    ).toEqual(screen.getByText(/invalid password/i).id);
  });

  test('A username field error from the API is correctly shown to the user', async () => {
    (useUserQuery as jest.Mock).mockReturnValue({
      isSuccess: false,
    });
    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>
    );

    expect(screen.getByRole('button', {name: /log\s?in/i})).toBeInTheDocument();

    fetchMock.mockReturnValue(
      mockJsonResponse(false, {
        response: {
          errors: ['Specified user does not exist'],
          field_errors: {
            email: ['Specified user does not exist'],
          },
        },
      })
    );

    const user = userEvent.setup();
    const testEmail = 'wronguser@test.com';
    const testPassword = 'testpassword';

    await user.type(screen.getByRole('textbox', {name: /email/i}), testEmail);
    await user.type(screen.getByLabelText(/password/i), testPassword);
    await user.click(screen.getByRole('button', {name: /log\s?in/i}));

    expect(screen.getByText(/user does not exist/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInvalid();
    expect(
      screen.getByLabelText(/email/i).getAttribute('aria-describedby')
    ).toEqual(screen.getByText(/user does not exist/i).id);
  });

  test('An unknown field error from the API is still shown to the user', async () => {
    (useUserQuery as jest.Mock).mockReturnValue({
      isSuccess: false,
    });
    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>
    );

    expect(screen.getByRole('button', {name: /log\s?in/i})).toBeInTheDocument();

    fetchMock.mockReturnValue(
      mockJsonResponse(false, {
        response: {
          errors: ['Unknown field error'],
          field_errors: {
            unknown_field: ['Unknown field error'],
          },
        },
      })
    );

    const user = userEvent.setup();
    const testEmail = 'testuser@test.com';
    const testPassword = 'testpassword';

    await user.type(screen.getByRole('textbox', {name: /email/i}), testEmail);
    await user.type(screen.getByLabelText(/password/i), testPassword);
    await user.click(screen.getByRole('button', {name: /log\s?in/i}));

    expect(screen.getByText(/unknown field error/i)).toBeInTheDocument();
  });

  test('A plain error response from the API (not a field error) is still shown to the user', async () => {
    (useUserQuery as jest.Mock).mockReturnValue({
      isSuccess: false,
    });
    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>
    );

    expect(screen.getByRole('button', {name: /log\s?in/i})).toBeInTheDocument();

    fetchMock.mockReturnValue(
      mockJsonResponse(false, {
        response: {
          errors: ['Generic error message'],
        },
      })
    );

    const user = userEvent.setup();
    const testEmail = 'testuser@test.com';
    const testPassword = 'testpassword';

    await user.type(screen.getByRole('textbox', {name: /email/i}), testEmail);
    await user.type(screen.getByLabelText(/password/i), testPassword);
    await user.click(screen.getByRole('button', {name: /log\s?in/i}));

    expect(screen.getByText(/generic error message/i)).toBeInTheDocument();
  });

  test('A client side error is thrown; no API response', async () => {
    (useUserQuery as jest.Mock).mockReturnValue({
      isSuccess: false,
    });
    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>
    );

    expect(screen.getByRole('button', {name: /log\s?in/i})).toBeInTheDocument();

    fetchMock.mockImplementation(() => {
      throw new Error('Client side error');
    });

    const user = userEvent.setup();
    const testEmail = 'testuser@test.com';
    const testPassword = 'testpassword';

    await user.type(screen.getByRole('textbox', {name: /email/i}), testEmail);
    await user.type(screen.getByLabelText(/password/i), testPassword);
    await user.click(screen.getByRole('button', {name: /log\s?in/i}));

    expect(screen.getByText(/client side error/i)).toBeInTheDocument();
  });

  test('A client side error with no message is thrown; no API response', async () => {
    (useUserQuery as jest.Mock).mockReturnValue({
      isSuccess: false,
    });
    render(
      <QueryClientProvider client={queryClient}>
        <LoginForm />
      </QueryClientProvider>
    );

    expect(screen.getByRole('button', {name: /log\s?in/i})).toBeInTheDocument();

    fetchMock.mockImplementation(() => {
      throw new Error();
    });

    const user = userEvent.setup();
    const testEmail = 'testuser@test.com';
    const testPassword = 'testpassword';

    await user.type(screen.getByRole('textbox', {name: /email/i}), testEmail);
    await user.type(screen.getByLabelText(/password/i), testPassword);
    await user.click(screen.getByRole('button', {name: /log\s?in/i}));

    expect(screen.getByText(/login failed/i)).toBeInTheDocument();
  });
});

// cases to cover:
// [x] logout calls clear token (already in e2e)
// [x] login calls api (already in e2e)
// [x] password field error
// [x] username field error
// [x] what happens if it's just an error field in the API response and not a field error? - use errors: ['You are already authenticated...']
// [x] error with no API response
// [x] document somewhere that the form of the error response is set by flask-security
