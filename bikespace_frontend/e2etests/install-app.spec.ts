import {test, expect} from '@playwright/test';

const androidUserAgent =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';

const stepsSummary = 'Add BikeSpace to your home screen';

// `.toHaveAttribute` on this slot also waits for hydration, because the
// prerendered HTML is always 'pending'
const installSlot = '[data-install-mode]';

test.beforeEach(async ({context}) => {
  // test isolation: block all network requests except for localhost
  await context.route(/https?:\/\/(?!localhost).+/, route => route.abort());
});

test('Install section is hidden on desktop', async ({page, isMobile}) => {
  test.skip(isMobile, 'desktop only');

  await page.goto('/');

  await expect(page.locator(installSlot)).toHaveAttribute(
    'data-install-mode',
    'hidden'
  );
  await expect(page.getByText(stepsSummary)).toHaveCount(0);
});

test.describe('iPhone', () => {
  test.skip(({isMobile}) => !isMobile, 'iPhone only');

  test('Shows the steps for adding to the home screen', async ({page}) => {
    await page.goto('/');

    await page.getByText(stepsSummary).click();

    await expect(page.getByText('Tap Add to Home Screen.')).toBeVisible();
  });

  test('Is hidden inside the installed app', async ({page}) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'standalone', {value: true});
    });

    await page.goto('/');

    await expect(page.locator(installSlot)).toHaveAttribute(
      'data-install-mode',
      'hidden'
    );
  });
});

test.describe('Android', () => {
  test.use({userAgent: androidUserAgent, hasTouch: true});

  test.skip(({browserName}) => browserName !== 'chromium', 'Chromium only');

  test('Shows the steps until the browser offers to install', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByText(stepsSummary).click();

    await expect(page.getByText('choose Install app')).toBeVisible();
  });

  test('Install button opens the browser prompt', async ({page}) => {
    await page.goto('/');
    await expect(page.locator(installSlot)).toHaveAttribute(
      'data-install-mode',
      'android'
    );

    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt', {cancelable: true});
      Object.assign(event, {
        prompt: () => {
          document.body.dataset.promptCalled = 'true';
          return Promise.resolve();
        },
      });
      window.dispatchEvent(event);
    });

    await page.getByRole('button', {name: 'Install BikeSpace'}).click();

    await expect(page.locator('body')).toHaveAttribute(
      'data-prompt-called',
      'true'
    );
  });
});
