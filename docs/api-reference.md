## API Reference

### External APIs Consumed

**#### Google Gemini AI Service API**

* **Purpose:** To provide the core generative AI capabilities for the Roster Copilot's intelligent features.
* **Base URL(s):** N/A (interaction via official Google AI SDK for Node.js/TypeScript).
* **Authentication:** API Key (managed as a secure backend environment variable `GEMINI_API_KEY`).
* **Key SDK Interactions (Conceptual for PoC):**
    * **Onboarding Profile Analysis/Greeting Generation:** Gemini model invoked with user archetype/preferences for personalized onboarding elements.
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
* **Key Endpoints (Conceptual for PoC):**
    * **Authentication (`/api/auth/`):** `signup` (POST), `login` (POST), `logout` (POST), `session` (GET), `verify-email/[token]` (GET), `forgot-password` (POST), `reset-password` (POST).
    * **User Profile (`/api/users/me`):** `GET` (fetch profile), `PUT` (update profile - including archetype, onboarding answers).
    * **AI Copilot - Onboarding & Profile (`/api/copilot/`):** `onboarding-profile` (POST/GET - potentially covered by general user profile update), `update-preference` (POST).
    * **AI Copilot - Draft Assistance (`/api/copilot/`):** `draft-advice` (POST with draft state, returns advice).
    * **AI Copilot - In-Season Guidance (`/api/copilot/`):** `weekly-digest` (GET), `critical-alert-check` (GET), `on-demand-query` (POST).
    * **Core Fantasy League Data (`/api/league/`, `/api/team/` - simplified for PoC):** `leagues` (POST for create, GET for list user is in), `leagues/{leagueId}/details` (GET), `leagues/{leagueId}/join` (POST), `leagues/{leagueId}/my-team/roster` (GET), `leagues/{leagueId}/my-team/lineup` (POST), `leagues/{leagueId}/available-players` (GET), `leagues/{leagueId}/my-team/roster/add` (POST), `leagues/{leagueId}/my-team/roster/drop` (POST), `leagues/{leagueId}/scores` (GET), `leagues/{leagueId}/standings` (GET), `leagues/{leagueId}/schedule` (GET).
    * **Players (`/api/players/`):** `players/{playerId}` (GET), `players?search=...` (GET).