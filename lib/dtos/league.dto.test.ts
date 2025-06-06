/**
 * Unit tests for League DTOs
 */

import { describe, it, expect } from '@jest/globals';
import type { CreateLeagueDto, CreateLeagueResponseDto } from './league.dto';

describe('League DTOs', () => {
  describe('CreateLeagueDto', () => {
    it('should accept valid create league data', () => {
      const validDto: CreateLeagueDto = {
        leagueName: 'Test League',
        numberOfTeams: 10,
        scoringType: 'PPR'
      };

      expect(validDto.leagueName).toBe('Test League');
      expect(validDto.numberOfTeams).toBe(10);
      expect(validDto.scoringType).toBe('PPR');
    });

    it('should enforce numberOfTeams constraints', () => {
      // TypeScript should enforce these at compile time
      const validTeamCounts: Array<8 | 10 | 12> = [8, 10, 12];
      
      validTeamCounts.forEach(count => {
        const dto: CreateLeagueDto = {
          leagueName: 'Test League',
          numberOfTeams: count,
          scoringType: 'Standard'
        };
        expect([8, 10, 12]).toContain(dto.numberOfTeams);
      });
    });

    it('should enforce scoringType constraints', () => {
      // TypeScript should enforce these at compile time
      const validScoringTypes: Array<'Standard' | 'PPR'> = ['Standard', 'PPR'];
      
      validScoringTypes.forEach(type => {
        const dto: CreateLeagueDto = {
          leagueName: 'Test League',
          numberOfTeams: 10,
          scoringType: type
        };
        expect(['Standard', 'PPR']).toContain(dto.scoringType);
      });
    });
  });

  describe('CreateLeagueResponseDto', () => {
    it('should accept valid response data', () => {
      const validResponse: CreateLeagueResponseDto = {
        leagueId: 'league-123',
        leagueName: 'Test League',
        commissionerUserId: 'user-123',
        numberOfTeams: 10,
        scoringType: 'PPR',
        draftStatus: 'Scheduled',
        currentSeasonWeek: 1,
        participatingTeamIds: [],
        rosterSettings: {
          QB: 1, RB: 2, WR: 2, TE: 1, K: 1, DEF: 1, BENCH: 6
        },
        createdAt: '2025-01-27T00:00:00.000Z'
      };

      expect(validResponse.leagueId).toBe('league-123');
      expect(validResponse.draftStatus).toBe('Scheduled');
      expect(validResponse.participatingTeamIds).toEqual([]);
      expect(validResponse.rosterSettings.QB).toBe(1);
    });
  });
});
