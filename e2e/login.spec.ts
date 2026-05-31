import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/auth/login');

  await page.fill('#name', 'Test User');
  await page.fill('#email', 'test@venue.local');
  await page.fill('#password', 'demo-password');
  await page.click('text=enter dashboard');

  await page.waitForURL('**/rooms');
  await expect(page.locator('text=available rooms')).toBeVisible();
});
