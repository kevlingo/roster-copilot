## Project Structure

```plaintext
roster-copilot/
├── .env.local                  # Local environment variables (e.g., Gemini API Key, Resend API Key - NOT committed to Git)
├── .gitignore                  # Specifies intentionally untracked files for Git
├── .next/                      # Next.js build output (automatically generated, git-ignored)
├── app/                        # Next.js App Router: Core application (pages, layouts, API routes)
│   ├── (auth)/                 # Optional route group for authentication pages
│   │   ├── login/page.tsx      # Login screen
│   │   └── signup/page.tsx     # Sign-up screen
│   ├── (main)/                 # Route group for main application sections (after login)
│   │   ├── layout.tsx          # Main app layout (e.g., with sidebar, AI Copilot panel)
│   │   ├── dashboard/page.tsx  # League Home / Main Dashboard screen
│   │   ├── draft/[leagueId]/page.tsx # Live Draft Room screen
│   │   ├── league/[leagueId]/  # Screens related to a specific league
│   │   │   ├── roster/page.tsx   # User's team roster
│   │   │   ├── lineup/page.tsx   # Set weekly lineup
│   │   │   ├── waivers/page.tsx  # Waiver wire / Add-drop players
│   │   │   └── standings/page.tsx# League standings
│   │   ├── copilot/             # Screens specifically for AI Copilot interactions
│   │   │   ├── digest/page.tsx # Weekly Strategy Digest screen
│   │   │   └── profile/page.tsx# User Profile / AI Copilot preferences view
│   │   └── onboarding/page.tsx # Simple host page for the AI Copilot panel's conversational onboarding flow; may include a visual progress timeline.
│   ├── api/                    # Backend API routes (Next.js Route Handlers)
│   │   ├── auth/               # Authentication related API routes
│   │   │   ├── signup/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── verify-email/[token]/route.ts # Example for email verification
│   │   │   ├── forgot-password/route.ts
│   │   │   └── reset-password/route.ts
│   │   ├── copilot/             # API routes for AI Copilot features
│   │   │   ├── onboarding-profile/route.ts
│   │   │   ├── draft-advice/route.ts
│   │   │   ├── weekly-digest/route.ts
│   │   │   └── (other_copilot_apis...)/route.ts
│   │   └── (other_general_api_routes...)/route.ts
│   ├── globals.css             # Global styles, Tailwind base/directives
│   ├── layout.tsx              # Root layout for the entire application
│   └── page.tsx                # Homepage / Initial landing page
├── components/                 # Shared React UI components
│   ├── ai-copilot/              # Components for the AI Copilot panel/overlay (including interactive chat elements like Archetype Cards)
│   │   └── AIPanel.tsx
│   ├── core/                   # Basic, reusable UI elements
│   ├── draft/                  # Components for the Draft Room UI
│   ├── layout/                 # Structural layout components
│   └── onboarding/             # UI components specific to the onboarding page, like the progress timeline
├── data/                       # For PoC: Static data files and database
│   ├── static-nfl-data/        # Directory for JSON files (player info, schedules, etc. - to be loaded into SQLite for PoC)
│   │   ├── nfl-players.json
│   │   └── nfl-games.json
│   └── roster_copilot_poc.db    # SQLite database file
├── lib/                        # Shared utilities, constants, core backend logic
│   ├── ai/                     # AI Copilot Service logic: Gemini API integration, Jake personality system, conversation intelligence
│   │   ├── gemini-service.ts   # Centralized Gemini API integration service
│   │   ├── jake-personality.ts # Jake's personality system and conversation intelligence
│   │   └── conversation-manager.ts # AI-powered conversation flow and context management
│   ├── conversation/           # Enhanced conversation management for AI-powered interactions
│   │   ├── ai-conversation-manager.ts # AI conversation intelligence engine
│   │   └── conversation-context.ts    # Conversation context optimization and management
│   ├── dal/                    # Data Access Layer: SQLite interaction logic (using Provider Model), static data parsing functions
│   ├── services/               # Other backend services (e.g., NotificationService for email)
│   │   └── NotificationService.ts
│   └── utils/                  # General utility functions
├── public/                     # Static assets accessible from the web root (images, fonts, manifest.json, etc.)
├── scripts/                    # Utility scripts
│   └── database/
│       └── seed-db.ts          # Example script for seeding database
├── next.config.js              # Next.js configuration file
├── package.json                # Project dependencies (npm/yarn) and scripts
├── tailwind.config.ts          # Tailwind CSS configuration file
├── tsconfig.json               # TypeScript configuration file
└── README.md                   # Project overview, setup, and development instructions
```
**Key Directory Descriptions:**
* **`app/`**: Core Next.js application using App Router (UI pages, layouts, API routes). `app/onboarding/page.tsx` serves as a host for the panel-driven conversational onboarding.
* **`components/`**: Reusable React UI components, including those for the AI Copilot panel (`ai-copilot/`) and onboarding UI elements (`onboarding/`).
* **`data/`**: Contains static JSON data (to be loaded into SQLite) and the SQLite database file for the PoC.
* **`lib/`**: Houses shared backend logic: `lib/ai/` for AI Copilot Service, `lib/dal/` for Data Access Layer, `lib/services/` for other services like NotificationService.
* **`public/`**: For static assets like images.
* **`scripts/`**: For utility/developer scripts like database seeding.