## Frontend Testing Strategy (Proof-of-Concept)

  * **Primary Frontend Testing Tools:** Jest (with React Testing Library); Playwright.
  * **Unit & Component Tests (Frontend Focus):** Test individual React components (core UI, AI Copilot panel, Draft Room components), custom hooks. Use RTL to simulate events, assert rendering. Mock Next.js API calls. Co-locate test files.
  * **Integration Tests (Frontend Focus - PoC Scope):** Limited. Covered by component tests rendering trees or E2E tests. Focus on components consuming shared state correctly.
  * **End-to-End (E2E) Tests (Frontend Focus - PoC Scope):** Playwright for 1-2 critical "happy path" user flows (e.g., Onboarding, Digest Interaction). Validate full interaction against mocked backend or PoC backend with static data.
  * **Accessibility Testing (Frontend - PoC Scope):** Manual checks against NFRs (keyboard nav, contrast, focus). ESLint accessibility plugins. Browser dev tools for spot checks. Special attention to AI-generated content accessibility.
  * **Visual Regression Testing (PoC Scope):** Deferred for PoC.
  * **Test Coverage Targets (Frontend - PoC Scope):** Sufficient coverage for reliable core MVP demo flows. Quality and critical path coverage prioritized over percentage.