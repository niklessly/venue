import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/auth/login');

  await expect(page.getByRole('button', { name: 'войти' })).toBeEnabled();
  await page.getByRole('button', { name: 'EN' }).click();
  await expect(page.getByRole('button', { name: 'enter dashboard' })).toBeEnabled();
  await page.getByRole('button', { name: 'RU' }).click();

  await page.fill('#email', 'bad-email');
  await expect(page.getByRole('button', { name: 'войти' })).toBeDisabled();

  await page.fill('#name', 'Test User');
  await page.fill('#email', 'test@venue.local');
  await page.fill('#password', 'demo-password');
  await page.getByRole('button', { name: 'войти' }).click();

  await page.waitForURL('**/rooms');
  await expect(page.getByRole('heading', { name: 'свободные залы' })).toBeVisible();
  await expect(page.getByText('Test User', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'выйти' }).click();
  await page.waitForURL('**/auth/login');
});
