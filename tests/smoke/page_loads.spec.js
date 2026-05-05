const { test, expect } = require('@playwright/test');

test('Home page loads and has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Wilmer House/);
  await expect(page.locator('nav')).toBeVisible();
});

test('Admin login page loads', async ({ page }) => {
  await page.goto('/admin/login.html');
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test('Admin dashboard requires login redirect or loads', async ({ page }) => {
  await page.goto('/admin/index.html');
  // For now, checking if the page content exists. 
  // If there's a redirect logic, we'd test that here.
  await expect(page).toHaveURL(/admin/);
});
