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

  test('should handle express mode archetype selection by name', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });

    // Find chat input and respond to start onboarding
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await expect(chatInput).toBeVisible();

    // Respond to greeting to trigger mode selection
    await chatInput.fill('hello');
    await page.keyboard.press('Enter');

    // Wait for mode selection and choose Quick Setup
    await page.waitForSelector('text=Quick Setup', { timeout: 10000 });
    await chatInput.fill('Quick Setup');
    await page.keyboard.press('Enter');

    // Wait for express archetype presentation and select archetype
    await page.waitForSelector('text=Here are your four Fantasy Manager Archetypes', { timeout: 10000 });
    await chatInput.fill('Eager Learner');
    await page.keyboard.press('Enter');

    // Wait for express confirmation message
    const confirmationMessage = page.locator('text=Perfect! You\'re a **Eager Learner**');
    await expect(confirmationMessage).toBeVisible({ timeout: 10000 });

    // Verify confirmation question
    const confirmationQuestion = page.locator('text=Is this correct?');
    await expect(confirmationQuestion).toBeVisible();
  });

  test('should handle express mode archetype selection by number', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });

    // Find chat input and respond to start onboarding
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');

    // Respond to greeting to trigger mode selection
    await chatInput.fill('hello');
    await page.keyboard.press('Enter');

    // Wait for mode selection and choose Quick Setup
    await page.waitForSelector('text=Quick Setup', { timeout: 10000 });
    await chatInput.fill('1');
    await page.keyboard.press('Enter');

    // Wait for express archetype presentation and select by number
    await page.waitForSelector('text=Here are your four Fantasy Manager Archetypes', { timeout: 10000 });
    await chatInput.fill('1');
    await page.keyboard.press('Enter');

    // Wait for express confirmation message
    const confirmationMessage = page.locator('text=Perfect! You\'re a **Eager Learner**');
    await expect(confirmationMessage).toBeVisible({ timeout: 10000 });
  });

  test('should complete express mode onboarding flow for Eager Learner', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });

    // Start onboarding and select express mode
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('hello');
    await page.keyboard.press('Enter');

    // Select Quick Setup mode
    await page.waitForSelector('text=Quick Setup', { timeout: 10000 });
    await chatInput.fill('Quick Setup');
    await page.keyboard.press('Enter');

    // Select Eager Learner
    await page.waitForSelector('text=Here are your four Fantasy Manager Archetypes', { timeout: 10000 });
    await chatInput.fill('Eager Learner');
    await page.keyboard.press('Enter');

    // Wait for confirmation and confirm
    await page.waitForSelector('text=Is this correct?', { timeout: 10000 });
    await chatInput.fill('yes');
    await page.keyboard.press('Enter');

    // Verify transition to express questionnaire message
    const questionnaireMessage = page.locator('text=few quick questions');
    await expect(questionnaireMessage).toBeVisible({ timeout: 10000 });
  });

  test('should complete express mode onboarding flow for other archetypes', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });

    // Start onboarding and select express mode
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('hello');
    await page.keyboard.press('Enter');

    // Select Quick Setup mode
    await page.waitForSelector('text=Quick Setup', { timeout: 10000 });
    await chatInput.fill('Quick Setup');
    await page.keyboard.press('Enter');

    // Select Bold Playmaker
    await page.waitForSelector('text=Here are your four Fantasy Manager Archetypes', { timeout: 10000 });
    await chatInput.fill('Bold Playmaker');
    await page.keyboard.press('Enter');

    // Wait for confirmation and confirm
    await page.waitForSelector('text=Is this correct?', { timeout: 10000 });
    await chatInput.fill('yes');
    await page.keyboard.press('Enter');

    // Verify express completion message (no questionnaire for non-Eager Learner)
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

  test('should allow user to change selection in express mode', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });

    // Start onboarding and select express mode
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('hello');
    await page.keyboard.press('Enter');

    // Select Quick Setup mode
    await page.waitForSelector('text=Quick Setup', { timeout: 10000 });
    await chatInput.fill('Quick Setup');
    await page.keyboard.press('Enter');

    // Select an archetype
    await page.waitForSelector('text=Here are your four Fantasy Manager Archetypes', { timeout: 10000 });
    await chatInput.fill('Eager Learner');
    await page.keyboard.press('Enter');

    // Wait for confirmation and reject
    await page.waitForSelector('text=Is this correct?', { timeout: 10000 });
    await chatInput.fill('no, I want to change');
    await page.keyboard.press('Enter');

    // Verify return to express selection
    const selectionMessage = page.locator('text=Here are your four Fantasy Manager Archetypes');
    await expect(selectionMessage).toBeVisible({ timeout: 10000 });
  });

  test('should handle full mode conversation flow', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });

    // Start onboarding and select full mode
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('hello');
    await page.keyboard.press('Enter');

    // Select Let's Chat mode
    await page.waitForSelector('text=Let\'s Chat', { timeout: 10000 });
    await chatInput.fill('Let\'s Chat');
    await page.keyboard.press('Enter');

    // Verify transition message
    const transitionMessage = page.locator('text=take our time');
    await expect(transitionMessage).toBeVisible({ timeout: 10000 });

    // Say ready to proceed
    await chatInput.fill('ready');
    await page.keyboard.press('Enter');

    // Select archetype in full mode
    await chatInput.fill('Eager Learner');
    await page.keyboard.press('Enter');

    // Wait for full confirmation and confirm
    await page.waitForSelector('text=Is this correct?', { timeout: 10000 });
    await chatInput.fill('yes');
    await page.keyboard.press('Enter');

    // Verify full questionnaire transition message
    const questionnaireMessage = page.locator('text=quick questions that will help me personalize');
    await expect(questionnaireMessage).toBeVisible({ timeout: 10000 });
  });

  test('should allow mode switching from express to full', async ({ page }) => {
    // Wait for onboarding to start
    await page.waitForSelector('text=Hi! I\'m your AI Copilot', { timeout: 10000 });

    // Start onboarding and select express mode
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('hello');
    await page.keyboard.press('Enter');

    // Select Quick Setup mode
    await page.waitForSelector('text=Quick Setup', { timeout: 10000 });
    await chatInput.fill('Quick Setup');
    await page.keyboard.press('Enter');

    // Request mode switch
    await page.waitForSelector('text=Here are your four Fantasy Manager Archetypes', { timeout: 10000 });
    await chatInput.fill('I want more details');
    await page.keyboard.press('Enter');

    // Verify switch to full mode
    const switchMessage = page.locator('text=switch to the full conversation mode');
    await expect(switchMessage).toBeVisible({ timeout: 10000 });

    // Verify full archetype presentation
    const fullPresentation = page.locator('text=Great! Let me introduce you to the four Fantasy Manager Archetypes');
    await expect(fullPresentation).toBeVisible({ timeout: 10000 });
  });
});
