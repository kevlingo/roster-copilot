# Debug Log

## Story 1.0.3: Setup Core API Middleware

- **File Path:** [`jest.config.js`](jest.config.js:1), [`jest.setup.js`](jest.setup.js:1)
- **Change Description:**
    - Attempt 1 (2025-06-03): Added `node-fetch` dev dependency. Updated [`jest.setup.js`](jest.setup.js:1) to polyfill Fetch API globals (`Request`, `Response`, `Headers`, `fetch`, `TextEncoder`, `TextDecoder`) using `node-fetch` and `util`. Test Result: `ReferenceError: Request is not defined`.
    - Attempt 2 (2025-06-03): Modified [`jest.setup.js`](jest.setup.js:1) type assertions for polyfills (e.g. `global.fetch = fetchPolyfill as typeof global.fetch;`) to remove `as typeof` which caused TS errors in a JS file. Test Result: `SyntaxError: Cannot use import statement outside a module` (from `node-fetch` in `jest.setup.js`).
    - Attempt 3 (2025-06-03): Modified [`jest.config.js`](jest.config.js:1) to include `transformIgnorePatterns: ['/node_modules/(?!node-fetch)/', '\\.pnp\\.[^\\/]+$']` to try and force transformation of `node-fetch`. Test Result: `SyntaxError: Cannot use import statement outside a module` (from `node-fetch` in `jest.setup.js`) persists.
    - Attempt 4 (2025-06-03 - based on search): Retained the `transformIgnorePatterns: ['/node_modules/(?!node-fetch)/', '\\.pnp\\.[^\\/]+$']` as it appeared to be the correct general approach according to online sources for allowing `node-fetch` to be transformed. Test Result: `SyntaxError: Cannot use import statement outside a module` (from `node-fetch` in `jest.setup.js`) persists. The issue seems more stubborn than just `transformIgnorePatterns`.
- **Rationale:** Attempting to resolve Jest's inability to handle ESM `import` statements from `node-fetch` (v3+) when setting up polyfills for Fetch API globals needed for testing Next.js API route handlers, or alternatively, to mock Next.js server objects.
- **Expected Outcome:** Unit tests for `lib/api/middleware/route-handlers.test.ts` pass.
- **Actual Outcome:**
    - Attempts 1-4 (polyfilling `node-fetch`): Failed due to ESM/CJS conflicts and Jest's handling of `node-fetch` v3+.
    - Attempt 5 (Pivoting strategy after user feedback - 2025-06-03):
        - Reverted `node-fetch` related changes in `jest.setup.js` and `jest.config.js`. Uninstalled `node-fetch`.
        - Updated `lib/api/middleware/route-handlers.test.ts` to manually mock `NextRequest` and `NextResponse` objects within the test file itself.
        - Added `jest.mock('next/server', ...)` at the top of `lib/api/middleware/route-handlers.test.ts` to mock the `next/server` module, preventing `ReferenceError: Request is not defined` when Jest loads the SUT (`lib/api/middleware/route-handlers.ts`).
- **Status:** Resolved (2025-06-03). Tests passed after implementing `jest.mock('next/server')`.

## Story 1.1: E2E Test Debug - User Account Creation with Email Verification (Playwright `webServer` DB issue)

- **File Path:** [`lib/dal/db.ts`](lib/dal/db.ts:1), [`app/api/auth/signup/route.ts`](app/api/auth/signup/route.ts:1)
- **Change Description (Attempt 1 - Logging):** Added `console.log` and `console.error` statements for `process.cwd()`, resolved `DB_PATH`, and enhanced error object logging in database connection, schema initialization, user creation, and token creation steps.
- **Rationale:** To diagnose if `process.cwd()` or DB path resolution is incorrect when Next.js dev server is run by Playwright's `webServer`, and to capture more specific SQLite errors during the E2E test execution that fails at signup.
- **Expected Outcome:** Console logs from the Next.js server (started by Playwright) should reveal the actual CWD, DB path, and any specific errors encountered by SQLite, helping pinpoint why `createUserProfile` fails.
- **Status:** Reverted (2025-06-03). Logging helped identify issues; now removed.

