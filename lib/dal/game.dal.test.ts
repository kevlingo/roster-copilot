/**
 * Game Data Access Layer Tests
 * Tests for NFLGame database operations
 */

import {
  getNFLGamesByWeek,
  getNFLGameById,
  getAllNFLGames,
  getOpponentForTeam
} from './game.dal';
import { initializeDatabase, closeDb } from './db';

describe('Game DAL', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('getNFLGamesByWeek', () => {
    it('should return games for a specific week', async () => {
      const games = await getNFLGamesByWeek(1);
      
      expect(Array.isArray(games)).toBe(true);
      
      if (games.length > 0) {
        // Verify all games are for week 1
        games.forEach(game => {
          expect(game.weekNumber).toBe(1);
          expect(game).toHaveProperty('gameId');
          expect(game).toHaveProperty('homeTeamAbbreviation');
          expect(game).toHaveProperty('awayTeamAbbreviation');
        });
      }
    });

    it('should return empty array for non-existent week', async () => {
      const games = await getNFLGamesByWeek(99);
      expect(games).toEqual([]);
    });

    it('should handle week boundaries correctly', async () => {
      const week1Games = await getNFLGamesByWeek(1);
      const week2Games = await getNFLGamesByWeek(2);
      
      // Games should be different between weeks (if both weeks have games)
      if (week1Games.length > 0 && week2Games.length > 0) {
        const week1GameIds = week1Games.map(g => g.gameId);
        const week2GameIds = week2Games.map(g => g.gameId);
        
        // No game should appear in both weeks
        const intersection = week1GameIds.filter(id => week2GameIds.includes(id));
        expect(intersection).toEqual([]);
      }
    });
  });

  describe('getNFLGameById', () => {
    it('should return a game by ID', async () => {
      // First get a game to test with
      const allGames = await getAllNFLGames();
      
      if (allGames.length > 0) {
        const testGame = allGames[0];
        const retrievedGame = await getNFLGameById(testGame.gameId);
        
        expect(retrievedGame).toBeDefined();
        expect(retrievedGame?.gameId).toBe(testGame.gameId);
        expect(retrievedGame?.weekNumber).toBe(testGame.weekNumber);
        expect(retrievedGame?.homeTeamAbbreviation).toBe(testGame.homeTeamAbbreviation);
        expect(retrievedGame?.awayTeamAbbreviation).toBe(testGame.awayTeamAbbreviation);
      }
    });

    it('should return undefined for non-existent game ID', async () => {
      const game = await getNFLGameById('non-existent-id');
      expect(game).toBeUndefined();
    });
  });

  describe('getAllNFLGames', () => {
    it('should return all games ordered by week and date', async () => {
      const games = await getAllNFLGames();
      
      expect(Array.isArray(games)).toBe(true);
      
      if (games.length > 1) {
        // Verify ordering: should be sorted by weekNumber first
        for (let i = 1; i < games.length; i++) {
          expect(games[i].weekNumber).toBeGreaterThanOrEqual(games[i - 1].weekNumber);
        }
      }
    });

    it('should return games with all required properties', async () => {
      const games = await getAllNFLGames();
      
      if (games.length > 0) {
        const game = games[0];
        expect(game).toHaveProperty('gameId');
        expect(game).toHaveProperty('weekNumber');
        expect(game).toHaveProperty('homeTeamAbbreviation');
        expect(game).toHaveProperty('awayTeamAbbreviation');
        expect(typeof game.gameId).toBe('string');
        expect(typeof game.weekNumber).toBe('number');
        expect(typeof game.homeTeamAbbreviation).toBe('string');
        expect(typeof game.awayTeamAbbreviation).toBe('string');
      }
    });
  });

  describe('getOpponentForTeam', () => {
    it('should return opponent for home team', async () => {
      const games = await getAllNFLGames();
      
      if (games.length > 0) {
        const testGame = games[0];
        const opponent = await getOpponentForTeam(
          testGame.homeTeamAbbreviation, 
          testGame.weekNumber
        );
        
        expect(opponent).toBe(testGame.awayTeamAbbreviation);
      }
    });

    it('should return opponent for away team', async () => {
      const games = await getAllNFLGames();
      
      if (games.length > 0) {
        const testGame = games[0];
        const opponent = await getOpponentForTeam(
          testGame.awayTeamAbbreviation, 
          testGame.weekNumber
        );
        
        expect(opponent).toBe(testGame.homeTeamAbbreviation);
      }
    });

    it('should return undefined for team not playing in week', async () => {
      const opponent = await getOpponentForTeam('NONEXISTENT', 1);
      expect(opponent).toBeUndefined();
    });

    it('should return undefined for invalid week', async () => {
      const games = await getAllNFLGames();
      
      if (games.length > 0) {
        const testGame = games[0];
        const opponent = await getOpponentForTeam(
          testGame.homeTeamAbbreviation, 
          99 // Invalid week
        );
        
        expect(opponent).toBeUndefined();
      }
    });
  });

  describe('data integrity', () => {
    it('should have valid game status values', async () => {
      const games = await getAllNFLGames();
      const validStatuses = ['Scheduled', 'InProgress', 'Final'];
      
      games.forEach(game => {
        if (game.gameStatus) {
          expect(validStatuses).toContain(game.gameStatus);
        }
      });
    });

    it('should have different home and away teams', async () => {
      const games = await getAllNFLGames();
      
      games.forEach(game => {
        expect(game.homeTeamAbbreviation).not.toBe(game.awayTeamAbbreviation);
      });
    });

    it('should have valid week numbers', async () => {
      const games = await getAllNFLGames();
      
      games.forEach(game => {
        expect(game.weekNumber).toBeGreaterThan(0);
        expect(game.weekNumber).toBeLessThanOrEqual(18);
      });
    });
  });
});
