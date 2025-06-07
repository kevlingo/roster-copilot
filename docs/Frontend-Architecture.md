# Roster Copilot Frontend Architecture Document (Proof-of-Concept)

## Table of Contents

  - [Introduction](https://www.google.com/search?q=%23introduction)
  - [Overall Frontend Philosophy & Patterns](https://www.google.com/search?q=%23overall-frontend-philosophy--patterns)
  - [Detailed Frontend Directory Structure](https://www.google.com/search?q=%23detailed-frontend-directory-structure)
  - [Component Breakdown & Implementation Details](https://www.google.com/search?q=%23component-breakdown--implementation-details)
      - [Component Naming & Organization](https://www.google.com/search?q=%23component-naming--organization)
      - [Template for Component Specification](https://www.google.com/search?q=%23template-for-component-specification)
  - [State Management In-Depth](https://www.google.com/search?q=%23state-management-in-depth)
      - [Store Structure / Slices](https://www.google.com/search?q=%23store-structure--slices)
      - [Key Selectors](https://www.google.com/search?q=%23key-selectors)
      - [Key Actions / Reducers / Thunks](https://www.google.com/search?q=%23key-actions--reducers--thunks)
  - [API Interaction Layer](https://www.google.com/search?q=%23api-interaction-layer)
      - [Client/Service Structure](https://www.google.com/search?q=%23clientservice-structure)
      - [Error Handling & Retries (Frontend)](https://www.google.com/search?q=%23error-handling--retries-frontend)
  - [Routing Strategy](https://www.google.com/search?q=%23routing-strategy)
      - [Route Definitions](https://www.google.com/search?q=%23route-definitions)
      - [Route Guards / Protection](https://www.google.com/search?q=%23route-guards--protection)
  - [Build, Bundling, and Deployment](https://www.google.com/search?q=%23build-bundling-and-deployment)
      - [Build Process & Scripts](https://www.google.com/search?q=%23build-process--scripts)
      - [Key Bundling Optimizations](https://www.google.com/search?q=%23key-bundling-optimizations)
      - [Deployment to CDN/Hosting](https://www.google.com/search?q=%23deployment-to-cdnhosting)
  - [Frontend Testing Strategy](https://www.google.com/search?q=%23frontend-testing-strategy)
      - [Component Testing](https://www.google.com/search?q=%23component-testing)
      - [UI Integration/Flow Testing](https://www.google.com/search?q=%23ui-integrationflow-testing)
      - [End-to-End UI Testing Tools & Scope](https://www.google.com/search?q=%23end-to-end-ui-testing-tools--scope)
  - [Accessibility (AX) Implementation Details](https://www.google.com/search?q=%23accessibility-ax-implementation-details)
  - [Performance Considerations](https://www.google.com/search?q=%23performance-considerations)
  - [Internationalization (i18n) and Localization (l10n) Strategy](https://www.google.com/search?q=%23internationalization-i18n-and-localization-l10n-strategy)
  - [Feature Flag Management](https://www.google.com/search?q=%23feature-flag-management)
  - [Frontend Security Considerations](https://www.google.com/search?q=%23frontend-security-considerations)
  - [Browser Support and Progressive Enhancement](https://www.google.com/search?q=%23browser-support-and-progressive-enhancement)
  - [Change Log](https://www.google.com/search?q=%23change-log)

## Introduction

This document details the technical architecture specifically for the frontend of Roster Copilot. It complements the main Roster Copilot Architecture Document and the UI/UX Specification. This document details the frontend architecture and **builds upon the foundational decisions** (e.g., overall tech stack, CI/CD, primary testing tools) defined in the main Roster Copilot Architecture Document (`docs/architecture.md` or linked equivalent). **Frontend-specific elaborations or deviations from general patterns must be explicitly noted here.** The goal is to provide a clear blueprint for frontend development, ensuring consistency, maintainability, and alignment with the overall system design and user experience goals.

  - **Link to Main Architecture Document (REQUIRED):** `docs/architecture.md`
  - **Link to UI/UX Specification (REQUIRED if exists):** `docs/front-end-spec.md`
  - **Link to Primary Design Files (Figma, Sketch, etc.) (REQUIRED if exists):** {From UI/UX Spec}
  - **Link to Deployed Storybook / Component Showcase (if applicable):** {URL}

## Overall Frontend Philosophy & Patterns

The frontend architecture for the Roster Copilot Proof-of-Concept (PoC) will prioritize rapid development, a modern user experience ("pop"), responsiveness, and clear integration with the Next.js backend API and the AI Copilot's features. It will adhere to the following philosophies and patterns:

  * **Framework & Core Libraries:**
      * **Next.js (with React):** As defined in the System Architecture, Next.js 15.3.3 (latest stable) will be used as the primary framework, leveraging React 19.1.0 (latest) for building the user interface with strict server/client component separation.
      * **TypeScript:** TypeScript 5.5.3 (stable) will be used for all frontend code to ensure type safety and improve developer experience, aligning with the overall project language choice.
  * **Component Architecture:**
      * A **Component-Based Architecture** will be strictly followed, utilizing reusable React functional components with Hooks.
      * We will leverage **DaisyUI components** (built on Tailwind CSS) for common UI elements (buttons, forms, modals, cards, etc.) to accelerate development and ensure a consistent base style.
      * **Tailwind CSS 4.1.8 utility classes** will be used for custom styling and fine-tuning the appearance of DaisyUI 5.0.43 components or creating bespoke layout elements to achieve the desired "pop" and unique Roster Copilot feel. Uses CSS-based configuration instead of JavaScript config.
      * Consideration will be given to a simple, practical organization of components (e.g., shared/core components, feature-specific components) as outlined later in the "Detailed Frontend Directory Structure."
  * **State Management Strategy (PoC Scope):**
      * For the PoC, frontend state management will be kept as simple as possible.
      * **Local component state:** Managed via React's `useState` and `useReducer` hooks will be the default.
      * **React Context API:** Will be used **sparingly** when state needs to be shared across a specific component subtree without excessive prop-drilling (e.g., potentially for managing application theme (light/dark), the state of the AI Copilot panel).
      * **Global State (if essential for PoC):** If a more robust global state solution is deemed absolutely necessary during PoC development, **Zustand** is the agreed-upon lightweight option due to its simplicity and minimal boilerplate. The aim for the PoC is to avoid or minimize reliance on a global store.
  * **Data Flow:**
      * **Client-Side Data Fetching:** For interacting with the Next.js API Routes, standard `fetch` API (or a lightweight wrapper) within React components (often inside `useEffect` hooks or custom hooks) will be used for PoC simplicity.
      * **Next.js App Router Data Fetching:** Where appropriate (e.g., for initial page loads or less dynamic data), we will leverage Next.js App Router's capabilities for data fetching in Server Components or Route Handler data fetching to improve performance and simplify client-side logic.
      * Data fetched from APIs will be managed via component state or context as described above.
  * **Styling Approach:**
      * **Tailwind CSS:** Primary utility-first CSS framework for all styling.
      * **DaisyUI 5.0.43:** Used as a component library providing pre-styled Tailwind CSS components to ensure visual consistency and speed up development. Themes (light/dark) will be managed using DaisyUI's theming capabilities with CSS custom properties or a compatible Tailwind plugin like `next-themes`.
      * **Global Styles (`app/globals.css`):** Will contain Tailwind base directives, any global style overrides, and potentially base font configurations.
  * **Key Design Patterns (Frontend):**
      * **Functional Components with Hooks:** Standard React pattern.
      * **Provider Pattern:** For distributing shared state via React Context.
      * **Conditional Rendering:** For showing/hiding UI elements based on state or props.
      * **(Potentially) Custom Hooks:** For encapsulating reusable stateful logic or side effects (e.g., a custom hook for interacting with a specific set of AI Copilot API endpoints).

## Detailed Frontend Directory Structure

```plaintext
roster-copilot/
├── app/                        # Next.js App Router: Core application UI (pages, layouts) & API routes
│   ├── (auth)/                 # Route group for pre-login authentication pages
│   │   ├── login/page.tsx      # UI for the Login screen
│   │   └── signup/page.tsx     # UI for the Sign-Up screen
│   ├── (main)/                 # Route group for main authenticated application sections
│   │   ├── layout.tsx          # Main authenticated app layout (e.g., containing persistent Sidebar, Header, and logic for AI Copilot Panel/Icon)
│   │   ├── dashboard/page.tsx  # UI for the League Home / Main Dashboard
│   │   ├── draft/[leagueId]/page.tsx # UI for the Live Draft Room
│   │   ├── league/[leagueId]/  # UI for league-specific views
│   │   │   ├── roster/page.tsx   # UI for viewing/managing team roster
│   │   │   ├── lineup/page.tsx   # UI for setting weekly lineup
│   │   │   ├── waivers/page.tsx  # UI for waiver wire / Add-drop players
│   │   │   └── standings/page.tsx# UI for league standings
│   │   ├── copilot/             # UI for dedicated full-page AI Copilot interactions
│   │   │   ├── digest/page.tsx # UI for the full Weekly Strategy Digest screen
│   │   │   └── profile/page.tsx# UI for User Profile / AI Copilot preferences view
│   │   └── onboarding/page.tsx # Simple host page UI for the AI Copilot panel's conversational onboarding flow; may include a visual progress timeline component.
│   ├── api/                    # Backend API routes (as defined in System Architecture)
│   │   └── ( ...api_routes_here... )
│   ├── globals.css             # Global styles, Tailwind CSS base directives & custom global styles
│   ├── layout.tsx              # Root layout for the entire application (e.g., <html>, <body> tags)
│   └── page.tsx                # Homepage / Initial public landing page (if any, or redirects to auth flow)
├── components/                 # Shared & reusable React UI components
│   ├── ai-copilot/              # UI components specifically for the AI Copilot Panel/Overlay & its content
│   │   ├── AIPanel.tsx         # The main shell for the persistent AI panel/overlay
│   │   ├── ArchetypeCard.tsx   # Interactive card for archetype selection during onboarding (rendered within AIPanel)
│   │   ├── DigestSummaryItem.tsx # Component for displaying items in digest summaries (in AIPanel or Dashboard)
│   │   └── (other_interactive_chat_elements...).tsx # e.g., QuestionPromptCard.tsx
│   ├── core/                   # Fundamental, highly reusable UI building blocks
│   │   ├── Button.tsx          # Custom Button (styling DaisyUI/Tailwind)
│   │   └── Modal.tsx           # Custom Modal component
│   ├── draft/                  # UI components specific to the Draft Room experience
│   │   └── DraftPlayerCard.tsx
│   ├── layout/                 # Components that define the structure of pages or main app sections
│   │   ├── MainAppLayout.tsx   # Shell component for the app/(main)/layout.tsx (e.g., includes Sidebar, Header)
│   │   └── Sidebar.tsx
│   └── onboarding/             # UI components specific to the onboarding page/experience
│       └── OnboardingProgressTimeline.tsx
├── data/                       # (Contains static PoC data & SQLite DB - as per System Architecture)
├── lib/                        # (Contains shared backend logic: AI Service, DAL, utils - as per System Architecture)
├── public/                     # Static assets (images, fonts, favicon.ico, etc.)
├── styles/                     # (Optional) For any additional complex global styles or theme overrides not in globals.css
├── next.config.js              # Next.js configuration
├── package.json                # Project dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration (including DaisyUI plugin)
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project overview
```

**Key Frontend Directory Descriptions & Conventions:**

  * **`app/`**: Core Next.js application UI using App Router. `app/(main)/layout.tsx` is key for persistent UI like the AI Copilot panel. `app/(main)/onboarding/page.tsx` hosts the panel-driven conversational onboarding.
  * **`components/`**: Shared/reusable React UI components.
      * `components/ai-copilot/`: For the AI Copilot Panel and its interactive elements.
      * `components/core/`: Basic UI building blocks (likely wrappers around DaisyUI).
      * `components/layout/`: Structural components.
      * `components/onboarding/`: UI elements for the onboarding page (e.g., progress timeline).

## Component Breakdown & Implementation Details

### Component Naming & Organization

  * **React Component Names:** `PascalCase` (e.g., `UserProfileCard`).
  * **File Names for Components:** `PascalCase.tsx` (e.g., `UserProfileCard.tsx`).
  * **Organization:** Shared components in `components/` subdirectories (core, layout, ai-copilot, feature-specific). Very specific, non-reusable components might be co-located if simple, but preference for organized `components/` structure for PoC.

### Template for Component Specification

{This template MUST be used to specify any new, significant UI component developed for Roster Copilot. It ensures comprehensive definition and clear guidance for implementation.}

**\#\#\#\# Component: {ComponentName}**

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

## State Management In-Depth (Proof-of-Concept)

The state management strategy for the Roster Copilot PoC prioritizes simplicity, leveraging React's built-in capabilities.

  * **Chosen Solution:**
    1.  **Local Component State (`useState`, `useReducer`):** Default and primary approach.
    2.  **React Context API:** Used sparingly for sharing state across a specific component subtree (e.g., theme state, AI Copilot panel state, read-only User Profile data).
    3.  **Global State (Zustand - if absolutely necessary for PoC):** Only if clearly justified for state needed by many disconnected parts and Context becomes unwieldy. Aim to avoid/minimize for PoC.
  * **Decision Guide for State Location (PoC):** Start local; elevate to Context if shared in a tree; consider global (Zustand) only as a last resort for essential, widespread state.
  * **Store Structure / Slices (PoC - If Zustand is used):** If used, a single, simple store. Complex slicing is out of scope for PoC.
  * **Key Selectors / Actions / Reducers / Thunks (PoC):** State logic managed in components or custom hooks using Context. Complex global store patterns are out of scope.

## API Interaction Layer (Proof-of-Concept)

  * **Communication Method:** Native `fetch` API for calls to backend Next.js API routes. JSON format for request/response bodies. Use appropriate HTTP methods.
  * **Data Structuring & Transformation:** Request payloads use TypeScript interfaces. API responses expected to align closely with frontend needs, minimizing client-side transformation for PoC.
  * **Error Handling (Frontend Client-Side):** `fetch` calls include `.catch()` or `try/catch` for error handling. User-facing errors displayed gracefully (e.g., via AI Copilot panel). Technical errors logged to console.
  * **Loading State Indication:** Components initiating API calls must manage and display loading states (e.g., DaisyUI "loading" or "skeleton" components).
  * **Abstraction (Optional for PoC, Recommended for Key Interactions):** Consider simple custom React hooks for frequently used or complex AI Copilot API interactions to encapsulate logic.

## Routing Strategy (Proof-of-Concept)

  * **Primary Routing Mechanism:** Next.js App Router (folder structure in `app/` defines routes).
  * **Route Naming Conventions:** Follow folder names (typically `kebab-case` for URL segments if folders are named that way). Special files (`page.tsx`, `layout.tsx`) define UI.
  * **Route Parameters:** Next.js App Router dynamic segments (e.g., `app/draft/[leagueId]/page.tsx`).
  * **Authentication & Authorization Integration with Routing (Route Guards):**
      * Protected Routes: `app/(main)/` group requires authentication.
      * Public Routes: `app/(auth)/` group and root `app/page.tsx` are public.
      * Access Control (PoC): `app/(main)/layout.tsx` checks auth status; redirects unauthenticated users to `/login`. Next.js Middleware is an option for more advanced logic if needed.
  * **Programmatic Navigation:** `useRouter` hook or `<Link>` component from Next.js.

## Build, Bundling, and Deployment Details (Frontend Specific - PoC)

  * **Build Process:** Managed by Next.js (`npm run build` or `yarn build`). Includes TypeScript compilation, JS bundling, CSS optimization (Tailwind JIT/PostCSS).
  * **Bundling Strategy:** Next.js automatic code splitting by route. `React.lazy()` or `next/dynamic` considered for further optimization of large, non-critical components. Tree shaking inherent in build.
  * **Deployment (Frontend Specifics for Netlify):** Deployed on Netlify, connected to Git repo. Pushes to deployment branch trigger auto build/deploy. Netlify handles static assets, SSR pages, serverless functions.
  * **Environment Configuration (Frontend Aspects):** Next.js environment variables (prefixed `NEXT_PUBLIC_` for client-side access if needed). Backend secrets (Gemini API Key) managed securely on Netlify for serverless functions. `.env.local` for local dev.

## Frontend Testing Strategy (Proof-of-Concept)

  * **Primary Frontend Testing Tools:** Jest 29.7.0 (with React Testing Library 16.3.0 - React 19 compatible); Playwright 1.52.0.
  * **Unit & Component Tests (Frontend Focus):** Test individual React components (core UI, AI Copilot panel, Draft Room components), custom hooks. Use RTL to simulate events, assert rendering. Mock Next.js API calls. Co-locate test files.
  * **Integration Tests (Frontend Focus - PoC Scope):** Limited. Covered by component tests rendering trees or E2E tests. Focus on components consuming shared state correctly.
  * **End-to-End (E2E) Tests (Frontend Focus - PoC Scope):** Playwright for 1-2 critical "happy path" user flows (e.g., Onboarding, Digest Interaction). Validate full interaction against mocked backend or PoC backend with static data.
  * **Accessibility Testing (Frontend - PoC Scope):** Manual checks against NFRs (keyboard nav, contrast, focus). ESLint accessibility plugins. Browser dev tools for spot checks. Special attention to AI-generated content accessibility.
  * **Visual Regression Testing (PoC Scope):** Deferred for PoC.
  * **Test Coverage Targets (Frontend - PoC Scope):** Sufficient coverage for reliable core MVP demo flows. Quality and critical path coverage prioritized over percentage.

## Accessibility Implementation Details (Frontend - PoC)

Adherence to foundational aspects of WCAG 2.1 Level AA.

  * **Semantic HTML:** Use correct HTML5 elements for structure.
  * **ARIA Roles & Attributes:** Use for custom interactive components or dynamic content (e.g., AI Copilot Panel states, interactive cards).
  * **Keyboard Navigation:** All interactive elements focusable and operable via keyboard. Logical tab order. Custom components follow ARIA APG patterns. Visible focus outlines.
  * **Focus Management:** For modals/overlays (e.g., AI Copilot panel on mobile), focus trapped and returned correctly.
  * **Forms & Error Handling (Accessibility):** Inputs have associated, visible labels. Error messages programmatically associated and announced.
  * **Dynamic Content & ARIA Live Regions:** AI Copilot panel/chat area and critical alerts use ARIA live regions (`aria-live="polite"` or `aria-live="assertive"`) for updates.

## Responsiveness (Proof-of-Concept)

The web application must be fully responsive.

  * **Target Viewports:** Mobile (portrait 360px-480px), Tablet (portrait/landscape 768px-1024px - PoC focus on portrait usability), Desktop/Laptop (1280px+).
  * **Implementation Strategy:** Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`). Mobile-first approach recommended where practical. Flexible layouts (Flexbox, Grid via Tailwind). AI Copilot panel/overlay adapts responsively (desktop panel, mobile icon/overlay).
  * **Testing (PoC):** Manual browser resizing. Spot checks on mobile devices/emulators. Playwright E2E tests can verify different viewports.

## Change Log

| Change                                                          | Date       | Version | Description                                                     | Author      |
| :-------------------------------------------------------------- | :--------- | :------ | :-------------------------------------------------------------- | :---------- |
| Initial Frontend Architecture Document Draft for PoC Created    | 2025-05-30 | 0.1     | First complete draft based on user collaboration.             | Jane (DA)   |

-----