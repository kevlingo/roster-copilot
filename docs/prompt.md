# AI Frontend Generation Prompt for: Roster Copilot (Proof-of-Concept)

## 1. Overall Project Context

**Project Name:** Roster Copilot (Proof-of-Concept)

**Project Goal:** To create an AI-driven companion for fantasy football players of all skill levels, simplifying strategic decision-making, enhancing game understanding, and making fantasy football more accessible and enjoyable. This is for a one-month hackathon PoC.

**Core Innovation:** An "AI Copilot" that provides personalized user onboarding (via archetypes and a learning profile), "Draft Day Co-Pilot" assistance, and "In-Season Strategic Guidance" (weekly digest, critical alerts), all with preference-driven explanations.

**Target Audience (from UIUX_Spec.md):**
* **The Eager Learner:** New to fantasy football or still learning, values clear guidance and simple explanations.
* **The Calculated Strategist:** Experienced, enjoys planning and optimizing, appreciates efficiency and data.
* **The Bold Playmaker:** Experienced, willing to take risks, values high-upside opportunities.

**Application Type:** A web-based application developed as an Integrated Full-Stack application using the Next.js framework. The frontend will be a Single Page Application (SPA) experience.

**Definitive Technology Stack (from Architecture.md & Frontend-Architecture.md):**
* **Framework:** Next.js (~14.x) with React (~18.x)
* **Language:** TypeScript (~5.x)
* **Styling:** Tailwind CSS with DaisyUI component library. Adherence to utility-first principles for Tailwind is expected. DaisyUI components should be used for common UI elements (buttons, forms, modals, cards, etc.) to accelerate development and ensure a consistent base style.
* **State Management (Frontend - PoC Scope):** Primarily local component state (`useState`, `useReducer`). React Context API sparingly for specific subtrees (e.g., theme, AI Copilot panel state). Zustand as a lightweight global store option only if absolutely necessary.
* **API Interaction:** Frontend will interact with backend Next.js API Routes using the native `fetch` API.

**Overall Architectural Style (Frontend):** Component-Based Architecture using reusable React functional components with Hooks.

## 2. Design System & Visuals

**Overall Visual Style (from UIUX_Spec.md & Prd.md):**
* The UI should be **modern, clean, intuitive, and visually engaging ("pop")**.
* Prioritize ease of understanding and a professional aesthetic that inspires confidence.
* The application must be **fully responsive** across common desktop, tablet (portrait focus), and mobile web browser sizes.

**Component Library & Styling Approach (from Frontend-Architecture.md):**
* **Primary Styling:** Tailwind CSS (utility-first). Generated components should leverage Tailwind utility classes for layout, spacing, typography, colors, etc.
* **Component Library:** DaisyUI (latest stable version, e.g., ~4.7.2 as per `Architecture.md`).
    * Bolt.new should aim to generate components that are either direct DaisyUI components (e.g., `<button class="btn btn-primary">`) or are styled with Tailwind CSS in a way that is compatible and visually harmonious with DaisyUI's themes and component styles.
    * When a standard UI element is needed (button, card, modal, input, dropdown, etc.), prefer generating the DaisyUI equivalent markup structure if possible, or ensure custom components align with DaisyUI's look and feel.
* **Theming:** The application will support Light and Dark UI themes. This will be managed using DaisyUI's built-in theming capabilities (e.g., by applying `data-theme="light"` or `data-theme="dark"` to the root HTML element). Generated components should be theme-aware, utilizing Tailwind's `dark:` variants or DaisyUI's theme-sensitive component styles.
    * (Default themes: 'light' and 'dark'. If other DaisyUI themes like 'cupcake' or 'dracula' are preferred for light/dark, specify.)

