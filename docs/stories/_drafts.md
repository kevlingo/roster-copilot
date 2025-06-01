# Story Drafts

**Story 1.0.1 (New for Epic 1): Generate Static NFL Player and Game JSON Data Files**

- **Story/Task:** As a Developer/System, I need to generate static JSON data files containing representative NFL player information and a simplified NFL game schedule for the PoC so that this data is available for seeding into the SQLite database and for use by the application.
- **Goal:** To create the foundational static JSON datasets (`nfl-players.json`, `nfl-games.json`) that will simulate NFL data for the Roster Copilot Proof-of-Concept.
- **Acceptance Criteria (ACs):**
  1.  A JSON file named `nfl-players.json` is created (e.g., to be placed in `data/static-nfl-data/`).
  2.  `nfl-players.json` contains an array of at least 50-100 unique, representative fictional NFL players.
  3.  Each player object in `nfl-players.json` adheres to the `NFLPlayer` schema defined in `Architecture.md` (including `playerId`, `fullName`, `position`, `nflTeamAbbreviation`, `status`, `projectedPoints`, `keyAttributes`, `notes`).
      - Ensure a variety of positions (QB, RB, WR, TE, K, DEF).
      - Include a mix of player statuses (Active, Injured_Out, Injured_Questionable, Bye Week).
      - Populate `projectedPoints` with sample data for at least one PoC week.
      - Populate `keyAttributes` and `notes` with plausible sample data.
  4.  A JSON file named `nfl-games.json` is created (e.g., to be placed in `data/static-nfl-data/`).
  5.  `nfl-games.json` contains an array of simplified NFL game objects for a PoC season (e.g., at least 1-2 weeks of games for 8-12 teams).
  6.  Each game object in `nfl-games.json` adheres to the `NFLGame` schema defined in `Architecture.md` (including `gameId`, `weekNumber`, `homeTeamAbbreviation`, `awayTeamAbbreviation`, `gameDateTime_ISO`, `matchupContextNotes`).
      - Ensure `homeTeamAbbreviation` and `awayTeamAbbreviation` correspond to `nflTeamAbbreviation` values used in `nfl-players.json`.
  7.  The generated JSON data is well-formatted and valid.
  8.  The generation process **should leverage data generation libraries where appropriate** (e.g., for unique IDs, fictional names, basic numerical data) but **must also ensure the generated data is contextually plausible for an NFL PoC.** This may involve custom scripting, configuration of the generation library, or manual curation/adjustment of library outputs to achieve realistic player profiles, team assignments, game schedules, and relevant attributes/notes.
  9.  (Optional but recommended) The generation process is documented or scripted if it involves more than manual creation, to allow for regeneration if needed.

---

**Story 1.0.2 (New for Epic 1): Seed Static NFL Player and Game Data into SQLite Database**

- **Story/Task:** As a Developer/System, I need to seed the SQLite database with data from the static `nfl-players.json` and `nfl-games.json` files so that the application has initial NFL player and game data to operate with for the PoC.
- **Goal:** To populate the `NFLPlayers` and `NFLGames` tables (or their equivalents as per `Architecture.md` data models) in the `roster_copilot_poc.db` SQLite database with the content from the generated JSON data files.
- **Acceptance Criteria (ACs):**
  1.  A mechanism (e.g., a script, a one-time setup function) exists to read `nfl-players.json` and `nfl-games.json` from their location (e.g., `data/static-nfl-data/`).
  2.  Before seeding, the relevant tables (`NFLPlayers`, `NFLGames`) are created in the SQLite database if they don't already exist, matching the schemas defined in `Architecture.md`.
  3.  All player objects from `nfl-players.json` are inserted into the `NFLPlayers` table.
  4.  All game objects from `nfl-games.json` are inserted into the `NFLGames` table.
  5.  The seeding process handles potential data type conversions or mapping between JSON fields and database columns as necessary, according to the schemas in `Architecture.md`.
  6.  The seeding process is idempotent (i.e., running it multiple times does not duplicate data or cause errors, perhaps by checking if data exists or clearing tables before seeding for PoC).
  7.  A clear success message or log is produced upon completion of the seeding process.
  8.  If errors occur during seeding (e.g., JSON parsing error, database write error), they are logged clearly.
  9.  This seeding mechanism is intended for initial PoC data setup and can be run by a developer during project initialization.

---

**Story 1.0.3 (New for Epic 1): Setup Core API Middleware**

