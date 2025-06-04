## Data Models

### Core Application Entities / Domain Objects

**#### UserProfile**
* **Description:** Represents a Roster Copilot user and stores their preferences for personalizing the AI Copilot experience. Persisted in SQLite for PoC.
* **Schema / Interface Definition (PoC Scope):**
    ```typescript
    interface UserProfile {
      userId: string; 
      username: string;
      email: string; // Added for login and notifications
      passwordHash: string; // For storing hashed password
      emailVerified: boolean; // Added for email verification status
      selectedArchetype: "Eager Learner" | "Calculated Strategist" | "Bold Playmaker" | "Busy Optimizer" | null; // Updated
      onboardingAnswers?: {
        preferredExplanationDepth?: "simple" | "standard" | "detailed";
        riskComfortLevel?: "low" | "medium" | "high";
      };
      riskToleranceNumeric?: number; 
      aiInteractionStyle?: "concise" | "balanced" | "thorough"; 
      favoriteNFLTeam?: string;
      teamsToAvoidPlayersFrom?: string[];
      learnedObservations?: {
        draftTendencies?: string[]; 
        playerStyleAffinity?: string[]; 
      };
      createdAt: string; 
      updatedAt: string; 
    }
    ```

**#### NFLPlayer (Static PoC Data)**
* **Description:** Represents an NFL player with essential information and PoC-specific data (e.g., projected points for a demo week). Pre-loaded into SQLite from static sources.
* **Schema / Interface Definition (PoC Scope):**
    ```typescript
    interface NFLPlayer {
      playerId: string; 
      fullName: string; 
      position: "QB" | "RB" | "WR" | "TE" | "K" | "DEF"; 
      nflTeamAbbreviation: string; 
      status?: "Active" | "Injured_Out" | "Injured_Questionable" | "Bye Week"; 
      projectedPoints?: number; 
      keyAttributes?: {
        consistencyRating?: "High" | "Medium" | "Low";
        upsidePotential?: "High" | "Medium" | "Low";
        role?: string; 
      };
      notes?: string; // Could include injury news, role changes for PoC
    }
    ```

**#### NFLGame (Static PoC Data - Simplified)**
* **Description:** Represents a simplified NFL game for a specific week in our PoC static dataset, for matchup context. Pre-loaded into SQLite.
* **Schema / Interface Definition (PoC Scope):**
    ```typescript
    interface NFLGame {
      gameId: string; 
      weekNumber: number; 
      homeTeamAbbreviation: string; 
      awayTeamAbbreviation: string; 
      gameDateTime_ISO?: string; 
      matchupContextNotes?: string[]; 
      // For PoC, might include home_score, away_score if simulating game outcomes directly
      homeScore?: number;
      awayScore?: number;
      gameStatus?: "Scheduled" | "InProgress" | "Final";
    }
    ```

**#### League_PoC (Proof-of-Concept)**
* **Description:** Represents a fantasy league created within Roster Copilot for the PoC. Stores minimal information for demonstration.
* **Schema / Interface Definition (PoC Scope):**
    ```typescript
    interface League_PoC {
      leagueId: string; 
      leagueName: string; 
      commissionerUserId: string; 
      numberOfTeams: 8 | 10 | 12; 
      scoringType: "Standard" | "PPR"; 
      draftStatus: "Scheduled" | "InProgress" | "Completed";
      currentSeasonWeek: number; 
      participatingTeamIds?: string[]; // Array of FantasyTeam_PoC IDs
      // PoC: Roster settings (e.g., QB:1, RB:2) might be fixed globally or a simple JSON here
      rosterSettings?: { QB: number; RB: number; WR: number; TE: number; K: number; DEF: number; BENCH: number; };
      createdAt: string; 
    }
    ```

**#### FantasyTeam_PoC (Proof-of-Concept)**
* **Description:** Represents a single fantasy team within a `League_PoC`, managed by a user.
* **Schema / Interface Definition (PoC Scope):**
    ```typescript
    interface FantasyTeam_PoC {
      teamId: string; 
      leagueId: string; 
      userId: string; 
      teamName: string; 
      playerIds_onRoster: string[]; // Array of NFLPlayer IDs
      // PoC: Could store weekly lineups here if not a separate model
      // weeklyLineups?: { week: number; starters: string[]; }[]; 
    }
    ```
    
**#### ResetToken_PoC (Proof-of-Concept - for Password Reset)**
* **Description:** Represents a temporary token for password reset. Could be stored in SQLite for PoC.
* **Schema / Interface Definition (PoC Scope):**
    ```typescript
    interface ResetToken_PoC {
      token: string; // The unique token
      userId: string; // User this token belongs to
      expiresAt: string; // ISO timestamp for expiry
      used: boolean; // Whether the token has been used
    }
    ```
    
**#### EmailVerificationToken_PoC (Proof-of-Concept - for Email Verification)**
* **Description:** Represents a temporary token for email verification. Could be stored in SQLite for PoC.
* **Schema / Interface Definition (PoC Scope):**
    ```typescript
    interface EmailVerificationToken_PoC {
      token: string; // The unique token
      userId: string; // User this token belongs to
      email: string; // Email to be verified
      expiresAt: string; // ISO timestamp for expiry
    }
    ```


#### API Payload Schemas (PoC Scope)
* **Description:** For the PoC, API request and response payloads will closely mirror the Core Application Entities to maintain simplicity. Specific Data Transfer Objects (DTOs), defined with TypeScript interfaces, may be used for particular endpoints if needed, derived from these core models. Examples include:
    * `AuthSignupDto`: `{ username, email, password }`
    * `AuthLoginDto`: `{ email, password }`
    * `CreateLeagueDto`: `{ leagueName, numberOfTeams, scoringType }`
    * `UpdateUserProfileDto`: `{ selectedArchetype?, onboardingAnswers?, newPassword?, currentPassword? ... }`

#### Database Schemas (for PoC SQLite)
* **Description:** The PoC SQLite database will contain tables corresponding to `UserProfiles`, `NFLPlayers`, `NFLGames`, `Leagues_PoC`, `FantasyTeams_PoC`, and potentially `ResetTokens_PoC` and `EmailVerificationTokens_PoC`. The Data Access Layer (DAL) will manage schema creation (e.g., via simple `CREATE TABLE` statements) and all SQL interactions.
    * `UserProfiles` table based on `UserProfile` interface.
    * `NFLPlayers` table based on `NFLPlayer` interface. (Consider how `keyAttributes` (object) is stored - JSON string or separate table).
    * `NFLGames` table based on `NFLGame` interface. (Consider how `matchupContextNotes` (array) is stored).
    * `Leagues` table based on `League_PoC` interface. (Consider how `participatingTeamIds` (array) and `rosterSettings` (object) are stored).
    * `FantasyTeams` table based on `FantasyTeam_PoC` interface. (Consider how `playerIds_onRoster` (array) is stored).
    * `ResetTokens` table based on `ResetToken_PoC` interface.
    * `EmailVerificationTokens` table based on `EmailVerificationToken_PoC` interface.

#### Note on Data Model Evolution & Future Integration (PoC)
The data models defined herein are simplified for the PoC. The Data Access Layer utilizes a Provider Model pattern. This is a strategic architectural choice to facilitate future enhancements Post-PoC, such as integration with live NFL data APIs, migration to more robust database systems, and potential integration with external third-party fantasy league platforms. Such integrations would involve developing new data providers responsible for fetching data and mapping it to Roster Copilot's internal domain models, which may also evolve.