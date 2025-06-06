import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Define paths
const projectRootDir = path.resolve(__dirname, '../../'); // Adjust as needed if script moves
const dbPath = path.join(projectRootDir, 'data', 'roster_copilot_poc.db');
const playersDataPath = path.join(projectRootDir, 'data', 'static-nfl-data', 'nfl-players.json');
const gamesDataPath = path.join(projectRootDir, 'data', 'static-nfl-data', 'nfl-games.json');

// Data interfaces (matching docs/data-models.md)
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
  notes?: string;
}

interface NFLGame {
  gameId: string;
  weekNumber: number;
  homeTeamAbbreviation: string;
  awayTeamAbbreviation: string;
  gameDateTime_ISO?: string;
  matchupContextNotes?: string[];
  homeScore?: number;
  awayScore?: number;
  gameStatus?: "Scheduled" | "InProgress" | "Final";
}

// SQL Table Definitions
const createPlayersTableSQL = `
CREATE TABLE IF NOT EXISTS NFLPlayers (
    playerId TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    position TEXT NOT NULL,
    nflTeamAbbreviation TEXT NOT NULL,
    status TEXT,
    projectedPoints REAL,
    keyAttributes TEXT,
    notes TEXT
);`;

const createGamesTableSQL = `
CREATE TABLE IF NOT EXISTS NFLGames (
    gameId TEXT PRIMARY KEY,
    weekNumber INTEGER NOT NULL,
    homeTeamAbbreviation TEXT NOT NULL,
    awayTeamAbbreviation TEXT NOT NULL,
    gameDateTime_ISO TEXT,
    matchupContextNotes TEXT,
    homeScore INTEGER,
    awayScore INTEGER,
    gameStatus TEXT
);`;

// SQL for UserProfiles table (matching the schema from lib/dal/db.ts)
const createUserProfilesTableSQL = `
CREATE TABLE IF NOT EXISTS UserProfiles (
  userId TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  emailVerified BOOLEAN NOT NULL DEFAULT 0,
  selectedArchetype TEXT,
  onboardingAnswers TEXT,
  riskToleranceNumeric REAL,
  aiInteractionStyle TEXT,
  favoriteNFLTeam TEXT,
  teamsToAvoidPlayersFrom TEXT,
  learnedObservations TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);`;

