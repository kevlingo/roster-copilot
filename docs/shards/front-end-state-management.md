## State Management In-Depth (Proof-of-Concept)

The state management strategy for the Roster Copilot PoC prioritizes simplicity, leveraging React's built-in capabilities.

  * **Chosen Solution:**
    1.  **Local Component State (`useState`, `useReducer`):** Default and primary approach.
    2.  **React Context API:** Used sparingly for sharing state across a specific component subtree (e.g., theme state, AI Copilot panel state, read-only User Profile data).
    3.  **Global State (Zustand - if absolutely necessary for PoC):** Only if clearly justified for state needed by many disconnected parts and Context becomes unwieldy. Aim to avoid/minimize for PoC.
  * **Decision Guide for State Location (PoC):** Start local; elevate to Context if shared in a tree; consider global (Zustand) only as a last resort for essential, widespread state.
  * **Store Structure / Slices (PoC - If Zustand is used):** If used, a single, simple store. Complex slicing is out of scope for PoC.
  * **Key Selectors / Actions / Reducers / Thunks (PoC):** State logic managed in components or custom hooks using Context. Complex global store patterns are out of scope.