- **Story/Task:** As a Developer, I need to set up core API middleware for common concerns like error handling and request logging so that all API endpoints have consistent baseline behavior and observability from the outset.
- **Goal:** To implement and configure essential middleware for the Next.js API routes that will handle cross-cutting concerns for all (or most) API endpoints in a standardized way, as outlined in the `Architecture.md`.
- **Acceptance Criteria (ACs):**
  1.  A standardized error handling middleware is implemented for all Next.js API routes.
      - This middleware catches unhandled errors from API route handlers.
      - It logs detailed error information server-side (as per `Architecture.md` "Error Handling Strategy" - Logging).
      - It ensures that user-facing responses for errors are generic and do not leak sensitive information (as per `Architecture.md` "Error Handling Strategy" - Information Disclosure).
      - It returns appropriate HTTP status codes for different error types if possible (e.g., 400 for validation, 500 for server errors).
  2.  A request logging middleware is implemented for all Next.js API routes.
      - This middleware logs key information for each incoming request (e.g., timestamp, method, path, status code of response, duration).
      - Logged information aligns with the logging strategy defined in `Architecture.md` ("Error Handling Strategy" - Logging, Context).
  3.  (Optional, if deemed necessary for PoC now) A basic authentication check middleware or wrapper is stubbed out or implemented to be easily applied to protected routes, preparing for Story 1.2 (Login) and subsequent authenticated endpoints. This middleware would verify session validity.
  4.  The implemented middleware is applied globally to API routes or in a way that ensures consistent application as new routes are added.
  5.  The setup of this core middleware is documented briefly (e.g., in `README.md` or a specific backend setup guide within `docs/`) if it involves non-standard Next.js patterns.

---

**Story 1.1 (Revised): User Account Creation with Email Verification**

- **Story:** As a new user, I want to be able to sign up for a Roster Copilot account **and verify my email address** so that I can securely access the platform and its features.
- **Acceptance Criteria (ACs):**

  1.  User can navigate to a Sign-Up page/form.
  2.  Sign-Up form requires at least a username, email address, and password.
  3.  Password input has a confirmation field.
  4.  System validates that the username is unique.
  5.  System validates that the email address is in a valid format and is unique.
  6.  System enforces password complexity rules.
  7.  Upon submitting valid sign-up details, a new user account is created with an "unverified" status.
  8.  A unique, time-limited verification link/token is sent to the user's provided email address.
  9.  The user is informed on-screen that a verification email has been sent and they need to check their email to complete registration.
  10. The verification email clearly explains its purpose and contains the verification link/token.
  11. Clicking the verification link in the email verifies the user's email address and updates the account status to "verified".
  12. Upon successful email verification, the user is logged in (or taken to the login page with a success message).
  13. User receives a clear success message upon completing email verification.
  14. If sign-up form submission fails (e.g., username taken, invalid email format), clear and specific error messages are displayed.
  15. If the verification link is invalid, expired, or already used, an appropriate error message is displayed.
  16. Users are blocked from full access until their email is verified (MVP approach).

  ***

  **Story 1.2: User Login**

- **Story:** As a registered user, I want to be able to log in to my Roster Copilot account using my credentials so that I can access my leagues and personalized features.
- **Acceptance Criteria (ACs):**

  1.  User can navigate to a Login page/form.
  2.  Login form requires the user's email address (or username) and password.
  3.  Upon submitting valid credentials, the system authenticates the user.
  4.  Upon successful authentication, the user is granted access to the authenticated parts of the application (e.g., redirected to their dashboard).
  5.  A persistent session is created for the logged-in user.
  6.  If authentication fails (e.g., incorrect email/username or password), a clear and non-specific error message (e.g., "Invalid credentials") is displayed.
  7.  The system protects against brute-force login attempts (e.g., rate limiting – _this might be a broader NFR but good to keep in mind for the AC if specific behavior is expected at the story level_).

  ***

  **Story 1.3: User Logout**

- **Story:** As a logged-in user, I want to be able to log out of my Roster Copilot account so that I can securely end my session.
- **Acceptance Criteria (ACs):**

  1.  A clear "Logout" option (e.g., button, link) is accessible to logged-in users within the application's main navigation or user profile area.
  2.  Clicking the "Logout" option initiates the logout process.
  3.  The user's current session is terminated securely on the server-side.
  4.  Any client-side session identifiers (e.g., tokens in memory/session storage) are cleared.
  5.  Upon successful logout, the user is redirected to a public page (e.g., the Login page or Homepage).
  6.  The user can no longer access authenticated-only areas of the application without logging in again.

  ***

  **Story 1.4: View/Edit Basic Profile Information**

- **Story:** As a registered user, I want to be able to view and edit my basic profile information so that I can keep my account details up to date.
- **Acceptance Criteria (ACs):**

  1.  A logged-in user can navigate to a "Profile" or "Account Settings" page.
  2.  The Profile page displays the user's current basic information (e.g., username, email address).
  3.  The user has an option to edit their profile information (e.g., an "Edit Profile" button).
  4.  When editing, the user can update their email address.
  5.  When editing, the user can change their password.
      - Changing password requires them to enter their current password.
      - New password input requires a confirmation field.
      - New password must adhere to defined complexity rules.
  6.  The system validates changes (e.g., new email format and uniqueness, password complexity).
  7.  Upon successful update, changes are persisted to the user's account.
  8.  User receives a clear success message upon updating their profile.
  9.  If an update fails (e.g., email already taken, incorrect current password), clear and specific error messages are displayed.

  ***

  **Story 1.5: Forgot Password Functionality**

