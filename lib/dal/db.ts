import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Default path to the SQLite database file
const DEFAULT_DB_PATH = path.resolve(process.cwd(), 'data', 'roster_copilot_poc.db');

let db: Database.Database | null = null;

export function connectDb(dbPath: string = DEFAULT_DB_PATH): Database.Database {
  if (db) {
    // console.log('[SQLite] Using existing open connection.');
    return db;
  }

  // Ensure directory exists
  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });

  try {
    db = new Database(dbPath);
    console.log(`[SQLite] Connected to database at ${dbPath}.`);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    console.log('[SQLite] Foreign key support enabled.');

    return db;
  } catch (err) {
    console.error('[SQLite Connection Error]', err instanceof Error ? err.message : err, 'Path:', dbPath);
    db = null;
    throw err;
  }
}

export function closeDb(): void {
  if (db) {
    try {
      db.close();
      console.log('[SQLite] Database connection closed.');
      db = null;
    } catch (err) {
      console.error('[SQLite Close Error]', err instanceof Error ? err.message : err);
      throw err;
    }
  }
}

function ensureDbConnected(): Database.Database {
  if (!db) {
    // This case should ideally be handled by explicit connection management (e.g., connectDb call at app start)
    // For robustness in tests or unexpected scenarios, we could try to auto-connect here,
    // but it's better to enforce explicit connection.
    // For now, we'll throw if not connected, assuming connectDb was called.
    throw new Error('[SQLite] Database not connected. Call connectDb() first.');
  }
  return db;
}


/**
 * Executes a SQL query that is expected to return multiple rows.
 * @param sql The SQL query string.
 * @param params Parameters for the SQL query.
 * @returns An array of rows.
 */
export function all<T = unknown>(sql: string, params: unknown[] = []): T[] {
  const currentDb = ensureDbConnected();
  try {
    const stmt = currentDb.prepare(sql);
    const rows = stmt.all(params) as T[];
    return rows;
  } catch (err) {
    console.error('[SQLite DAL Error - all]', { sql, params, error: err instanceof Error ? err.message : err });
    throw err;
  }
}

/**
 * Executes a SQL query that is expected to return a single row.
 * @param sql The SQL query string.
 * @param params Parameters for the SQL query.
 * @returns A single row or undefined.
 */
export function get<T = unknown>(sql: string, params: unknown[] = []): T | undefined {
  const currentDb = ensureDbConnected();
  try {
    const stmt = currentDb.prepare(sql);
    const row = stmt.get(params) as T | undefined;
    return row;
  } catch (err) {
    console.error('[SQLite DAL Error - get]', { sql, params, error: err instanceof Error ? err.message : err });
    throw err;
  }
}

/**
 * Executes a SQL query that does not return rows (e.g., INSERT, UPDATE, DELETE).
 * @param sql The SQL query string.
 * @param params Parameters for the SQL query.
 * @returns An object containing lastInsertRowid and changes.
 */
export function run(sql: string, params: unknown[] = []): { lastID: number; changes: number } {
  const currentDb = ensureDbConnected();
  try {
    const stmt = currentDb.prepare(sql);
    const result = stmt.run(params);
    return {
      lastID: Number(result.lastInsertRowid),
      changes: result.changes
    };
  } catch (err) {
    console.error('[SQLite DAL Error - run]', { sql, params, error: err instanceof Error ? err.message : err });
    throw err;
  }
}

// You might want to export the raw `db` instance for more complex scenarios or transactions,
// but using wrapper functions like `all`, `get`, `run` promotes consistency and error handling.
// export { db };

/**
 * Initializes the database schema if tables do not exist.
 * This should be called once at application startup.
 */
