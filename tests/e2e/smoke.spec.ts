import { test, expect } from '@playwright/test';

test('app boots, navigates, scores, filters, and searches', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /^ctrlmap v2$/i })).toBeVisible();

  // Primary nav: open ISO 27001.
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: /^iso 27001$/i })
    .click();
  await expect(page.getByTestId('iso27001-view')).toBeVisible();

  // Score A.5.1 as implemented.
  const a51 = page.getByTestId('control-A.5.1');
  await a51.getByRole('radio', { name: /^implemented$/i }).click();
  await expect(a51.getByRole('radio', { name: /^implemented$/i })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  // Toggle the Organizational category filter — list should shrink to <118.
  await page.getByRole('switch', { name: /organizational/i }).click();
  const filteredCount = page.getByTestId('filtered-count');
  await expect(filteredCount).toContainText(/of 118 shown/);
  // Clear all filters.
  await page.getByRole('button', { name: /clear all/i }).click();

  // Search for A.5.1 via the search bar.
  await page.getByLabel(/search controls/i).fill('A.5.1');
  await expect(page.getByTestId('filtered-count')).toContainText(/of 118 shown/);
});
