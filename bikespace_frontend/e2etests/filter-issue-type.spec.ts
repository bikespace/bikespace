import {test, expect, Page} from '@playwright/test';

test.use({
  viewport: {height: 800, width: 1200},
});

test.beforeEach(async ({context, page}) => {
  // test isolation: block all network requests except for localhost
  await context.route(/https?:\/\/(?!localhost).+/, route => route.abort());

  await page.goto('/dashboard?tab=filters');
  await page.waitForSelector('div.leaflet-container');
  // initial load renders 1500+ submissions; can be slow in CI, especially webkit
  await expect(page.getByTestId('report-summary-count')).toBeVisible({
    timeout: 15 * 1000,
  });
});

async function getReportCount(page: Page): Promise<number> {
  const countLocator = page.getByTestId('report-summary-count');

  // when no submissions match the current filters, ReportSummary renders a
  // warning icon instead of the count element
  if ((await countLocator.count()) === 0) return 0;

  const text = await countLocator.innerText();
  return Number(text.replace(/,/g, ''));
}

// The filtered count updates via an async effect reacting to filter state,
// so it can lag a render behind the click that triggered it. Poll until two
// consecutive reads agree before treating the value as settled.
async function getStableReportCount(page: Page): Promise<number> {
  let previous: number | undefined;
  await expect
    .poll(async () => {
      const current = await getReportCount(page);
      const stable = current === previous;
      previous = current;
      return stable;
    })
    .toBe(true);
  return getReportCount(page);
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

    const totalCount = await getStableReportCount(page);

    const abandonedChip = page.getByRole('button', {
      name: 'Abandoned bicycle',
      exact: true,
    });
    const damagedChip = page.getByRole('button', {
      name: 'Parking damaged',
      exact: true,
    });
    await abandonedChip.click();
    await expect(abandonedChip).toHaveAttribute('aria-pressed', 'true');
    await damagedChip.click();
    await expect(damagedChip).toHaveAttribute('aria-pressed', 'true');

    // default mode is "any": matches submissions with at least one selected issue
    await expect(filterModeSelect).toHaveValue('any');
    const anyCount = await getStableReportCount(page);
    expect(anyCount).toBeLessThanOrEqual(totalCount);

    // "all" is a strict subset of "any": matches submissions with every selected issue
    await filterModeSelect.selectOption('all');
    const allCount = await getStableReportCount(page);
    expect(allCount).toBeLessThanOrEqual(anyCount);

    // "exclude" matches submissions with none of the selected issues,
    // so it is the complement of "any" (relative to the unfiltered total)
    await filterModeSelect.selectOption('exclude');
    const excludeCount = await getStableReportCount(page);
    expect(excludeCount).toBe(totalCount - anyCount);
  });
});
