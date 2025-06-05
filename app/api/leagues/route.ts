/**
 * League API Routes
 * POST /api/leagues - Create a new league
 * GET /api/leagues - Get user's leagues (future implementation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLeague, isLeagueNameTaken } from '@/lib/dal/league.dal';
import { CreateLeagueDto, CreateLeagueResponseDto } from '@/lib/dtos/league.dto';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';

/**
 * POST /api/leagues
 * Creates a new fantasy league
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Check authentication
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body: CreateLeagueDto;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { leagueName, numberOfTeams, scoringType } = body;
    
    if (!leagueName || typeof leagueName !== 'string' || leagueName.trim().length === 0) {
      return NextResponse.json(
        { error: 'League name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!numberOfTeams || ![8, 10, 12].includes(numberOfTeams)) {
      return NextResponse.json(
        { error: 'Number of teams must be 8, 10, or 12' },
        { status: 400 }
      );
    }

    if (!scoringType || !['Standard', 'PPR'].includes(scoringType)) {
      return NextResponse.json(
        { error: 'Scoring type must be "Standard" or "PPR"' },
        { status: 400 }
      );
    }

    // Check if league name is already taken (optional for PoC, but good practice)
    const nameTaken = await isLeagueNameTaken(leagueName.trim());
    if (nameTaken) {
      return NextResponse.json(
        { error: 'League name is already taken. Please choose a different name.' },
        { status: 409 }
      );
    }

    // Create the league
    const newLeague = await createLeague(
      leagueName.trim(),
      user.userId,
      numberOfTeams,
      scoringType
    );

    // Prepare response
    const response: CreateLeagueResponseDto = {
      leagueId: newLeague.leagueId,
      leagueName: newLeague.leagueName,
      commissionerUserId: newLeague.commissionerUserId,
      numberOfTeams: newLeague.numberOfTeams,
      scoringType: newLeague.scoringType,
      draftStatus: newLeague.draftStatus,
      currentSeasonWeek: newLeague.currentSeasonWeek,
      participatingTeamIds: newLeague.participatingTeamIds || [],
      rosterSettings: newLeague.rosterSettings || {
        QB: 1, RB: 2, WR: 2, TE: 1, K: 1, DEF: 1, BENCH: 6
      },
      createdAt: newLeague.createdAt
    };

    console.log(`[API] League created successfully: ${newLeague.leagueId} by user ${user.userId}`);

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('[API Error] Failed to create league:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leagues
 * Gets user's leagues (placeholder for future implementation)
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Check authentication
    const user = await getUserFromSession(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Implement getUserLeagues when needed by other stories
    return NextResponse.json(
      { message: 'Get user leagues endpoint - to be implemented' },
      { status: 501 }
    );

  } catch (error) {
    console.error('[API Error] Failed to get user leagues:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
