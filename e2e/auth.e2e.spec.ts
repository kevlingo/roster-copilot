import { test, expect, Page } from '@playwright/test';
import sqlite3 from 'sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // For unique usernames/emails
import bcrypt from 'bcrypt'; // Added bcrypt import

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

// Helper function to directly insert a user into the DB for testing login
async function createTestUserInDb(userData: {
  username: string;
  email: string;
  passwordPlain: string;
  emailVerified: boolean;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(TEST_DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) return reject(err);
    });

    bcrypt.hash(userData.passwordPlain, 10, (err: Error | null | undefined, passwordHash: string) => {
      if (err) {
        db.close();
        return reject(err);
      }
      const userId = uuidv4();
      const now = new Date().toISOString();
      db.run(
        `INSERT INTO UserProfiles (userId, username, email, passwordHash, emailVerified, createdAt, updatedAt, selectedArchetype)
         VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
        [userId, userData.username, userData.email, passwordHash, userData.emailVerified ? 1 : 0, now, now],
        function (this: sqlite3.RunResult, err: Error | null) {
          db.close((closeErr) => {
            if (closeErr) console.error('E2E DB Close Error (createTestUserInDb):', closeErr.message);
          });
          if (err) {
            console.error('E2E DB Insert Error (createTestUserInDb):', err.message);
            return reject(err);
          }
          resolve();
        }
      );
    });
  });
}


test.describe('User Authentication E2E Flows', () => { // Renamed describe block
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

  // --- Login Tests ---
  const loginTestUserEmail = `login_e2e_${uuidv4().slice(0,8)}@example.com`;
  const loginTestUserPassword = 'PasswordForLogin123!';
  const loginTestUsername = `login_e2e_user_${uuidv4().slice(0,8)}`;

  test('should allow a verified user to log in successfully and redirect to dashboard', async () => {
    // 1. Create a verified user directly in the DB
    await createTestUserInDb({
      username: loginTestUsername,
      email: loginTestUserEmail,
      passwordPlain: loginTestUserPassword,
      emailVerified: true,
    });

    // 2. Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('h2')).toHaveText('Login to your Account');

    // 3. Fill out and submit the login form
    await page.locator('input[name="email"]').fill(loginTestUserEmail);
    await page.locator('input[name="password"]').fill(loginTestUserPassword);
    await page.locator('button[type="submit"]:has-text("Login")').click();

    // 4. Assert redirection to the dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    // Optionally, check for some element on the dashboard
    // await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('should show an error message for incorrect password', async () => {
    // User created in the previous test (or ensure one exists if tests run in parallel/isolation)
    // For simplicity, we'll rely on the user from the previous test or create a new one if needed.
    // If not relying on previous test, ensure 'loginTestUserEmail' is created and verified.
     await createTestUserInDb({ // Ensure user exists for this test
      username: `login_fail_${uuidv4().slice(0,8)}`,
      email: loginTestUserEmail, // Use the same email to ensure it exists
      passwordPlain: loginTestUserPassword, // Correct password for creation
      emailVerified: true,
    });


    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[name="email"]').fill(loginTestUserEmail);
    await page.locator('input[name="password"]').fill('WrongPassword123!');
    await page.locator('button[type="submit"]:has-text("Login")').click();

    const errorMessage = page.locator('.alert-error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid credentials');
    await expect(page).toHaveURL(`${BASE_URL}/login`); // Should remain on login page
  });

  test('should show an error message for unverified email', async () => {
    const unverifiedEmail = `unverified_${uuidv4().slice(0,8)}@example.com`;
    const unverifiedUsername = `unverified_user_${uuidv4().slice(0,8)}`;
    // 1. Create an unverified user directly in the DB
    await createTestUserInDb({
      username: unverifiedUsername,
      email: unverifiedEmail,
      passwordPlain: loginTestUserPassword,
      emailVerified: false,
    });

    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[name="email"]').fill(unverifiedEmail);
    await page.locator('input[name="password"]').fill(loginTestUserPassword);
    await page.locator('button[type="submit"]:has-text("Login")').click();

    const errorMessage = page.locator('.alert-error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Email not verified');
    await expect(page).toHaveURL(`${BASE_URL}/login`); // Should remain on login page
  });
});