/**
 * Tests for Lineup Data Transfer Objects
 */

import {
  GetLineupResponseDto,
  LineupPlayerDto,
  SaveLineupRequestDto,
  SaveLineupResponseDto,
  LineupValidationError,
  LineupValidationResult
} from './lineup.dto';

describe('Lineup DTOs', () => {
  describe('LineupPlayerDto', () => {
    it('should have required properties', () => {
      const player: LineupPlayerDto = {
        playerId: 'p1',
        fullName: 'Test Player',
        position: 'QB',
        nflTeamAbbreviation: 'TST',
        status: 'Active',
        projectedPoints: 20.5,
        opponent: 'OPP',
        gameTime: '1:00 PM'
      };

      expect(player.playerId).toBe('p1');
      expect(player.fullName).toBe('Test Player');
      expect(player.position).toBe('QB');
      expect(player.nflTeamAbbreviation).toBe('TST');
      expect(player.status).toBe('Active');
      expect(player.projectedPoints).toBe(20.5);
      expect(player.opponent).toBe('OPP');
      expect(player.gameTime).toBe('1:00 PM');
    });

    it('should allow optional properties to be undefined', () => {
      const player: LineupPlayerDto = {
        playerId: 'p1',
        fullName: 'Test Player',
        position: 'QB',
        nflTeamAbbreviation: 'TST',
        status: 'Active',
        projectedPoints: 20.5
      };

      expect(player.opponent).toBeUndefined();
      expect(player.gameTime).toBeUndefined();
    });
  });

  describe('GetLineupResponseDto', () => {
    it('should have correct structure', () => {
      const response: GetLineupResponseDto = {
        teamInfo: {
          teamId: 't1',
          teamName: 'Test Team',
          leagueId: 'l1',
          leagueName: 'Test League'
        },
        weekNumber: 1,
        lineup: {
          starters: [],
          bench: []
        },
        rosterSettings: {
          QB: 1,
          RB: 2,
          WR: 2,
          TE: 1,
          K: 1,
          DEF: 1,
          BENCH: 6
        },
        hasExistingLineup: false
      };

      expect(response.teamInfo.teamId).toBe('t1');
      expect(response.weekNumber).toBe(1);
      expect(response.lineup.starters).toEqual([]);
      expect(response.lineup.bench).toEqual([]);
      expect(response.rosterSettings.QB).toBe(1);
      expect(response.hasExistingLineup).toBe(false);
    });
  });

  describe('SaveLineupRequestDto', () => {
    it('should have required properties', () => {
      const request: SaveLineupRequestDto = {
        weekNumber: 1,
        starterPlayerIds: ['p1', 'p2', 'p3'],
        benchPlayerIds: ['p4', 'p5', 'p6']
      };

      expect(request.weekNumber).toBe(1);
      expect(request.starterPlayerIds).toEqual(['p1', 'p2', 'p3']);
      expect(request.benchPlayerIds).toEqual(['p4', 'p5', 'p6']);
    });

    it('should allow empty arrays', () => {
      const request: SaveLineupRequestDto = {
        weekNumber: 1,
        starterPlayerIds: [],
        benchPlayerIds: []
      };

      expect(request.starterPlayerIds).toEqual([]);
      expect(request.benchPlayerIds).toEqual([]);
    });
  });

  describe('SaveLineupResponseDto', () => {
    it('should have correct structure for success', () => {
      const response: SaveLineupResponseDto = {
        success: true,
        message: 'Lineup saved successfully!',
        lineup: {
          lineupId: 'lineup1',
          weekNumber: 1,
          starterPlayerIds: ['p1', 'p2'],
          benchPlayerIds: ['p3', 'p4'],
          updatedAt: '2023-01-01T00:00:00.000Z'
        }
      };

      expect(response.success).toBe(true);
      expect(response.message).toBe('Lineup saved successfully!');
      expect(response.lineup.lineupId).toBe('lineup1');
      expect(response.lineup.weekNumber).toBe(1);
      expect(response.lineup.starterPlayerIds).toEqual(['p1', 'p2']);
      expect(response.lineup.benchPlayerIds).toEqual(['p3', 'p4']);
      expect(response.lineup.updatedAt).toBe('2023-01-01T00:00:00.000Z');
    });
  });

  describe('LineupValidationError', () => {
    it('should have required properties', () => {
      const error: LineupValidationError = {
        field: 'starters',
        message: 'Invalid lineup configuration'
      };

      expect(error.field).toBe('starters');
      expect(error.message).toBe('Invalid lineup configuration');
      expect(error.playerId).toBeUndefined();
    });

    it('should allow optional playerId', () => {
      const error: LineupValidationError = {
        field: 'starters',
        message: 'Player is injured',
        playerId: 'p1'
      };

      expect(error.field).toBe('starters');
      expect(error.message).toBe('Player is injured');
      expect(error.playerId).toBe('p1');
    });
  });

  describe('LineupValidationResult', () => {
    it('should represent valid lineup', () => {
      const result: LineupValidationResult = {
        isValid: true,
        errors: []
      };

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should represent invalid lineup with errors', () => {
      const errors: LineupValidationError[] = [
        {
          field: 'starters',
          message: 'QB: Expected 1, got 0'
        },
        {
          field: 'starters',
          message: 'Player is injured',
          playerId: 'p1'
        }
      ];

      const result: LineupValidationResult = {
        isValid: false,
        errors
      };

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].field).toBe('starters');
      expect(result.errors[0].message).toBe('QB: Expected 1, got 0');
      expect(result.errors[1].playerId).toBe('p1');
    });
  });

  describe('Type safety', () => {
    it('should enforce correct types', () => {
      // This test ensures TypeScript compilation catches type errors
      const player: LineupPlayerDto = {
        playerId: 'p1',
        fullName: 'Test Player',
        position: 'QB',
        nflTeamAbbreviation: 'TST',
        status: 'Active',
        projectedPoints: 20.5
      };

      // These should be type-safe
      expect(typeof player.playerId).toBe('string');
      expect(typeof player.projectedPoints).toBe('number');
      expect(typeof player.status).toBe('string');
    });

    it('should handle roster settings correctly', () => {
      const rosterSettings = {
        QB: 1,
        RB: 2,
        WR: 2,
        TE: 1,
        K: 1,
        DEF: 1,
        BENCH: 6
      };

      // All values should be numbers
      Object.values(rosterSettings).forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      });
    });
  });
});
