# Test info

- Name: League Creation Flow >> form elements can be interacted with
- Location: C:\Source\roster-copilot\e2e\league-creation.e2e.spec.ts:30:7

# Error details

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="leagueName"]')
    - locator resolved to 2 elements. Proceeding with the first one: <input value="" type="text" required="" maxlength="50" id="leagueName" name="leagueName" class="input input-bordered w-full" placeholder="Enter your league name"/>
    - fill("Test League Name")
  - attempting fill action
    2 × waiting for element to be visible, enabled and editable
      - element is not visible
    - retrying fill action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and editable
      - element is not visible
    - retrying fill action
      - waiting 100ms
    53 × waiting for element to be visible, enabled and editable
       - element is not visible
     - retrying fill action
       - waiting 500ms

    at C:\Source\roster-copilot\e2e\league-creation.e2e.spec.ts:35:16
```

# Page snapshot

```yaml
- complementary:
  - heading "Roster Copilot" [level=1]
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
      - img
      - text: Dashboard
    - link "My Team":
      - /url: /league/league-123/roster
      - img
      - text: My Team
    - link "Players":
      - /url: /league/league-123/waivers
      - img
      - text: Players
    - link "League":
      - /url: /league/league-123/standings
      - img
      - text: League
    - link "AI Copilot Hub":
      - /url: /copilot/digest
      - img
      - text: AI Copilot Hub
  - paragraph: Hackathon PoC
- banner:
  - button "Switch to dark mode":
    - img
  - text: Fantasy User
  - img
- main:
  - heading "Create New League" [level=1]
  - link "← Back to Dashboard":
    - /url: /dashboard
  - text: League Name *
  - textbox "Enter your league name"
  - text: 0/50 characters Number of Teams *
  - combobox:
    - option "8 Teams"
    - option "10 Teams" [selected]
    - option "12 Teams"
  - text: Choose how many teams will be in your league Scoring Type *
  - combobox:
    - option "Standard"
    - option "PPR (Point Per Reception)" [selected]
  - text: PPR gives 1 point for each reception, Standard does not
  - button "Create League"
  - heading "What happens next?" [level=3]
  - list:
    - listitem: You'll be the commissioner of this league
    - listitem: "The draft will be scheduled (status: \"Scheduled\")"
    - listitem: You can invite other users to join your league
    - listitem: Default roster settings will be applied (QB:1, RB:2, WR:2, TE:1, K:1, DEF:1, BENCH:6)
- log
- textbox "Type your message..."
- button "Send message":
  - img
- button "Hide chat history" [pressed]
- button "Chat settings":
  - img
- alert
```

# Test source

```ts
   1 | /**
   2 |  * E2E tests for League Creation flow
   3 |  * Tests basic page functionality and form rendering
   4 |  */
   5 |
   6 | import { test, expect } from '@playwright/test';
   7 |
   8 | test.describe('League Creation Flow', () => {
   9 |   test('create league page loads correctly', async ({ page }) => {
  10 |     // Navigate directly to create league page
  11 |     await page.goto('/league/create');
  12 |
  13 |     // Check that the page loads and has the correct title
  14 |     await expect(page.locator('h1')).toContainText('Create New League');
  15 |
  16 |     // Check that form elements are present
  17 |     await expect(page.locator('input[name="leagueName"]')).toBeVisible();
  18 |     await expect(page.locator('select[name="numberOfTeams"]')).toBeVisible();
  19 |     await expect(page.locator('select[name="scoringType"]')).toBeVisible();
  20 |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  21 |
  22 |     // Check that back to dashboard link is present
  23 |     await expect(page.locator('text=Back to Dashboard')).toBeVisible();
  24 |
  25 |     // Check that form has correct default values
  26 |     await expect(page.locator('select[name="numberOfTeams"]')).toHaveValue('10');
  27 |     await expect(page.locator('select[name="scoringType"]')).toHaveValue('PPR');
  28 |   });
  29 |
  30 |   test('form elements can be interacted with', async ({ page }) => {
  31 |     // Navigate to create league page
  32 |     await page.goto('/league/create');
  33 |
  34 |     // Fill in league name
> 35 |     await page.fill('input[name="leagueName"]', 'Test League Name');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  36 |     await expect(page.locator('input[name="leagueName"]')).toHaveValue('Test League Name');
  37 |
  38 |     // Change number of teams
  39 |     await page.selectOption('select[name="numberOfTeams"]', '12');
  40 |     await expect(page.locator('select[name="numberOfTeams"]')).toHaveValue('12');
  41 |
  42 |     // Change scoring type
  43 |     await page.selectOption('select[name="scoringType"]', 'Standard');
  44 |     await expect(page.locator('select[name="scoringType"]')).toHaveValue('Standard');
  45 |   });
  46 |
  47 |   test('back to dashboard link works', async ({ page }) => {
  48 |     // Navigate to create league page
  49 |     await page.goto('/league/create');
  50 |
  51 |     // Click back to dashboard link
  52 |     await page.click('text=Back to Dashboard');
  53 |
  54 |     // Should navigate back to dashboard
  55 |     await page.waitForURL('/dashboard');
  56 |     await expect(page.locator('h1')).toContainText('Dashboard');
  57 |   });
  58 | });
  59 |
```