**Color Palette (Conceptual - from UIUX_Spec.md placeholder, to be defined in detail if available, otherwise use DaisyUI theme defaults):**
* **Primary Color:** (e.g., A vibrant blue or green, used for primary actions, links, and highlights. Refer to DaisyUI primary color for the selected theme.)
* **Secondary Color:** (e.g., A neutral or complementary color used for secondary actions or elements. Refer to DaisyUI secondary color.)
* **Accent Color:** (e.g., A contrasting color for specific highlights or calls to action. Refer to DaisyUI accent color.)
* **Neutral Colors:** (A range of grays for text, backgrounds, borders. Refer to DaisyUI base and neutral colors.)
* **Feedback Colors:** Standard colors for success (green), error (red), warning (yellow), info (blue). Refer to DaisyUI success, error, warning, info colors.
* **Guidance for Bolt.new:** Unless specific hex codes are provided later for a custom theme, please generate components assuming usage of standard DaisyUI theme colors (e.g., `bg-primary`, `text-accent`, `border-neutral`).

**Typography (Conceptual - from UIUX_Spec.md placeholder, to be defined in detail, otherwise use DaisyUI theme defaults):**
* **Font Families:** (e.g., "Primary Sans-Serif: [Font Name like 'Inter' or 'System UI'] for body text and UI elements. Display Font (Optional): [Font Name] for major headings.")
    * **Guidance for Bolt.new:** If specific fonts are not provided, use Tailwind CSS default font stack or DaisyUI theme defaults (which are typically modern sans-serif fonts).
* **Sizes & Weights:**
    * Headings (h1-h6): Define a clear typographic scale (e.g., using Tailwind's `text-xl`, `text-2xl`, etc., or DaisyUI's heading styles).
    * Body Text: Standard size (e.g., `text-base`).
    * Captions/Small Text: (e.g., `text-sm`).
    * Weights: Specify usage of normal, medium, semibold, bold (e.g., `font-normal`, `font-semibold`).
* **Guidance for Bolt.new:** Generate text elements using appropriate semantic HTML tags (h1-h6, p, span) and apply Tailwind CSS utility classes for sizing, weight, and line height to achieve the desired hierarchy.

**Iconography (Conceptual - from UIUX_Spec.md placeholder):**
* **Style:** (e.g., "Clean, modern, line-art style icons." or "Solid, filled icons.")
* **Source (if any planned):** (e.g., "Heroicons," "Feather Icons," or custom SVG set).
* **Guidance for Bolt.new:** If specific icons are requested for components, provide SVG code or clear descriptions. If not, Bolt.new may suggest placeholder icons or use common conventions. For Roster Copilot PoC, simple, clear icons are preferred.

