/**
 * Unit tests for League models and constants
 */

import { describe, it, expect } from '@jest/globals';
import { DEFAULT_ROSTER_SETTINGS } from './league.models';
import type { League_PoC, FantasyTeam_PoC } from './league.models';

describe('League Models', () => {
  describe('DEFAULT_ROSTER_SETTINGS', () => {
    it('should have correct default roster settings', () => {
      expect(DEFAULT_ROSTER_SETTINGS).toEqual({
        QB: 1,
        RB: 2,
        WR: 2,
        TE: 1,
        K: 1,
        DEF: 1,
        BENCH: 6
      });
    });
  });

  describe('League_PoC interface', () => {
    it('should accept valid league data', () => {
      const validLeague: League_PoC = {
        leagueId: 'league-123',
        leagueName: 'Test League',
        commissionerUserId: 'user-123',
        numberOfTeams: 10,
        scoringType: 'PPR',
        draftStatus: 'Scheduled',
        currentSeasonWeek: 1,
        participatingTeamIds: [],
        rosterSettings: DEFAULT_ROSTER_SETTINGS,
        createdAt: '2025-06-06T00:00:00.000Z'
      };

      expect(validLeague.leagueId).toBe('league-123');
      expect(validLeague.numberOfTeams).toBe(10);
      expect(validLeague.scoringType).toBe('PPR');
      expect(validLeague.draftStatus).toBe('Scheduled');
    });
  });

  describe('FantasyTeam_PoC interface', () => {
    it('should accept valid fantasy team data', () => {
      const validTeam: FantasyTeam_PoC = {
        teamId: 'team-123',
        leagueId: 'league-123',
        userId: 'user-123',
        teamName: 'Test Team',
        playerIds_onRoster: ['player1', 'player2'],
        createdAt: '2025-06-06T00:00:00.000Z'
      };

      expect(validTeam.teamId).toBe('team-123');
      expect(validTeam.leagueId).toBe('league-123');
      expect(validTeam.playerIds_onRoster).toEqual(['player1', 'player2']);
    });
  });
});
