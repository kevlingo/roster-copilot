/**
 * Tests for Join League API Route
 * POST /api/leagues/[leagueId]/join
 */

import { POST } from './route';
import * as leagueDAL from '@/lib/dal/league.dal';
import * as sessionAuth from '@/lib/auth/session';

// Mock next/server
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

// Mock the dependencies
jest.mock('@/lib/dal/league.dal');
jest.mock('@/lib/auth/session');

const mockLeagueDAL = leagueDAL as jest.Mocked<typeof leagueDAL>;
const mockSessionAuth = sessionAuth as jest.Mocked<typeof sessionAuth>;

// Import NextRequest after mocking
import { NextRequest } from 'next/server';

describe('POST /api/leagues/[leagueId]/join', () => {
  const mockUser = {
    userId: 'user-123',
    username: 'testuser',
    email: 'test@example.com'
  };

  const mockLeague = {
    leagueId: 'league-123',
    leagueName: 'Test League',
    commissionerUserId: 'commissioner-123',
    numberOfTeams: 10 as const,
    scoringType: 'PPR' as const,
    draftStatus: 'Scheduled' as const,
    currentSeasonWeek: 1,
    participatingTeamIds: ['team-1', 'team-2'],
    rosterSettings: {
      QB: 1, RB: 2, WR: 2, TE: 1, K: 1, DEF: 1, BENCH: 6
    },
    createdAt: '2025-01-01T00:00:00.000Z'
  };

  const mockNewTeam = {
    teamId: 'team-new',
    leagueId: 'league-123',
    userId: 'user-123',
    teamName: "testuser's Team",
    playerIds_onRoster: [],
    createdAt: '2025-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully join a league', async () => {
    // Setup mocks
    mockSessionAuth.getUserFromSession.mockResolvedValue(mockUser);
    mockLeagueDAL.getLeagueById.mockResolvedValue(mockLeague);
    mockLeagueDAL.userHasTeamInLeague.mockResolvedValue(false);
    mockLeagueDAL.createFantasyTeam.mockResolvedValue(mockNewTeam);
    mockLeagueDAL.updateLeagueParticipatingTeams.mockResolvedValue();

    const request = new NextRequest('http://localhost/api/leagues/league-123/join', {
      method: 'POST'
    });

    const response = await POST(request, { params: { leagueId: 'league-123' } });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('Successfully joined league');
    expect(data.league.leagueId).toBe('league-123');
    expect(data.team.teamId).toBe('team-new');
    expect(mockLeagueDAL.createFantasyTeam).toHaveBeenCalledWith(
      'league-123',
      'user-123',
      "testuser's Team"
    );
  });

  it('should return 401 if user is not authenticated', async () => {
    mockSessionAuth.getUserFromSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/leagues/league-123/join', {
      method: 'POST'
    });

    const response = await POST(request, { params: { leagueId: 'league-123' } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Authentication required');
  });

  it('should return 404 if league does not exist', async () => {
    mockSessionAuth.getUserFromSession.mockResolvedValue(mockUser);
    mockLeagueDAL.getLeagueById.mockResolvedValue(undefined);

    const request = new NextRequest('http://localhost/api/leagues/nonexistent/join', {
      method: 'POST'
    });

    const response = await POST(request, { params: { leagueId: 'nonexistent' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('League not found');
  });

  it('should return 409 if user already has a team in the league', async () => {
    mockSessionAuth.getUserFromSession.mockResolvedValue(mockUser);
    mockLeagueDAL.getLeagueById.mockResolvedValue(mockLeague);
    mockLeagueDAL.userHasTeamInLeague.mockResolvedValue(true);

    const request = new NextRequest('http://localhost/api/leagues/league-123/join', {
      method: 'POST'
    });

    const response = await POST(request, { params: { leagueId: 'league-123' } });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('You are already a member of this league');
  });

  it('should return 403 if league is full', async () => {
    const fullLeague = {
      ...mockLeague,
      numberOfTeams: 8 as const,
      participatingTeamIds: ['team-1', 'team-2', 'team-3', 'team-4', 'team-5', 'team-6', 'team-7', 'team-8']
    };

    mockSessionAuth.getUserFromSession.mockResolvedValue(mockUser);
    mockLeagueDAL.getLeagueById.mockResolvedValue(fullLeague);
    mockLeagueDAL.userHasTeamInLeague.mockResolvedValue(false);

    const request = new NextRequest('http://localhost/api/leagues/league-123/join', {
      method: 'POST'
    });

    const response = await POST(request, { params: { leagueId: 'league-123' } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('League is full. No more teams can join.');
  });

  it('should return 403 if draft has already started', async () => {
    const draftStartedLeague = {
      ...mockLeague,
      draftStatus: 'InProgress' as const
    };

    mockSessionAuth.getUserFromSession.mockResolvedValue(mockUser);
    mockLeagueDAL.getLeagueById.mockResolvedValue(draftStartedLeague);
    mockLeagueDAL.userHasTeamInLeague.mockResolvedValue(false);

    const request = new NextRequest('http://localhost/api/leagues/league-123/join', {
      method: 'POST'
    });

    const response = await POST(request, { params: { leagueId: 'league-123' } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Cannot join league. Draft has already started or completed.');
  });
});
