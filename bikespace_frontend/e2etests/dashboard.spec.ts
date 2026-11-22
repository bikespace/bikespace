import {test, expect} from '@playwright/test';

import {
  defaultTestOptions,
  testDefaultViewport,
  testDesktopViewport,
} from './constants';

const stopClusterNavAfterFirstSubmission = false;
const retriesForKnownFlakyTests = 3;
// The feed and map render every submission (~1,400 seeded), which can take
// over the default 5s when other workers are loading the dashboard too
// (seen on Firefox with parallel workers; passes reliably in isolation).
const feedLoadTimeout = 15 * 1000;

test.use(defaultTestOptions);

test.beforeEach(async ({context}) => {
  // test isolation: block all network requests except for localhost
  await context.route(/https?:\/\/(?!localhost).+/, route => route.abort());
});

test.describe('Dashboard navigation on mobile viewport size', () => {
  test.use({
    viewport: testDefaultViewport,
  });

  // Too flaky to add to CI; often times out on generating the insights tab for some browsers
  test.skip('Mobile: dashboard menu nav', async ({page}) => {
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
    ).toBeVisible({timeout: feedLoadTimeout});
    await page.waitForSelector('div.leaflet-container');
    await expect(
      page.getByRole('button', {name: /marker for submission 1/i, exact: true})
    ).toBeVisible({timeout: feedLoadTimeout});
  });
});

test.describe('Dashboard navigation on mobile viewport size (flaky)', () => {
  if (retriesForKnownFlakyTests > 0) test.describe.configure({retries: 3});
  test.slow(); // each selection re-renders every marker, slow with parallel workers
  test.use({
    viewport: testDefaultViewport,
  });

  // Too flaky to add to CI; often fails on trying to locate the marker for submission 1
  test('Mobile: navigate between submissions in the same cluster', async ({
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
    ).toBeVisible({timeout: feedLoadTimeout});

    if (stopClusterNavAfterFirstSubmission)
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
    ).toBeVisible({timeout: feedLoadTimeout});

    await page.getByRole('button', {name: /id: 3\D/i}).click();
    await expect(
      page.getByTestId('submissions-feed').getByText(/id: 3\D/i)
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: /marker for submission 3/i,
        exact: true,
      })
    ).toBeVisible({timeout: feedLoadTimeout});
  });
});

test.describe('Dashboard navigation on desktop viewport size', () => {
  test.use({
    viewport: testDesktopViewport,
  });

  // Too flaky to add to CI; often times out on generating the insights tab for some browsers
  test.skip('Desktop: dashboard menu nav', async ({page, isMobile}) => {
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
    ).toBeVisible({timeout: feedLoadTimeout});
    await page.waitForSelector('div.leaflet-container');
    await expect(
      page.getByRole('button', {name: /marker for submission 1/i, exact: true})
    ).toBeVisible({timeout: feedLoadTimeout});
  });
});

test.describe('Dashboard rapid submission selection', () => {
  test.use({
    viewport: testDesktopViewport,
  });

  test('Desktop: selecting submissions in quick succession does not crash the map', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile);
    test.setTimeout(60 * 1000);

    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    // A tight spiral of submissions forms one cluster that has to be
    // spiderfied. Lower radius = higher ID, so the latest are closest together.
    const submissions = Array.from({length: 30}, (_, index) => {
      const id = index + 1;
      const radius = (31 - id) * 0.000006;
      return {
        id,
        latitude: 43.6572 + radius * Math.sin(id),
        longitude: -79.448 + radius * 1.4 * Math.cos(id),
        issues: ['not_provided'],
        parking_duration: 'hours',
        parking_time: new Date(Date.UTC(2025, 2, 19, 12, id)).toISOString(),
        submitted_datetime: null,
        comments: null,
        user: null,
        version: 3,
      };
    });
    await page.route(/\/api\/v2\/submissions/, async route => {
      const id = new URL(route.request().url()).pathname.match(/\/(\d+)$/)?.[1];
      await route.fulfill({
        json: id
          ? submissions.find(submission => submission.id === Number(id))
          : {
              pagination: {
                current_page: 1,
                has_next: false,
                has_prev: false,
                total_items: submissions.length,
                total_pages: 1,
              },
              submissions,
            },
      });
    });

    await page.goto('/dashboard');
    await page.waitForSelector('div.leaflet-container');
    await page.getByRole('button', {name: /feed/i}).click();

    const feed = page.getByTestId('submissions-feed');
    await expect(
      feed.getByRole('button', {name: /id: \d+/i}).first()
    ).toBeVisible({
      timeout: feedLoadTimeout,
    });

    // Dispatch clicks directly: Playwright's actionability checks are too slow
    // to land a new selection while the map is still moving to the last one.
    // Moving between members of a spiderfied cluster is what closes the popup
    // while it is still opening.
    const clusterIds = [30, 29, 28, 27];
    const lastSelectedId = await feed.evaluate(async (element, ids) => {
      let crashed = false;
      window.addEventListener('error', () => (crashed = true));

      const clickSubmission = (id: number) =>
        [...element.querySelectorAll('button')]
          .find(button =>
            new RegExp(`id: ${id}(\\D|$)`, 'i').test(button.textContent ?? '')
          )
          ?.click();

      for (const delay of [150, 250, 350, 500, 700]) {
        for (const id of ids) {
          if (crashed) return id;
          clickSubmission(id);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      return ids.at(-1);
    }, clusterIds);

    await page.waitForTimeout(1500);
    expect(pageErrors).toEqual([]);
    await expect(
      page
        .locator('.leaflet-popup')
        .getByRole('link', {name: `ID: ${lastSelectedId}`, exact: true})
    ).toBeVisible();
  });
});

test.describe('Dashboard navigation on desktop viewport size (flaky)', () => {
  if (retriesForKnownFlakyTests > 0) test.describe.configure({retries: 3});
  test.slow(); // each selection re-renders every marker, slow with parallel workers
  test.use({
    viewport: testDesktopViewport,
  });

  // Too flaky to add to CI; often fails on trying to locate the marker for submission 1
  test('Desktop: navigate between submissions in the same cluster', async ({
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
    ).toBeVisible({timeout: feedLoadTimeout});

    if (stopClusterNavAfterFirstSubmission)
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
    ).toBeVisible({timeout: feedLoadTimeout});

    await page.getByRole('button', {name: /id: 3\D/i}).click();
    await expect(
      page.getByTestId('submissions-feed').getByText(/id: 3\D/i)
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: /marker for submission 3/i,
        exact: true,
      })
    ).toBeVisible({timeout: feedLoadTimeout});
  });
});
