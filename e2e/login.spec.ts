import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/auth/login');

  await expect(page.getByRole('button', { name: 'войти' })).toBeEnabled();
  await page.getByRole('button', { name: 'войти' }).click();
  await expect(page.getByText('Введите имя.')).toBeVisible();
  await expect(page.getByText('Введите email.')).toBeVisible();
  await expect(page.getByText('Введите пароль.')).toBeVisible();

  await page.getByRole('button', { name: 'EN' }).click();
  await expect(page.getByRole('button', { name: 'enter dashboard' })).toBeEnabled();
  await expect(page.getByText('Enter your name.')).toBeVisible();
  await expect(page.getByText('Enter your email.')).toBeVisible();
  await expect(page.getByText('Enter your password.')).toBeVisible();
  await page.getByRole('button', { name: 'RU' }).click();

  await page.fill('#name', 'A');
  await expect(page.getByText('Имя должно быть не короче 2 символов.')).toBeVisible();

  await page.fill('#name', 'Test User');
  await page.fill('#email', 'bad-email');
  await page.fill('#password', 'demo-password');
  await expect(page.getByText('Введите корректный email.')).toBeVisible();

  await page.fill('#email', 'test@venue.local');
  await page.getByRole('button', { name: 'войти' }).click();

  await page.waitForURL('**/rooms');
  await expect(page.getByRole('heading', { name: 'залы' })).toBeVisible();
  await expect(page.getByText('Test User', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'выйти' }).click();
  await page.waitForURL('**/auth/login');
});
