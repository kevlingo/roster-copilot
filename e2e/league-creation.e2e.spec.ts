/**
 * E2E tests for League Creation flow
 * Tests basic page functionality and form rendering
 */

import { test, expect } from '@playwright/test';

test.describe('League Creation Flow', () => {
  test('create league page loads correctly', async ({ page }) => {
    // Navigate directly to create league page
    await page.goto('/league/create');

    // Check that the page loads and has the correct title
    await expect(page.locator('h1')).toContainText('Create New League');

    // Check that form elements are present
    await expect(page.locator('input[name="leagueName"]')).toBeVisible();
    await expect(page.locator('select[name="numberOfTeams"]')).toBeVisible();
    await expect(page.locator('select[name="scoringType"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check that back to dashboard link is present
    await expect(page.locator('text=Back to Dashboard')).toBeVisible();

    // Check that form has correct default values
    await expect(page.locator('select[name="numberOfTeams"]')).toHaveValue('10');
    await expect(page.locator('select[name="scoringType"]')).toHaveValue('PPR');
  });

  test('form elements can be interacted with', async ({ page }) => {
    // Navigate to create league page
    await page.goto('/league/create');

    // Fill in league name
    await page.fill('input[name="leagueName"]', 'Test League Name');
    await expect(page.locator('input[name="leagueName"]')).toHaveValue('Test League Name');

    // Change number of teams
    await page.selectOption('select[name="numberOfTeams"]', '12');
    await expect(page.locator('select[name="numberOfTeams"]')).toHaveValue('12');

    // Change scoring type
    await page.selectOption('select[name="scoringType"]', 'Standard');
    await expect(page.locator('select[name="scoringType"]')).toHaveValue('Standard');
  });

  test('back to dashboard link works', async ({ page }) => {
    // Navigate to create league page
    await page.goto('/league/create');

    // Click back to dashboard link
    await page.click('text=Back to Dashboard');

    // Should navigate back to dashboard
    await page.waitForURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
