## Operational Guidelines

This document consolidates key operational aspects for the Roster Copilot Proof-of-Concept, including coding standards, testing strategy, error handling, and security best practices.

### Coding Standards

These standards are mandatory for all code developed for the Roster Copilot Proof-of-Concept.
* **Primary Runtimes & Languages:** TypeScript 5.5.3, Node.js (~20.x or ~22.x LTS), Next.js 15.3.3, React 19.1.0. (Framework modernization completed 2025-06-07)
* **Style Guide & Linter:** ESLint (with `eslint-config-next`) and Prettier (default settings). Adherence expected.
* **Naming Conventions:**
    * Variables & Functions/Methods: `camelCase`.
    * Classes, React Components, Types & Interfaces: `PascalCase`.
    * Constants: `UPPER_SNAKE_CASE`.
    * File Names: React Component files: `PascalCase.tsx`. Non-component TypeScript files: `kebab-case.ts` or `PascalCase.ts` for classes/services. Next.js `app` router uses special names like `page.tsx`, `layout.tsx`, `route.ts`. Script files (e.g. in `scripts/`) can be `kebab-case.ts` or `snake_case.py` if Python.
* **Theming:**
    * Application shall support Light and Dark UI themes.
    * Tailwind CSS 4.1.8 with DaisyUI 5.0.43 theming solution using CSS-based configuration will be utilized.
    * Styles must be theme-aware (e.g., Tailwind `dark:` variants).
    * Visual design specs will include palettes for both themes.
* **File Structure:** Adherence to the `## Project Structure` section defined in this document and the `Frontend-Architecture.md` is mandatory.
* **Asynchronous Operations (TypeScript/JavaScript):** Must use `async/await` for clarity and robust error handling (with `try/catch`). Avoid mixing with raw `.then().catch()` for the same logical block.
* **Type Safety (TypeScript):** `strict` mode (all flags enabled, e.g., `strictNullChecks`, `noImplicitAny`, etc.) enabled in `tsconfig.json`. Avoid `any` type; if used temporarily for PoC, mark with `// TODO: Refactor AnyType`. Define clear interfaces/types for all significant data structures (DTOs, API responses, service layer function signatures).
* **Comments & Documentation (PoC Scope):** Comments explain *why* or clarify complex logic. Critical/non-obvious functions in `lib/ai/`, `lib/dal/`, `lib/services/` should have brief JSDoc/TSDoc header comments. Root `README.md` with setup/run instructions.
* **Dependency Management:** Use `npm` or `yarn` (be consistent). Add new external dependencies judiciously for PoC. Prefer stable, pinned versions in `package.json`.
* **Specific Language & Framework Conventions (Next.js/React/TypeScript for PoC):**
    * **React Best Practices:** Follow Rules of Hooks. Prefer functional components with hooks over class components.
    * **Next.js Conventions:** Utilize App Router conventions (Route Handlers for APIs, Server/Client Components). Use Next.js `Image` component for image optimization.
    * **API Route Handlers (Backend):** Keep lean; delegate complex logic to service modules in `lib/`. Consistent JSON responses and HTTP status codes, managed by core error handling middleware (Story 1.0.3).
    * **State Management (Frontend):** PoC: Local component state (`useState`, `useReducer`), React Context for simple cross-component needs. Zustand if global store proves essential (as per `Frontend-Architecture.md`).
    * **Immutability:** Adhere to immutable patterns when updating state in React and in backend services where appropriate.

### Overall Testing Strategy (Proof-of-Concept)

* **Primary Testing Tools:** Jest 29.7.0 (with React Testing Library 16.3.0 - React 19 compatible); Playwright 1.52.0.
* **Unit Tests:**
  - **Scope:** Test individual React components, utility functions, critical AI Copilot Service logic units, core DAL functions, individual service methods.
  - **Location:** Co-located with source files (e.g., `*.test.ts` or `*.spec.ts` next to `*.ts` file) or in a `__tests__` subdirectory.
  - **Mocking/Stubbing:** Use Jest mocks (`jest.fn()`, `jest.spyOn()`) for external dependencies (e.g., Gemini AI SDK calls, Resend SDK calls, DAL calls from service tests).
  - **AI Agent Responsibility:** AI Developer Agent MUST generate unit tests covering all public methods of new/modified modules, significant logic paths, edge cases, and error conditions.
* **Integration Tests (PoC Scope):**
  - **Scope:** Test the interaction between several components or services. E.g., API route handler to service layer to DAL (using a test SQLite instance or in-memory version if feasible for DAL tests). Test "AI Copilot Service" orchestrating calls to DAL and Gemini mock.
  - **Location:** Likely in a separate `test/integration` directory.
  - **Environment:** May use Testcontainers for managing test databases if complexity grows beyond simple better-sqlite3 file testing, or dedicated test database files. Mock external APIs (Gemini, Resend).
