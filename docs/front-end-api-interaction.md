## API Interaction Layer (Proof-of-Concept)

  * **Communication Method:** Native `fetch` API for calls to backend Next.js API routes. JSON format for request/response bodies. Use appropriate HTTP methods.
  * **Data Structuring & Transformation:** Request payloads use TypeScript interfaces. API responses expected to align closely with frontend needs, minimizing client-side transformation for PoC.
  * **Error Handling (Frontend Client-Side):** `fetch` calls include `.catch()` or `try/catch` for error handling. User-facing errors displayed gracefully (e.g., via AI Copilot panel). Technical errors logged to console.
  * **Loading State Indication:** Components initiating API calls must manage and display loading states (e.g., DaisyUI "loading" or "skeleton" components).
  * **Abstraction (Optional for PoC, Recommended for Key Interactions):** Consider simple custom React hooks for frequently used or complex AI Copilot API interactions to encapsulate logic.