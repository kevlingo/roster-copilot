/**
 * E2E tests for Player Profile Modal functionality
 * Tests the complete user flow from clicking a player name to viewing their details
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Player Profile Modal E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Login and navigate to a page with player cards
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    await page.click('[data-testid="login-button"]');
    
    // Wait for login to complete and navigate to roster page
    await page.waitForURL('**/dashboard');
    await page.goto('/league/test-league-123/roster');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should open player profile modal when clicking player name in roster table', async () => {
    // Wait for roster data to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Find the first player name button in the table
    const firstPlayerButton = page.locator('table tbody tr:first-child td button').first();
    await expect(firstPlayerButton).toBeVisible();

    // Get the player name for verification
    const playerName = await firstPlayerButton.textContent();
    expect(playerName).toBeTruthy();

    // Click the player name
    await firstPlayerButton.click();

    // Verify modal opens
    await expect(page.locator('.modal.modal-open')).toBeVisible();
    await expect(page.locator('[id="modal-title"]')).toContainText('Player Profile');

    // Verify player details are displayed
    await expect(page.locator('.modal-content')).toContainText(playerName!);
    await expect(page.locator('.modal-content')).toContainText('Projected Points');
  });

  test('should open player profile modal when clicking player name in draft card', async () => {
    // Navigate to draft page
    await page.goto('/league/test-league-123/draft');
    await page.waitForLoadState('networkidle');

    // Wait for draft cards to load
    await page.waitForSelector('[data-testid="draft-player-card"]', { timeout: 10000 });

    // Find the first player name button in a draft card
    const firstPlayerButton = page.locator('[data-testid="draft-player-card"] button').first();
    await expect(firstPlayerButton).toBeVisible();

    // Get the player name for verification
    const playerName = await firstPlayerButton.textContent();
    expect(playerName).toBeTruthy();

    // Click the player name
    await firstPlayerButton.click();

    // Verify modal opens
    await expect(page.locator('.modal.modal-open')).toBeVisible();
    await expect(page.locator('[id="modal-title"]')).toContainText('Player Profile');

    // Verify player details are displayed
    await expect(page.locator('.modal-content')).toContainText(playerName!);
  });

  test('should display complete player information in modal', async () => {
    // Navigate to roster and open a player modal
    await page.goto('/league/test-league-123/roster');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const firstPlayerButton = page.locator('table tbody tr:first-child td button').first();
    await firstPlayerButton.click();

    // Wait for modal to open and data to load
    await expect(page.locator('.modal.modal-open')).toBeVisible();
    await page.waitForSelector('.modal-content', { timeout: 5000 });

    // Verify all expected sections are present
    await expect(page.locator('.modal-content')).toContainText('Projected Points');
    
    // Check for player attributes section (if player has attributes)
    const attributesSection = page.locator('.modal-content').locator('text=Player Attributes');
    if (await attributesSection.count() > 0) {
      await expect(page.locator('.modal-content')).toContainText('Consistency');
      await expect(page.locator('.modal-content')).toContainText('Upside Potential');
      await expect(page.locator('.modal-content')).toContainText('Role');
    }

    // Verify position and team are displayed
    const modalContent = await page.locator('.modal-content').textContent();
    expect(modalContent).toMatch(/QB|RB|WR|TE|K|DEF/); // Position
    expect(modalContent).toMatch(/[A-Z]{2,4}/); // Team abbreviation
  });

  test('should close modal when clicking close button', async () => {
    // Open a player modal
    await page.goto('/league/test-league-123/roster');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const firstPlayerButton = page.locator('table tbody tr:first-child td button').first();
    await firstPlayerButton.click();

    // Verify modal is open
    await expect(page.locator('.modal.modal-open')).toBeVisible();

    // Click close button
    await page.click('[aria-label="Close modal"]');

    // Verify modal is closed
    await expect(page.locator('.modal.modal-open')).not.toBeVisible();
  });

  test('should close modal when clicking backdrop', async () => {
    // Open a player modal
    await page.goto('/league/test-league-123/roster');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const firstPlayerButton = page.locator('table tbody tr:first-child td button').first();
    await firstPlayerButton.click();

    // Verify modal is open
    await expect(page.locator('.modal.modal-open')).toBeVisible();

    // Click backdrop (outside modal content)
    await page.click('.modal-backdrop');

    // Verify modal is closed
    await expect(page.locator('.modal.modal-open')).not.toBeVisible();
  });

  test('should close modal when pressing Escape key', async () => {
    // Open a player modal
    await page.goto('/league/test-league-123/roster');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    const firstPlayerButton = page.locator('table tbody tr:first-child td button').first();
    await firstPlayerButton.click();

    // Verify modal is open
    await expect(page.locator('.modal.modal-open')).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(page.locator('.modal.modal-open')).not.toBeVisible();
  });

  test('should handle loading state correctly', async () => {
    // Navigate to roster page
    await page.goto('/league/test-league-123/roster');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Intercept API call to delay response
    await page.route('**/api/players/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      route.continue();
    });

    const firstPlayerButton = page.locator('table tbody tr:first-child td button').first();
    await firstPlayerButton.click();

    // Verify modal opens with loading state
    await expect(page.locator('.modal.modal-open')).toBeVisible();
    await expect(page.locator('.loading.loading-spinner')).toBeVisible();
    await expect(page.locator('.modal-content')).toContainText('Loading player details...');

    // Wait for loading to complete
    await expect(page.locator('.loading.loading-spinner')).not.toBeVisible({ timeout: 10000 });
  });

  test('should handle error state correctly', async () => {
    // Navigate to roster page
    await page.goto('/league/test-league-123/roster');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Intercept API call to return error
    await page.route('**/api/players/**', async route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    const firstPlayerButton = page.locator('table tbody tr:first-child td button').first();
    await firstPlayerButton.click();

    // Verify modal opens with error state
    await expect(page.locator('.modal.modal-open')).toBeVisible();
    await expect(page.locator('.modal-content')).toContainText('Failed to load player data');
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });

  test('should work correctly with multiple player cards on same page', async () => {
    // Navigate to a page with multiple player cards
    await page.goto('/league/test-league-123/roster');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Get all player buttons
    const playerButtons = page.locator('table tbody tr td button');
    const buttonCount = await playerButtons.count();
    expect(buttonCount).toBeGreaterThan(1);

    // Test opening modal for first player
    const firstPlayerName = await playerButtons.nth(0).textContent();
    await playerButtons.nth(0).click();
    await expect(page.locator('.modal.modal-open')).toBeVisible();
    await expect(page.locator('.modal-content')).toContainText(firstPlayerName!);
    
    // Close modal
    await page.click('[aria-label="Close modal"]');
    await expect(page.locator('.modal.modal-open')).not.toBeVisible();

    // Test opening modal for second player
    const secondPlayerName = await playerButtons.nth(1).textContent();
    await playerButtons.nth(1).click();
    await expect(page.locator('.modal.modal-open')).toBeVisible();
    await expect(page.locator('.modal-content')).toContainText(secondPlayerName!);
  });
});
