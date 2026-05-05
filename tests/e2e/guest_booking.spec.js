const { test, expect } = require('@playwright/test');

test.describe('Guest Booking Flow & Logic', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Should open booking modal for a property', async ({ page }) => {
    // Wait for properties to load (simulated or real)
    await page.waitForSelector('.prop-card');
    // Click the "Book Now" button specifically
    await page.locator('.prop-card .btn-primary').first().click();
    
    await expect(page.locator('#booking-modal')).toHaveClass(/open/);
    await expect(page.locator('#modal-prop-name')).toContainText('Property');
  });

  test('Should calculate price correctly based on dates', async ({ page }) => {
    await page.locator('.prop-card .btn-primary').first().click();
    
    // Set check-in to today + 2 days
    const today = new Date();
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + 2);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + 3); // 3 nights

    const checkInStr = checkInDate.toISOString().split('T')[0];
    const checkOutStr = checkOutDate.toISOString().split('T')[0];

    // Fill dates via evaluate to bypass Flatpickr's readonly restriction if present
    await page.evaluate(({ inStr, outStr }) => {
        const checkIn = document.getElementById('check-in');
        const checkOut = document.getElementById('check-out');
        checkIn.value = inStr;
        checkOut.value = outStr;
        checkIn.dispatchEvent(new Event('change', { bubbles: true }));
        checkOut.dispatchEvent(new Event('change', { bubbles: true }));
    }, { inStr: checkInStr, outStr: checkOutStr });

    // Check if total amount is updated (Assuming £200/night for Prop 1)
    // 3 nights * £200 = £600
    // Wait for the logic to process
    await page.waitForTimeout(500); 
    const totalText = await page.textContent('#total-amount');
    expect(totalText).toContain('£600');
  });

  test('Should show error on overlapping dates (Double-Booking)', async ({ page }) => {
    // This test assumes "Property 1" has an existing booking in Supabase
    // We can simulate the availability check by mocking the API response if needed
    // But let's try a real interaction flow first.
    
    await page.locator('.prop-card .btn-primary').first().click();
    
    // Use dates that we know are likely already "disabled" or we can mock them
    // For this test to be robust, we'll mock the Supabase response
    await page.route('**/rest/v1/bookings*', async (route) => {
        const json = [{ check_in: '2026-06-01', check_out: '2026-06-05' }];
        await route.fulfill({ json });
    });

    // Fill dates via evaluate
    await page.evaluate(() => {
        const checkIn = document.getElementById('check-in');
        const checkOut = document.getElementById('check-out');
        checkIn.value = '2026-06-02';
        checkOut.value = '2026-06-04';
        checkIn.dispatchEvent(new Event('change', { bubbles: true }));
        checkOut.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    await page.fill('#cust-name', 'Test User');
    await page.fill('#cust-email', 'test@example.com');
    await page.fill('#cust-phone', '1234567890');
    
    // Attempt to confirm
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('already booked');
      await dialog.dismiss();
    });
    
    await page.click('.confirm-btn');
  });

  test('Should toggle between Online and Cash payment', async ({ page }) => {
    await page.locator('.prop-card .btn-primary').first().click();
    
    // Default is Online
    await expect(page.locator('#card-form')).not.toHaveClass(/hidden/);
    
    // Switch to Cash
    await page.click('#pay-cash');
    await expect(page.locator('#card-form')).toHaveClass(/hidden/);
    
    // Switch back to Online
    await page.click('#pay-online');
    await expect(page.locator('#card-form')).not.toHaveClass(/hidden/);
  });

});
