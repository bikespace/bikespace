import {test, expect, Page} from '@playwright/test';

test.use({
  viewport: {height: 800, width: 1200},
});

test.beforeEach(async ({context, page}) => {
  // test isolation: block all network requests except for localhost
  await context.route(/https?:\/\/(?!localhost).+/, route => route.abort());

  await page.goto('/dashboard?tab=filters');
  await page.waitForSelector('div.leaflet-container');
  await expect(page.getByTestId('report-summary-count')).toBeVisible();
});

async function getReportCount(page: Page): Promise<number> {
  const text = await page.getByTestId('report-summary-count').innerText();
  return Number(text.replace(/,/g, ''));
}

test.describe('Issue type filter', () => {
  test('filter mode select is disabled until an issue chip is selected', async ({
    page,
  }) => {
    const filterModeSelect = page.getByLabel('Filter mode');
    await expect(filterModeSelect).toBeVisible();
    await expect(filterModeSelect).toBeDisabled();

    const abandonedChip = page.getByRole('button', {
      name: 'Abandoned bicycle',
      exact: true,
    });
    await abandonedChip.click();
    await expect(filterModeSelect).toBeEnabled();

    // deselecting the only selected chip disables the control again
    await abandonedChip.click();
    await expect(filterModeSelect).toBeDisabled();
  });

  test('chip click toggles its pressed state', async ({page}) => {
    const abandonedChip = page.getByRole('button', {
      name: 'Abandoned bicycle',
      exact: true,
    });

    await expect(abandonedChip).toHaveAttribute('aria-pressed', 'false');
    await abandonedChip.click();
    await expect(abandonedChip).toHaveAttribute('aria-pressed', 'true');
    await abandonedChip.click();
    await expect(abandonedChip).toHaveAttribute('aria-pressed', 'false');
  });

  test('report summary is only marked "(filtered)" once an issue is selected', async ({
    page,
  }) => {
    const summaryLabel = page.getByTestId('report-summary-label');
    await expect(summaryLabel).not.toContainText('(filtered)');

    await page
      .getByRole('button', {name: 'Abandoned bicycle', exact: true})
      .click();
    await expect(summaryLabel).toContainText('(filtered)');

    await page
      .getByRole('button', {name: 'Abandoned bicycle', exact: true})
      .click();
    await expect(summaryLabel).not.toContainText('(filtered)');
  });

  test('filter mode changes which submissions are shown', async ({page}) => {
    const filterModeSelect = page.getByLabel('Filter mode');

    const totalCount = await getReportCount(page);

    await page
      .getByRole('button', {name: 'Abandoned bicycle', exact: true})
      .click();
    await page
      .getByRole('button', {name: 'Parking damaged', exact: true})
      .click();

    // default mode is "any": matches submissions with at least one selected issue
    await expect(filterModeSelect).toHaveValue('any');
    const anyCount = await getReportCount(page);
    expect(anyCount).toBeLessThanOrEqual(totalCount);

    // "all" is a strict subset of "any": matches submissions with every selected issue
    await filterModeSelect.selectOption('all');
    await expect.poll(() => getReportCount(page)).toBeLessThanOrEqual(anyCount);

    // "exclude" matches submissions with none of the selected issues,
    // so it is the complement of "any" (relative to the unfiltered total)
    await filterModeSelect.selectOption('exclude');
    await expect.poll(() => getReportCount(page)).toBe(totalCount - anyCount);
  });
});