- **Story:** As a registered user who has forgotten their password, I want to be able to securely reset my password so that I can regain access to my account.
- **Acceptance Criteria (ACs):**

  1.  A "Forgot Password?" link is available on the Login page.
  2.  Clicking the link takes the user to a page where they can enter their registered email address.
  3.  Upon submitting a registered email address, the system sends a password reset link/token to that email.
  4.  The password reset link/token is unique, time-limited, and single-use.
  5.  The email clearly explains the purpose of the link and how to use it.
  6.  Clicking the reset link in the email takes the user to a secure page where they can enter and confirm a new password.
  7.  The new password must adhere to defined complexity rules.
  8.  Upon successful password reset, the user's password is updated in the system.
  9.  The user receives an on-screen confirmation of the successful password change.
  10. (Optional, but good practice) The user receives an email notification that their password has been changed.
  11. If the submitted email address is not found in the system, a generic message is displayed (to avoid confirming whether an email is registered).
  12. If the reset link is invalid, expired, or already used, an appropriate error message is displayed.

  ***

  **Story 1.6: Basic League Creation**

- **Story:** As a registered and logged-in user, I want to be able to create a new fantasy football league with basic settings so that I can start a league and invite others to join.
- **Acceptance Criteria (ACs):**

  1.  A logged-in user can access a "Create League" option/page.
  2.  The "Create League" form requires the user to input a unique League Name.
  3.  The "Create League" form allows the user to select the number of teams in the league (e.g., options for 8, 10, 12 teams, as per PoC scope in Data Models `League_PoC`).
  4.  The "Create League" form allows the user to select a basic scoring type (e.g., "Standard," "PPR," as per PoC scope in Data Models `League_PoC`).
  5.  Upon submission of valid league creation details, a new league is created in the system with the submitting user assigned as the Commissioner.
  6.  The newly created league has a default draft status of "Scheduled" and current season week set (e.g., to 1, as per `League_PoC` data model).
  7.  After successful league creation, the user (Commissioner) is redirected to the newly created league's dashboard/home page.
  8.  The system displays a success message upon league creation.
  9.  If league creation fails (e.g., non-unique league name), a clear error message is displayed.
  10. Other league settings (e.g., roster size, specific waiver rules beyond basic add/drop) will use predefined PoC defaults and are not customizable at this stage.

  ***

  **Story 1.7: Join an Existing League**

