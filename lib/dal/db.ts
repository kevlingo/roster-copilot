import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs'; // Changed from require to import

// Default path to the SQLite database file
const DEFAULT_DB_PATH = path.resolve(process.cwd(), 'data', 'roster_copilot_poc.db');

let db: sqlite3.Database | null = null;

export function connectDb(dbPath: string = DEFAULT_DB_PATH): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    if (db) { // If db object exists, assume it's open or will be handled by its state
      // console.log('[SQLite] Using existing open connection.');
      resolve(db);
      return;
    }
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    fs.mkdirSync(dir, { recursive: true }); // Changed from require to fs


    db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('[SQLite Connection Error]', err.message, 'Path:', dbPath);
        db = null; // Reset on error
        reject(err);
      } else {
        console.log(`[SQLite] Connected to database at ${dbPath}.`);
        db!.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
          if (pragmaErr) {
            console.error('[SQLite PRAGMA Error]', pragmaErr.message);
            // Optionally close DB and reject if pragma fails
            db!.close((closeErr) => {
              if (closeErr) console.error('[SQLite] Error closing DB after PRAGMA failure:', closeErr.message);
              db = null;
              reject(pragmaErr);
            });
          } else {
            console.log('[SQLite] Foreign key support enabled.');
            resolve(db!);
          }
        });
      }
    });
  });
}

export function closeDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('[SQLite Close Error]', err.message);
          reject(err);
        } else {
          console.log('[SQLite] Database connection closed.');
          db = null;
          resolve();
        }
      });
    } else {
      resolve(); // No connection to close
    }
  });
}

// Force close and reset connection (useful for tests)
export function forceCloseDb(): void {
  if (db) {
    try {
      db.close();
    } catch (error) {
      console.warn('[SQLite] Force close warning:', error);
    }
    db = null;
  }
}

function ensureDbConnected(): sqlite3.Database {
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
 * @returns A promise that resolves with an array of rows or rejects with an error.
 */
export function all<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const currentDb = ensureDbConnected();
  return new Promise((resolve, reject) => {
    currentDb.all(sql, params, (err, rows: T[]) => {
      if (err) {
        console.error('[SQLite DAL Error - all]', { sql, params, error: err.message });
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Executes a SQL query that is expected to return a single row.
 * @param sql The SQL query string.
 * @param params Parameters for the SQL query.
 * @returns A promise that resolves with a single row or undefined, or rejects with an error.
 */
export function get<T = unknown>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  const currentDb = ensureDbConnected();
  return new Promise((resolve, reject) => {
    currentDb.get(sql, params, (err, row: T | undefined) => {
      if (err) {
        console.error('[SQLite DAL Error - get]', { sql, params, error: err.message });
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Executes a SQL query that does not return rows (e.g., INSERT, UPDATE, DELETE).
 * @param sql The SQL query string.
 * @param params Parameters for the SQL query.
 * @returns A promise that resolves with an object containing lastID and changes, or rejects with an error.
 */
export function run(sql: string, params: unknown[] = []): Promise<{ lastID: number; changes: number }> {
  const currentDb = ensureDbConnected();
  return new Promise((resolve, reject) => {
    // `this` context within the callback refers to the statement object
    // eslint-disable-next-line func-names
    currentDb.run(sql, params, function (this: sqlite3.RunResult, err: Error | null) {
      if (err) {
        console.error('[SQLite DAL Error - run]', { sql, params, error: err.message });
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// You might want to export the raw `db` instance for more complex scenarios or transactions,
// but using wrapper functions like `all`, `get`, `run` promotes consistency and error handling.
// export { db };

/**
 * Initializes the database schema if tables do not exist.
 * This should be called once at application startup.
 */
export async function initializeDatabase(dbPath?: string): Promise<void> {
  // Ensure connection is established, potentially with a specific path for testing
  await connectDb(dbPath); // if dbPath is undefined, uses DEFAULT_DB_PATH
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

  const createChatHistoryTable = `
    CREATE TABLE IF NOT EXISTS ChatHistory (
      messageId TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      content TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      messageType TEXT DEFAULT 'conversation' CHECK (messageType IN ('conversation', 'notification', 'markdown', 'component')),
      componentType TEXT,
      componentProps TEXT, -- JSON string
      conversationContext TEXT, -- JSON string for onboarding/general context
      timestamp TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES UserProfiles(userId) ON DELETE CASCADE
    );
  `;

  const createConversationSessionsTable = `
    CREATE TABLE IF NOT EXISTS ConversationSessions (
      sessionId TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      conversationType TEXT NOT NULL DEFAULT 'general' CHECK (conversationType IN ('onboarding', 'general', 'digest')),
      startTime TEXT NOT NULL,
      lastActivity TEXT NOT NULL,
      messageCount INTEGER NOT NULL DEFAULT 0,
      isActive BOOLEAN NOT NULL DEFAULT 1,
      deviceInfo TEXT, -- JSON string for device tracking
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES UserProfiles(userId) ON DELETE CASCADE
    );
  `;

  try {
    await run(createUserProfilesTable);
    console.log('[SQLite] UserProfiles table checked/created.');
    await run(createEmailVerificationTokensTable);
    console.log('[SQLite] EmailVerificationTokens_PoC table checked/created.');
    await run(createResetTokensTable);
    console.log('[SQLite] ResetTokens_PoC table checked/created.');
    await run(createLeaguesTable);
    console.log('[SQLite] Leagues_PoC table checked/created.');
    await run(createFantasyTeamsTable);
    console.log('[SQLite] FantasyTeams_PoC table checked/created.');
    await run(createWeeklyLineupsTable);
    console.log('[SQLite] WeeklyLineups_PoC table checked/created.');
    await run(createDraftPicksTable);
    console.log('[SQLite] DraftPicks table checked/created.');
    await run(createDraftStatesTable);
    console.log('[SQLite] DraftStates table checked/created.');
    await run(createChatHistoryTable);
    console.log('[SQLite] ChatHistory table checked/created.');
    await run(createConversationSessionsTable);
    console.log('[SQLite] ConversationSessions table checked/created.');
  } catch (error) {
    console.error('[SQLite Schema Initialization Error]', error);
    // Potentially throw error to halt app startup if schema is critical
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