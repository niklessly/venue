import { expect, Page, test } from '@playwright/test';

async function login(page: Page, email = 'test@venue.local', name = 'Test User'): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('#name', name);
  await page.fill('#email', email);
  await page.fill('#password', 'demo-password');
  await page.getByRole('button', { name: 'войти' }).click();
  await page.waitForURL('**/rooms');
}

function dateAfter(days: number): string {
  const value = new Date();
  value.setDate(value.getDate() + days);
  const year = value.getFullYear();
  const month = (value.getMonth() + 1).toString().padStart(2, '0');
  const day = value.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

test('filters rooms by equipment, capacity and availability', async ({ page }) => {
  await login(page);

  await page.fill('#equipment', 'проектор');
  await expect(page.locator('.room-card')).toHaveCount(3);

  await page.fill('#capacity', '9');
  await expect(page.locator('.room-card')).toHaveCount(1);
  await expect(page.locator('.room-card')).toContainText('зал 4');

  await page.getByRole('button', { name: 'сбросить фильтры' }).click();
  await page.fill('#date', dateAfter(1));
  await expect(page.locator('.room-card')).toHaveCount(4);
  await expect(page.locator('.room-card').filter({ hasText: 'зал 1' })).toHaveCount(1);

  await page.fill('#time', '10:15');
  await page.locator('#capacity').fill('0');
  await expect(page.locator('.room-card').filter({ hasText: 'зал 1' })).toHaveCount(0);
  await expect(page.locator('.room-card').filter({ hasText: 'занят' })).toHaveCount(0);
  await expect(page.locator('.room-card-free')).toHaveCount(3);
});

test('creates, edits, cancels and deletes booking', async ({ page }) => {
  await login(page);

  await page.locator('.room-card').filter({ hasText: 'зал 4' }).click();
  await page.waitForURL('**/room-details/**');
  await page.getByRole('button', { name: 'забронировать зал' }).click();
  await page.waitForURL('**/rooms/room-4/book');

  await page.fill('#title', 'Playwright booking');
  await page.fill('#date', dateAfter(7));
  await page.fill('#startTime', '10:00');
  await page.fill('#endTime', '10:30');
  await page.fill('#participants', '2');
  await page.getByRole('button', { name: 'создать бронь' }).click();

  await page.waitForURL('**/bookings');
  const booking = page.locator('.booking-item').filter({ hasText: 'Playwright booking' });
  await expect(booking).toBeVisible();

  await booking.getByRole('link', { name: 'изменить' }).click();
  await page.waitForURL('**/bookings/**/edit');
  await page.fill('#title', 'Playwright booking moved');
  await page.fill('#startTime', '11:00');
  await page.fill('#endTime', '11:30');
  await page.getByRole('button', { name: 'сохранить изменения' }).click();
  await page.waitForURL('**/bookings');

  const movedBooking = page
    .locator('.booking-item')
    .filter({ hasText: 'Playwright booking moved' });
  await expect(movedBooking).toContainText('11:00 - 11:30');

  await movedBooking.getByRole('button', { name: 'отменить' }).click();
  await expect(movedBooking).toContainText('отменена');

  await movedBooking.getByRole('button', { name: 'удалить' }).click();
  await expect(
    page.locator('.booking-item').filter({ hasText: 'Playwright booking moved' }),
  ).toHaveCount(0);
});

test('rejects conflicting booking slot', async ({ page }) => {
  await login(page);

  await page.goto('/rooms/room-1/book');
  await page.fill('#title', 'Conflict check');
  await page.fill('#date', dateAfter(1));
  await page.fill('#startTime', '10:15');
  await page.fill('#endTime', '10:30');
  await page.fill('#participants', '2');
  await page.getByRole('button', { name: 'создать бронь' }).click();

  await expect(page.locator('tui-notification')).toContainText('уже забронирован');
  await expect(page).toHaveURL(/\/rooms\/room-1\/book$/);
});

test('admin creates and deletes room', async ({ page }) => {
  await login(page, 'admin@venue.local', 'Admin User');

  await page.goto('/admin');
  await page.getByRole('button', { name: 'новый зал' }).click();
  await page.getByRole('button', { name: 'создать зал' }).click();
  await expect(page.getByText('Укажите название зала.')).toBeVisible();
  await expect(page.getByText('Укажите локацию зала.')).toBeVisible();
  await page.fill('#capacity', '0');
  await page.getByRole('button', { name: 'создать зал' }).click();
  await expect(page.getByText('Вместимость зала должна быть не меньше 1.')).toBeVisible();

  await page.fill('#name', 'focus room');
  await page.fill('#capacity', '3');
  await page.fill('#location', 'floor 5');
  await page.fill('#description', 'quiet room for focused work');
  await page.fill('#equipment', 'wifi, whiteboard');
  await page.getByRole('button', { name: 'создать зал' }).click();

  await expect(page.locator('tui-notification')).toContainText('Зал создан.');
  await expect(page.locator('.admin-room-button').filter({ hasText: 'focus room' })).toBeVisible();

  await page.getByRole('button', { name: 'удалить зал' }).click();
  await expect(page.locator('tui-notification')).toContainText('Зал удалён.');
  await expect(page.locator('.admin-room-button').filter({ hasText: 'focus room' })).toHaveCount(0);
});
