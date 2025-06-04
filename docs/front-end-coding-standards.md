## Front-End Coding Standards (Proof-of-Concept)

This document outlines coding standards and conventions specific to the frontend development of the Roster Copilot Proof-of-Concept. For general coding standards applicable to the entire project (including TypeScript, naming conventions, style guides, etc.), please refer to the main [Operational Guidelines](./operational-guidelines.md).

### Core Frameworks & Libraries
*   **Next.js (with React):** As defined in the System Architecture, Next.js (latest stable, e.g., ~14.x or ~15.x as of May 2025) will be used as the primary framework, leveraging React (latest stable, e.g., ~18.x) for building the user interface.
*   **TypeScript:** Will be used for all frontend code to ensure type safety and improve developer experience, aligning with the overall project language choice.

### Component Architecture & Naming
*   A **Component-Based Architecture** will be strictly followed, utilizing reusable React functional components with Hooks.
*   We will leverage **DaisyUI components** (built on Tailwind CSS) for common UI elements (buttons, forms, modals, cards, etc.) to accelerate development and ensure a consistent base style.
*   **Tailwind CSS utility classes** will be used for custom styling and fine-tuning the appearance of DaisyUI components or creating bespoke layout elements to achieve the desired "pop" and unique Roster Copilot feel.
*   **React Component Names:** `PascalCase` (e.g., `UserProfileCard`).
*   **File Names for Components:** `PascalCase.tsx` (e.g., `UserProfileCard.tsx`).
*   **Organization:** Shared components in `components/` subdirectories (core, layout, ai-copilot, feature-specific). Very specific, non-reusable components might be co-located if simple, but preference for organized `components/` structure for PoC.

### Key Design Patterns (Frontend)
*   **Functional Components with Hooks:** Standard React pattern.
*   **Provider Pattern:** For distributing shared state via React Context.
*   **Conditional Rendering:** For showing/hiding UI elements based on state or props.
*   **(Potentially) Custom Hooks:** For encapsulating reusable stateful logic or side effects (e.g., a custom hook for interacting with a specific set of AI Copilot API endpoints).

### Styling Approach
*   **Tailwind CSS:** Primary utility-first CSS framework for all styling.
*   **DaisyUI:** Used as a component library providing pre-styled Tailwind CSS components to ensure visual consistency and speed up development. Themes (light/dark) will be managed using DaisyUI's theming capabilities or a compatible Tailwind plugin like `next-themes`.
*   **Global Styles (`app/globals.css`):** Will contain Tailwind base directives, any global style overrides, and potentially base font configurations.

Refer to [Operational Guidelines](./operational-guidelines.md) for project-wide coding standards, including ESLint/Prettier setup, general naming conventions, TypeScript strict mode, and commenting guidelines.