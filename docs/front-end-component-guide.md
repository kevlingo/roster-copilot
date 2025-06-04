## Component Breakdown & Implementation Details

### Component Naming & Organization

  * **React Component Names:** `PascalCase` (e.g., `UserProfileCard`).
  * **File Names for Components:** `PascalCase.tsx` (e.g., `UserProfileCard.tsx`).
  * **Organization:** Shared components in `components/` subdirectories (core, layout, ai-copilot, feature-specific). Very specific, non-reusable components might be co-located if simple, but preference for organized `components/` structure for PoC.

### Template for Component Specification

{This template MUST be used to specify any new, significant UI component developed for Roster Copilot. It ensures comprehensive definition and clear guidance for implementation.}

**#### Component: {ComponentName}**

  * **Purpose:** {Briefly describe what this component does, its primary responsibility, and its role within the user interface. This MUST be clear and concise.}
  * **Source File(s):** {Specify the exact file path(s). MUST adhere to naming conventions.}
  * **Visual Reference:** {Link to Figma frame/component or sketch. REQUIRED if visual representation exists/needed.}
  * **Props (Properties):**
    | Prop Name     | Type                                                     | Required? | Default Value | Description                                                                                               |
    | :------------ | :------------------------------------------------------- | :-------- | :------------ | :-------------------------------------------------------------------------------------------------------- |
    | `{propName1}` | `{e.g., string, number, boolean, UserProfile, () => void}` | {Yes/No}  | {If any}    | {MUST clearly state the prop's purpose, any constraints, and usage.} |
  * **Internal State (if any):**
    | State Variable   | Type      | Initial Value | Description                                                                                       |
    | :--------------- | :-------- | :------------ | :------------------------------------------------------------------------------------------------ |
    | `{stateVar1}`    | `{type}`  | `{value}`     | {Description of the state variable, its purpose, and when/how it changes.}                      |
  * **Key UI Elements / Structure:**
    {Pseudo-HTML/JSX or clear textual description of DOM and key visual elements. Include conditional rendering notes.}
  * **Events Handled / Emitted:**
      * **Handles:** {Significant user interaction events handled directly.}
      * **Emits:** {Custom events or callbacks emitted to parent (function props with signatures).}
  * **Actions Triggered (Side Effects):**
      * **State Management (Context/Zustand):** {If component dispatches actions or selects from shared state.}
      * **API Calls:** {Specify API endpoints called, conditions, and response handling.}
  * **Styling Notes:**
      * {MUST reference specific DaisyUI components used. MUST specify key Tailwind CSS utilities or `@apply` directives for custom classes. Dynamic styling logic MUST be described.}
  * **Accessibility (AX) Notes:**
      * {MUST list specific ARIA attributes/values. MUST describe required keyboard navigation behavior. MUST note focus management requirements.}

### Foundational/Shared Components (PoC Approach)

*For the Roster Copilot Proof-of-Concept, detailed specifications for most individual UI components will be created emergently during the UI design and development phases, adhering strictly to the "Template for Component Specification" defined above. Focus will be on components critical for the MVP user flows.*
*Any foundational or globally shared custom components identified (e.g., a specialized `AIPanelViewCard.tsx` or a core `PageLayout.tsx`) must be documented using the template to ensure clarity and reusability.*