- **Story:** As a registered and logged-in user, I want to be able to join an existing fantasy football league so that I can participate with others.
- **Acceptance Criteria (ACs):**

  1.  A logged-in user can access an option to "Join League" (e.g., from their main dashboard or a league selection page).
  2.  The "Join League" interface requires the user to input a League ID (or a unique league identifier/invitation code).
  3.  The system validates if the entered League ID exists and if the league is open for new members (e.g., has not reached its maximum number of teams).
  4.  Upon successful validation and if the league has space, the user's team is added to the league.
  5.  The user is informed of successful league join and is able to navigate to the league's dashboard.
  6.  If the League ID is invalid, the league is full, or joining is not possible for other reasons (e.g., draft already in progress/completed, if that's a restriction for PoC), a clear error message is displayed.
  7.  For the PoC, joining a league does not require commissioner approval (it's an open join if space allows).
  8.  The system should update the `participatingTeamIds` in the `League_PoC` data model and create a corresponding `FantasyTeam_PoC` entry for the user.

  ***

  **Story 1.8: Core Live Online Snake Draft Room Interface**

- **Story:** As a logged-in user in an active league, I want to access a live online draft room that supports a snake draft format so that I can select players for my team in real-time with other league members.
- **Acceptance Criteria (ACs):**

  1.  When a league's draft is active/scheduled, users in that league can navigate to and enter the "Live Draft Room" page.
  2.  The Draft Room displays a draft board showing all draft picks by team and round.
  3.  The Draft Room indicates the current team on the clock and the time remaining for their pick (for PoC, pick timer can be simplified or generous).
  4.  The Draft Room displays a list of available NFL players, filterable by position (QB, RB, WR, TE, K, DEF).
  5.  Available player information includes at least `fullName`, `position`, `nflTeamAbbreviation`, and `projectedPoints` (from static PoC `NFLPlayer` data).
  6.  A user whose turn it is to pick can select an available player and confirm their pick within the allotted time.
  7.  Once a player is picked, they are removed from the available player list and added to the drafting user's team roster and the draft board.
  8.  The draft proceeds in a snake order (e.g., Team 1, Team 2, ..., Team N, Team N, ..., Team 2, Team 1).
  9.  Users can view their current team roster as it's being built during the draft.
  10. The system updates the draft board, current pick, and available players in real-time (or near real-time with polling for PoC) for all users in the Draft Room.
  11. When the draft is completed (all teams have filled their rosters based on predefined PoC roster sizes), the system clearly indicates the draft has ended.
  12. The `draftStatus` for the `League_PoC` is updated to "InProgress" when the draft starts and "Completed" when it ends.
  13. For the PoC, the draft room assumes all users are online and actively making picks (no auto-pick or commissioner pause/admin features).

  ***

  **Story 1.9: View Team Roster**

- **Story:** As a logged-in user who is part of a league, I want to be able to view my current team roster so that I can see the players I have and their basic information.
- **Acceptance Criteria (ACs):**

  1.  A logged-in user can navigate to a "My Team" or "Roster" page for each league they are a part of.
  2.  The page displays a list of all players currently on the user's `FantasyTeam_PoC` roster.
  3.  For each player on the roster, the following information is displayed: `fullName`, `position`, `nflTeamAbbreviation`, and `status` (e.g., "Active", "Injured", "Bye Week" from the static `NFLPlayer` data).
  4.  (Optional for PoC but good for context) Display the player's `projectedPoints` for the current/upcoming week if available in the static data.
  5.  The roster view should clearly distinguish between different player positions.
  6.  The roster view should indicate if a player is in the starting lineup or on the bench (this will be more relevant once "Set Weekly Lineup" functionality is implemented, but the display should be prepared for it).

  ***

  **Story 1.10: Set Weekly Lineup**

- **Story:** As a logged-in user who is part of a league, I want to be able to set my weekly lineup for my fantasy team so that I can optimize my team's performance for the current week's games.
- **Acceptance Criteria (ACs):**

  1.  A logged-in user can navigate to a "Set Lineup" or "Manage Lineup" page for their team for the current/upcoming league week.
  2.  The page displays the user's current roster, distinguishing between players currently in the starting lineup and players on the bench.
  3.  The interface clearly shows the required number of players for each starting position (e.g., 1 QB, 2 RB, 2 WR, 1 TE, 1 K, 1 DEF – _these would be based on PoC default league settings_).
  4.  Users can move players between their bench and the starting lineup slots, adhering to positional requirements.
  5.  The system prevents users from saving an invalid lineup (e.g., too many players at one position, not enough players at another, or an injured player in a starting slot if we decide to enforce this for PoC).
  6.  Users can save their submitted lineup for the current/upcoming week.
  7.  The saved lineup is persisted and reflected in the roster view and any relevant game-week views.
  8.  Player information displayed should include data relevant to lineup decisions, such as `fullName`, `position`, `nflTeamAbbreviation`, `status`, and `projectedPoints` (from static `NFLPlayer` data).
  9.  A clear indication of which NFL game a player is participating in for the week, and their opponent, should be visible if this data is available in the static `NFLGame` data for the PoC.
  10. (Optional for PoC) A "Save Lineup" action provides confirmation feedback to the user.

  ***

  **Story 1.11: Basic Add/Drop Player Functionality (Simplified Waivers)**

- **Story:** As a logged-in user, I want to be able to add available players to my team and drop players from my team so that I can manage my roster throughout the season.
- **Acceptance Criteria (ACs):**

  1.  A logged-in user can navigate to a "Players" or "Waiver Wire" page that lists available NFL players (those not currently on any team's roster in their league).
  2.  The available players list displays relevant information: `fullName`, `position`, `nflTeamAbbreviation`, `status`, and `projectedPoints` (from static `NFLPlayer` data).
  3.  Users can filter the available player list by position.
  4.  Users can select an available player and initiate an "Add Player" action.
  5.  If the user's roster is full, the system requires them to select a player from their current roster to "Drop" in order to add the new player.
  6.  If the user's roster has space, they can add a player without dropping anyone (up to roster limits defined by PoC defaults).
  7.  Users can select a player from their current roster and initiate a "Drop Player" action (which would free up a roster spot).
  8.  Upon successful completion of an add/drop transaction:
      - The user's `FantasyTeam_PoC` roster is updated (`playerIds_onRoster`).
      - The added player is no longer listed as available in the league.
      - The dropped player becomes available in the league (if applicable for PoC static data handling).
  9.  The system provides clear confirmation messages for successful add, drop, or add/drop transactions.
  10. The system prevents invalid transactions (e.g., trying to add a player to a full roster without dropping someone, dropping a player not on the roster).
  11. For the PoC, all add/drop transactions are processed immediately (no waiver period, bidding, or priority system).

  ***

  **Story 1.12: Display of Fantasy Scores**

- **Story:** As a logged-in user, I want to be able to view fantasy scores for NFL games (from the PoC static dataset) so that I can track player performances and my team's matchup.
- **Acceptance Criteria (ACs):**

  1.  The application has a mechanism to access and display NFL game information and player scores from the static PoC dataset (e.g., `NFLGame` and `NFLPlayer` data with `projectedPoints` or actual PoC scores for a given week).
  2.  Users can view a summary of scores for the current/past PoC week's NFL games relevant to their league.
  3.  This score display should be accessible, for instance, from the League Home/Dashboard or a dedicated "Scores" page.
  4.  For each game displayed, users can see the participating NFL teams, their scores (from static data), and potentially key player fantasy point totals from that game (from static data).
  5.  Within a user's weekly matchup view (if already developed or as part of this story), the fantasy points for players in their and their opponent's starting lineups are updated based on the static PoC scores.
  6.  The display clearly indicates the status of games (e.g., "Scheduled," "In Progress," "Final" - based on PoC static data for a given week).
  7.  The system should be able to reflect scoring updates based on the progression of the PoC static dataset for a simulated week.

  ***

  **Story 1.13: Display League Standings and Basic Schedule**

- **Story:** As a logged-in user in a league, I want to be able to view the current league standings and a basic league schedule so that I can track my team's progress and see upcoming matchups.
- **Acceptance Criteria (ACs):**

  1.  A logged-in user can navigate to a "League Standings" page.
  2.  The standings page displays all teams in the league, ranked by their win-loss record (for PoC, this will be based on static/simulated game outcomes for past weeks).
  3.  For each team, the standings show: Team Name, Wins, Losses, (PoC: Ties if applicable), and (PoC: total points for/against, if easily calculable from static data).
  4.  A logged-in user can access a basic "League Schedule" view (this could be part of the standings page or a separate section).
  5.  The schedule displays past and upcoming matchups for each week of the PoC season.
  6.  For each matchup, the schedule shows the participating teams and, for completed games, the final scores (from static PoC data).
  7.  The user can easily identify their own team's past results and upcoming matchups within the schedule.
  8.  The `currentSeasonWeek` from the `League_PoC` data model is used to determine which week's data to primarily display or highlight.

  ***

  **Story 1.14: Access Basic Player Statistics and NFL News**

- **Story:** As a logged-in user, I want to be able to access basic player statistics and relevant NFL news (from static PoC datasets) so that I can make informed decisions about my fantasy team.
- **Acceptance Criteria (ACs):**

  1.  Users can access a "Players" section or individual player profiles/pop-ups where basic statistics are displayed.
  2.  Player profiles display information such as `fullName`, `position`, `nflTeamAbbreviation`, `status`, `projectedPoints`, and `keyAttributes` (e.g., consistency, upside) as available in the static `NFLPlayer` data.
  3.  (PoC Scope) Basic NFL news/notes relevant to players (e.g., injury updates, role changes) are displayed if included in the `notes` field of the static `NFLPlayer` data or a separate static news dataset.
  4.  The player information should be easily searchable or accessible from various points in the application (e.g., from roster, waiver wire, draft room).
  5.  The displayed statistics and news are clearly sourced from the PoC static dataset for the current simulated week/period.

  ***

**Story 2.1 (Revised): Implement Fantasy Manager Archetype Selection Interface**

* **Story:** As a new user undergoing AI Copilot onboarding, I want to be presented with a selection of predefined "Fantasy Manager Archetypes" so that I can choose one that best reflects my initial approach or experience level with fantasy football.
* **Acceptance Criteria (ACs):**
    1.  During the AI Copilot onboarding flow, after initial account creation/login (and potentially email verification), the user is presented with an archetype selection interface.
    2.  The interface clearly displays the predefined "Fantasy Manager Archetypes" (e.g., **"Eager Learner"** (for new/learning players), "Calculated Strategist," "Bold Playmaker," "Busy Optimizer" - *updated list*).
    3.  Each archetype option includes a brief, engaging description of its characteristics (potentially using "Archetype Cards" as suggested in UI/UX spec). The description for "Eager Learner" should cater to those completely new and those still learning.
    4.  The user can select one archetype.
    5.  The user's selection is captured and stored as part of their `UserProfile` (specifically the `selectedArchetype` field, reflecting the updated list).
    6.  Upon selection, the system proceeds to the next step in the onboarding flow (e.g., conditional questionnaire if "Eager Learner" is selected, or completion of this part of onboarding).
    7.  The interface for archetype selection is visually appealing and easy to use, aligning with the "modern, clean, engaging pop" aesthetic.

    ***
    **Story 2.2: Implement Brief Guided Questionnaire for Eager Learner Archetype Users**

* **Story:** As a new user who has selected the "Eager Learner" archetype, I want to answer a brief, guided questionnaire so that the AI Copilot can establish my essential baseline preferences for personalized advice.
* **Acceptance Criteria (ACs):**
    1.  If a user selects the "Eager Learner" archetype during onboarding (as per Story 2.1), they are presented with a short questionnaire.
    2.  The questionnaire consists of 2-3 key questions designed to capture baseline preferences (e.g., preferred explanation depth: "simple," "standard," "detailed"; risk comfort level: "low," "medium," "high" – as per `UserProfile.onboardingAnswers` in `Architecture.md`).
    3.  Each question is presented clearly with straightforward options for answers.
    4.  The user's answers are captured and stored in their `UserProfile` (specifically in the `onboardingAnswers` object).
    5.  Upon completion of the questionnaire, the user is informed that their initial preferences are set.
    6.  The interface for the questionnaire is user-friendly, easy to navigate, and aligns with the application's visual style.
    7.  After completing the questionnaire, the user proceeds to the next step in the onboarding flow or to the main application dashboard.
    *Note: Exact question wording to be detailed by the Design Architect in `UIUX_Spec.md`.*

    ***

    **Story 2.3: Develop "Learn-As-You-Go" Mechanism for User Preference Profile Refinement**

* **Story:** As an active user, I want the AI Copilot to observe my actions and decisions, and when it detects patterns or significant deviations from my current User Preference Profile, I want it to proactively ask for my confirmation to update and refine my profile so that its advice becomes increasingly personalized and accurate over time.
* **Acceptance Criteria (ACs):**
    1.  The system (specifically the AI Copilot Service) has a mechanism to passively observe key user actions and decisions relevant to their preferences (e.g., types of players drafted/added, riskiness of lineup choices, interaction style with AI features – *for PoC, this observation might be based on simplified heuristics or simulated events*).
    2.  The AI Copilot Service can compare observed behaviors/decisions against the user's existing `UserProfile` (archetype, onboarding answers, and any learned observations).
    3.  (PoC Scope) When a predefined pattern or a significant deviation is detected (e.g., an "Eager Learner" consistently making "Bold Playmaker" type waiver claims), the AI Copilot generates a polite, contextual prompt to the user.
    4.  The prompt clearly states the observation and asks if the user would like to update their profile to reflect this tendency (e.g., "I've noticed you often pick high-risk, high-reward players. Would you like me to consider this tendency when giving advice in the future?").
    5.  The user can easily respond "Yes" or "No" to the AI's prompt (e.g., via buttons in the AI Copilot Panel).
    6.  If the user confirms "Yes," the AI Copilot Service updates the `UserProfile` (e.g., adds to `learnedObservations` or adjusts a preference like `riskToleranceNumeric`).
    7.  If the user says "No," the profile is not updated for that specific observation, and the AI should respect this (perhaps by not prompting for the exact same observation too frequently).
    8.  This "Learn-As-You-Go" interaction is designed to be unobtrusive and enhance the user's sense of a personalized experience.
    9.  For the PoC, the "observation" logic will be simplified, focusing on 1-2 specific, demonstrable scenarios/heuristics.

    ***

    **Story 2.4: View Core User Preference Profile**

* **Story:** As a registered user, I want to be able to view my core User Preference Profile (selected archetype and explicit onboarding answers) so that I understand the basis for the AI Copilot's personalization.
* **Acceptance Criteria (ACs):**
    1.  A logged-in user can navigate to a "User Profile" or "AI Copilot Settings" page where their AI Copilot preferences are displayed.
    2.  The page clearly displays the "Fantasy Manager Archetype" the user selected during onboarding (e.g., "Eager Learner," "Calculated Strategist").
    3.  If the user answered the initial guided questionnaire (e.g., if they are an "Eager Learner"), their explicit answers to those questions (e.g., preferred explanation depth, risk comfort level) are displayed.
    4.  The presentation of this information is read-only for the PoC scope (full editing capabilities are post-MVP).
    5.  The information displayed accurately reflects the data stored in the user's `UserProfile` (fields `selectedArchetype` and `onboardingAnswers`).
    6.  The page is easily accessible and presents the information in a clear, understandable format.

    ***

    **Story 3.1: Deliver Real-Time Personalized Player Recommendations during Draft**

* **Story:** As a user participating in a live draft, I want to receive real-time, personalized player recommendations from the AI Copilot (Draft Day Co-Pilot) when it's my turn to pick, so that I can make informed decisions that align with my preferences and team needs.
* **Acceptance Criteria (ACs):**
    1.  When it is the user's turn to pick in the "Live Draft Room" (as per Story 1.8), the AI Copilot Co-Pilot panel displays personalized player recommendations.
    2.  Recommendations are generated by the "AI Copilot Service" considering the user's `UserProfile` (archetype, preferences), current draft state (players already picked, current round), and their existing team composition.
    3.  For each recommended player, the AI Co-Pilot panel displays their essential context (e.g., `fullName`, `position`, `nflTeamAbbreviation`, `projectedPoints` from static `NFLPlayer` data – as per Story 1.8 and Story 1.14).
    4.  The AI provides a concise, preference-driven explanation for why each player is recommended (as per "Basic 'Explain My Advice' Feature" in PRD).
    5.  The recommendations are refreshed or updated if the draft context changes significantly before the user picks (e.g., if a targeted player is picked by someone else just before their turn, though PoC might simplify this).
    6.  The recommendations are presented in a clear and easily scannable format within the AI Co-Pilot panel/area of the Draft Room UI.
    7.  For the PoC, the "AI Copilot Service" will use simplified logic and the static `NFLPlayer` dataset to generate these recommendations.
    8.  The performance NFR for AI Copilot suggestions (targeting 3-5 seconds) is considered in the interaction design.

    ***

    **Story 3.2: Provide Contextual Draft Guidance for Eager Learners**

* **Story:** As a user identified as an "Eager Learner," I want to receive contextual guidance and tips from the AI Copilot (Draft Day Co-Pilot) throughout the live draft process so that I can better understand draft procedures and basic strategy.
* **Acceptance Criteria (ACs):**
    1.  If the user's `UserProfile` indicates they selected the "Eager Learner" archetype, the AI Copilot Co-Pilot provides additional contextual help during the draft.
    2.  Guidance is triggered by specific draft events or states (e.g., start of the draft, user's first pick, explanation of snake draft turn order, reminders about positional needs).
    3.  Tips are concise, easy to understand, and directly relevant to the current stage of the draft.
    4.  Examples of guidance for PoC:
        * "Welcome to your first (or early) draft! The draft will proceed in a 'snake' order, meaning the pick order reverses each round."
        * "It's your turn to pick! Consider drafting a [specific position based on team need/common strategy] soon."
        * "Remember to build a balanced roster across different positions."
    5.  This guidance is displayed within the AI Co-Pilot panel/area in the Draft Room UI, separate from or clearly distinguished from player recommendations.
    6.  The guidance is designed to be helpful and not overwhelming for new users.
    7.  The "AI Copilot Service" is responsible for triggering and generating this contextual guidance based on user profile and draft state.

    ***

    **Story 3.3: Allow Independent Draft Picks Despite AI Suggestions**

* **Story:** As a user in a live draft, I want to be able to easily ignore AI Copilot (Draft Day Co-Pilot) suggestions and make my own independent player selections so that I have full control over my draft choices.
* **Acceptance Criteria (ACs):**
    1.  While the AI Co-Pilot displays recommendations (as per Story 3.1), the main player selection interface in the Draft Room remains fully functional and accessible to the user.
    2.  The user can browse, search, and select any available player from the general player pool, regardless of whether that player was recommended by the AI.
    3.  Making an independent pick does not require extra steps or dismissal of AI suggestions.
    4.  The process for confirming an independent pick is the same as confirming an AI-suggested pick (as defined in Story 1.8).
    5.  The AI Copilot (or its UI representation) does not obstruct or impede the user's ability to make their own selections.
    6.  (Optional for PoC, good UX) After an independent pick, the AI Copilot could offer a brief, neutral acknowledgement, or simply prepare for the next relevant event. It should not be critical or overly persistent about its ignored suggestions.

    ***

    **Story 3.4 (Stretch Goal): Request Alternative Draft Suggestion**

* **Story:** As a user in a live draft, when the AI Copilot (Draft Day Co-Pilot) provides a player recommendation, I want to be able to easily request an alternative suggestion so that I can explore more options if the initial one isn't to my liking.
* **Acceptance Criteria (ACs):**
    1.  When the AI Co-Pilot panel displays player recommendations (as per Story 3.1), an option (e.g., a button "Suggest Another" or "Alternative?") is available alongside or within the recommendation display.
    2.  Clicking this option prompts the "AI Copilot Service" to generate a different player recommendation.
    3.  The alternative suggestion should ideally be distinct from the previously shown recommendation(s) for that pick turn.
    4.  The alternative suggestion is displayed with the same level of context and explanation as the initial recommendation (player info, rationale, as per Story 3.1).
    5.  (PoC Scope) The AI Copilot Service might offer a limited number of alternatives (e.g., 1-2) for a given pick to keep complexity manageable.
    6.  Requesting an alternative does not prevent the user from picking their original choice, the new alternative, or any other player independently.
    7.  The feature is designed to be simple and quick to use during a timed draft pick.

    ***

    **Story 4.1: Generate Personalized Weekly Strategy Digest**

* **Story:** As an active user, I want to receive a personalized "Weekly Strategy Digest" from the AI Copilot so that I can get timely advice on waiver targets and start/sit decisions tailored to my team and preferences.
* **Acceptance Criteria (ACs):**
    1.  The system generates a "Personalized Weekly Strategy Digest" for each user, once or twice per week at scheduled times (for PoC, generation can be manually triggered or based on a simple schedule using the static dataset's current week).
    2.  The digest includes AI-identified top waiver wire targets based on the user's team needs (derived from their current roster), their `UserProfile` preferences, and available players from the static `NFLPlayer` data.
    3.  The digest includes AI-recommended start/sit options for key lineup decisions for the upcoming week, considering player matchups (from static `NFLGame` data) and the user's `UserProfile` preferences.
    4.  Each piece of advice (waiver target, start/sit option) is presented with a concise, preference-driven explanation (as per "Basic 'Explain My Advice' Feature").
    5.  The digest may also include brief highlights of important strategic considerations or matchup advantages/disadvantages for the upcoming week, based on static PoC data.
    6.  The digest is accessible to the user (e.g., via a notification in the AI Copilot Panel, a link on the dashboard, or a dedicated "Weekly Strategy Digest Screen").
    7.  The content for the digest is generated by the "AI Copilot Service" using the static PoC datasets (`NFLPlayer`, `NFLGame`, `UserProfile`).
    8.  The digest is presented in a clear, scannable, and engaging format.

    ***

    **Story 4.2: On-Demand AI Queries for Digest Details**

* **Story:** As a user reviewing my Weekly Strategy Digest, I want to be able to make on-demand queries to the AI Copilot for further detail or clarification on specific suggestions so that I can better understand the advice before acting on it.
* **Acceptance Criteria (ACs):**
    1.  When viewing the "Weekly Strategy Digest" (as per Story 4.1), the user has an option to ask for more details or clarification on specific pieces of advice (e.g., a "Why this player?" button or a focused query input within the AI Copilot Panel).
    2.  (PoC Scope) On-demand queries are focused on the suggestions presented in the digest (e.g., "Tell me more about why player X is a good waiver target," "What are the risks of starting player Y?").
    3.  The "AI Copilot Service" processes these queries, referencing the user's `UserProfile`, relevant static data (`NFLPlayer`, `NFLGame`), and the context of the original digest suggestion.
    4.  The AI Copilot provides a concise, preference-driven explanation in response to the query.
    5.  The response is displayed to the user, likely within the AI Copilot Panel or an expanded section of the digest.
    6.  The interaction should feel conversational and provide genuinely helpful additional insight.
    7.  The performance NFR for AI Copilot suggestions (targeting 3-5 seconds) is considered for query responses.

    ***

    **Story 4.3: Implement Proactive Critical Alerts**

* **Story:** As an active user, I want to receive proactive "Critical Alerts" from the AI Copilot for urgent, high-impact events relevant to my team so that I can take timely action.
* **Acceptance Criteria (ACs):**
    1.  The "AI Copilot Service" can identify predefined critical events based on the static PoC dataset (e.g., a key player on the user's roster is newly marked as "Injured_Out" in the `NFLPlayer` data for the current week).
    2.  (PoC Scope) The system implements 1-2 specific, predefined critical alert scenarios using the static data.
    3.  When a critical event is detected for a user's team, a prominent alert is presented to the user (e.g., via the AI Copilot Panel/Overlay, a toast notification).
    4.  The alert clearly communicates the urgent event (e.g., "Player X on your roster is now OUT for this week's game!").
    5.  The alert provides immediate, actionable context or suggestions if applicable (details for injury alerts will be covered in the next story, Story 4.4).
    6.  The user can easily acknowledge or dismiss the alert.
    7.  The "AI Copilot Service" is responsible for triggering and formatting these alerts.
    8.  The alerts are designed to be genuinely critical and not overly frequent, to avoid alert fatigue.

    ***

    **Story 4.4: Bench Player Replacement Suggestions in Injury Alerts**

* **Story:** As a user who receives a critical alert about a player injury on my roster, I want the alert to include immediate, viable replacement suggestions from my current bench (if suitable options exist) so that I can quickly address the lineup gap.
* **Acceptance Criteria (ACs):**
    1.  When a "Critical Alert" is generated due to a player on the user's roster being marked as injured and out (as per Story 4.3 and PRD), the "AI Copilot Service" checks the user's current bench for suitable replacements.
    2.  A suitable replacement is a player on the bench who plays the same position (or a flexible position that could cover) as the injured player and is healthy/active.
    3.  If one or more suitable bench replacements are found, the critical injury alert also lists these players as immediate replacement options.
    4.  For each suggested bench replacement, basic relevant information is shown (e.g., `fullName`, `position`, `projectedPoints` from static `NFLPlayer` data).
    5.  The alert might also still mention considering waiver targets (as per PRD), but the primary focus of this story is the bench suggestion.
    6.  The user can easily see these suggestions within the alert displayed in the AI Copilot Panel or notification.
    7.  The logic for identifying suitable bench replacements is handled by the "AI Copilot Service" using static PoC data.

    ***

    **Story 4.5: Implement "Preference-Driven Explanation Style" for AI Advice**

* **Story:** As a user receiving advice from the AI Copilot, I want the style, depth, and focus of the rationale behind the advice to be dynamically adapted based on my established User Preference Profile so that the explanations are consistently relevant and easy for me to understand.
* **Acceptance Criteria (ACs):**
    1.  The "AI Copilot Service," when generating explanations for its advice (e.g., for draft recommendations Story 3.1, weekly digest Story 4.1, on-demand queries Story 4.2), accesses the user's `UserProfile`.
    2.  The service uses preferences like `selectedArchetype` and `onboardingAnswers.preferredExplanationDepth` (e.g., "simple," "standard," "detailed") from the `UserProfile` to modify the style of the explanation.
    3.  (PoC Scope) The system demonstrates at least two distinct explanation styles based on user preferences. For example:
        * **Style 1 (e.g., for "Eager Learner" with "simple" depth):** Very concise, uses basic terminology, focuses on the primary reason.
        * **Style 2 (e.g., for "Calculated Strategist" with "detailed" depth):** More analytical, may include a key statistic or a slightly deeper strategic point.
    4.  The mechanism for selecting and applying the explanation style is implemented within the "AI Copilot Service."
    5.  The explanations, regardless of style, remain clear and directly link the AI's advice to relevant (simplified for PoC) insights or user preferences.
    6.  This feature is demonstrated in conjunction with at least one AI advice-giving feature (e.g., draft recommendations or weekly digest).

    ***

    