async function seedDatabase() {
  console.log('Starting database seeding process...');

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Created data directory: ${dataDir}`);
  }

  return new Promise<void>((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log(`Connected to SQLite database: ${dbPath}`);
    });

    db.serialize(async () => {
    // Create tables
    db.run(createUserProfilesTableSQL, (err) => {
      if (err) {
        console.error('Error creating UserProfiles table:', err.message);
        return;
      }
      console.log('UserProfiles table created or already exists.');
    });

    db.run(createPlayersTableSQL, (err) => {
      if (err) {
        console.error('Error creating NFLPlayers table:', err.message);
        return;
      }
      console.log('NFLPlayers table created or already exists.');
    });

    db.run(createGamesTableSQL, (err) => {
      if (err) {
        console.error('Error creating NFLGames table:', err.message);
        return;
      }
      console.log('NFLGames table created or already exists.');
    });

    // Clear existing data for idempotency
    db.run('DELETE FROM UserProfiles;', (err) => {
        if (err) console.error('Error clearing UserProfiles table:', err.message);
        else console.log('Cleared existing data from UserProfiles table.');
    });
    db.run('DELETE FROM NFLPlayers;', (err) => {
        if (err) console.error('Error clearing NFLPlayers table:', err.message);
        else console.log('Cleared existing data from NFLPlayers table.');
    });
    db.run('DELETE FROM NFLGames;', (err) => {
        if (err) console.error('Error clearing NFLGames table:', err.message);
        else console.log('Cleared existing data from NFLGames table.');
    });

    // Seed default user (Kevin)
    try {
      const userId = uuidv4();
      const username = 'Kevin';
      const email = 'kevlingo@gmail.com';
      const password = '7fej3w_ixVjRaKW';
      const saltRounds = 10; // Same as used in signup
      const passwordHash = await bcrypt.hash(password, saltRounds);
      const now = new Date().toISOString();

      const userInsertStmt = db.prepare(
        `INSERT INTO UserProfiles (
          userId, username, email, passwordHash, emailVerified,
          selectedArchetype, onboardingAnswers, riskToleranceNumeric,
          aiInteractionStyle, favoriteNFLTeam, teamsToAvoidPlayersFrom,
          learnedObservations, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      userInsertStmt.run(
        userId,
        username,
        email,
        passwordHash,
        1, // emailVerified = true (1)
        null, // selectedArchetype
        null, // onboardingAnswers
        null, // riskToleranceNumeric
        null, // aiInteractionStyle
        null, // favoriteNFLTeam
        null, // teamsToAvoidPlayersFrom
        null, // learnedObservations
        now,  // createdAt
        now,  // updatedAt
        (err: Error | null) => {
          if (err) {
            console.error('Error inserting default user:', err.message);
          } else {
            console.log(`✅ Default user '${username}' (${email}) created successfully - already verified!`);
          }
        }
      );

      userInsertStmt.finalize((err) => {
        if (err) {
          console.error('Error finalizing user insert statement:', err.message);
        } else {
          console.log('Finished seeding default user.');
        }
      });
    } catch (error: any) {
      console.error('Error creating default user:', error.message);
    }

    // Seed NFLPlayers
    try {
      const playersRawData = fs.readFileSync(playersDataPath, 'utf-8');
      const players: NFLPlayer[] = JSON.parse(playersRawData);
      console.log(`Read ${players.length} players from ${playersDataPath}`);

      const playerInsertStmt = db.prepare(
        'INSERT INTO NFLPlayers (playerId, fullName, position, nflTeamAbbreviation, status, projectedPoints, keyAttributes, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );

      players.forEach((player) => {
        playerInsertStmt.run(
          player.playerId,
          player.fullName,
          player.position,
          player.nflTeamAbbreviation,
          player.status,
          player.projectedPoints,
          player.keyAttributes ? JSON.stringify(player.keyAttributes) : null,
          player.notes,
          (err: Error | null) => {
            if (err) {
                console.error(`Error inserting player ${player.playerId}:`, err.message);
            }
          }
        );
      });
      playerInsertStmt.finalize((err) => {
        if (err) {
            console.error('Error finalizing player insert statement:', err.message);
        } else {
            console.log('Finished seeding NFLPlayers table.');
        }
      });
    } catch (error: any) {
      console.error('Error processing nfl-players.json:', error.message);
    }

    // Seed NFLGames
    try {
      const gamesRawData = fs.readFileSync(gamesDataPath, 'utf-8');
      const games: NFLGame[] = JSON.parse(gamesRawData);
      console.log(`Read ${games.length} games from ${gamesDataPath}`);

      const gameInsertStmt = db.prepare(
        'INSERT INTO NFLGames (gameId, weekNumber, homeTeamAbbreviation, awayTeamAbbreviation, gameDateTime_ISO, matchupContextNotes, homeScore, awayScore, gameStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );

      games.forEach((game) => {
        gameInsertStmt.run(
          game.gameId,
          game.weekNumber,
          game.homeTeamAbbreviation,
          game.awayTeamAbbreviation,
          game.gameDateTime_ISO,
          game.matchupContextNotes ? JSON.stringify(game.matchupContextNotes) : null,
          game.homeScore,
          game.awayScore,
          game.gameStatus,
          (err: Error | null) => {
            if (err) {
                console.error(`Error inserting game ${game.gameId}:`, err.message);
            }
          }
        );
      });
      gameInsertStmt.finalize((err) => {
        if (err) {
            console.error('Error finalizing game insert statement:', err.message);
        } else {
            console.log('Finished seeding NFLGames table.');
        }
      });
    } catch (error: any) {
      console.error('Error processing nfl-games.json:', error.message);
    }

      // Close database connection
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
          reject(err);
        } else {
          console.log('Database connection closed. Seeding process completed.');
          resolve();
        }
      });
    });
  });
}

seedDatabase().catch((error) => {
  console.error('Unhandled error in seedDatabase:', error.message);
});