**Spacing & Grid (Conceptual - from UIUX_Spec.md placeholder):**
* **System:** Consistent spacing scale (e.g., based on Tailwind's default spacing scale: 4px base unit, so `p-4` is 16px, `m-2` is 8px).
* **Layout:** Use Tailwind CSS flexbox and grid utilities for layout.
* **Guidance for Bolt.new:** Apply consistent padding and margins using Tailwind utility classes. For page layouts, describe the desired structure (e.g., "two-column layout with a sidebar," "header, main content area, footer").

**Global UI Components / Design Tokens (Beyond DaisyUI):**
* At this PoC stage, we will primarily rely on DaisyUI components.
* If any custom global "design tokens" (e.g., specific border-radius standard, shadow standard) are defined beyond Tailwind/DaisyUI defaults, they will be specified here. (For now, assume standard Tailwind/DaisyUI).
* **Guidance for Bolt.new:** Prioritize generating markup that leverages DaisyUI component classes. If custom components are needed, they should be styled with Tailwind utilities to be visually consistent with DaisyUI.

## 3. Application Structure & Routing

The application uses Next.js App Router conventions. Key pages and their routes are defined by the folder structure within `app/`.

**Key Route Groups & Layouts (from Frontend-Architecture.md):**
* **Root Layout (`app/layout.tsx`):** Defines the root `<html>` and `<body>` structure for the entire application. Includes global CSS (`app/globals.css`).
* **Public/Auth Pages (`app/(auth)/...`):**
    * `/login` (`app/(auth)/login/page.tsx`): Login screen.
    * `/signup` (`app/(auth)/signup/page.tsx`): Sign-up screen.
    * These routes will have a simple layout, potentially defined in `app/(auth)/layout.tsx` if needed, distinct from the main app layout.
* **Main Authenticated Application (`app/(main)/...`):**
    * Requires authentication. Access is protected.
    * Uses a common layout defined in `app/(main)/layout.tsx`. This layout **MUST** include:
        * A persistent **Sidebar** component for primary navigation within the authenticated app.
        * A **Header** component (e.g., for user profile access, notifications).
        * An area or mechanism to display the persistent **AI Copilot Panel/Icon** (this panel might be a collapsible sidebar or a floating element, its state managed as per Frontend Architecture).
* **Homepage / Initial Landing (`app/page.tsx`):** This page might be a simple public landing page or immediately redirect to `/login` or `/dashboard` if the user is already authenticated. For the PoC, it can redirect to `/login`.

**Key Application Routes & Pages (from Frontend-Architecture.md - Route Definitions):**

Please generate the main page component structure for the following key routes. Each page should utilize the appropriate layout (`app/(auth)/layout.tsx` or `app/(main)/layout.tsx`).

* **`/dashboard` (`app/(main)/dashboard/page.tsx`):**
    * **Purpose:** Main user dashboard after login. Displays league overview, summaries of AI Copilot digest, critical alerts.
    * **Key Elements:** League selection/overview, AI Copilot digest summary cards, critical alert display area.

* **`/draft/:leagueId` (`app/(main)/draft/[leagueId]/page.tsx`):**
    * **Purpose:** Live Draft Room for a specific league (dynamic `leagueId`).
    * **Key Elements:** Draft board (grid showing picks per team/round), available player list (filterable, sortable), current team's roster-in-progress, pick timer, current picker indicator, AI Co-Pilot panel area.

* **`/league/:leagueId/roster` (`app/(main)/league/[leagueId]/roster/page.tsx`):**
    * **Purpose:** User's team roster for a specific league.
    * **Key Elements:** List of players on the roster, grouped by position, showing key player info (name, team, position, status, projected points). Indication of starters vs. bench.

* **`/league/:leagueId/lineup` (`app/(main)/league/[leagueId]/lineup/page.tsx`):**
    * **Purpose:** Page for setting the weekly lineup.
    * **Key Elements:** Display of current roster, distinction between starters and bench, drag-and-drop or click-to-move interface for players, visual representation of lineup slots and positional requirements.

* **`/league/:leagueId/waivers` (`app/(main)/league/[leagueId]/waivers/page.tsx`):**
    * **Purpose:** Waiver wire / Add-drop players for a league.
    * **Key Elements:** Filterable list of available (unowned) players, user's current roster display, actions to add/drop players.

* **`/league/:leagueId/standings` (`app/(main)/league/[leagueId]/standings/page.tsx`):**
    * **Purpose:** League standings.
    * **Key Elements:** Table or list displaying all teams in the league, ranked by W-L record, showing team name, wins, losses.

* **`/copilot/digest` (`app/(main)/copilot/digest/page.tsx`):**
    * **Purpose:** Full Weekly Strategy Digest screen from the AI Copilot.
    * **Key Elements:** Sections for waiver targets, start/sit advice, strategic highlights, with explanations. Likely presented using "Insight Cards."

* **`/copilot/profile` (`app/(main)/copilot/profile/page.tsx`):**
    * **Purpose:** User Profile page, also displaying AI Copilot preferences (selected archetype, onboarding answers).
    * **Key Elements:** Display of username, email. Forms/inputs for editing profile information (username, email, password). Read-only display of AI Copilot preferences.

* **`/onboarding` (`app/(main)/onboarding/page.tsx`):**
    * **Purpose:** Host page for the AI Copilot panel's conversational onboarding flow.
    * **Key Elements:** May include a visual progress timeline component for the onboarding steps. The primary interaction will be via the AI Copilot Panel.

**Navigation Structure (Conceptual, from UIUX_Spec.md):**
* **Primary Navigation (Sidebar within `app/(main)/layout.tsx`):**
    * Dashboard (`/dashboard`)
    * My Team (links to current league's `/roster` or a league selection page if multiple leagues)
    * Players (links to current league's `/waivers`)
    * League (links to current league's `/standings`)
    * AI Copilot Hub / Digest (`/copilot/digest`)
* **User Account Access (Header within `app/(main)/layout.tsx`):**
    * Profile (`/copilot/profile`)
    * Logout functionality

**Guidance for Bolt.new:**
* Generate basic page components for these routes, placing them in the correct `app/...` directory structure.
* Ensure pages within `app/(main)/` correctly use the `app/(main)/layout.tsx` which should contain placeholders for Sidebar, Header, and AI Copilot Panel.
* For dynamic routes like `/draft/:leagueId`, ensure the page component can receive and utilize the `leagueId` parameter.

## 4. Key User Flows & Page-Level Interactions

This section describes key user flows. Components generated should facilitate these interactions.

**Flow 1: New User Onboarding & AI Copilot Setup (Simplified for Bolt.new)**
*(Based on UIUX_Spec.md and relevant stories like 2.1, 2.2)*

1.  **User lands on Sign-Up Page (`/signup` - `app/(auth)/signup/page.tsx`):**
    * **UI:** Form with fields for username, email, password, confirm password. "Sign Up" button.
    * **Interaction:** User fills form, clicks "Sign Up".
    * **API Call (Conceptual):** `POST /api/auth/signup`.
    * **Expected UI Change (on success):** Redirect to a page indicating an email verification step is required OR directly to the AI Copilot Onboarding start page (`/onboarding`) if auto-login post-signup & pre-verification access to onboarding is allowed. (For PoC, assume redirect to `/onboarding` after signup, with verification handled in parallel).

2.  **User is on AI Copilot Onboarding Page (`/onboarding` - `app/(main)/onboarding/page.tsx`):**
    * This page primarily hosts the **AI Copilot Panel** which drives the conversational onboarding.
    * **UI (AI Copilot Panel - `components/ai-copilot/AIPanel.tsx`):**
        * Displays a welcome message.
        * Presents "Fantasy Manager Archetype" selection (e.g., using `ArchetypeCard.tsx` components). Options: "Eager Learner," "Calculated Strategist," "Bold Playmaker," "Busy Optimizer."
    * **Interaction (within AI Copilot Panel):** User selects an Archetype.
    * **API Call (Conceptual):** `PUT /api/users/me` (to update `UserProfile.selectedArchetype`).
    * **Expected UI Change (within AI Copilot Panel, if "Eager Learner" selected):** Panel transitions to display a brief questionnaire (2-3 questions, e.g., preferred explanation depth, risk comfort level).
    * **Interaction (within AI Copilot Panel):** User answers questionnaire.
    * **API Call (Conceptual):** `PUT /api/users/me` (to update `UserProfile.onboardingAnswers`).
    * **Expected UI Change:** Onboarding concludes, panel shows a confirmation, user is likely navigated to `/dashboard`. The main page (`/onboarding`) might show a progress timeline component (`components/onboarding/OnboardingProgressTimeline.tsx`).

**Flow 2: Drafting a Player during Live Draft**
*(Based on UIUX_Spec.md, Architecture.md sequence diagrams, and stories like 1.8, 3.1)*

1.  **User is in the Draft Room (`/draft/:leagueId` - `app/(main)/draft/[leagueId]/page.tsx`):**
    * **UI:** Displays draft board, available player list (`NFLPlayer` data), user's current team roster, pick timer, current picker. Includes an **AI Co-Pilot panel area**.
    * **Pre-condition:** It's the user's turn to pick.

2.  **AI Co-Pilot Provides Recommendation (Interaction for Story 3.1):**
    * **UI (AI Co-Pilot Panel):** Displays 1-2 recommended players with context (name, position, team, projected points) and a concise explanation. May include an "Suggest Another" button.
    * **API Call (Conceptual):** `POST /api/copilot/draft-advice` (triggered by frontend when it's user's turn).

3.  **User Selects a Player:**
    * **Interaction Option A (Pick AI Suggestion):** User clicks on a recommended player or a "Draft This Player" button associated with the AI suggestion in the Co-Pilot panel.
    * **Interaction Option B (Pick Independently):** User interacts with the main "Available Player List" (filterable by position), clicks on a player from this list.
    * **Expected UI Change:** Selected player is highlighted. A "Confirm Draft Pick" button becomes active.

4.  **User Confirms Draft Pick:**
    * **Interaction:** User clicks "Confirm Draft Pick" button.
    * **API Call (Conceptual):** `POST /api/leagues/:leagueId/draft/pick` with `playerId`.
    * **Expected UI Changes (on success):**
        * Selected player is added to the user's "Current Team Roster" display on the page.
        * Selected player is removed from the "Available Player List."
        * The main "Draft Board" updates to show the pick.
        * The turn advances to the next drafter.
        * The AI Co-Pilot panel clears its previous suggestion for this user.

**Guidance for Bolt.new:**
* For these flows, focus on generating the main page layouts and the areas where key components (like player lists, forms, AI Copilot Panel) would reside.
* Scaffold the interactive elements (buttons, input fields, lists).
* Indicate where API calls would be made and what kind of data would populate the UI elements (e.g., a list of player cards).

## 5. Component Generation Instructions

**Overall Strategy:**
* For the main pages defined in "Section 3: Application Structure & Routing," please generate the overall page structure and layout. Include placeholders or basic versions of the key UI elements described for each page.
* Prioritize using DaisyUI components (with Tailwind CSS for styling and layout) for common elements like buttons, forms, cards, modals, navigation bars, sidebars, etc.
* Ensure all generated components are functional React components using TypeScript and Hooks, adhering to the project structure defined in `Frontend-Architecture.md` (e.g., placing shared components in `src/components/...` and page-specific components within their respective `app/...` route directories if not broadly reusable).
* Components should be responsive and theme-aware (Light/Dark, using DaisyUI theme capabilities and Tailwind `dark:` variants).

**Specific Reusable Components to Generate:**

Please generate the following specific reusable components with the described characteristics. These components will be used in various parts of the application.

**1. Component: `ArchetypeCard.tsx`**
    * **Purpose:** An interactive card used during AI Copilot onboarding (on `/onboarding` page, likely within the `AIPanel.tsx`) to display a "Fantasy Manager Archetype" and allow the user to select it.
    * **Visual Reference/Description:** Based on `UIUX_Spec.md` concept for "Engaging 'Archetype Cards'". Each card should be visually distinct and appealing.
        * Layout: Vertical card layout.
        * Content:
            * Archetype Title (e.g., "Eager Learner") - Prominent text.
            * Archetype Icon (Suggest a simple, relevant placeholder icon if a specific one isn't provided by Bolt.new, e.g., a graduation cap for "Eager Learner", a brain/gears for "Calculated Strategist").
            * Short Archetype Description (1-2 sentences).
            * "Select" button (DaisyUI `btn-primary`).
        * Styling: Use DaisyUI `card` component as a base. Ensure good padding, clear typography. Add a subtle hover effect to indicate interactivity. When selected, the card should have a distinct visual state (e.g., border color change, background tint).
    * **Props:**
        * `title: string` (e.g., "Eager Learner")
        * `description: string`
        * `icon?: React.ReactNode` (Optional, for an SVG icon component or image)
        * `isSelected: boolean`
        * `onSelect: () => void` (Callback when the card's select button or the card itself is clicked)
    * **Interaction:** Clicking the card or its "Select" button should call the `onSelect` prop. The visual state should change based on the `isSelected` prop.
    * **Location:** `src/components/ai-copilot/ArchetypeCard.tsx` or `src/components/onboarding/ArchetypeCard.tsx`

**2. Component: `AIPanel.tsx` (Shell & Basic Structure)**
    * **Purpose:** The main shell for the persistent AI Copilot Panel/Overlay. This panel will display onboarding steps, AI advice, digests, alerts, and potentially allow for on-demand queries.
    * **Visual Reference/Description (from UIUX_Spec.md concepts):**
        * **Desktop:** A collapsible sidebar (e.g., on the right). Width around 300-400px when open. A prominent header with "AI Copilot" title and a close/collapse button. Scrollable content area.
        * **Mobile:** Accessed via a clearly labeled floating action button (FAB) or icon. When triggered, it opens as an overlay (e.g., bottom half or full screen modal-like view).
        * Styling: Clean, modern, using DaisyUI elements for structure (e.g., `card` or `drawer` for desktop, `modal` for mobile overlay if appropriate).
    * **Key Internal Structure (for Bolt.new to scaffold):**
        * Header section with title and close/collapse/expand controls.
        * A main content area where different views (onboarding steps, digest summaries, alert messages, query responses) will be rendered dynamically.
        * (Optional for Bolt.new initial generation, can be added later) An input area at the bottom if direct chat-like interaction is planned for on-demand queries.
    * **Props (Conceptual for shell):**
        * `isOpen: boolean`
        * `onToggleOpen: () => void`
        * `title?: string` (e.g., "AI Copilot", "Onboarding", "Weekly Digest")
        * `children: React.ReactNode` (for the dynamic content area)
    * **Interaction:** Clicking collapse/expand or the mobile FAB should toggle its visibility via `onToggleOpen`.
    * **Location:** `src/components/ai-copilot/AIPanel.tsx`

**3. Component: `DraftPlayerCard.tsx`**
    * **Purpose:** To display information for a single player within the "Available Player List" in the Draft Room (`/draft/:leagueId`).
    * **Visual Reference/Description:** A compact card optimized for lists.
        * Layout: Horizontal or compact vertical layout to fit many cards in a list.
        * Content:
            * Player Full Name (`NFLPlayer.fullName`) - Prominent.
            * Player Position (`NFLPlayer.position`).
            * Player NFL Team Abbreviation (`NFLPlayer.nflTeamAbbreviation`).
            * Projected Points (`NFLPlayer.projectedPoints`) - Clearly visible.
            * Status (e.g., "Active", "Injured_Out", "Bye Week" - `NFLPlayer.status`) - perhaps with a small visual indicator/badge.
            * "Draft" button (DaisyUI `btn-sm` or similar).
        * Styling: Use DaisyUI `card` (perhaps `card-compact` or `card-side`) or just styled `div`s. Ensure information is easily scannable. Add hover effect.
    * **Props:**
        * `player: NFLPlayer` (Using the `NFLPlayer` interface from `Architecture.md#NFLPlayer-(Static-PoC-Data)` which includes `playerId`, `fullName`, `position`, `nflTeamAbbreviation`, `status`, `projectedPoints`, etc.)
        * `onDraft: (playerId: string) => void`
    * **Interaction:** Clicking the "Draft" button calls `onDraft` with `player.playerId`.
    * **Location:** `src/components/draft/DraftPlayerCard.tsx`

**General Guidance for Bolt.new Component Generation:**
* Focus on generating the JSX structure, applying Tailwind CSS classes for styling based on the descriptions, and setting up the defined props.
* Basic event handling (like `onClick` calling a prop function) should be included.
* Complex state logic or API calls within these specific components should generally be stubbed or left for later manual integration, unless the component is extremely simple. The primary goal here is UI scaffolding.
* Ensure generated TypeScript code uses the interfaces/types defined (e.g., `NFLPlayer`).

## 6. State Management (High-Level Pointers)

Referencing the `Frontend-Architecture.md`:

* **Default to Local Component State:** For most components, especially presentational ones, manage state locally using React Hooks (`useState`, `useReducer`). Bolt.new should generate components that primarily receive data via props and manage their own UI-specific state locally.
* **React Context API (Sparingly):** If generating a set of components that clearly operate within a shared subtree requiring common state (e.g., a multi-step form wizard, theme provider), Bolt.new might scaffold placeholders for Context providers and consumers, but the actual Context logic will likely be refined manually. For example, the `AIPanel.tsx` might eventually use Context for its internal state if shared across many sub-components within the panel.
* **Global Store (Zustand - Minimal PoC Use):** For the PoC, direct interaction with a global Zustand store by newly generated Bolt.new components should be minimized. If a component clearly needs to display data from or dispatch actions to an existing global store (e.g., user authentication status for a Header component), Bolt.new should generate the component to accept this data via props, and the connection to the global store will be handled manually during integration. For instance, a `Header` component might receive `isAuthenticated: boolean` and `userName: string` as props.
* **Guidance for Bolt.new:** Generate components to be as stateless as possible (controlled components), receiving data and callbacks via props. If internal state is needed for UI logic (e.g., toggling a dropdown), use `useState`. Avoid generating complex global state logic or new global stores.

## 7. API Integration Points

While Bolt.new is not expected to implement the full API call logic using our `fetch` wrapper or service structure (as defined in `Frontend-Architecture.md#api-interaction-layer`), components that display or submit data should be scaffolded with clear placeholders or patterns indicating where these API interactions will occur.

**Guidance for Bolt.new:**

* **Data Display Components:** For components that display data fetched from an API (e.g., `DraftPlayerCard.tsx` displaying `NFLPlayer` data, the `Dashboard` page displaying league summaries):
    * Generate the component to accept the necessary data via props (e.g., `player: NFLPlayer` for `DraftPlayerCard.tsx`).
    * Include placeholder rendering for loading states (e.g., showing a DaisyUI `spinner` or `skeleton` component) and error states (e.g., displaying an error message).
    * You can add comments in the generated code like `// TODO: Fetch data for [component name] from API endpoint [conceptual API endpoint, e.g., /api/leagues/:leagueId/draft/available-players]`

* **Data Submission Components (Forms):** For components that submit data via forms (e.g., Login form on `/login`, Signup form on `/signup`, Profile update form on `/copilot/profile`):
    * Generate the form structure with appropriate input fields (using DaisyUI form controls like `input`, `select`, `textarea`).
    * Implement basic client-side validation stubs if described in user flows or component specs (e.g., required fields, email format).
    * The form's submission handler (e.g., `onSubmit`) should be a stubbed function that indicates an API call will be made. For example:
        ```typescript
        // Example for a login form submission handler
        const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          // const formData = new FormData(event.currentTarget);
          // const email = formData.get('email');
          // const password = formData.get('password');
          // console.log('TODO: Call API to /api/auth/login with:', { email, password });
          // setLoading(true);
          // try {
          //   // actual_api_call_here
          //   // handle success (e.g., redirect)
          // } catch (error) {
          //   // handle error (e.g., show error message)
          // } finally {
          //   setLoading(false);
          // }
        };
        ```

* **Key API Endpoints (Conceptual, from Architecture.md - for context, not direct implementation by Bolt.new):**
    * Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`
    * User Profile: `/api/users/me` (GET, PUT)
    * AI Copilot: `/api/copilot/draft-advice`, `/api/copilot/weekly-digest`, `/api/copilot/on-demand-query`, `/api/copilot/critical-alert-check`
    * League Data: `/api/leagues/...`, `/api/leagues/:leagueId/draft/...`, `/api/leagues/:leagueId/my-team/...`
    * Players: `/api/players/:playerId`, `/api/players?search=...`

* **Focus for Bolt.new:** Generate the UI structure and placeholders that anticipate these interactions. The actual API call implementation using our `fetch` wrapper and service layer will be handled manually during development and integration.

## 8. Critical "Don'ts" or Constraints

To ensure the generated code aligns with our project standards and architecture, please adhere to the following:

* **No New Global State Stores:** Do NOT generate new global state stores (e.g., new Zustand stores or new React Contexts intended for broad application-wide state). Global state strategy is already defined in `Frontend-Architecture.md`; generated components should expect to receive global data via props or connect to existing, specified stores during manual integration.
* **Adhere to TypeScript Strict Mode:** All generated TypeScript code MUST be compatible with TypeScript's `strict` mode (all flags enabled, e.g., `strictNullChecks`, `noImplicitAny`), as specified in `Architecture.md#coding-standards`. Avoid using the `any` type; use specific types or `unknown` if a type is truly indeterminate at generation time.
* **No Deprecated Libraries or Features:** Do NOT use any deprecated libraries, APIs, or HTML/CSS features. Rely on the versions and technologies specified in "Section 1: Overall Project Context" and our main `Architecture.md`.
* **Framework & Library Exclusivity:**
    * Only generate React components using functional components and Hooks. Do NOT generate class components.
    * Styling MUST use Tailwind CSS utility classes and DaisyUI component classes as described in "Section 2: Design System & Visuals." Do NOT introduce other CSS methodologies like plain CSS files (beyond `app/globals.css`), CSS-in-JS libraries (unless explicitly part of DaisyUI/Tailwind setup), or SASS/SCSS (unless specified as part of project setup, which it currently is not).
* **Accessibility Mandates:** Adhere to the accessibility guidelines described in "Section X: Accessibility (AX) Implementation Details" of `Frontend-Architecture.md` (which would be summarized in this prompt if detailing specific components). For example, all interactive elements must be keyboard accessible, and ARIA attributes should be used appropriately for custom components.
* **Security Considerations (Frontend):**
    * Do NOT use `dangerouslySetInnerHTML` unless explicitly instructed for a very specific, sanitized use case.
    * Avoid practices that could lead to common frontend vulnerabilities (e.g., mishandling user inputs that might be rendered, constructing URLs unsafely). Refer to `Frontend-Architecture.md#frontend-security-considerations`.
* **Directory Structure:** Generated components and pages MUST be placed in the correct directories as outlined in "Section 3: Application Structure & Routing" and detailed in `Frontend-Architecture.md#detailed-frontend-directory-structure`. For example, broadly reusable UI elements go into `src/components/core/`, feature-specific components into their respective feature folders or `components/[feature]/`.
* **No Direct DOM Manipulation (Outside of React's Control):** Avoid direct DOM manipulation (e.g., `document.getElementById`). All UI changes should be managed through React's state and props.
* **Simplicity for PoC:** For this Proof-of-Concept, favor simplicity and clarity in the generated code. Avoid overly complex or "clever" solutions if a simpler approach meets the requirements.
* **No Backend Logic:** Generated components should be purely frontend. Do NOT include any backend logic, direct database calls, or Node.js-specific code meant for API routes. Backend interactions are via `fetch` to Next.js API routes.

## 9. Platform-Specific Optimizations & Final Guidance

**For Bolt.new (and similar Generative UI Tools):**

* **Iterative Generation:** Understand that this prompt describes a multifaceted application. If you cannot generate everything at once, focus on scaffolding the main page structures defined in "Section 3: Application Structure & Routing" and then the specific reusable components detailed in "Section 5: Component Generation Instructions."
* **Clarity over Premature Complexity:** For this Proof-of-Concept, prioritize generating clear, understandable, and correct JSX/TSX structure with appropriate Tailwind CSS and DaisyUI class usage. Complex internal state logic or intricate animations are secondary to getting the foundational UI elements correct.
* **Leverage DaisyUI Semantics:** When generating components that have DaisyUI equivalents (e.g., buttons, cards, modals, inputs, dropdowns), please try to use the DaisyUI class names and recommended HTML structure for those components (e.g., `<button class="btn btn-primary">`, `<div class="card">...</div>`). This will ensure visual consistency and leverage the theming capabilities of DaisyUI.
* **Responsiveness:** Ensure generated layouts and components are responsive, using Tailwind's responsive prefixes (e.g., `md:`, `lg:`) as needed to adapt to different screen sizes described in "Section 2: Design System & Visuals."
* **TypeScript Usage:** Generate TypeScript code. Use provided interfaces or infer types where possible. Avoid `any` unless absolutely necessary and clearly commented. Props for components should be explicitly typed.
* **Comments for TODOs:** If there are areas where you anticipate manual coding will be required for complex logic, API integration, or state management connections, please insert comments like `// TODO: Implement [specific logic/integration needed here]` to guide the developers.
* **Focus on Structure and Style:** Your primary role with this prompt is to generate the HTML-like structure (JSX) and the styling (Tailwind/DaisyUI classes). More complex JavaScript logic and state interactions will be layered in by developers.

**Final Check:** Before finalizing your output, please ensure the generated code is well-formatted and free of obvious syntax errors.