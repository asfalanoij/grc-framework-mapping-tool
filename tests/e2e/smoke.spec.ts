import { test, expect } from '@playwright/test';

test('app boots, navigates to ISO 27001, and scores a control', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /ctrlmap v2/i })).toBeVisible();

  // Scope to the primary navigation — Home has an inline link with the same name.
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: /^iso 27001$/i })
    .click();
  await expect(page.getByTestId('iso27001-view')).toBeVisible();

  // First Annex A control should be A.5.1
  const a51Card = page.getByTestId('control-A.5.1');
  await expect(a51Card).toBeVisible();

  // Score it as implemented
  await a51Card.getByRole('radio', { name: /^implemented$/i }).click();
  await expect(a51Card.getByRole('radio', { name: /^implemented$/i })).toHaveAttribute('aria-checked', 'true');
});
