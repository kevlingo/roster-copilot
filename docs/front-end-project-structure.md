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