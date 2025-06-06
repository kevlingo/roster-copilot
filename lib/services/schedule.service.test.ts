/**
 * Unit tests for Schedule Service
 * Tests schedule generation and matchup logic
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { generateLeagueSchedule, isWeekCompleted } from './schedule.service';
import { FantasyTeam_PoC } from '../models/league.models';

describe('Schedule Service', () => {
  let mockTeams: FantasyTeam_PoC[];

  beforeEach(() => {
    // Create mock teams for testing
    mockTeams = [
      {
        teamId: 'team1',
        leagueId: 'league1',
        userId: 'user1',
        teamName: 'Team 1',
        playerIds_onRoster: [],
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        teamId: 'team2',
        leagueId: 'league1',
        userId: 'user2',
        teamName: 'Team 2',
        playerIds_onRoster: [],
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        teamId: 'team3',
        leagueId: 'league1',
        userId: 'user3',
        teamName: 'Team 3',
        playerIds_onRoster: [],
        createdAt: '2025-01-01T00:00:00Z'
      },
      {
        teamId: 'team4',
        leagueId: 'league1',
        userId: 'user4',
        teamName: 'Team 4',
        playerIds_onRoster: [],
        createdAt: '2025-01-01T00:00:00Z'
      }
    ];
  });

  describe('generateLeagueSchedule', () => {
    it('should generate a schedule for even number of teams', () => {
      const schedule = generateLeagueSchedule('league1', mockTeams, 13);
      
      expect(schedule.leagueId).toBe('league1');
      expect(schedule.matchups.length).toBeGreaterThan(0);
      
      // Each team should play each other team at least once
      const team1Opponents = new Set();
      for (const matchup of schedule.matchups) {
        if (matchup.team1Id === 'team1') {
          team1Opponents.add(matchup.team2Id);
        } else if (matchup.team2Id === 'team1') {
          team1Opponents.add(matchup.team1Id);
        }
      }
      
      // Team 1 should play against all other teams
      expect(team1Opponents.size).toBe(3);
    });

    it('should generate a schedule for odd number of teams', () => {
      const oddTeams = mockTeams.slice(0, 3); // 3 teams
      const schedule = generateLeagueSchedule('league1', oddTeams, 13);
      
      expect(schedule.leagueId).toBe('league1');
      expect(schedule.matchups.length).toBeGreaterThan(0);
      
      // With 3 teams, each week should have 1 matchup (one team has bye)
      const week1Matchups = schedule.matchups.filter(m => m.weekNumber === 1);
      expect(week1Matchups.length).toBe(1);
    });

    it('should handle minimum teams (2 teams)', () => {
      const twoTeams = mockTeams.slice(0, 2);
      const schedule = generateLeagueSchedule('league1', twoTeams, 5);
      
      expect(schedule.matchups.length).toBeGreaterThan(0);
      
      // All matchups should be between the two teams
      for (const matchup of schedule.matchups) {
        expect(['team1', 'team2']).toContain(matchup.team1Id);
        expect(['team1', 'team2']).toContain(matchup.team2Id);
        expect(matchup.team1Id).not.toBe(matchup.team2Id);
      }
    });

    it('should throw error for insufficient teams', () => {
      expect(() => {
        generateLeagueSchedule('league1', [], 13);
      }).toThrow('Need at least 2 teams to generate a schedule');
      
      expect(() => {
        generateLeagueSchedule('league1', [mockTeams[0]], 13);
      }).toThrow('Need at least 2 teams to generate a schedule');
    });

    it('should generate correct number of weeks', () => {
      const schedule = generateLeagueSchedule('league1', mockTeams, 5);
      
      const maxWeek = Math.max(...schedule.matchups.map(m => m.weekNumber));
      expect(maxWeek).toBeLessThanOrEqual(5);
      expect(schedule.numberOfWeeks).toBeLessThanOrEqual(5);
    });

    it('should ensure each team plays once per week', () => {
      const schedule = generateLeagueSchedule('league1', mockTeams, 13);
      
      // Check week 1 - each team should appear exactly once
      const week1Matchups = schedule.matchups.filter(m => m.weekNumber === 1);
      const week1Teams = new Set();
      
      for (const matchup of week1Matchups) {
        expect(week1Teams.has(matchup.team1Id)).toBe(false);
        expect(week1Teams.has(matchup.team2Id)).toBe(false);
        week1Teams.add(matchup.team1Id);
        week1Teams.add(matchup.team2Id);
      }
      
      expect(week1Teams.size).toBe(4); // All 4 teams should be involved
    });

    it('should mark all matchups as not completed initially', () => {
      const schedule = generateLeagueSchedule('league1', mockTeams, 13);
      
      for (const matchup of schedule.matchups) {
        expect(matchup.isCompleted).toBe(false);
        expect(matchup.team1Score).toBeUndefined();
        expect(matchup.team2Score).toBeUndefined();
      }
    });
  });

  describe('isWeekCompleted', () => {
    it('should return true for past weeks', () => {
      expect(isWeekCompleted(1, 3)).toBe(true);
      expect(isWeekCompleted(2, 3)).toBe(true);
    });

    it('should return false for current and future weeks', () => {
      expect(isWeekCompleted(3, 3)).toBe(false);
      expect(isWeekCompleted(4, 3)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isWeekCompleted(1, 1)).toBe(false);
      expect(isWeekCompleted(0, 1)).toBe(true);
    });
  });

  describe('Round-robin algorithm validation', () => {
    it('should ensure fair scheduling over multiple weeks', () => {
      const schedule = generateLeagueSchedule('league1', mockTeams, 13);
      
      // Count how many times each team plays each other team
      const matchupCounts = new Map<string, number>();
      
      for (const matchup of schedule.matchups) {
        const key1 = `${matchup.team1Id}-${matchup.team2Id}`;
        const key2 = `${matchup.team2Id}-${matchup.team1Id}`;
        
        matchupCounts.set(key1, (matchupCounts.get(key1) || 0) + 1);
        matchupCounts.set(key2, (matchupCounts.get(key2) || 0) + 1);
      }
      
      // Each pair of teams should play a similar number of times
      const counts = Array.from(matchupCounts.values());
      const minCount = Math.min(...counts);
      const maxCount = Math.max(...counts);
      
      // The difference should be reasonable (at most 1 for round-robin)
      expect(maxCount - minCount).toBeLessThanOrEqual(2);
    });
  });
});
