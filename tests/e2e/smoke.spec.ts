import { test, expect } from '@playwright/test';

test('v2 shell loads and shows scaffold heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /ctrlmap v2/i })).toBeVisible();
  await expect(page.getByTestId('app-shell')).toBeVisible();
});
