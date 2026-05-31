import { test, expect } from '@playwright/test';

test('create booking flow', async ({ page }) => {
  // ensure user is logged in
  await page.goto('/auth/login');
  await page.fill('#name', 'Test User');
  await page.fill('#email', 'test@venue.local');
  await page.fill('#password', 'demo-password');
  await page.click('text=enter dashboard');
  await page.waitForURL('**/rooms');

  // open first room
  await page.click('.rooms-grid .room-card');
  await page.waitForURL('**/room-details/**');

  // click book and open booking form (route may navigate to /page or /rooms/:id/book)
  await page.click('text=book this room');
  await page.waitForSelector('form');

  // fill booking form
  await page.fill('#title', 'Playwright booking');
  await page.fill('#date', '2026-06-02');
  await page.fill('#startTime', '10:00');
  await page.fill('#endTime', '10:30');
  await page.fill('#participants', '2');
  await page.click('text=create booking');

  // expect redirected to bookings and see new booking
  await page.waitForURL('**/bookings');
  await expect(page.locator('text=my bookings')).toBeVisible();
});
