# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> login flow
- Location: e2e/login.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=available rooms')
Expected: visible
Error: strict mode violation: locator('text=available rooms') resolved to 2 elements:
    1) <h1>available rooms</h1> aka getByRole('heading', { name: 'available rooms' })
    2) <p class="eyebrow">available rooms</p> aka getByRole('paragraph').filter({ hasText: 'available rooms' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=available rooms')

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
    - generic [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e24]: date
          - textbox "date" [ref=e25]
        - generic [ref=e26]:
          - generic [ref=e27]: time
          - textbox "time" [ref=e28]
        - generic [ref=e29]:
          - generic [ref=e30]: capacity
          - spinbutton "capacity" [ref=e31]: "0"
        - generic [ref=e32]:
          - generic [ref=e33]: equipment
          - textbox "equipment" [ref=e34]:
            - /placeholder: projector
        - generic [ref=e35]:
          - generic [ref=e36]: sort
          - combobox "sort" [ref=e37]:
            - option "by name" [selected]
            - option "by capacity"
            - option "by status"
      - generic [ref=e38]:
        - generic [ref=e39]:
          - paragraph [ref=e40]: available rooms
          - heading "choose the room that fits your meeting" [level=2] [ref=e41]
        - generic [ref=e42]: 4 rooms
      - generic [ref=e43]:
        - button "room 1 4 seats free" [ref=e44] [cursor=pointer]:
          - generic [ref=e45]: room 1
          - generic [ref=e46]:
            - generic [ref=e47]: 4 seats
            - generic [ref=e48]: free
        - button "room 2 6 seats busy" [ref=e49] [cursor=pointer]:
          - generic [ref=e50]: room 2
          - generic [ref=e51]:
            - generic [ref=e52]: 6 seats
            - generic [ref=e53]: busy
        - button "room 3 8 seats free" [ref=e54] [cursor=pointer]:
          - generic [ref=e55]: room 3
          - generic [ref=e56]:
            - generic [ref=e57]: 8 seats
            - generic [ref=e58]: free
        - button "room 4 10 seats free" [ref=e59] [cursor=pointer]:
          - generic [ref=e60]: room 4
          - generic [ref=e61]:
            - generic [ref=e62]: 10 seats
            - generic [ref=e63]: free
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('login flow', async ({ page }) => {
  4  |   await page.goto('/auth/login');
  5  | 
  6  |   await page.fill('#name', 'Test User');
  7  |   await page.fill('#email', 'test@venue.local');
  8  |   await page.fill('#password', 'demo-password');
  9  |   await page.click('text=enter dashboard');
  10 | 
  11 |   await page.waitForURL('**/rooms');
> 12 |   await expect(page.locator('text=available rooms')).toBeVisible();
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  13 | });
  14 | 
```