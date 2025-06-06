/**
 * Unit tests for roster management DAL functions
 */

import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import {
  addPlayerToTeamRoster,
  removePlayerFromTeamRoster,
  getOwnedPlayerIdsInLeague
} from './league.dal';
import { getAvailableNFLPlayersInLeague } from './player.dal';

// Declare mock functions
let mockDbGet: jest.Mock;
let mockDbRun: jest.Mock;
let mockDbAll: jest.Mock;

// Mock the db module
jest.mock('./db', () => ({
  get: (...args: unknown[]) => mockDbGet(...args),
  run: (...args: unknown[]) => mockDbRun(...args),
  all: (...args: unknown[]) => mockDbAll(...args),
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

describe('Roster Management DAL Functions', () => {
  beforeAll(() => {
    // Initialize mocks
    mockDbGet = jest.fn();
    mockDbRun = jest.fn();
    mockDbAll = jest.fn();
  });

  beforeEach(() => {
    // Clear all mock implementations and calls before each test
    mockDbGet.mockClear();
    mockDbRun.mockClear();
    mockDbAll.mockClear();
  });

  describe('addPlayerToTeamRoster', () => {
    it('should add a player to an empty roster', async () => {
      // Mock team with empty roster
      const mockTeam = {
        teamId: 'team-1',
        leagueId: 'league-1',
        userId: 'user-1',
        teamName: 'Test Team',
        playerIds_onRoster: '[]',
        createdAt: '2023-01-01'
      };

      mockDbGet.mockResolvedValue(mockTeam);
      mockDbRun.mockResolvedValue({ lastID: 1, changes: 1 });

      await addPlayerToTeamRoster('team-1', 'p1');

      expect(mockDbGet).toHaveBeenCalledWith(
        'SELECT * FROM FantasyTeams_PoC WHERE teamId = ?',
        ['team-1']
      );
      expect(mockDbRun).toHaveBeenCalledWith(
        'UPDATE FantasyTeams_PoC SET playerIds_onRoster = ? WHERE teamId = ?',
        ['["p1"]', 'team-1']
      );
    });

    it('should not add duplicate players', async () => {
      // Mock team with existing player
      const mockTeam = {
        teamId: 'team-1',
        leagueId: 'league-1',
        userId: 'user-1',
        teamName: 'Test Team',
        playerIds_onRoster: '["p1"]',
        createdAt: '2023-01-01'
      };

      mockDbGet.mockResolvedValue(mockTeam);
      mockDbRun.mockResolvedValue({ lastID: 1, changes: 1 });

      await addPlayerToTeamRoster('team-1', 'p1');

      // Should still call update with same roster (no duplicate)
      expect(mockDbRun).toHaveBeenCalledWith(
        'UPDATE FantasyTeams_PoC SET playerIds_onRoster = ? WHERE teamId = ?',
        ['["p1"]', 'team-1']
      );
    });

    it('should throw error for non-existent team', async () => {
      mockDbGet.mockResolvedValue(undefined);

      await expect(addPlayerToTeamRoster('non-existent-team', 'p1'))
        .rejects.toThrow('Team not found: non-existent-team');
    });
  });

  describe('removePlayerFromTeamRoster', () => {
    it('should remove a player from roster', async () => {
      // Mock team with two players
      const mockTeam = {
        teamId: 'team-1',
        leagueId: 'league-1',
        userId: 'user-1',
        teamName: 'Test Team',
        playerIds_onRoster: '["p1", "p2"]',
        createdAt: '2023-01-01'
      };

      mockDbGet.mockResolvedValue(mockTeam);
      mockDbRun.mockResolvedValue({ lastID: 1, changes: 1 });

      await removePlayerFromTeamRoster('team-1', 'p1');

      expect(mockDbGet).toHaveBeenCalledWith(
        'SELECT * FROM FantasyTeams_PoC WHERE teamId = ?',
        ['team-1']
      );
      expect(mockDbRun).toHaveBeenCalledWith(
        'UPDATE FantasyTeams_PoC SET playerIds_onRoster = ? WHERE teamId = ?',
        ['["p2"]', 'team-1']
      );
    });

    it('should handle removing non-existent player gracefully', async () => {
      // Mock team with empty roster
      const mockTeam = {
        teamId: 'team-1',
        leagueId: 'league-1',
        userId: 'user-1',
        teamName: 'Test Team',
        playerIds_onRoster: '[]',
        createdAt: '2023-01-01'
      };

      mockDbGet.mockResolvedValue(mockTeam);
      mockDbRun.mockResolvedValue({ lastID: 1, changes: 1 });

      await removePlayerFromTeamRoster('team-1', 'p1');

      // Should still call update with empty roster
      expect(mockDbRun).toHaveBeenCalledWith(
        'UPDATE FantasyTeams_PoC SET playerIds_onRoster = ? WHERE teamId = ?',
        ['[]', 'team-1']
      );
    });

    it('should throw error for non-existent team', async () => {
      mockDbGet.mockResolvedValue(undefined);

      await expect(removePlayerFromTeamRoster('non-existent-team', 'p1'))
        .rejects.toThrow('Team not found: non-existent-team');
    });
  });

  describe('getOwnedPlayerIdsInLeague', () => {
    it('should return empty array for league with no teams', async () => {
      mockDbAll.mockResolvedValue([]);

      const ownedPlayerIds = await getOwnedPlayerIdsInLeague('empty-league');

      expect(mockDbAll).toHaveBeenCalledWith(
        'SELECT playerIds_onRoster FROM FantasyTeams_PoC WHERE leagueId = ?',
        ['empty-league']
      );
      expect(ownedPlayerIds).toEqual([]);
    });

    it('should return all owned player IDs in a league', async () => {
      // Mock two teams with different players
      const mockTeams = [
        { playerIds_onRoster: '["p1", "p2"]' },
        { playerIds_onRoster: '["p3", "p4"]' }
      ];

      mockDbAll.mockResolvedValue(mockTeams);

      const ownedPlayerIds = await getOwnedPlayerIdsInLeague('test-league');

      expect(ownedPlayerIds).toContain('p1');
      expect(ownedPlayerIds).toContain('p2');
      expect(ownedPlayerIds).toContain('p3');
      expect(ownedPlayerIds).toContain('p4');
      expect(ownedPlayerIds.length).toBe(4);
    });

    it('should not return duplicate player IDs', async () => {
      // Mock teams with overlapping players (edge case)
      const mockTeams = [
        { playerIds_onRoster: '["p1", "p2"]' },
        { playerIds_onRoster: '["p2", "p3"]' }
      ];

      mockDbAll.mockResolvedValue(mockTeams);

      const ownedPlayerIds = await getOwnedPlayerIdsInLeague('test-league');

      // Verify no duplicates
      const uniqueIds = [...new Set(ownedPlayerIds)];
      expect(ownedPlayerIds.length).toBe(uniqueIds.length);
      expect(ownedPlayerIds).toContain('p1');
      expect(ownedPlayerIds).toContain('p2');
      expect(ownedPlayerIds).toContain('p3');
    });
  });

  describe('getAvailableNFLPlayersInLeague', () => {
    it('should return all players when no players are owned', async () => {
      const mockPlayers = [
        { playerId: 'p1', fullName: 'Player 1', position: 'QB', nflTeamAbbreviation: 'KC', status: 'Active', projectedPoints: 20 },
        { playerId: 'p2', fullName: 'Player 2', position: 'RB', nflTeamAbbreviation: 'SF', status: 'Active', projectedPoints: 15 }
      ];

      mockDbAll.mockResolvedValue(mockPlayers);

      const availablePlayers = await getAvailableNFLPlayersInLeague([]);

      expect(mockDbAll).toHaveBeenCalledWith(
        'SELECT * FROM NFLPlayers WHERE 1=1 ORDER BY projectedPoints DESC, fullName',
        []
      );
      expect(Array.isArray(availablePlayers)).toBe(true);
      expect(availablePlayers.length).toBe(2);
    });

    it('should exclude owned players', async () => {
      const mockPlayers = [
        { playerId: 'p3', fullName: 'Player 3', position: 'WR', nflTeamAbbreviation: 'DAL', status: 'Active', projectedPoints: 18 }
      ];

      mockDbAll.mockResolvedValue(mockPlayers);

      const ownedPlayerIds = ['p1', 'p2'];
      const availablePlayers = await getAvailableNFLPlayersInLeague(ownedPlayerIds);

      expect(mockDbAll).toHaveBeenCalledWith(
        'SELECT * FROM NFLPlayers WHERE 1=1 AND playerId NOT IN (?,?) ORDER BY projectedPoints DESC, fullName',
        ['p1', 'p2']
      );

      const availablePlayerIds = availablePlayers.map(p => p.playerId);
      expect(availablePlayerIds).not.toContain('p1');
      expect(availablePlayerIds).not.toContain('p2');
      expect(availablePlayerIds).toContain('p3');
    });

    it('should filter by position when specified', async () => {
      const mockPlayers = [
        { playerId: 'qb1', fullName: 'QB Player', position: 'QB', nflTeamAbbreviation: 'KC', status: 'Active', projectedPoints: 25 }
      ];

      mockDbAll.mockResolvedValue(mockPlayers);

      const availablePlayers = await getAvailableNFLPlayersInLeague([], 'QB');

      expect(mockDbAll).toHaveBeenCalledWith(
        'SELECT * FROM NFLPlayers WHERE 1=1 AND position = ? ORDER BY projectedPoints DESC, fullName',
        ['QB']
      );

      availablePlayers.forEach(player => {
        expect(player.position).toBe('QB');
      });
    });

    it('should filter by search term when specified', async () => {
      const mockPlayers = [
        { playerId: 'josh1', fullName: 'Josh Allen', position: 'QB', nflTeamAbbreviation: 'BUF', status: 'Active', projectedPoints: 28 }
      ];

      mockDbAll.mockResolvedValue(mockPlayers);

      const availablePlayers = await getAvailableNFLPlayersInLeague([], undefined, 'Josh');

      expect(mockDbAll).toHaveBeenCalledWith(
        'SELECT * FROM NFLPlayers WHERE 1=1 AND fullName LIKE ? ORDER BY projectedPoints DESC, fullName',
        ['%Josh%']
      );

      availablePlayers.forEach(player => {
        expect(player.fullName.toLowerCase()).toContain('josh');
      });
    });
  });
});