## Story 1.1: E2E Test Debug - DB Connection for Email Verification API

- **File Path:** [`app/api/auth/verify-email/[token]/route.ts`](app/api/auth/verify-email/[token]/route.ts:1)
- **Change Description (Attempt 1 - DB Init):** Added `await initializeDatabase();` at the beginning of the `verifyEmailHandler` function.
- **Rationale:** The E2E test for email verification failed because the `/api/auth/verify-email/[token]` route encountered a "Database not connected" error. This was likely due to the database instance not being initialized or available for this specific request when run under Playwright's webServer. Adding `initializeDatabase()` ensures the DB connection is established before DAL operations.
- **Expected Outcome:** The E2E test for user registration and email verification should pass, as the verify-email endpoint will now correctly connect to the database.
- **Status:** Resolved (2025-06-04). E2E test passed after adding `initializeDatabase()` to `verifyEmailHandler`.

## Story 1.2: User Login - Backend API Endpoint
... (JWT entries) ...
- **Status:** Success.

## Story 1.2: User Login - Frontend Client-Side Validation Tests (`app/(auth)/login/page.test.tsx`)

- **File Path:** [`app/(auth)/login/page.test.tsx`](app/(auth)/login/page.test.tsx)
- **Change Description (Debug Attempt - `screen.debug()`):**
  Added `console.log(screen.debug(...))` in failing tests.
- **Rationale:** Inspect DOM state.
- **Actual Outcome:** Error elements not present in DOM.
- **Status:** Completed. Debug lines were removed.

- **File Path:** [`app/(auth)/login/page.test.tsx`](app/(auth)/login/page.test.tsx)
- **Change Description (Debug Attempt - Mock `React.useState` for `error` state using `jest.spyOn`):**
  Mocked `React.useState` with `jest.spyOn` to spy on `setError`.
- **Rationale:** Confirm `setError` invocation.
- **Actual Outcome:** Spy did not register calls, despite component logs (next step) showing `setError` line was hit.
- **Status:** Superseded by root cause.

- **File Path:** [`app/(auth)/login/page.tsx`](app/(auth)/login/page.tsx) & [`app/(auth)/login/page.test.tsx`](app/(auth)/login/page.test.tsx)
- **Change Description (Debug Attempt - `console.log` in `handleSubmit`):**
  Added `console.log` in `handleSubmit` of `LoginPage`.
- **Rationale:** Observe data flow in `handleSubmit`.
- **Actual Outcome:** Component logs confirmed `setError` line was reached, but spy in test didn't register.
- **Status:** Superseded by root cause. Console logs should be removed.

- **File Path:** [`app/(auth)/login/page.test.tsx`](app/(auth)/login/page.test.tsx)
- **Change Description (Refine `React.useState` mock setup / `jest.mock('react')`):**
  Multiple attempts to refine `useState` mocking, including `jest.mock('react')`.
- **Rationale:** Address potential import/spy issues.
- **Actual Outcome:** Spy (`mockSetError`) still failed to register calls.
- **Status:** Superseded by root cause. All `useState` mocking should be removed from tests.

- **ROOT CAUSE IDENTIFIED & FIXED (by User on 2025-06-04):**
  - **Problem:** HTML5 `required` attributes on email/password inputs in `app/(auth)/login/page.tsx` prevented form submission with empty fields, bypassing custom validation logic (`handleSubmit` and `setError` calls).
  - **Fix Applied by User:** Removed `required` attributes from the email and password input fields in `app/(auth)/login/page.tsx`.
  - **Consequence:** This should allow `handleSubmit` to execute and custom client-side validation to run, making `setError` calls effective.
- **Next Step:** Validate the fix by running all tests. All temporary debugging code (console.logs in component, useState mocks in tests) should be removed by the user or by me after test validation.
- **Status:** Fix applied by user. Pending test validation.