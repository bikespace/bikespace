import {test, expect} from '@playwright/test';

import {defaultTestOptions} from './constants';
import testParkingDataSrc from '@/__test__/test_data/testParkingData.json';

test.use(defaultTestOptions);

test.beforeEach(async ({context}) => {
  await context.route(process.env.DATA_BICYCLE_PARKING!, async route => {
    const body = JSON.stringify(testParkingDataSrc);
    await route.fulfill({body});
  });
  // test isolation: block all network requests except for localhost
  // await context.route(/https?:\/\/(?!localhost).+/, route => route.abort());
});

test('Navigate bike parking map', async ({page, browserName}, testInfo) => {
  test.fixme(
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
  // 'map loaded' fires before the parking layer is drawn; the spinner stays
  // until the map is idle, so a click before then can miss the parking pins
  await expect(page.locator('[aria-label="Loading map..."]')).toHaveCount(0);
  const parkingMap = page.locator('div.maplibregl-map');
  const closePane = page.getByRole('button', {name: 'close details pane'});
  const openPane = page.getByRole('button', {name: 'open details pane'});
  // parking markers are anchored at the bottom; maplibre's default marker
  // (dropped on an empty-location click) is also labelled "Map marker"
  const firstMarker = page
    .locator('.maplibregl-marker-anchor-bottom[aria-label="Map marker"]')
    .first();

  // details pane should re-open if a feature is clicked
  await closePane.click();
  await openPane.waitFor({state: 'visible'});
  await parkingMap.click({position: {x: 400, y: 273}});
  await closePane.waitFor({state: 'visible'});

  // marker should be unselected initially; two results returned
  const mapSelectButtons = page.getByRole('button', {name: 'Select on Map'});
  await expect(mapSelectButtons).toHaveCount(2);
  await expect(firstMarker).toHaveScreenshot({maxDiffPixelRatio: 0.2});

  // map marker should change to selected when Select on Map button clicked
  await mapSelectButtons.first().click();
  await expect(firstMarker).toHaveScreenshot({maxDiffPixelRatio: 0.2});
});
