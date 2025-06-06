/**
 * Tests for Weekly Lineup Data Access Layer
 */

import { initializeDatabase, closeDb } from './db';
import { createUserProfile } from './user.dal';
import { createLeague, createFantasyTeam, saveWeeklyLineup, getWeeklyLineup, getWeeklyLineupsByTeam } from './league.dal';

// Mock console methods to reduce test noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

beforeEach(async () => {
  await initializeDatabase();
});

afterEach(async () => {
  await closeDb();
});

describe('Weekly Lineup DAL Functions', () => {
  let userId: string;
  let leagueId: string;
  let teamId: string;

  beforeEach(async () => {
    // Create test user with unique email
    const uniqueEmail = `test-${Date.now()}-${Math.random()}@example.com`;
    const user = await createUserProfile({
      username: `testuser-${Date.now()}`,
      email: uniqueEmail,
      passwordHash: 'hashedpassword'
    });
    userId = user.userId;

    // Create test league
    const league = await createLeague('Test League', userId, 10, 'PPR');
    leagueId = league.leagueId;

    // Create test team
    const team = await createFantasyTeam(leagueId, userId, 'Test Team');
    teamId = team.teamId;
  });

  describe('saveWeeklyLineup', () => {
    it('should create new weekly lineup', async () => {
      const starterPlayerIds = ['p1', 'p2', 'p3'];
      const benchPlayerIds = ['p4', 'p5', 'p6'];
      const weekNumber = 1;

      const lineup = await saveWeeklyLineup(
        teamId,
        leagueId,
        weekNumber,
        starterPlayerIds,
        benchPlayerIds
      );

      expect(lineup.lineupId).toBeDefined();
      expect(lineup.teamId).toBe(teamId);
      expect(lineup.leagueId).toBe(leagueId);
      expect(lineup.weekNumber).toBe(weekNumber);
      expect(lineup.starterPlayerIds).toEqual(starterPlayerIds);
      expect(lineup.benchPlayerIds).toEqual(benchPlayerIds);
      expect(lineup.createdAt).toBeDefined();
      expect(lineup.updatedAt).toBeDefined();
    });

    it('should update existing weekly lineup', async () => {
      const weekNumber = 1;
      const initialStarters = ['p1', 'p2'];
      const initialBench = ['p3', 'p4'];

      // Create initial lineup
      const initialLineup = await saveWeeklyLineup(
        teamId,
        leagueId,
        weekNumber,
        initialStarters,
        initialBench
      );

      // Update lineup
      const updatedStarters = ['p1', 'p3'];
      const updatedBench = ['p2', 'p4'];

      const updatedLineup = await saveWeeklyLineup(
        teamId,
        leagueId,
        weekNumber,
        updatedStarters,
        updatedBench
      );

      expect(updatedLineup.lineupId).toBe(initialLineup.lineupId);
      expect(updatedLineup.starterPlayerIds).toEqual(updatedStarters);
      expect(updatedLineup.benchPlayerIds).toEqual(updatedBench);
      expect(updatedLineup.updatedAt).not.toBe(initialLineup.updatedAt);
    });

    it('should allow different lineups for different weeks', async () => {
      const starterPlayerIds = ['p1', 'p2'];
      const benchPlayerIds = ['p3', 'p4'];

      const week1Lineup = await saveWeeklyLineup(
        teamId,
        leagueId,
        1,
        starterPlayerIds,
        benchPlayerIds
      );

      const week2Lineup = await saveWeeklyLineup(
        teamId,
        leagueId,
        2,
        starterPlayerIds,
        benchPlayerIds
      );

      expect(week1Lineup.lineupId).not.toBe(week2Lineup.lineupId);
      expect(week1Lineup.weekNumber).toBe(1);
      expect(week2Lineup.weekNumber).toBe(2);
    });
  });

  describe('getWeeklyLineup', () => {
    it('should retrieve existing lineup', async () => {
      const starterPlayerIds = ['p1', 'p2', 'p3'];
      const benchPlayerIds = ['p4', 'p5', 'p6'];
      const weekNumber = 1;

      const savedLineup = await saveWeeklyLineup(
        teamId,
        leagueId,
        weekNumber,
        starterPlayerIds,
        benchPlayerIds
      );

      const retrievedLineup = await getWeeklyLineup(teamId, weekNumber);

      expect(retrievedLineup).toBeDefined();
      expect(retrievedLineup!.lineupId).toBe(savedLineup.lineupId);
      expect(retrievedLineup!.starterPlayerIds).toEqual(starterPlayerIds);
      expect(retrievedLineup!.benchPlayerIds).toEqual(benchPlayerIds);
    });

    it('should return undefined for non-existent lineup', async () => {
      const lineup = await getWeeklyLineup(teamId, 1);
      expect(lineup).toBeUndefined();
    });

    it('should return undefined for non-existent team', async () => {
      const lineup = await getWeeklyLineup('non-existent-team', 1);
      expect(lineup).toBeUndefined();
    });
  });

  describe('getWeeklyLineupsByTeam', () => {
    it('should retrieve all lineups for a team', async () => {
      const starterPlayerIds = ['p1', 'p2'];
      const benchPlayerIds = ['p3', 'p4'];

      // Create lineups for multiple weeks
      await saveWeeklyLineup(teamId, leagueId, 1, starterPlayerIds, benchPlayerIds);
      await saveWeeklyLineup(teamId, leagueId, 2, starterPlayerIds, benchPlayerIds);
      await saveWeeklyLineup(teamId, leagueId, 3, starterPlayerIds, benchPlayerIds);

      const lineups = await getWeeklyLineupsByTeam(teamId);

      expect(lineups).toHaveLength(3);
      expect(lineups[0].weekNumber).toBe(1);
      expect(lineups[1].weekNumber).toBe(2);
      expect(lineups[2].weekNumber).toBe(3);
    });

    it('should return empty array for team with no lineups', async () => {
      const lineups = await getWeeklyLineupsByTeam(teamId);
      expect(lineups).toHaveLength(0);
    });

    it('should return empty array for non-existent team', async () => {
      const lineups = await getWeeklyLineupsByTeam('non-existent-team');
      expect(lineups).toHaveLength(0);
    });

    it('should return lineups ordered by week number', async () => {
      const starterPlayerIds = ['p1', 'p2'];
      const benchPlayerIds = ['p3', 'p4'];

      // Create lineups out of order
      await saveWeeklyLineup(teamId, leagueId, 3, starterPlayerIds, benchPlayerIds);
      await saveWeeklyLineup(teamId, leagueId, 1, starterPlayerIds, benchPlayerIds);
      await saveWeeklyLineup(teamId, leagueId, 2, starterPlayerIds, benchPlayerIds);

      const lineups = await getWeeklyLineupsByTeam(teamId);

      expect(lineups).toHaveLength(3);
      expect(lineups[0].weekNumber).toBe(1);
      expect(lineups[1].weekNumber).toBe(2);
      expect(lineups[2].weekNumber).toBe(3);
    });
  });

  describe('Database constraints', () => {
    it('should enforce unique constraint on teamId and weekNumber', async () => {
      const starterPlayerIds = ['p1', 'p2'];
      const benchPlayerIds = ['p3', 'p4'];
      const weekNumber = 1;

      // First save should succeed
      await saveWeeklyLineup(teamId, leagueId, weekNumber, starterPlayerIds, benchPlayerIds);

      // Second save with same team and week should update, not create duplicate
      await saveWeeklyLineup(
        teamId,
        leagueId,
        weekNumber,
        ['p5', 'p6'],
        ['p7', 'p8']
      );

      const allLineups = await getWeeklyLineupsByTeam(teamId);
      expect(allLineups).toHaveLength(1);
      expect(allLineups[0].starterPlayerIds).toEqual(['p5', 'p6']);
    });
  });
});
