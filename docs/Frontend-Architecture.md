# Roster Copilot Frontend Architecture Document (v1.1)

## Table of Contents

- [Introduction](#introduction)
- [Overall Frontend Philosophy & Patterns](#overall-frontend-philosophy--patterns)
- [Detailed Frontend Directory Structure](#detailed-frontend-directory-structure)
- [UI/UX Design Specification](#uiux-design-specification)
  - [Overall Concept & User Flow](#overall-concept--user-flow)
  - [Wireframes (Descriptive)](#wireframes-descriptive)
  - [Visual Design Language](#visual-design-language)
  - [Iconography](#iconography)
  - [Typography](#typography)
- [Component Breakdown & Implementation Details](#component-breakdown--implementation-details)
  - [Component Naming & Organization](#component-naming--organization)
  - [AI Copilot Component Specifications](#ai-copilot-component-specifications)
    - [PersistentChatInterface (Container)](#component-persistentchatinterface-container-component)
    - [ChatInput](#component-chatinput-presentationalcontrolled-component)
    - [ChatBubbleOverlay](#component-chatbubbleoverlay-presentational-component)
    - [ChatMessageBubble](#component-chatmessagebubble-presentational-component)
    - [HideChatButton](#component-hidechatbutton-presentational-component)
    - [ChatSettings](#component-chatsettings-presentational-component-with-local-state-for-popover)
  - [AI Copilot Panel Behaviors](#ai-copilot-panel-specifications-roster-copilot-context)
- [State Management In-Depth](#state-management-in-depth)
- [API Interaction Layer](#api-interaction-layer)
- [Routing Strategy](#routing-strategy)
- [Build, Bundling, and Deployment](#build-bundling-and-deployment)
- [Frontend Testing Strategy](#frontend-testing-strategy)
- [Accessibility (AX) Implementation Details](#accessibility-ax-implementation-details)
- [Performance Considerations](#performance-considerations)
- [Change Log](#change-log)

## Introduction

This document details the technical architecture specifically for the frontend of Roster Copilot. It complements the main Roster Copilot Architecture Document by providing a clear blueprint for frontend development, ensuring consistency, maintainability, and alignment with the overall system design and user experience goals.

This version now integrates the detailed UI/UX and component specifications for the **AI Chat Interface**, which serves as the implementation plan for the AI Copilot feature. Foundational decisions (e.g., overall tech stack, CI/CD) are defined in the main Roster Copilot Architecture Document (`docs/architecture.md`).

- **Link to Main Architecture Document (REQUIRED):** `docs/architecture.md`
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
* **State Management Strategy (PoC Scope):**
    * Frontend state management will be a combination of local component state and a lightweight global store for shared state.
    * **Local component state:** Managed via React's `useState` and `useReducer` hooks will be the default. 
    * **Global State:** **Zustand** is the agreed-upon lightweight option due to its simplicity and minimal boilerplate for managing state like chat history and visibility. 
* **Data Flow:**
    * **Client-Side Data Fetching:** For interacting with the Next.js API Routes, standard `fetch` API within React components will be used. 
    * Data fetched from APIs will be managed via component state or the global Zustand store.
* **Styling Approach:**
    * **Tailwind CSS:** Primary utility-first CSS framework for all styling. 
    * **DaisyUI 5.0.43:** Used as a component library providing pre-styled Tailwind CSS components to ensure visual consistency and speed up development. 
    * **Global Styles (`app/globals.css`):** Will contain Tailwind base directives, any global style overrides, and potentially base font configurations. 

## Detailed Frontend Directory Structure

```plaintext
roster-copilot/
├── app/                        # Next.js App Router: Core application UI (pages, layouts) & API routes
│   ├── (auth)/                 # Route group for pre-login authentication pages
│   │   ├── login/page.tsx      # UI for the Login screen
│   │   └── signup/page.tsx     # UI for the Sign-Up screen
│   ├── (main)/                 # Route group for main authenticated application sections
│   │   ├── layout.tsx          # Main authenticated app layout (containing persistent Header and the AI Copilot Panel)
│   │   ├── dashboard/page.tsx  # UI for the League Home / Main Dashboard
│   │   └── ... (other main app pages)
│   ├── api/                    # Backend API routes
│   │   └── ( ...api_routes_here... )
│   ├── globals.css             # Global styles, Tailwind CSS base directives & custom global styles
│   └── layout.tsx              # Root layout for the entire application (e.g., <html>, <body> tags)
├── components/                 # Shared & reusable React UI components
│   ├── ai-copilot/             # UI components specifically for the AI Copilot Panel/Overlay.
│   │   ├── PersistentChatInterface.tsx # The main container & state manager for the chat.
│   │   ├── ChatInput.tsx         # The fixed input textbox component.
│   │   ├── ChatBubbleOverlay.tsx # The overlay for displaying message bubbles.
│   │   ├── ChatMessageBubble.tsx # An individual chat bubble.
│   │   └── ... (other supporting components like buttons)
│   ├── core/                   # Fundamental, highly reusable UI building blocks (Button, Modal etc.)
│   └── layout/                 # Components defining page structure (Header, Sidebar, etc.)
├── lib/                        # Shared logic, utilities, etc.
├── public/                     # Static assets (images, fonts, etc.)
├── store/                      # Global state management store (Zustand)
│   └── chatStore.ts
├── tailwind.config.ts          # Tailwind CSS configuration (including DaisyUI plugin)
└── tsconfig.json               # TypeScript configuration
```

## UI/UX Design Specification

### Overall Concept & User Flow

* **Persistent Presence:** The chat interface is always available via an input textbox fixed at the bottom of the screen. 
* **Overlay Bubbles:** Chat history (latest 3-4 messages) appears as bubbles overlaying the current page content. 
* **User Interaction Flow:**
    1.  User types a message into the persistent textbox. 
    2.  The user's message appears as a new light grey chat bubble. 
    3.  The AI's response appears as a new light blue chat bubble. 
    4.  The chat history scrolls within its overlay area. 
    5.  User can click an icon to hide the chat bubbles; the textbox remains visible. 
    6.  User can click a settings icon to access options like 'Clear History'. 

### Wireframes (Descriptive)

**Chat Active - Overlay Visible**

```
+-----------------------------------------------------+
| Page Content (Visible, interactive)                 |
|                                                     |
|   +------------------------+                        |
|   | User: Previous msg 2   | (Light Grey Bubble)    |
|   +------------------------+                        |
|                    +------------------------+       |
|                    | AI: Previous msg 1     |       | (Light Blue Bubble)
|                    +------------------------+       |
|   +------------------------+                        |
|   | User: Latest message   | (Light Grey Bubble)    |
|   +------------------------+                        |
|                    +------------------------+       |
|                    | AI: Latest response    |       | (Light Blue Bubble)
|                    +------------------------+       |
|                                                     |
| Page Content (Visible, interactive)                 |
+-----------------------------------------------------+
| [ Chat Input Textbox ] [Send][Hide][Settings]       | Fixed Bottom
+-----------------------------------------------------+
```

### Visual Design Language

* **Color Palette:**
    * **AI Bubbles:** Light Blue (`#A0D2DB` or `bg-blue-200`). 
    * **User Bubbles:** Light Grey (`#E5E7EB` or `bg-gray-200`). 
    * **Textbox Background:** Neutral (`#F3F4F6` or `bg-gray-100`). 
    * **Text Color:** Dark grey/black (`#1F2937` or `text-gray-800`). 
* **Bubble Styling:**
    * **Corners:** Rounded (`rounded-lg` or `rounded-xl`). 
    * **Shadows:** Minimal, soft shadow (`shadow-sm`). 
* **Overall Feel:** Clean, light, modern, and uncluttered. 

### Iconography

* **Style:** Clean, modern, and universally understandable (e.g., from `lucide-react`). 
* **Icons Needed:** Send, Toggle Chat Visibility (`Eye`/`EyeOff`), Settings (cog). 

### Typography

* **Font Family:** A soft, easy-to-read sans-serif font like `Inter` or `Nunito Sans`. 
* **Sizing:** Legible size for messages (14px-16px). 

## Component Breakdown & Implementation Details

### Component Naming & Organization

* **React Component Names:** `PascalCase` (e.g., `UserProfileCard`). 
* **File Names for Components:** `PascalCase.tsx` (e.g., `UserProfileCard.tsx`). 
* **Organization:** Shared components in `components/` subdirectories. AI Copilot components are located in `components/ai-copilot/`. 

### AI Copilot Component Specifications

#### Component: `PersistentChatInterface` (Container Component)

* **Purpose:** Manages the overall state of the chat interface (visibility, history) and handles communication with the AI service. Renders the `ChatInput` and `ChatBubbleOverlay` components. 
* **Source File(s):** `components/ai-copilot/PersistentChatInterface.tsx` 
* **State Management:** This component will be the primary consumer of the `chatStore` (Zustand) to manage `chatHistory`, `isOverlayVisible`, etc. 
* **API Calls:** Contains the primary logic for sending messages to the AI backend and receiving responses. 

#### Component: `ChatInput` (Presentational/Controlled Component)

* **Purpose:** Renders the fixed textbox at the bottom of the screen, along with the 'Send', 'Hide Chat', and 'Settings' icon buttons. 
* **Source File(s):** `components/ai-copilot/ChatInput.tsx` 
* **Props:**
    * `value: string`: The current text in the input field.
    * `onValueChange: (value: string) => void`: Callback for when the text changes.
    * `onSubmit: () => void`: Callback for when the message is submitted.
    * `onHideToggle: () => void`: Callback to toggle chat bubble visibility.
    * `onSettingsClick: () => void`: Callback to open settings.
    * `isLoading: boolean`: To disable the input while the AI is responding.
* **Key UI Elements / Structure:**
    * Fixed at the bottom of the viewport. 
    * Contains a text input area and icon buttons for Send, Hide, and Settings. 
    * On narrower screens, the text input shrinks proportionally to accommodate the fixed-width icon buttons. 
* **Interaction:** After sending a message, focus automatically returns to the text input area. 

#### Component: `ChatBubbleOverlay` (Presentational Component)

* **Purpose:** Renders the list of chat message bubbles, overlaying a portion of the page. Manages its own internal scrolling. 
* **Source File(s):** `components/ai-copilot/ChatBubbleOverlay.tsx` 
* **Props:**
    * `messages: Array<MessageObject>`: The array of chat messages to display.
    * `isVisible: boolean`: Controls the visibility of the overlay.
* **Key UI Elements / Structure:**
    * The container uses `display: flex` and `flex-direction: column-reverse` to stack messages from the bottom up. 
    * Positioned on one side of the viewport (e.g., bottom-right). 
    * The container itself is transparent to allow underlying page content to be visible around the bubbles. 
    * To prevent messages from being obscured by the `ChatInput` component, the scrollable area within this overlay has a `padding-bottom` equal to the height of the `ChatInput`. 

#### Component: `ChatMessageBubble` (Presentational Component)

* **Purpose:** Renders a single chat message, styled differently for the user and the AI. 
* **Source File(s):** `components/ai-copilot/ChatMessageBubble.tsx` 
* **Props:**
    * `message: MessageObject`: The message content, sender, and timestamp.
* **Styling Notes:**
    * **AI Bubble:** Light blue background, aligned to the **left** side of the chat overlay (`self-start`). 
    * **User Bubble:** Light grey background, aligned to the **right** side of the chat overlay (`self-end`). 
    * Bubbles have a `max-width` (e.g., `max-w-xl`) to prevent them from becoming too wide. 
    * Text within the bubble remains left-aligned for readability. 

#### Component: `HideChatButton` (Presentational Component)

* **Purpose:** Renders a dynamic icon to show or hide the `ChatBubbleOverlay`. 
* **Source File(s):** `components/ai-copilot/buttons/HideChatButton.tsx` (example path) 
* **Props:**
    * `isChatVisible: boolean`: Determines which icon to show (`Eye` or `EyeOff`). 
    * `onClick: () => void`: The toggle handler.
* **Accessibility Notes:**
    * Tooltip and `aria-label` dynamically change between "Show chat history" and "Hide chat history". 
    * Uses `aria-pressed` to communicate the toggle state to screen readers. 

#### Component: `ChatSettings` (Presentational Component with local state for popover)

* **Purpose:** Renders the settings (cog) icon and handles the popover for actions like "Clear Chat History". 
* **Source File(s):** `components/ai-copilot/ChatSettings.tsx` 
* **Interaction:** Clicking the "Clear Chat History" option will prompt the user for confirmation before dispatching an action to clear the state. 

### AI Copilot Panel Specifications (Roster Copilot Context)

#### Desktop Panel Behavior
* **Default State:** The panel defaults to open on desktop for immediate access. 
* **User Control:** The user can collapse/hide the panel. This state is persisted across sessions using `localStorage`. 
* **Auto-Reopen:** The panel may auto-reopen for critical alerts. 

#### Mobile Access Pattern
* **Access Method:** Accessed via a clearly labeled AI Copilot icon which triggers an overlay interface. 
* **Overlay Design:** The overlay typically covers the bottom half of the screen. 

#### Contextual Awareness & Verbosity
* **Screen Context:** The AI's proactivity is influenced by the user's current screen (e.g., Draft room vs. Roster management). 
* **User Profile Adaptation:** The AI's behavior adapts based on the user's archetype (e.g., "Eager Learner" gets more detailed explanations). 

## State Management In-Depth

* **Chosen Solution:** **Zustand** will be used for global state, supplemented by local component state (`useState`).
* **Store Structure (`store/chatStore.ts`):**
    * `chatHistory: Array<MessageObject>`: where `MessageObject` = `{ id: string, text: string, sender: 'user' | 'ai' }`. 
    * `isOverlayVisible: boolean`. 
    * `isLoadingResponse: boolean`. 
    * Actions to add messages, toggle visibility, and clear history.
* **Persistence:** The `isOverlayVisible` state and potentially the `chatHistory` will be persisted to `localStorage` to be restored across sessions. 

## API Interaction Layer

* **Communication Method:** Native `fetch` API for calls to backend Next.js API routes. 
* **Conceptual `handleSendMessage` function (in `PersistentChatInterface`):**
    1.  Add user message to the `chatHistory` state.
    2.  Set `isLoadingResponse` to `true`.
    3.  `POST` the message to the AI service endpoint.
    4.  On receiving a response, add the AI message to `chatHistory`.
    5.  Set `isLoadingResponse` to `false`.
    6.  Handle any errors gracefully, potentially showing an error message in the chat UI. 

## Routing Strategy

* **Primary Routing Mechanism:** Next.js App Router (folder structure in `app/` defines routes). 
* **Authentication & Authorization:** The `app/(main)/layout.tsx` (where the AI Copilot panel resides) will handle logic for authenticated users. Unauthenticated users will be directed to routes in the `app/(auth)/` group.  The AI Copilot panel itself is not a route but a persistent UI element within the main authenticated layout.

## Build, Bundling, and Deployment

* **Build Process:** Managed by Next.js (`npm run build`). 
* **Bundling Strategy:** Next.js provides automatic code splitting by route. `next/dynamic` will be considered for large, non-critical components to further optimize loading. 
* **Deployment:** Deployed on Netlify, connected to the Git repository. Pushes to the deployment branch will trigger an automatic build and deploy. 

## Frontend Testing Strategy

* **Primary Frontend Testing Tools:** Jest 29.7.0 (with React Testing Library 16.3.0); Playwright 1.52.0. 
* **Unit & Component Tests:** Individual React components (especially the AI Copilot components) will be tested using RTL to simulate events and assert rendering based on props and state. API calls will be mocked. 
* **End-to-End (E2E) Tests:** Playwright will be used for critical user flows, including interacting with the AI Copilot panel (e.g., sending a message and verifying a mocked response appears). 

## Accessibility (AX) Implementation Details

* **Keyboard Navigation:** All interactive elements (input, send, hide, settings, clear history, scroll) must be keyboard accessible and operable. 
* **Focus Management:** Clear focus indicators for all interactive elements. When the chat opens/closes, focus should be managed logically. 
* **ARIA Attributes:**
    * Use `aria-live="polite"` for the chat message area so screen readers announce new messages. 
    * Use proper roles for chat elements (e.g., `log`, `form`, `button`). 
    * `aria-label` is required for all icon-only buttons. 
    * `aria-pressed` must be used for toggle buttons (like the Toggle Chat Visibility button) to indicate their current state. 
* **Color Contrast:** Ensure sufficient contrast between text and background colors in bubbles, the input field, and controls to meet WCAG 2.1 AA standards. 
* **Text Resizing:** The interface must remain usable when the browser text is zoomed. 

## Performance Considerations

* **Memoization:** Use `React.memo` for presentational components like `ChatMessageBubble` to prevent re-renders when props haven't changed, which is crucial for a potentially long list of messages. 
* **Virtualization:** If chat history is expected to become extremely long (hundreds of messages), a virtualization library (e.g., `react-window`) will be considered for the `ChatBubbleOverlay` to only render the visible messages. This is likely overkill initially. 
* **Bundle Size:** Be mindful of any new dependencies added.
* **Interaction with Underlying Page:** Ensure the chat overlay uses `pointer-events: none;` on its main container and `pointer-events: auto;` on the actual interactive chat elements to allow the user to click "through" the empty parts of the overlay onto the page content underneath. 

## Change Log

| Change | Date | Version | Description | Author |
| :--- | :--- | :--- | :--- | :--- |
| Initial Frontend Architecture Document Draft | 2025-05-30 | 0.1 | First complete draft based on user collaboration. | Jane (DA) |
| Integrated AI Chat UI/UX Specification | 2025-06-03 | 1.1 | Merged the detailed AI Chat Interface spec into the main frontend architecture, creating a single unified document. | Sarah (PO) |