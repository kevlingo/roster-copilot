import { test, expect, Page } from '@playwright/test';
import sqlite3 from 'sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // For unique usernames/emails

const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'roster_copilot_poc.db'); // Corrected DB name
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Helper function to get the latest verification token for an email from the DB
async function getLatestVerificationToken(email: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(TEST_DB_PATH, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('E2E DB Connect Error:', err.message);
        return reject(err);
      }
    });

    db.get(
      'SELECT token FROM EmailVerificationTokens_PoC WHERE email = ? ORDER BY createdAt DESC LIMIT 1',
      [email],
      (err, row: any) => {
        if (err) {
          console.error('E2E DB Query Error:', err.message);
          db.close();
          return reject(err);
        }
        db.close((closeErr) => {
          if (closeErr) console.error('E2E DB Close Error:', closeErr.message);
        });
        resolve(row ? row.token : null);
      }
    );
  });
}

test.describe('User Registration and Email Verification E2E Flow', () => {
  let page: Page;
  let uniqueUserSuffix: string;
  let testUsername: string;
  let testEmail: string;
  const testPassword = 'Password123!';

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.beforeEach(async ({ page }) => { // Pass page fixture here
    uniqueUserSuffix = uuidv4().slice(0, 8);
    testUsername = `e2euser_${uniqueUserSuffix}`;
    testEmail = `e2e_${uniqueUserSuffix}@example.com`;

    // Listen for console errors from the browser page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`E2E Browser Console ERROR: ${msg.text()}`);
      }
    });
    page.on('pageerror', exception => {
      console.log(`E2E Uncaught exception in page: "${exception}"`);
    });

  });
  
  test.afterAll(async () => {
    await page.close();
  });

  test('should allow a user to sign up, verify email, and see verification success on login page', async () => {
    // 1. Navigate to signup page
    await page.goto(`${BASE_URL}/signup`);
    await expect(page.locator('h2')).toHaveText('Create Account');

    // 2. Fill out and submit the signup form
    await page.locator('input[name="username"]').fill(testUsername);
    await page.locator('input[name="email"]').fill(testEmail);
    await page.locator('input[name="password"]').fill(testPassword);
    await page.locator('input[name="passwordConfirmation"]').fill(testPassword);
    await page.locator('input[name="terms"]').check();
    await page.locator('button[type="submit"]:has-text("Sign Up")').click();
    
    // 3. Assert success message about email verification
    const successMessageLocator = page.locator('.alert-success');
    // Use getByText with a regex for the specific error message.
    const errorMessageLocator = page.getByText(/Failed to create user account. Please try again./i);

    try {
      await expect(successMessageLocator).toBeVisible({ timeout: 10000 });
      await expect(successMessageLocator).toContainText('User registered successfully. Please check your email to verify your account.');
    } catch (e) {
      console.log("Success message not found. Checking for error messages...");
      const errorVisible = await errorMessageLocator.first().isVisible({timeout: 1000});
      if(errorVisible){
        const errorText = await errorMessageLocator.first().textContent();
        console.log("Visible error message on page:", errorText);
      }
      const pageContent = await page.content();
      console.log("Page content on failure:\n", pageContent.substring(0, 2000)); // Log first 2000 chars
      throw e; // Re-throw the original error to fail the test
    }

    // 4. Retrieve the verification token from the test database
    let verificationToken: string | null = null;
    try {
      verificationToken = await getLatestVerificationToken(testEmail);
    } catch (error) {
      console.error("Failed to retrieve verification token from DB during E2E test:", error);
      // Optionally, fail the test here if token retrieval is critical and fails
      // For now, we'll let it proceed and Playwright will fail on navigation if token is null.
    }
    expect(verificationToken, "Verification token should be found in the database.").not.toBeNull();
    
    // 5. Construct the verification URL and navigate to it
    const verificationUrl = `${BASE_URL}/api/auth/verify-email/${verificationToken}`;
    await page.goto(verificationUrl);

    // 6. Assert redirection to the login page
    // After verification, the API should redirect to /login with query params
    await page.waitForURL(`${BASE_URL}/login?verified=true&email=${encodeURIComponent(testEmail)}`, { timeout: 10000 });
    await expect(page).toHaveURL(`${BASE_URL}/login?verified=true&email=${encodeURIComponent(testEmail)}`);
    
    // 7. Assert success message on login page
    // This message is displayed by the Login page component based on query params
    const loginPageSuccessMessage = page.locator('.alert-success'); // Assuming similar alert on login
    await expect(loginPageSuccessMessage).toBeVisible();
    await expect(loginPageSuccessMessage).toContainText('Email verified successfully! Please log in.');

    // 8. Assert email field is pre-filled
    await expect(page.locator('input[name="email"]')).toHaveValue(testEmail);
  });
});