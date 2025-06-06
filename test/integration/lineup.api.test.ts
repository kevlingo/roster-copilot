/**
 * Integration tests for Weekly Lineup API functionality
 */

import { initializeDatabase, closeDb } from '@/lib/dal/db';
import { createUserProfile } from '@/lib/dal/user.dal';
import { createLeague, createFantasyTeam, saveWeeklyLineup, getWeeklyLineup, getWeeklyLineupsByTeam } from '@/lib/dal/league.dal';

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

describe('Weekly Lineup API Integration', () => {
  let userId: string;
  let leagueId: string;
  let teamId: string;

  beforeEach(async () => {
    // Create test user with unique email and username
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const uniqueEmail = `test-${timestamp}-${randomId}@example.com`;
    const uniqueUsername = `testuser-${timestamp}-${randomId}`;
    const user = await createUserProfile({
      username: uniqueUsername,
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

  describe('Weekly Lineup Data Flow', () => {
    it('should create, retrieve, and update weekly lineups', async () => {
      const weekNumber = 1;
      // Use mock player IDs for testing
      const starterPlayerIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];
      const benchPlayerIds = ['p8', 'p9', 'p10'];

      // Create initial lineup
      const createdLineup = await saveWeeklyLineup(
        teamId,
        leagueId,
        weekNumber,
        starterPlayerIds,
        benchPlayerIds
      );

      expect(createdLineup.lineupId).toBeDefined();
      expect(createdLineup.teamId).toBe(teamId);
      expect(createdLineup.leagueId).toBe(leagueId);
      expect(createdLineup.weekNumber).toBe(weekNumber);
      expect(createdLineup.starterPlayerIds).toEqual(starterPlayerIds);
      expect(createdLineup.benchPlayerIds).toEqual(benchPlayerIds);

      // Retrieve the lineup
      const retrievedLineup = await getWeeklyLineup(teamId, weekNumber);
      expect(retrievedLineup).toBeDefined();
      expect(retrievedLineup!.lineupId).toBe(createdLineup.lineupId);
      expect(retrievedLineup!.starterPlayerIds).toEqual(starterPlayerIds);
      expect(retrievedLineup!.benchPlayerIds).toEqual(benchPlayerIds);

      // Update the lineup (swap a starter and bench player)
      const updatedStarters = [...starterPlayerIds];
      const updatedBench = [...benchPlayerIds];
      
      // Move first bench player to starters, move last starter to bench
      const benchToStarter = updatedBench.shift()!;
      const starterToBench = updatedStarters.pop()!;
      updatedStarters.push(benchToStarter);
      updatedBench.push(starterToBench);

      const updatedLineup = await saveWeeklyLineup(
        teamId,
        leagueId,
        weekNumber,
        updatedStarters,
        updatedBench
      );

      expect(updatedLineup.lineupId).toBe(createdLineup.lineupId); // Same lineup ID
      expect(updatedLineup.starterPlayerIds).toEqual(updatedStarters);
      expect(updatedLineup.benchPlayerIds).toEqual(updatedBench);
      expect(updatedLineup.updatedAt).not.toBe(createdLineup.updatedAt);
    });

    it('should handle multiple weeks independently', async () => {
      const starterPlayerIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];
      const benchPlayerIds = ['p8', 'p9', 'p10'];

      // Create lineups for weeks 1 and 2
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
        ['p8', 'p9', 'p10', 'p1', 'p2', 'p3', 'p4'], // Different lineup for week 2
        ['p5', 'p6', 'p7']
      );

      expect(week1Lineup.lineupId).not.toBe(week2Lineup.lineupId);
      expect(week1Lineup.weekNumber).toBe(1);
      expect(week2Lineup.weekNumber).toBe(2);

      // Verify both lineups can be retrieved independently
      const retrievedWeek1 = await getWeeklyLineup(teamId, 1);
      const retrievedWeek2 = await getWeeklyLineup(teamId, 2);

      expect(retrievedWeek1!.starterPlayerIds).toEqual(starterPlayerIds);
      expect(retrievedWeek2!.starterPlayerIds).toEqual(['p8', 'p9', 'p10', 'p1', 'p2', 'p3', 'p4']);
    });

    it('should maintain data integrity with roster constraints', async () => {
      const weekNumber = 1;

      // Test with valid lineup
      const validStarters = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];
      const validBench = ['p8', 'p9', 'p10'];

      const validLineup = await saveWeeklyLineup(
        teamId,
        leagueId,
        weekNumber,
        validStarters,
        validBench
      );

      expect(validLineup.starterPlayerIds).toHaveLength(7);
      expect(validLineup.benchPlayerIds).toHaveLength(3);
      
      // Verify all players are accounted for
      const allLineupPlayers = [...validLineup.starterPlayerIds, ...validLineup.benchPlayerIds];
      const expectedPlayers = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'];
      expect(allLineupPlayers.sort()).toEqual(expectedPlayers.sort());
    });

    it('should handle empty lineups gracefully', async () => {
      const weekNumber = 1;
      const allPlayers = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'];

      // Create lineup with all players on bench
      const emptyStartersLineup = await saveWeeklyLineup(
        teamId,
        leagueId,
        weekNumber,
        [], // No starters
        allPlayers // All on bench
      );

      expect(emptyStartersLineup.starterPlayerIds).toHaveLength(0);
      expect(emptyStartersLineup.benchPlayerIds).toHaveLength(allPlayers.length);

      // Retrieve and verify
      const retrieved = await getWeeklyLineup(teamId, weekNumber);
      expect(retrieved!.starterPlayerIds).toHaveLength(0);
      expect(retrieved!.benchPlayerIds).toHaveLength(allPlayers.length);
    });
  });

  describe('Database Constraints and Edge Cases', () => {
    it('should handle non-existent team gracefully', async () => {
      const nonExistentTeamId = 'non-existent-team-id';
      const lineup = await getWeeklyLineup(nonExistentTeamId, 1);
      expect(lineup).toBeUndefined();
    });

    it('should handle non-existent week gracefully', async () => {
      const lineup = await getWeeklyLineup(teamId, 999);
      expect(lineup).toBeUndefined();
    });

    it('should maintain unique constraint on team and week', async () => {
      const weekNumber = 1;
      const starterPlayerIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];
      const benchPlayerIds = ['p8', 'p9', 'p10'];

      // Create initial lineup
      const firstSave = await saveWeeklyLineup(
        teamId,
        leagueId,
        weekNumber,
        starterPlayerIds,
        benchPlayerIds
      );

      // Second save should update, not create duplicate
      const secondSave = await saveWeeklyLineup(
        teamId,
        leagueId,
        weekNumber,
        ['p8', 'p9', 'p10', 'p1', 'p2', 'p3', 'p4'],
        ['p5', 'p6', 'p7']
      );

      expect(firstSave.lineupId).toBe(secondSave.lineupId);
      expect(secondSave.starterPlayerIds).not.toEqual(firstSave.starterPlayerIds);
    });
  });
});
