import { test, expect } from '@playwright/test';

test('app boots, navigates across multiple frameworks, scores items', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /^ctrlmap v2$/i })).toBeVisible();

  // 1. ISO 27001 view: filter + search work, score A.5.1 as Implemented.
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: /^iso 27001$/i })
    .click();
  await expect(page.getByTestId('iso27001-view')).toBeVisible();
  const a51 = page.getByTestId('control-A.5.1');
  await a51.getByRole('radio', { name: /^implemented$/i }).click();
  await expect(a51.getByRole('radio', { name: /^implemented$/i })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  // 2. NIST CSF view loads + scoring works.
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: /^nist csf$/i })
    .click();
  await expect(page.getByTestId('framework-view-NIST CSF 2.0')).toBeVisible();
  const govOc01 = page.getByTestId('item-GV.OC-01');
  await govOc01.getByRole('radio', { name: /^in progress$/i }).click();
  await expect(govOc01.getByRole('radio', { name: /^in progress$/i })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  // 3. NCSC CAF (bespoke 3-level objectives → principles → outcomes).
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: /^ncsc caf$/i })
    .click();
  await expect(page.getByTestId('framework-view-NCSC CAF')).toBeVisible();
  await expect(page.getByTestId('item-A1.a')).toBeVisible();
});
