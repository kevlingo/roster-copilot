# Roster Copilot Frontend Architecture Document (Proof-of-Concept)

## Table of Contents

  - [Introduction](https://www.google.com/search?q=%23introduction)
  - [Overall Frontend Philosophy & Patterns](https://www.google.com/search?q=%23overall-frontend-philosophy--patterns)
  - [Detailed Frontend Directory Structure](https://www.google.com/search?q=%23detailed-frontend-directory-structure)
  - [Component Breakdown & Implementation Details](https://www.google.com/search?q=%23component-breakdown--implementation-details)
      - [Component Naming & Organization](https://www.google.com/search?q=%23component-naming--organization)
      - [Template for Component Specification](https://www.google.com/search?q=%23template-for-component-specification)
      - [Conversational Onboarding Architecture](https://www.google.com/search?q=%23conversational-onboarding-architecture)
      - [Chat History Persistence Patterns](https://www.google.com/search?q=%23chat-history-persistence-patterns)
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
      * **Next.js (with React):** As defined in the System Architecture, Next.js (latest stable, e.g., \~14.x or \~15.x as of May 2025) will be used as the primary framework, leveraging React (latest stable, e.g., \~18.x) for building the user interface.
      * **TypeScript:** Will be used for all frontend code to ensure type safety and improve developer experience, aligning with the overall project language choice.
  * **Component Architecture:**
      * A **Component-Based Architecture** will be strictly followed, utilizing reusable React functional components with Hooks.
      * We will leverage **DaisyUI components** (built on Tailwind CSS) for common UI elements (buttons, forms, modals, cards, etc.) to accelerate development and ensure a consistent base style.
      * **Tailwind CSS utility classes** will be used for custom styling and fine-tuning the appearance of DaisyUI components or creating bespoke layout elements to achieve the desired "pop" and unique Roster Copilot feel.
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
      * **DaisyUI:** Used as a component library providing pre-styled Tailwind CSS components to ensure visual consistency and speed up development. Themes (light/dark) will be managed using DaisyUI's theming capabilities or a compatible Tailwind plugin like `next-themes`.
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
│   │   ├── PersistentChatInterface.tsx # Core chat interface component with history persistence
│   │   ├── ConversationalOnboarding.tsx # Conversational onboarding flow management
│   │   ├── ChatHistoryManager.tsx # Chat history persistence and cross-device sync
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

  * **`app/`**: Core Next.js application UI using App Router. `app/(main)/layout.tsx` is key for persistent UI like the AI Copilot panel. `app/(main)/onboarding/page.tsx` hosts the conversational onboarding experience.
  * **`components/`**: Shared/reusable React UI components.
      * `components/ai-copilot/`: For the AI Copilot Panel, chat interface, and conversational onboarding components.
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

### Conversational Onboarding Architecture

The conversational onboarding system represents a significant architectural pattern that transforms traditional form-based user onboarding into natural chat-based interactions. This section defines the key architectural patterns and implementation approaches.

#### **Core Architecture Principles**

* **Chat-First Design:** All onboarding interactions occur through the existing `PersistentChatInterface.tsx` component
* **Conversation State Management:** Dedicated state management for tracking onboarding progress, user selections, and conversation context
* **Natural Language Processing:** Client-side processing for interpreting user responses in natural language format
* **Progressive Enhancement:** Modular design allowing for express mode, voice-ready architecture, and cross-device continuity

#### **Key Components & Patterns**

**1. Conversation State Management**
```typescript
interface OnboardingConversationState {
  currentPhase: 'greeting' | 'mode-selection' | 'archetype-selection' | 'questionnaire' | 'complete'
  selectedMode: 'express' | 'full' | null
  selectedArchetype: string | null
  questionnaireAnswers: Record<string, string>
  conversationHistory: ConversationMessage[]
}
```

**2. Response Processing Pattern**
```typescript
interface ResponseProcessor {
  processArchetypeSelection(userInput: string): ArchetypeSelectionResult
  processQuestionnaireResponse(userInput: string, questionType: string): QuestionnaireResult
  handleUnclearResponse(userInput: string, context: ConversationContext): ClarificationResponse
}
```

**3. Conversation Flow Control**
* **Mode Selection:** Express vs. Full conversation mode routing
* **Archetype Selection:** Natural language processing for archetype identification
* **Questionnaire Flow:** Sequential question handling with confirmation patterns
* **Error Recovery:** Graceful handling of unclear responses and technical failures

#### **Integration Points**

* **Chat Interface:** Extends `PersistentChatInterface.tsx` with onboarding-specific message handling
* **API Integration:** Connects to existing `PUT /api/users/me` endpoint for profile updates
* **State Persistence:** Integrates with chat history persistence system for cross-device continuity
* **Navigation:** Seamless transition to main application upon completion

### Chat History Persistence Patterns

The chat history persistence system provides the foundation for cross-device conversation continuity, AI personalization, and robust user experience. This section defines the architectural patterns for comprehensive chat storage and retrieval.

#### **Core Architecture Principles**

* **Comprehensive Persistence:** All chat conversations stored in backend, including onboarding interactions
* **UI vs. Backend Separation:** UI "clear" functionality only affects visible history, backend storage remains intact
* **Cross-Device Continuity:** Conversation state preserved and synchronized across device switches
* **Performance Optimization:** Efficient loading and caching strategies for large conversation histories

#### **Key Components & Patterns**

**1. Chat History Data Model**
```typescript
interface ChatMessage {
  id: string
  userId: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
  conversationContext?: OnboardingContext | GeneralChatContext
}

interface ConversationSession {
  id: string
  userId: string
  startTime: Date
  lastActivity: Date
  messageCount: number
  conversationType: 'onboarding' | 'general' | 'digest'
}
```

**2. Persistence Service Pattern**
```typescript
interface ChatHistoryService {
  persistMessage(message: ChatMessage): Promise<void>
  loadConversationHistory(userId: string, limit?: number): Promise<ChatMessage[]>
  clearUIHistory(): void // UI-only operation
  syncConversationState(deviceId: string): Promise<ConversationState>
}
```

**3. State Management Integration**
* **Local State:** Visible chat messages managed in component state
* **Backend Sync:** Automatic persistence of all messages on send/receive
* **Cross-Device Sync:** Conversation state synchronization on device handoff
* **Offline Handling:** Queue messages for sync when connection restored

#### **Performance Considerations**

* **Lazy Loading:** Implement pagination for large conversation histories
* **Caching Strategy:** Cache recent conversations in memory with efficient retrieval
* **Database Optimization:** Indexed queries for user-specific chat history retrieval
* **Real-time Sync:** Efficient synchronization patterns for cross-device continuity

#### **Integration Points**

* **Chat Interface:** Seamless integration with `PersistentChatInterface.tsx` for automatic persistence
* **API Layer:** Dedicated chat history endpoints for CRUD operations
* **Authentication:** User-scoped chat history with proper access controls
* **Analytics:** Foundation for conversation analytics and AI personalization learning

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
  * **Chat History API Integration:** Dedicated endpoints for chat history persistence (`POST /api/chat/messages`, `GET /api/chat/history`, etc.) with automatic message persistence and cross-device synchronization support.

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

  * **Primary Frontend Testing Tools:** Jest (with React Testing Library); Playwright.
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
| Conversational Onboarding & Chat Persistence Architecture Added | 2025-01-27 | 0.2     | Added architecture patterns for conversational onboarding and comprehensive chat history persistence system. | Curly (PO)  |

-----