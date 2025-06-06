/**
 * E2E Test for Archetype Onboarding Flow
 * Story 2.1: Core Conversational Fantasy Manager Archetype Selection
 */

import { test, expect } from '@playwright/test';

test.describe('Archetype Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Login with seeded user (who has selectedArchetype: null)
    await page.fill('input[name="email"]', 'kevlingo@gmail.com');
    await page.fill('input[name="password"]', '7fej3w_ixVjRaKW');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
  });

  test('should start onboarding conversation for user without selected archetype', async ({ page }) => {
    // Look for the chat interface
    const chatInterface = page.locator('[data-testid="chat-interface"]');
    await expect(chatInterface).toBeVisible();
    
    // Check if onboarding message appears
    const onboardingMessage = page.locator('text=Hi! I\'m your AI Copilot');
    await expect(onboardingMessage).toBeVisible({ timeout: 10000 });
    
    // Verify archetype presentation
    const archetypeMessage = page.locator('text=Eager Learner');
    await expect(archetypeMessage).toBeVisible();
  });

  test('should handle archetype selection by name', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });
    
    // Find chat input and respond with archetype selection
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await expect(chatInput).toBeVisible();
    
    await chatInput.fill('I want to be an Eager Learner');
    await page.keyboard.press('Enter');
    
    // Wait for confirmation message
    const confirmationMessage = page.locator('text=Great choice!');
    await expect(confirmationMessage).toBeVisible({ timeout: 10000 });
    
    // Verify confirmation question
    const confirmationQuestion = page.locator('text=Is this correct?');
    await expect(confirmationQuestion).toBeVisible();
  });

  test('should handle archetype selection by number', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });
    
    // Find chat input and respond with number selection
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('I choose number 1');
    await page.keyboard.press('Enter');
    
    // Wait for confirmation message
    const confirmationMessage = page.locator('text=Great choice!');
    await expect(confirmationMessage).toBeVisible({ timeout: 10000 });
  });

  test('should complete onboarding flow for Eager Learner', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });
    
    // Select Eager Learner
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('Eager Learner');
    await page.keyboard.press('Enter');
    
    // Wait for confirmation and confirm
    await page.waitForSelector('text=Is this correct?', { timeout: 10000 });
    await chatInput.fill('yes');
    await page.keyboard.press('Enter');
    
    // Verify transition to questionnaire message
    const questionnaireMessage = page.locator('text=quick questions');
    await expect(questionnaireMessage).toBeVisible({ timeout: 10000 });
  });

  test('should complete onboarding flow for other archetypes', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });
    
    // Select Bold Playmaker
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('Bold Playmaker');
    await page.keyboard.press('Enter');
    
    // Wait for confirmation and confirm
    await page.waitForSelector('text=Is this correct?', { timeout: 10000 });
    await chatInput.fill('yes');
    await page.keyboard.press('Enter');
    
    // Verify completion message (no questionnaire for non-Eager Learner)
    const completionMessage = page.locator('text=You\'re all set');
    await expect(completionMessage).toBeVisible({ timeout: 10000 });
  });

  test('should handle unclear responses with clarification', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });
    
    // Give unclear response
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('I like football');
    await page.keyboard.press('Enter');
    
    // Verify clarification request
    const clarificationMessage = page.locator('text=Which of these sounds most like you');
    await expect(clarificationMessage).toBeVisible({ timeout: 10000 });
  });

  test('should allow user to change selection', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });
    
    // Select an archetype
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('Eager Learner');
    await page.keyboard.press('Enter');
    
    // Wait for confirmation and reject
    await page.waitForSelector('text=Is this correct?', { timeout: 10000 });
    await chatInput.fill('no, I want to change');
    await page.keyboard.press('Enter');
    
    // Verify return to selection
    const selectionMessage = page.locator('text=Let\'s find the right archetype');
    await expect(selectionMessage).toBeVisible({ timeout: 10000 });
  });
});