* **End-to-End (E2E) Tests (PoC Scope):**
  - **Scope:** Playwright for 1-2 critical "happy path" demo flows (e.g., User Onboarding + Archetype selection, Draft Pick with AI Co-Pilot advice, Viewing Weekly Digest).
  - **Tools:** Playwright.
  - **AI Agent Responsibility:** AI Agent may be tasked with generating E2E test stubs or scripts based on user stories. Focus on critical happy paths.
* **Test Coverage (PoC Target):** Sufficient coverage for reliable core MVP features and demo flows. Quality and critical path coverage prioritized over percentage. Aim for high coverage on new business logic in services and utilities.
* **Mocking/Stubbing Strategy (General):** Mock Gemini AI and Resend APIs in unit/component/integration tests. E2E tests run against the PoC application using static/synthetic PoC dataset in better-sqlite3.
* **Test Data Management (PoC):** Small, representative subsets of static/synthetic data. better-sqlite3 seeded for specific test scenarios (e.g., via `seed-db.ts` script from Story 1.0.2).
* **Manual Testing:** Thorough manual testing of all demonstrated features and flows.
* **Development Methodology Note (TDD):** Pragmatic approach. TDD for select critical backend logic (e.g., in AI Copilot Service). Test-after for most UI/features to prioritize working PoC demo.

### Error Handling Strategy (Proof-of-Concept)

* **General Approach:** Frontend UI displays clear, user-friendly error messages (potentially via AI Copilot Panel/Chat). Backend API returns appropriate HTTP status codes and simple JSON error messages. Core API Middleware (Story 1.0.3) will standardize backend error responses.
* **Logging (PoC):** `console.log`/`console.error` on frontend. For backend, use a structured logging approach (e.g., Pino if Node.js, as potentially decided by Story 1.0.3 and Coding Standards) for Netlify Function logs. Core API Middleware (Story 1.0.3) will standardize request logging.
* **Specific Handling Patterns (PoC):**
    * **External API Calls (Google Gemini AI, Resend):** "AI Copilot Service" and "Notification Service" will use `try/catch`, log detailed errors, and return simplified user-friendly error messages or signals to UI. No complex retries beyond SDK defaults or simple retry logic for PoC.
    * **Internal Errors / Business Logic Exceptions (Backend):** Caught by general error handler middleware (Story 1.0.3), results in generic HTTP 500 (or other appropriate status) to frontend, details logged server-side.
    * **Data Access Layer (DAL) / better-sqlite3 Errors (PoC):** DAL logs specific errors, propagates generic error up to be caught by service layer or error handler middleware.
    * **Transaction Management (PoC):** Minimal; discrete DAL operations treated atomically. better-sqlite3 default transaction behavior per statement.

### Security Best Practices (Proof-of-Concept)

* **Input Sanitization/Validation:** All external inputs (API requests via Next.js Route Handlers, user-provided data) MUST be validated using DTOs with validation decorators (e.g., `class-validator` if chosen for Next.js backend). Data for Gemini prompts treated as untrusted; ensure no PII is inadvertently sent unless explicitly part of a feature and secured.
* **Output Encoding:** Rely on React/Next.js default XSS protection for rendering content. If manually constructing HTML or injecting content, use appropriate encoding libraries or framework features to prevent XSS.
* **Secrets Management:** Gemini API Key (`GEMINI_API_KEY`) and Resend API Key (`RESEND_API_KEY`) in untracked `.env.local` locally, secure environment variables on Netlify. Accessed only by backend "AI Copilot Service" or "Notification Service." No hardcoded secrets in code.
* **Dependency Security:** Minimize new dependencies. Run `npm audit` (or `yarn audit`) regularly and after adding/updating dependencies. Address high/critical vulnerabilities.
* **Authentication/Authorization Checks (PoC Scope):** Basic session management (e.g., using JWTs stored in HttpOnly cookies or a secure frontend storage if necessary, to be decided with auth stories). Protected API routes MUST verify session/token validity before processing. (Initial stub for auth middleware in Story 1.0.3).
* **API Security (General - PoC Scope):** HTTPS via Netlify. Input DTO validation for all API routes. Advanced measures (WAF, extensive rate limiting, detailed CSP) out of scope for PoC but noted for future.
* **Error Handling & Information Disclosure:** No detailed system errors/stack traces to UI (as per Error Handling Strategy and Story 1.0.3). Log detailed errors server-side, provide generic messages or error IDs to the client.
* **Regular Security Audits/Testing (PoC Scope):** Out of scope beyond general secure coding awareness and automated dependency checks.