# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: booking.spec.ts >> create booking flow
- Location: e2e/booking.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/bookings" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - complementary [ref=e5]:
    - generic [ref=e6]: venue
    - navigation [ref=e7]:
      - link "dashboard" [ref=e8] [cursor=pointer]:
        - /url: /rooms
      - link "bookings" [ref=e9] [cursor=pointer]:
        - /url: /bookings
      - link "statistics" [ref=e10] [cursor=pointer]:
        - /url: /statistics
    - generic [ref=e11]:
      - generic [ref=e12]: pink & yellow office booking prototype
      - button "logout" [ref=e13] [cursor=pointer]
  - main [ref=e14]:
    - generic [ref=e15]:
      - generic [ref=e16]:
        - paragraph [ref=e17]: meeting rooms
        - heading "available rooms" [level=1] [ref=e18]
      - generic [ref=e19]: Test User
    - generic [ref=e23]:
      - generic [ref=e24]:
        - generic [ref=e25]:
          - paragraph [ref=e26]: create booking
          - heading "room 1" [level=2] [ref=e27]
        - button "x" [ref=e28] [cursor=pointer]
      - generic [ref=e29]:
        - generic [ref=e30]:
          - generic [ref=e31]: room
          - combobox "room" [ref=e32]:
            - option "room 1" [selected]
            - option "room 2"
            - option "room 3"
            - option "room 4"
        - generic [ref=e33]:
          - generic [ref=e34]: title
          - textbox "title" [ref=e35]:
            - /placeholder: team sync
            - text: Playwright booking
        - generic [ref=e36]:
          - generic [ref=e37]:
            - generic [ref=e38]: date
            - textbox "date" [ref=e39]: 2026-06-02
          - generic [ref=e40]:
            - generic [ref=e41]: time
            - textbox "time" [ref=e42]: 10:00
          - generic [ref=e43]:
            - generic [ref=e44]: end
            - textbox "end" [ref=e45]: 10:30
        - generic [ref=e46]:
          - generic [ref=e47]: participants
          - spinbutton "participants" [ref=e48]: "2"
        - generic [ref=e49]:
          - paragraph [ref=e50]: required equipment
          - generic [ref=e51]:
            - generic [ref=e52]:
              - checkbox "projector" [checked] [ref=e53]
              - generic [ref=e54]: projector
            - generic [ref=e55]:
              - checkbox "wifi" [checked] [ref=e56]
              - generic [ref=e57]: wifi
        - button "create booking" [ref=e59] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('create booking flow', async ({ page }) => {
  4  |   // ensure user is logged in
  5  |   await page.goto('/auth/login');
  6  |   await page.fill('#name', 'Test User');
  7  |   await page.fill('#email', 'test@venue.local');
  8  |   await page.fill('#password', 'demo-password');
  9  |   await page.click('text=enter dashboard');
  10 |   await page.waitForURL('**/rooms');
  11 | 
  12 |   // open first room
  13 |   await page.click('.rooms-grid .room-card');
  14 |   await page.waitForURL('**/room-details/**');
  15 | 
  16 |   // click book and open booking form (route may navigate to /page or /rooms/:id/book)
  17 |   await page.click('text=book this room');
  18 |   await page.waitForSelector('form');
  19 | 
  20 |   // fill booking form
  21 |   await page.fill('#title', 'Playwright booking');
  22 |   await page.fill('#date', '2026-06-02');
  23 |   await page.fill('#startTime', '10:00');
  24 |   await page.fill('#endTime', '10:30');
  25 |   await page.fill('#participants', '2');
  26 |   await page.click('text=create booking');
  27 | 
  28 |   // expect redirected to bookings and see new booking
> 29 |   await page.waitForURL('**/bookings');
     |              ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  30 |   await expect(page.locator('text=my bookings')).toBeVisible();
  31 | });
  32 | 
```