export function initializeDatabase(dbPath?: string): void {
  // Ensure connection is established, potentially with a specific path for testing
  connectDb(dbPath); // if dbPath is undefined, uses DEFAULT_DB_PATH
  console.log('[SQLite] Initializing database schema...');

  const createUserProfilesTable = `
    CREATE TABLE IF NOT EXISTS UserProfiles (
      userId TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      emailVerified BOOLEAN NOT NULL DEFAULT 0,
      selectedArchetype TEXT,
      onboardingAnswers TEXT, -- JSON string
      riskToleranceNumeric REAL,
      aiInteractionStyle TEXT,
      favoriteNFLTeam TEXT,
      teamsToAvoidPlayersFrom TEXT, -- JSON string
      learnedObservations TEXT, -- JSON string
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `;

  const createEmailVerificationTokensTable = `
    CREATE TABLE IF NOT EXISTS EmailVerificationTokens_PoC (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      email TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL, -- Added createdAt column
      used BOOLEAN NOT NULL DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES UserProfiles(userId) ON DELETE CASCADE
    );
  `;

  const createResetTokensTable = `
    CREATE TABLE IF NOT EXISTS ResetTokens_PoC (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      used BOOLEAN NOT NULL DEFAULT 0,
      FOREIGN KEY (userId) REFERENCES UserProfiles(userId) ON DELETE CASCADE
    );
  `;

  const createLeaguesTable = `
    CREATE TABLE IF NOT EXISTS Leagues_PoC (
      leagueId TEXT PRIMARY KEY,
      leagueName TEXT NOT NULL,
      commissionerUserId TEXT NOT NULL,
      numberOfTeams INTEGER NOT NULL CHECK (numberOfTeams IN (8, 10, 12)),
      scoringType TEXT NOT NULL CHECK (scoringType IN ('Standard', 'PPR')),
      draftStatus TEXT NOT NULL DEFAULT 'Scheduled' CHECK (draftStatus IN ('Scheduled', 'InProgress', 'Completed')),
      currentSeasonWeek INTEGER NOT NULL DEFAULT 1,
      participatingTeamIds TEXT, -- JSON string array
      rosterSettings TEXT, -- JSON string object
      createdAt TEXT NOT NULL,
      FOREIGN KEY (commissionerUserId) REFERENCES UserProfiles(userId) ON DELETE CASCADE
    );
  `;

  const createFantasyTeamsTable = `
    CREATE TABLE IF NOT EXISTS FantasyTeams_PoC (
      teamId TEXT PRIMARY KEY,
      leagueId TEXT NOT NULL,
      userId TEXT NOT NULL,
      teamName TEXT NOT NULL,
      playerIds_onRoster TEXT, -- JSON string array
      createdAt TEXT NOT NULL,
      FOREIGN KEY (leagueId) REFERENCES Leagues_PoC(leagueId) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES UserProfiles(userId) ON DELETE CASCADE
    );
  `;

  const createWeeklyLineupsTable = `
    CREATE TABLE IF NOT EXISTS WeeklyLineups_PoC (
      lineupId TEXT PRIMARY KEY,
      teamId TEXT NOT NULL,
      leagueId TEXT NOT NULL,
      weekNumber INTEGER NOT NULL,
      starterPlayerIds TEXT, -- JSON string array
      benchPlayerIds TEXT, -- JSON string array
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (teamId) REFERENCES FantasyTeams_PoC(teamId) ON DELETE CASCADE,
      FOREIGN KEY (leagueId) REFERENCES Leagues_PoC(leagueId) ON DELETE CASCADE,
      UNIQUE(teamId, weekNumber) -- One lineup per team per week
    );
  `;

  const createDraftPicksTable = `
    CREATE TABLE IF NOT EXISTS DraftPicks (
      pickId TEXT PRIMARY KEY,
      leagueId TEXT NOT NULL,
      pickNumber INTEGER NOT NULL,
      round INTEGER NOT NULL,
      teamId TEXT NOT NULL,
      playerId TEXT,
      pickTimestamp TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (leagueId) REFERENCES Leagues_PoC(leagueId) ON DELETE CASCADE,
      FOREIGN KEY (teamId) REFERENCES FantasyTeams_PoC(teamId) ON DELETE CASCADE,
      UNIQUE(leagueId, pickNumber)
    );
  `;

  const createDraftStatesTable = `
    CREATE TABLE IF NOT EXISTS DraftStates (
      leagueId TEXT PRIMARY KEY,
      draftOrder TEXT NOT NULL, -- JSON string array of teamIds
      currentPickNumber INTEGER NOT NULL,
      currentRound INTEGER NOT NULL,
      currentTeamId TEXT NOT NULL,
      isComplete BOOLEAN NOT NULL DEFAULT 0,
      draftStartedAt TEXT,
      draftCompletedAt TEXT,
      totalPicks INTEGER NOT NULL,
      totalRounds INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (leagueId) REFERENCES Leagues_PoC(leagueId) ON DELETE CASCADE,
      FOREIGN KEY (currentTeamId) REFERENCES FantasyTeams_PoC(teamId) ON DELETE CASCADE
    );
  `;

  try {
    run(createUserProfilesTable);
    console.log('[SQLite] UserProfiles table checked/created.');
    run(createEmailVerificationTokensTable);
    console.log('[SQLite] EmailVerificationTokens_PoC table checked/created.');
    run(createResetTokensTable);
    console.log('[SQLite] ResetTokens_PoC table checked/created.');
    run(createLeaguesTable);
    console.log('[SQLite] Leagues_PoC table checked/created.');
    run(createFantasyTeamsTable);
    console.log('[SQLite] FantasyTeams_PoC table checked/created.');
    run(createWeeklyLineupsTable);
    console.log('[SQLite] WeeklyLineups_PoC table checked/created.');
    run(createDraftPicksTable);
    console.log('[SQLite] DraftPicks table checked/created.');
    run(createDraftStatesTable);
    console.log('[SQLite] DraftStates table checked/created.');
  } catch (error) {
    console.error('[SQLite Schema Initialization Error]', error);
    // Potentially throw error to halt app startup if schema is critical
    throw error;
  }
}

// Example of how to handle DB closing (though for serverless, connection might be managed per invocation or kept open)
// process.on('SIGINT', () => {
//   db.close((err) => {
//     if (err) {
//       return console.error(err.message);
//     }
//     console.log('Closed the database connection.');
//     process.exit(0);
//   });
// });