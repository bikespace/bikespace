import {render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

import {useAuthStore} from '@/states/store';
import LoginForm from './LoginForm';

// set up mocks and test scaffolding
let testQueryClient: QueryClient;

const originalFetch = global.fetch;
let fetchMock: jest.Mock;

const mockJsonResponse = (
  ok: boolean,
  body: unknown,
  status = ok ? 200 : 400
) => ({ok, status, json: async () => body}) as Response;

const testUserDetails = {
  active: true,
  confirmed_at: null,
  email: 'testuser@test.com',
  first_name: 'Test',
  id: 1,
  last_name: 'User',
  username: 'testuser',
};

const renderLoginForm = () =>
  render(
    <QueryClientProvider client={testQueryClient}>
      <LoginForm />
    </QueryClientProvider>
  );

beforeEach(() => {
  testQueryClient = new QueryClient({
    defaultOptions: {queries: {retry: false}},
  });

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
    // mock /users/me response
    useAuthStore.setState({authToken: 'testauthtoken'});
    fetchMock.mockReturnValue(mockJsonResponse(true, testUserDetails));

    renderLoginForm();

    // wait for user query to succeed and logout button to render
    const logoutButton = await screen.findByRole('button', {
      name: /log\s?out/i,
    });
    expect(logoutButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(logoutButton);

    expect(useAuthStore.getState().authToken).toBe(null);
  });

  test('Logging in makes a properly formed request to the API and sets the authToken', async () => {
    // no /users/me query will be made if authToken is null
    renderLoginForm();

    expect(
      await screen.findByRole('button', {name: /log\s?in/i})
    ).toBeInTheDocument();

    fetchMock.mockReturnValue(
      mockJsonResponse(true, {
        response: {
          csrf_token: 'not_used',
          user: {
            authentication_token: 'testauthtoken',
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
    // no /users/me query will be made if authToken is null
    renderLoginForm();

    expect(
      await screen.findByRole('button', {name: /log\s?in/i})
    ).toBeInTheDocument();

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
    const testEmail = testUserDetails.email;
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
    // no /users/me query will be made if authToken is null
    renderLoginForm();

    expect(
      await screen.findByRole('button', {name: /log\s?in/i})
    ).toBeInTheDocument();

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
    const testEmail = testUserDetails.email;
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
    // no /users/me query will be made if authToken is null
    renderLoginForm();

    expect(
      await screen.findByRole('button', {name: /log\s?in/i})
    ).toBeInTheDocument();

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
    const testEmail = testUserDetails.email;
    const testPassword = 'testpassword';

    await user.type(screen.getByRole('textbox', {name: /email/i}), testEmail);
    await user.type(screen.getByLabelText(/password/i), testPassword);
    await user.click(screen.getByRole('button', {name: /log\s?in/i}));

    expect(screen.getByText(/unknown field error/i)).toBeInTheDocument();
  });

  test('A plain error response from the API (not a field error) is still shown to the user', async () => {
    // no /users/me query will be made if authToken is null
    renderLoginForm();

    expect(
      await screen.findByRole('button', {name: /log\s?in/i})
    ).toBeInTheDocument();

    fetchMock.mockReturnValue(
      mockJsonResponse(false, {
        response: {
          errors: ['Generic error message'],
        },
      })
    );

    const user = userEvent.setup();
    const testEmail = testUserDetails.email;
    const testPassword = 'testpassword';

    await user.type(screen.getByRole('textbox', {name: /email/i}), testEmail);
    await user.type(screen.getByLabelText(/password/i), testPassword);
    await user.click(screen.getByRole('button', {name: /log\s?in/i}));

    expect(screen.getByText(/generic error message/i)).toBeInTheDocument();
  });

  test('A client side error is thrown; no API response', async () => {
    // no /users/me query will be made if authToken is null
    renderLoginForm();

    expect(
      await screen.findByRole('button', {name: /log\s?in/i})
    ).toBeInTheDocument();

    fetchMock.mockImplementation(() => {
      throw new Error('Client side error');
    });

    const user = userEvent.setup();
    const testEmail = testUserDetails.email;
    const testPassword = 'testpassword';

    await user.type(screen.getByRole('textbox', {name: /email/i}), testEmail);
    await user.type(screen.getByLabelText(/password/i), testPassword);
    await user.click(screen.getByRole('button', {name: /log\s?in/i}));

    expect(screen.getByText(/client side error/i)).toBeInTheDocument();
  });

  test('A client side error with no message is thrown; no API response', async () => {
    // no /users/me query will be made if authToken is null
    renderLoginForm();

    expect(
      await screen.findByRole('button', {name: /log\s?in/i})
    ).toBeInTheDocument();

    fetchMock.mockImplementation(() => {
      throw new Error();
    });

    const user = userEvent.setup();
    const testEmail = testUserDetails.email;
    const testPassword = 'testpassword';

    await user.type(screen.getByRole('textbox', {name: /email/i}), testEmail);
    await user.type(screen.getByLabelText(/password/i), testPassword);
    await user.click(screen.getByRole('button', {name: /log\s?in/i}));

    expect(screen.getByText(/login failed/i)).toBeInTheDocument();
  });
});
