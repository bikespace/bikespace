import {test, expect} from '@playwright/test';

const testLat = 43.76;
const testLong = -79.43;
const apiURL: string =
  process.env.BIKESPACE_API_URL ?? 'http://localhost:8000/api/v2';

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

  // mock submissions API
  await context.route('**/api/v2/submissions', async route => {
    const json = {status: 'created'};
    await route.fulfill({status: 201, json: json});
  });
});

test('Submit an issue', async ({page}) => {
  // navigate to /submissions from home page
  await page.goto('/');

  // purpose of .toPass: sometimes this first link click is flaky on webkit, not sure why
  await expect(async () => {
    await page.getByRole('link', {name: 'Report a bike parking issue'}).click();
    await page.waitForURL('/submission');
  }).toPass();

  // issue entry - 'next' button should be disabled until an issue is selected
  await expect(page.getByRole('button', {name: 'Next'})).toBeDisabled();
  await page.getByText('Bicycle parking is not provided').click();
  await page.getByRole('button', {name: 'Next'}).click();

  // location entry
  await page.waitForSelector('div.leaflet-container');
  await page
    .locator('div.leaflet-container')
    .click({position: {x: 100, y: 100}});
  await page.getByRole('button', {name: 'Next'}).click();

  // parking_time, parking_duration entry
  await page.getByLabel('When did this happen?').fill('2023-01-01T12:30');
  await page.getByText('hours').click();
  await page.getByRole('button', {name: 'Next'}).click();

  // comment entry
  await page.getByRole('textbox').fill('Test comment');
  await page.getByRole('button', {name: 'Next'}).click();

  // check summary content
  const submitSummary = page.locator('#submission-summary');
  await expect(submitSummary).toContainText('Issues: not_provided');
  await expect(submitSummary).toContainText(
    /Location: \d{2}\.\d+, -\d{2}\.\d+/
  );
  // Should be slightly different location than browser if map interaction successful
  await expect(submitSummary).not.toContainText(
    `Location: ${testLat}, ${testLong}`
  );
  await expect(submitSummary).toContainText(/Time: Sun Jan \d?1 2023/);
  await expect(submitSummary).toContainText('Parking duration needed: hours');
  await expect(submitSummary).toContainText('Comments: Test comment');

  // check API call on submission
  const requestPromise = page.waitForRequest(apiURL + '/submissions');
  await page.getByRole('button', {name: 'Submit'}).click();
  const request = await requestPromise;
  expect(request.postDataJSON()).toMatchObject({
    issues: ['not_provided'],
    parking_time: '2023-01-01T17:30:00.000Z',
    parking_duration: 'hours',
    comments: 'Test comment',
  });
  expect(request.postDataJSON()).toHaveProperty('latitude');
  expect(request.postDataJSON()).toHaveProperty('longitude');

  // check post-submission page
  await expect(page.getByRole('heading')).toHaveText('Success');

  // return to home
  await page.getByRole('button', {name: 'Close'}).click();
  await expect(page).toHaveURL('/');
});
