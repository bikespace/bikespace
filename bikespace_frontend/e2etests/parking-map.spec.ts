import {test, expect} from '@playwright/test';

import testParkingDataSrc from '@/__test__/test_data/testParkingData.json';

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
  await context.route(process.env.DATA_BICYCLE_PARKING, async route => {
    const body = JSON.stringify(testParkingDataSrc);
    await route.fulfill({body});
  });
  // test isolation: block all network requests except for localhost
  // await context.route(/https?:\/\/(?!localhost).+/, route => route.abort());
});

test('Navigate bike parking map', async ({page, browserName}, testInfo) => {
  test.skip(
    browserName === 'firefox',
    'WIP - need to reconfigure to allow headed mode on Linux to pass CI'
  );

  // navigate to /parking-map from home page
  await page.goto('/');

  // purpose of .toPass: ensures retry if page hydrates during navigation; particularly common problem on webkit
  await expect(async () => {
    await page.getByRole('link', {name: 'Find bicycle parking'}).click();
    await expect(page).toHaveURL('/parking-map', {timeout: 1000});
  }).toPass();

  // wait for map to load
  await page.waitForEvent('console', msg => msg.text().includes('map loaded'));
  const parkingMap = page.locator('div.maplibregl-map');
  const closePane = page.getByRole('button', {name: 'close details pane'});
  const openPane = page.getByRole('button', {name: 'open details pane'});
  const firstMarker = page.getByLabel(/map marker/i).first();

  // details pane should re-open if a feature is clicked
  closePane.click();
  await openPane.waitFor({state: 'visible'});
  await parkingMap.click({position: {x: 400, y: 273}});
  await closePane.waitFor({state: 'visible'});

  // marker should be unselected initially; two results returned
  const mapSelectButtons = page.getByRole('button', {name: 'Select on Map'});
  await expect(firstMarker).toHaveScreenshot({maxDiffPixelRatio: 0.2});
  expect(await mapSelectButtons.count()).toBe(2);

  // map marker should change to selected when Select on Map button clicked
  mapSelectButtons.first().click();
  await expect(firstMarker).toHaveScreenshot({maxDiffPixelRatio: 0.2});
});
