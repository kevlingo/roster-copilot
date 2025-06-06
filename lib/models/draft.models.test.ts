/**
 * Tests for draft models and helper functions
 */

import { getSnakeDraftOrder, getTeamForPick, calculateTotalPicks } from './draft.models';

describe('Draft Models Helper Functions', () => {
  const teams = ['team1', 'team2', 'team3', 'team4'];

  describe('getSnakeDraftOrder', () => {
    it('should return normal order for odd rounds', () => {
      expect(getSnakeDraftOrder(teams, 1)).toEqual(['team1', 'team2', 'team3', 'team4']);
      expect(getSnakeDraftOrder(teams, 3)).toEqual(['team1', 'team2', 'team3', 'team4']);
      expect(getSnakeDraftOrder(teams, 5)).toEqual(['team1', 'team2', 'team3', 'team4']);
    });

    it('should return reverse order for even rounds', () => {
      expect(getSnakeDraftOrder(teams, 2)).toEqual(['team4', 'team3', 'team2', 'team1']);
      expect(getSnakeDraftOrder(teams, 4)).toEqual(['team4', 'team3', 'team2', 'team1']);
      expect(getSnakeDraftOrder(teams, 6)).toEqual(['team4', 'team3', 'team2', 'team1']);
    });

    it('should not modify the original array', () => {
      const originalTeams = ['team1', 'team2', 'team3', 'team4'];
      getSnakeDraftOrder(originalTeams, 2);
      expect(originalTeams).toEqual(['team1', 'team2', 'team3', 'team4']);
    });
  });

  describe('getTeamForPick', () => {
    it('should correctly calculate team for first round picks', () => {
      expect(getTeamForPick(teams, 1)).toEqual({
        teamId: 'team1',
        round: 1,
        positionInRound: 1
      });
      expect(getTeamForPick(teams, 2)).toEqual({
        teamId: 'team2',
        round: 1,
        positionInRound: 2
      });
      expect(getTeamForPick(teams, 4)).toEqual({
        teamId: 'team4',
        round: 1,
        positionInRound: 4
      });
    });

    it('should correctly calculate team for second round picks (snake)', () => {
      expect(getTeamForPick(teams, 5)).toEqual({
        teamId: 'team4',
        round: 2,
        positionInRound: 1
      });
      expect(getTeamForPick(teams, 6)).toEqual({
        teamId: 'team3',
        round: 2,
        positionInRound: 2
      });
      expect(getTeamForPick(teams, 8)).toEqual({
        teamId: 'team1',
        round: 2,
        positionInRound: 4
      });
    });

    it('should correctly calculate team for third round picks (normal)', () => {
      expect(getTeamForPick(teams, 9)).toEqual({
        teamId: 'team1',
        round: 3,
        positionInRound: 1
      });
      expect(getTeamForPick(teams, 12)).toEqual({
        teamId: 'team4',
        round: 3,
        positionInRound: 4
      });
    });

    it('should handle larger pick numbers correctly', () => {
      expect(getTeamForPick(teams, 16)).toEqual({
        teamId: 'team1',
        round: 4,
        positionInRound: 4
      });
    });
  });

  describe('calculateTotalPicks', () => {
    const standardRosterSettings = {
      QB: 1, RB: 2, WR: 2, TE: 1, K: 1, DEF: 1, BENCH: 6
    };

    it('should calculate correct total picks for standard roster', () => {
      expect(calculateTotalPicks(4, standardRosterSettings)).toBe(56); // 4 teams * 14 players
      expect(calculateTotalPicks(8, standardRosterSettings)).toBe(112); // 8 teams * 14 players
      expect(calculateTotalPicks(10, standardRosterSettings)).toBe(140); // 10 teams * 14 players
      expect(calculateTotalPicks(12, standardRosterSettings)).toBe(168); // 12 teams * 14 players
    });

    it('should calculate correct total picks for custom roster settings', () => {
      const customRoster = { QB: 2, RB: 3, WR: 3, TE: 2, K: 1, DEF: 1, BENCH: 8 };
      expect(calculateTotalPicks(10, customRoster)).toBe(200); // 10 teams * 20 players
    });

    it('should handle minimal roster settings', () => {
      const minimalRoster = { QB: 1, RB: 1, WR: 1, TE: 1, K: 1, DEF: 1, BENCH: 0 };
      expect(calculateTotalPicks(8, minimalRoster)).toBe(48); // 8 teams * 6 players
    });
  });

  describe('Snake Draft Integration Test', () => {
    it('should correctly simulate a full 2-round draft for 4 teams', () => {
      const expectedOrder = [
        { pick: 1, team: 'team1', round: 1 },
        { pick: 2, team: 'team2', round: 1 },
        { pick: 3, team: 'team3', round: 1 },
        { pick: 4, team: 'team4', round: 1 },
        { pick: 5, team: 'team4', round: 2 }, // Snake: reverse order
        { pick: 6, team: 'team3', round: 2 },
        { pick: 7, team: 'team2', round: 2 },
        { pick: 8, team: 'team1', round: 2 }
      ];

      expectedOrder.forEach(({ pick, team, round }) => {
        const result = getTeamForPick(teams, pick);
        expect(result.teamId).toBe(team);
        expect(result.round).toBe(round);
      });
    });
  });
});
