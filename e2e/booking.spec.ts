import { expect, Page, test } from '@playwright/test';

async function login(page: Page, email = 'test@venue.local', name = 'Test User'): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('#name', name);
  await page.fill('#email', email);
  await page.fill('#password', 'demo-password');
  await page.getByRole('button', { name: 'enter dashboard' }).click();
  await page.waitForURL('**/rooms');
}

test('filters rooms by equipment, capacity and availability', async ({ page }) => {
  await login(page);

  await page.fill('#equipment', 'projector');
  await expect(page.locator('.room-card')).toHaveCount(3);

  await page.fill('#capacity', '9');
  await expect(page.locator('.room-card')).toHaveCount(1);
  await expect(page.locator('.room-card')).toContainText('room 4');

  await page.getByRole('button', { name: 'reset filters' }).click();
  await page.fill('#date', '2026-06-06');
  await page.fill('#time', '10:15');
  await page.locator('#capacity').fill('0');
  await page.locator('label').filter({ hasText: 'available only' }).locator('input').check();
  await expect(page.locator('.room-card').filter({ hasText: 'room 1' })).toHaveCount(0);
});

test('creates, edits, cancels and deletes booking', async ({ page }) => {
  await login(page);

  await page.locator('.room-card').filter({ hasText: 'room 4' }).click();
  await page.waitForURL('**/room-details/**');
  await page.getByRole('button', { name: 'book this room' }).click();
  await page.waitForURL('**/rooms/room-4/book');

  await page.fill('#title', 'Playwright booking');
  await page.fill('#date', '2026-06-22');
  await page.fill('#startTime', '10:00');
  await page.fill('#endTime', '10:30');
  await page.fill('#participants', '2');
  await page.getByRole('button', { name: 'create booking' }).click();

  await page.waitForURL('**/bookings');
  const booking = page.locator('.booking-item').filter({ hasText: 'Playwright booking' });
  await expect(booking).toBeVisible();
  await expect(page.locator('.summary-card').first()).toContainText('1');

  await booking.getByRole('link', { name: 'edit' }).click();
  await page.waitForURL('**/bookings/**/edit');
  await page.fill('#title', 'Playwright booking moved');
  await page.fill('#startTime', '11:00');
  await page.fill('#endTime', '11:30');
  await page.getByRole('button', { name: 'save changes' }).click();
  await page.waitForURL('**/bookings');

  const movedBooking = page
    .locator('.booking-item')
    .filter({ hasText: 'Playwright booking moved' });
  await expect(movedBooking).toContainText('11:00 - 11:30');

  await movedBooking.getByRole('button', { name: 'cancel' }).click();
  await expect(movedBooking).toContainText('cancelled');
  await expect(page.locator('.summary-card').first()).toContainText('0');

  await movedBooking.getByRole('button', { name: 'delete' }).click();
  await expect(
    page.locator('.booking-item').filter({ hasText: 'Playwright booking moved' }),
  ).toHaveCount(0);
});

test('rejects conflicting booking slot', async ({ page }) => {
  await login(page);

  await page.goto('/rooms/room-1/book');
  await page.fill('#title', 'Conflict check');
  await page.fill('#date', '2026-06-06');
  await page.fill('#startTime', '10:15');
  await page.fill('#endTime', '10:30');
  await page.fill('#participants', '2');
  await page.getByRole('button', { name: 'create booking' }).click();

  await expect(page.locator('tui-notification')).toContainText('already has an active booking');
  await expect(page).toHaveURL(/\/rooms\/room-1\/book$/);
});

test('admin creates and deletes room', async ({ page }) => {
  await login(page, 'admin@venue.local', 'Admin User');

  await page.goto('/admin');
  await page.getByRole('button', { name: 'new room' }).click();
  await page.fill('#name', 'focus room');
  await page.fill('#capacity', '3');
  await page.fill('#location', 'floor 5');
  await page.fill('#description', 'quiet room for focused work');
  await page.fill('#equipment', 'wifi, whiteboard');
  await page.getByRole('button', { name: 'create room' }).click();

  await expect(page.locator('tui-notification')).toContainText('Room created.');
  await expect(page.locator('.admin-room-button').filter({ hasText: 'focus room' })).toBeVisible();

  await page.getByRole('button', { name: 'delete room' }).click();
  await expect(page.locator('tui-notification')).toContainText('Room deleted.');
  await expect(page.locator('.admin-room-button').filter({ hasText: 'focus room' })).toHaveCount(0);
});
