## API Reference

### External APIs Consumed

**#### Google Gemini AI Service API**

* **Purpose:** To provide the core generative AI capabilities for the Roster Copilot's intelligent features, with primary focus on AI-powered conversational onboarding intelligence.
* **Base URL(s):** N/A (interaction via official Google AI SDK for Node.js/TypeScript).
* **Authentication:** API Key (managed as a secure backend environment variable `GEMINI_API_KEY`).
* **Key SDK Interactions (Enhanced for AI-Powered Conversations):**
    * **Conversational Onboarding Intelligence (NEW - Stories 2.5-2.7):** Gemini model powers dynamic, personality-driven conversations for archetype discovery and preference gathering
    * **Jake Personality System:** Comprehensive system prompts enable consistent AI personality adaptation and natural conversation flow
    * **Context-Aware Response Generation:** Full conversation history sent to Gemini for natural references and conversation building
    * **Draft Pick Recommendation & Explanation:** Gemini model invoked with draft state, user profile, and player data for personalized draft advice.
    * **In-Season Advice Generation (Weekly Digest, Alerts, On-Demand Queries):** Gemini model invoked with user profile, weekly static NFL data, and specific advice type needed.

**#### Resend API**

* **Purpose:** To send transactional emails for user account actions (e.g., email verification, password reset).
* **Base URL(s):** (Refer to Resend official documentation - e.g., `https://api.resend.com`)
* **Authentication:** API Key (Header Name: `Authorization: Bearer YOUR_RESEND_API_KEY`). Key stored in environment variable `RESEND_API_KEY`.
* **Key Endpoints Used (Conceptual):**
    * **`POST /emails`**:
        * Description: Sends an email.
        * Request Body Schema: (JSON including `from`, `to`, `subject`, `html` content, etc. as per Resend API docs).
* **Link to Official Docs:** `https://resend.com/docs`

### Internal APIs Provided (If Applicable)

**#### Roster Copilot Internal API (Next.js API Routes)**

* **Purpose:** To provide the Frontend UI with necessary data, process user actions, and serve AI-driven insights from the AI Copilot Service.
* **Base URL(s):** `/api/...`
* **Authentication/Authorization:** Basic session management for PoC; protected routes for user-specific data.
* **Key Endpoints (Implemented):**

#### ✅ Authentication Endpoints (`/api/auth/`)
* **`POST /api/auth/signup`** - User registration with email verification
  - Request: `{ username, email, password, passwordConfirmation }`
  - Response: `{ message: "Verification email sent" }`
  - Features: Username/email uniqueness, password validation, bcrypt hashing
* **`GET /api/auth/verify-email/[token]`** - Email verification
  - Response: Redirects to login with success/error message
  - Features: Token validation, account activation
* **`POST /api/auth/login`** - User authentication
  - Request: `{ email, password }`
  - Response: `{ user: {...}, token: "jwt_token" }`
  - Features: Rate limiting, email verification check, JWT generation
* **`POST /api/auth/logout`** - User logout
  - Response: `{ message: "Logged out successfully" }`
  - Features: Client-side token clearing
* **`POST /api/auth/forgot-password`** - Password reset request
  - Request: `{ email }`
  - Response: `{ message: "Reset email sent" }`
  - Features: Secure token generation, email delivery
* **`POST /api/auth/reset-password`** - Password reset completion
  - Request: `{ token, newPassword }`
  - Response: `{ message: "Password reset successful" }`
  - Features: Token validation, password hashing

#### ✅ User Profile Endpoints (`/api/users/`)
* **`GET /api/users/me`** - Fetch current user profile
  - Response: `{ userId, username, email, emailVerified, createdAt }`
  - Features: JWT authentication required
* **`PUT /api/users/me`** - Update user profile
  - Request: `{ username?, email? }`
  - Response: `{ user: {...} }`
  - Features: Validation, uniqueness checks

#### ✅ League & Team Endpoints (`/api/leagues/`)
* **`GET /api/leagues/[leagueId]/my-team/roster`** - Get team roster
  - Response: `{ team: {...}, players: [...], rosterSettings: {...} }`
  - Features: Authentication, authorization, position grouping
* **`POST /api/leagues/[leagueId]/join`** - Join an existing league
  - Request: `{ }` (leagueId from URL parameter)
  - Response: `{ league: {...}, team: {...} }`
  - Features: League validation, capacity checking, draft status validation, duplicate prevention

#### ✅ Draft Endpoints (`/api/leagues/[leagueId]/draft/`)
* **`GET /api/leagues/[leagueId]/draft`** - Get current draft state
  - Response: `{ draftState: {...}, currentPick: {...}, availablePlayers: [...], userTeam: {...} }`
  - Features: Real-time draft state, snake order calculation, user context
* **`POST /api/leagues/[leagueId]/draft`** - Start draft (commissioner only)
  - Response: `{ draftState: {...} }`
  - Features: Draft initialization, snake order generation, commissioner validation
* **`POST /api/leagues/[leagueId]/draft/pick`** - Make a draft pick
  - Request: `{ playerId: string }`
  - Response: `{ success: true, pick: {...}, nextPick: {...} }`
  - Features: Turn validation, player availability, roster updates, pick advancement

#### ✅ Player Endpoints (`/api/players/`)
* **`GET /api/players`** - Get NFL players with filtering
  - Query params: `position`, `search`, `available` (for draft context)
  - Response: `{ players: [...] }`
  - Features: Position filtering, search by name, availability status
* **`POST /api/players/batch`** - Get multiple players by IDs
  - Request: `{ playerIds: string[] }`
  - Response: `{ players: [...] }`
  - Features: Batch player retrieval for roster display

#### 🚧 Planned Endpoints (Future Implementation)
* **AI Copilot - Onboarding & Profile (`/api/copilot/`):** `onboarding-profile`, `update-preference`
* **AI Copilot - Draft Assistance (`/api/copilot/`):** `draft-advice`
* **AI Copilot - In-Season Guidance (`/api/copilot/`):** `weekly-digest`, `critical-alert-check`, `on-demand-query`
* **League Management (`/api/leagues/`):** `leagues` (POST/GET), `leagues/{id}/details`, `leagues/{id}/join`
* **Player Management (`/api/players/`):** `players/{id}`, `players?search=...`