import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Read environment variables from file.
// require('dotenv').config();

// Use process.env.PORT by default and fallback to 3000 if not available.
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: path.join(__dirname, 'e2e'), // Points to the e2e directory
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  // Run your local dev server before starting the tests:
  webServer: {
    command: 'npm run dev', // Command to start the Next.js dev server
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes timeout for server to start
    stdout: 'pipe',
    stderr: 'pipe',
  },
});