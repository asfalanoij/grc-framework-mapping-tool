import { test, expect } from '@playwright/test';

// Preview builds are served under /grc-framework-mapping-tool/ (GitHub Pages
// base path). When navigating via in-app NavLinks the router prepends the
// basename automatically; for direct page.goto we must include it.
const APP_BASE = '/grc-framework-mapping-tool';

test('cross-framework neighborhood — ISO control opens full 10-framework grid and round-trips to NIST', async ({
  page,
}) => {
  // 1. Land on the SPA root, then navigate via NavLink so basename is applied.
  await page.goto('/');
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: /^iso 27001$/i })
    .click();
  await expect(page.getByTestId('iso27001-view')).toBeVisible();

  // 2. Expand control A.5.1 so the cross-framework section + neighborhood link appear.
  //    The toggle button's accessible name is the control id (aria-labelledby
  //    points at the heading), so we match by its text content instead.
  const card = page.getByTestId('control-A.5.1');
  await card.locator('button:has-text("Show details")').click();
  await expect(card.locator('button:has-text("Hide details")')).toBeVisible();

  // 3. Follow the 'View full neighborhood' link.
  await card.getByTestId('neighborhood-link-A.5.1').click();
  await expect(page).toHaveURL(/\/neighborhood\/iso\/A\.5\.1$/);

  // 4. The full neighborhood grid is on screen — every framework row is rendered.
  const view = page.getByTestId('neighborhood-A.5.1');
  await expect(view).toBeVisible();
  await expect(view.getByText('NIST CSF 2.0')).toBeVisible();
  await expect(view.getByText('SOC 2')).toBeVisible();
  await expect(view.getByText('CIS v8')).toBeVisible();
  await expect(view.getByText('PCI DSS')).toBeVisible();
  await expect(view.getByText('Cyber Essentials')).toBeVisible();
  await expect(view.getByText('NIST 800-53')).toBeVisible();
  await expect(view.getByText('NIS 2')).toBeVisible();
  await expect(view.getByText('ISO 22301')).toBeVisible();
  await expect(view.getByText('ISO 27017')).toBeVisible();
  await expect(view.getByText('NCSC CAF')).toBeVisible();

  // 5. A.5.1 has many mappings — population summary should be > 0 / 10.
  const summary = view.getByText(/\d+ \/ 10 frameworks mapped/);
  await expect(summary).toBeVisible();
  const summaryText = await summary.textContent();
  expect(summaryText).toMatch(/[1-9]\d? \/ 10 frameworks mapped/);

  // 6. The NIST CSF row carries 'GV.PO-01' and is clickable.
  const nistBadge = view.getByRole('button', { name: /Navigate to NIST CSF 2\.0 GV\.PO-01/i });
  await expect(nistBadge).toBeVisible();
  await nistBadge.click();

  // 7. We land on /nist-csf-2 with the hash preserving intent.
  await expect(page).toHaveURL(/\/nist-csf-2#GV\.PO-01$/);
  await expect(page.getByTestId('framework-view-NIST CSF 2.0')).toBeVisible();
});

test('cross-framework neighborhood — unknown ISO id renders not-found state', async ({ page }) => {
  await page.goto(`${APP_BASE}/neighborhood/iso/Z.9.99`);
  await expect(page.getByRole('heading', { name: /control not found/i })).toBeVisible();
  await page.getByRole('link', { name: /back to iso 27001/i }).click();
  await expect(page).toHaveURL(/\/iso27001$/);
});

test('cross-framework neighborhood — management-system clause shows fewer mapped frameworks', async ({
  page,
}) => {
  // Clause 4.1 is a Management System clause; upstream prinnyo populates only
  // the core 6 cross-ref fields on these (n80053, nis2, iso22301, iso27017
  // are absent). We assert the empty-state em-dash marker exists for n80053.
  await page.goto(`${APP_BASE}/neighborhood/iso/4.1`);
  const view = page.getByTestId('neighborhood-4.1');
  await expect(view).toBeVisible();
  const n80053Row = view.getByTestId('neighborhood-row-n80053');
  await expect(n80053Row.getByLabel(/No NIST 800-53 mapping declared/i)).toBeVisible();
});
