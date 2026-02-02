import {test, expect} from '@playwright/test';

const skipFlakyTests = true;
const enableRetries = false;

const testLat = 43.76;
const testLong = -79.43;

test.use({
  geolocation: {
    latitude: testLat,
    longitude: testLong,
  },
  permissions: ['geolocation'],
  timezoneId: 'America/Toronto',
});

test.beforeEach(async ({context}) => {
  // test isolation: block all network requests except for localhost
  await context.route(/https?:\/\/(?!localhost).+/, route => route.abort());
});

test.describe('Dashboard navigation on mobile viewport size', () => {
  test.use({
    viewport: {
      height: 600,
      width: 800,
    },
  });

  test('Mobile: dashboard menu nav', async ({page}) => {
    // navigate to dashboard page
    await page.goto('/dashboard');
    await page.waitForSelector('div.leaflet-container');

    // open insights tab
    await page.getByRole('button', {name: /insights/i}).click();
    await expect(page.getByText(/problem type/i).first()).toBeVisible({
      timeout: 30 * 1000, // insight charts can take a while to load
    });

    // close tab
    await page.getByRole('button', {name: /back/i}).first().click();
    await expect(page.locator('div.leaflet-container')).toBeVisible();

    // open filters tab
    await page.getByRole('button', {name: /filters/i}).click();
    await expect(page.getByText(/date range/i).first()).toBeVisible();

    // close tab
    await page.getByRole('button', {name: /back/i}).first().click();
    await expect(page.locator('div.leaflet-container')).toBeVisible();

    // open feed tab
    await page.getByRole('button', {name: /feed/i}).click();
    await expect(page.getByText(/latest submissions/i).first()).toBeVisible();

    // close tab
    await page.getByRole('button', {name: /back/i}).first().click();
    await expect(page.locator('div.leaflet-container')).toBeVisible();

    // open info tab
    await page.getByRole('button', {name: /info/i}).click();
    await expect(page.getByText(/about the dashboard/i).first()).toBeVisible();
  });

  test('Mobile: load a submission on the dashboard using URL param', async ({
    page,
  }) => {
    await page.goto('/dashboard?submission_id=1');
    await expect(
      page.getByTestId('submissions-feed').getByText(/id: 1\D/i)
    ).toBeVisible();
    await page.waitForSelector('div.leaflet-container');
    await expect(
      page.getByRole('button', {name: /marker for submission 1/i, exact: true})
    ).toBeVisible();
  });
});

test.describe('Dashboard navigation on mobile viewport size (flaky)', () => {
  if (enableRetries) test.describe.configure({retries: 3});
  test.use({
    viewport: {
      height: 600,
      width: 800,
    },
  });

  test.skip('Mobile: navigate between submissions in the same cluster', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('div.leaflet-container');

    await page.getByRole('button', {name: /feed/i}).click();

    await page.getByRole('button', {name: /id: 1\D/i}).click();
    await expect(
      page.getByTestId('submissions-feed').getByText(/id: 1\D/i)
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: /marker for submission 1/i,
        exact: true,
      })
    ).toBeVisible();

    if (skipFlakyTests)
      test.fixme(
        true,
        'Subsequent interactions known to flake - appears to be a race condition between cluster internal refresh/management and cluster zoomToShowLayer method'
      );

    await page.getByRole('button', {name: /id: 2\D/i}).click();
    await expect(
      page.getByTestId('submissions-feed').getByText(/id: 2\D/i)
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: /marker for submission 2/i,
        exact: true,
      })
    ).toBeVisible();

    await page.getByRole('button', {name: /id: 3\D/i}).click();
    await expect(
      page.getByTestId('submissions-feed').getByText(/id: 3\D/i)
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: /marker for submission 3/i,
        exact: true,
      })
    ).toBeVisible();
  });
});

test.describe('Dashboard navigation on desktop viewport size', () => {
  test.use({
    viewport: {
      height: 800,
      width: 1200,
    },
  });

  test('Desktop: dashboard menu nav', async ({page, isMobile}) => {
    test.skip(isMobile);

    // navigate to dashboard page
    await page.goto('/dashboard');
    await page.waitForSelector('div.leaflet-container');

    // insights tab should be shown by default
    await expect(page.getByText(/problem type/i).first()).toBeVisible({
      timeout: 30 * 1000, // insight charts can take a while to load
    });

    // open insights tab
    await page.getByRole('button', {name: /insights/i}).click();
    await expect(page.getByText(/problem type/i).first()).toBeVisible({
      timeout: 30 * 1000, // insight charts can take a while to load
    });

    // open filters tab
    await page.getByRole('button', {name: /filters/i}).click();
    await expect(page.getByText(/date range/i).first()).toBeVisible();

    // open feed tab
    await page.getByRole('button', {name: /feed/i}).click();
    await expect(page.getByText(/latest submissions/i).first()).toBeVisible();

    // open info tab
    await page.getByRole('button', {name: /info/i}).click();
    await expect(page.getByText(/about the dashboard/i).first()).toBeVisible();
  });

  test('Desktop: load a submission on the dashboard using URL param', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile);

    await page.goto('/dashboard?submission_id=1');
    await expect(
      page.getByTestId('submissions-feed').getByText(/id: 1\D/i)
    ).toBeVisible();
    await page.waitForSelector('div.leaflet-container');
    await expect(
      page.getByRole('button', {name: /marker for submission 1/i, exact: true})
    ).toBeVisible();
  });
});

test.describe('Dashboard navigation on desktop viewport size (flaky)', () => {
  if (enableRetries) test.describe.configure({retries: 3});
  test.use({
    viewport: {
      height: 800,
      width: 1200,
    },
  });

  test.skip('Desktop: navigate between submissions in the same cluster', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile);

    await page.goto('/dashboard');
    await page.waitForSelector('div.leaflet-container');

    await page.getByRole('button', {name: /feed/i}).click();

    await page.getByRole('button', {name: /id: 1\D/i}).click();
    await expect(
      page.getByTestId('submissions-feed').getByText(/id: 1\D/i)
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: /marker for submission 1/i,
        exact: true,
      })
    ).toBeVisible();

    if (skipFlakyTests)
      test.fixme(
        true,
        'Subsequent interactions known to flake - appears to be a race condition between cluster internal refresh/management and cluster zoomToShowLayer method'
      );

    await page.getByRole('button', {name: /id: 2\D/i}).click();
    await expect(
      page.getByTestId('submissions-feed').getByText(/id: 2\D/i)
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: /marker for submission 2/i,
        exact: true,
      })
    ).toBeVisible();

    await page.getByRole('button', {name: /id: 3\D/i}).click();
    await expect(
      page.getByTestId('submissions-feed').getByText(/id: 3\D/i)
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: /marker for submission 3/i,
        exact: true,
      })
    ).toBeVisible();
  });
});
