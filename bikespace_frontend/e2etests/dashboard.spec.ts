import {test, expect} from '@playwright/test';

const testLat = 43.76;
const testLong = -79.43;

test.use({
  geolocation: {
    latitude: testLat,
    longitude: testLong,
  },
  permissions: ['geolocation'],
  timezoneId: 'America/Toronto',
  viewport: {
    height: 600,
    width: 800,
  },
});

test.beforeEach(async ({context}) => {
  // test isolation: block all network requests except for localhost
  await context.route(/https?:\/\/(?!localhost).+/, route => route.abort());
});

test('Load a submission on the dashboard using URL param', async ({
  page,
  browserName,
}, testInfo) => {
  await page.goto('/dashboard?submission_id=1');
  await expect(
    page.getByTestId('submissions-feed').getByText(/id: 1\D/i)
  ).toBeVisible();
  await page.waitForSelector('div.leaflet-container');
  await expect(
    page.getByRole('button', {name: /marker for submission 1/i, exact: true})
  ).toBeVisible();
});

test('Navigate between submissions in the same cluster', async ({
  page,
  browserName,
}, testInfo) => {
  await page.goto('/dashboard');
  await page.waitForSelector('div.leaflet-container');

  await page.getByRole('button', {name: /feed/i}).click();

  await page.getByRole('button', {name: /id: 1\D/i}).click();
  await expect(
    page.getByTestId('submissions-feed').getByText(/id: 1\D/i)
  ).toBeVisible();
  await expect(
    page.getByRole('button', {name: /marker for submission 1/i, exact: true})
  ).toBeVisible();

  await page.getByRole('button', {name: /id: 2\D/i}).click();
  await expect(
    page.getByTestId('submissions-feed').getByText(/id: 2\D/i)
  ).toBeVisible();
  await expect(
    page.getByRole('button', {name: /marker for submission 2/i, exact: true})
  ).toBeVisible();

  await page.getByRole('button', {name: /id: 3\D/i}).click();
  await expect(
    page.getByTestId('submissions-feed').getByText(/id: 3\D/i)
  ).toBeVisible();
  await expect(
    page.getByRole('button', {name: /marker for submission 3/i, exact: true})
  ).toBeVisible();
});
