import {test, expect} from '@playwright/test';

import {defaultTestOptions, nonAdminUser} from './constants';

test.use(defaultTestOptions);

const unauthorizedResponseBody = {
  meta: {
    code: 401,
  },
  response: {
    errors: ['You must sign in to view this resource.'],
  },
};

test.beforeEach(async ({context}) => {
  // test isolation: block all network requests except for localhost
  await context.route(/https?:\/\/(?!localhost).+/, route => route.abort());
});

test('Log in, mock invalid user token, log in again', async ({
  page,
  context,
}, testInfo) => {
  // navigate to /profile
  await page.goto('/profile');

  // enter credentials
  await page.getByLabel(/email/i).fill(nonAdminUser.email);
  await page.getByLabel(/password/i).fill(nonAdminUser.password);
  await page.getByRole('button', {name: /log\s?in/i}).click();

  // confirm login was successful
  await expect(page.getByText(nonAdminUser.username).first()).toBeVisible();
  await expect(page.getByRole('button', {name: /log\s?out/i})).toBeVisible();

  // mock response using revoked or stale auth token
  // not using real API revoke to avoid issues with tests running in parallel
  await context.route(
    `${process.env.BIKESPACE_API_URL}/users/me`,
    async route => {
      const body = JSON.stringify(unauthorizedResponseBody);
      await route.fulfill({status: 401, body: body});
    },
    {times: 1}
  );

  // confirm page reloads to login screen
  await page.goto('/profile');
  await expect(page.getByRole('button', {name: /log\s?in/i})).toBeVisible();

  // login again
  await page.getByLabel(/email/i).fill(nonAdminUser.email);
  await page.getByLabel(/password/i).fill(nonAdminUser.password);
  await page.getByRole('button', {name: /log\s?in/i}).click();

  // confirm second login successful
  await expect(page.getByText(nonAdminUser.username).first()).toBeVisible();
  await expect(page.getByRole('button', {name: /log\s?out/i})).toBeVisible();

  // log out
  await page.getByRole('button', {name: /log\s?out/i}).click();

  // confirm that log out was successful
  await expect(page.getByRole('button', {name: /log\s?in/i})).toBeVisible();
});
