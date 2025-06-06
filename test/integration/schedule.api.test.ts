/**
 * Integration tests for Schedule API endpoints
 * Tests the complete API flow for league schedule
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock next/server first
jest.mock('next/server', () => {
  class MockNextRequest {
    headers: Headers;
    nextUrl: URL;
    method: string;
    body?: unknown;
    ip?: string;

    constructor(input: string | URL | RequestInfo, init?: RequestInit) {
      const url = typeof input === 'string' ? input : (input as URL).toString();
      this.nextUrl = new URL(url);
      this.headers = new Headers(init?.headers);
      this.method = init?.method || 'GET';
      this.body = init?.body;
      this.ip = (init as RequestInit & { ip?: string })?.ip || '127.0.0.1';
    }

    async json() {
      if (typeof this.body === 'string') {
        return Promise.resolve(JSON.parse(this.body));
      }
      return Promise.resolve(this.body || {});
    }
  }

  return {
    NextResponse: {
      json: jest.fn((body, init) => ({
        status: init?.status || 200,
        headers: new Headers(init?.headers),
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(JSON.stringify(body)),
        body: body,
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
      })),
    },
    NextRequest: MockNextRequest,
  };
});

// Mock dependencies
jest.mock('@/lib/dal/db');
jest.mock('@/lib/auth/session');
jest.mock('@/lib/dal/league.dal');
jest.mock('@/lib/services/schedule.service');
jest.mock('@/lib/services/matchup.service');

// Import after mocking
import { GET } from '@/app/api/leagues/[leagueId]/schedule/route';
import { NextRequest } from 'next/server';
import * as db from '@/lib/dal/db';
import * as session from '@/lib/auth/session';
import * as leagueDal from '@/lib/dal/league.dal';
import * as scheduleService from '@/lib/services/schedule.service';

const mockedInitializeDatabase = db.initializeDatabase as jest.Mock;
const mockedGetUserFromSession = session.getUserFromSession as jest.Mock;
const mockedGetLeagueById = leagueDal.getLeagueById as jest.Mock;
const mockedGetFantasyTeamsByLeagueId = leagueDal.getFantasyTeamsByLeagueId as jest.Mock;
const mockedGetFantasyTeamByUserAndLeague = leagueDal.getFantasyTeamByUserAndLeague as jest.Mock;
const mockedGetLeagueSchedule = scheduleService.getLeagueSchedule as jest.Mock;

describe('Schedule API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedInitializeDatabase.mockResolvedValue(undefined);
  });

  describe('GET /api/leagues/[leagueId]/schedule', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockedGetUserFromSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/leagues/test/schedule');

      const response = await GET(request, { params: { leagueId: 'test' } });

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Authentication required');
    });

    it('should return 400 for missing league ID', async () => {
      mockedGetUserFromSession.mockResolvedValue({ userId: 'user1' });

      const request = new NextRequest('http://localhost:3000/api/leagues//schedule');

      const response = await GET(request, { params: { leagueId: '' } });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('League ID is required');
    });

    it('should return 404 for non-existent league', async () => {
      mockedGetUserFromSession.mockResolvedValue({ userId: 'user1' });
      mockedGetLeagueById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/leagues/nonexistent/schedule');

      const response = await GET(request, { params: { leagueId: 'nonexistent' } });

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('League not found');
    });

    it('should return schedule data for valid league', async () => {
      const mockUser = { userId: 'user1' };
      const mockLeague = {
        leagueId: 'league1',
        leagueName: 'Test League',
        currentSeasonWeek: 3,
        numberOfTeams: 4
      };
      const mockUserTeam = {
        teamId: 'team1',
        teamName: 'User Team',
        userId: 'user1'
      };
      const mockAllTeams = [
        mockUserTeam,
        { teamId: 'team2', teamName: 'Team 2', userId: 'user2' }
      ];
      const mockSchedule = {
        leagueId: 'league1',
        numberOfWeeks: 13,
        matchups: [
          {
            weekNumber: 1,
            team1Id: 'team1',
            team2Id: 'team2',
            isCompleted: false
          }
        ]
      };

      mockedGetUserFromSession.mockResolvedValue(mockUser);
      mockedGetLeagueById.mockResolvedValue(mockLeague);
      mockedGetFantasyTeamByUserAndLeague.mockResolvedValue(mockUserTeam);
      mockedGetFantasyTeamsByLeagueId.mockResolvedValue(mockAllTeams);
      mockedGetLeagueSchedule.mockResolvedValue(mockSchedule);

      const request = new NextRequest('http://localhost:3000/api/leagues/league1/schedule');

      const response = await GET(request, { params: { leagueId: 'league1' } });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('leagueInfo');
      expect(data).toHaveProperty('weeks');
      expect(data).toHaveProperty('totalWeeks');
      expect(data).toHaveProperty('isPoC');

      expect(data.leagueInfo.leagueId).toBe('league1');
      expect(Array.isArray(data.weeks)).toBe(true);
      expect(data.totalWeeks).toBe(13);
      expect(data.isPoC).toBe(true);
      expect(data.userTeamId).toBe('team1');
    });
  });
});