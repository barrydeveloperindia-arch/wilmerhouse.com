const { test, expect } = require('@playwright/test');

test.describe('Admin Panel Extensive Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Go to login page
    await page.goto('/admin/login.html');
    // Basic login simulation (assuming default or simple login for now)
    // In a real scenario, we would fill the actual credentials
    await page.evaluate(() => {
      localStorage.setItem('adminLoggedIn', 'true');
    });
    await page.goto('/admin/index.html');
  });

  test('Admin dashboard stats should be visible', async ({ page }) => {
    await expect(page.locator('#stat-revenue')).toBeVisible();
    await expect(page.locator('#stat-bookings')).toBeVisible();
    await expect(page.locator('#stat-pending')).toBeVisible();
  });

  test('Should navigate between tabs (Dashboard, Properties, Bookings)', async ({ page }) => {
    // Switch to Properties
    await page.click('#menu-props');
    await expect(page.locator('#view-props')).toBeVisible();
    await expect(page.locator('h1:has-text("Manage Properties")')).toBeVisible();

    // Switch to Bookings
    await page.click('#menu-bookings');
    await expect(page.locator('#view-bookings')).toBeVisible();
    await expect(page.locator('h1:has-text("All Bookings")')).toBeVisible();

    // Switch back to Dashboard
    await page.click('#menu-dash');
    await expect(page.locator('#view-dash')).toBeVisible();
  });

  test('Should open "Add Property" modal', async ({ page }) => {
    await page.click('#menu-props');
    await page.click('button:has-text("Add Property")');
    await expect(page.locator('#prop-modal')).toHaveClass(/open/);
    await expect(page.locator('#prop-modal-title')).toHaveText('Add Property');
  });

  test('Admin logout flow', async ({ page }) => {
    await page.click('li:has-text("Logout")');
    await expect(page).toHaveURL(/login.html/);
    const loggedIn = await page.evaluate(() => localStorage.getItem('adminLoggedIn'));
    expect(loggedIn).toBeNull();
  });

});
