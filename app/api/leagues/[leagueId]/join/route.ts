/**
 * Join League API Route
 * POST /api/leagues/[leagueId]/join - Join an existing league
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getLeagueById,
  createFantasyTeam,
  userHasTeamInLeague,
  updateLeagueParticipatingTeams
} from '@/lib/dal/league.dal';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';

/**
 * POST /api/leagues/[leagueId]/join
 * Allows a logged-in user to join an existing fantasy league
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
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

    const { leagueId } = await params;

    // Validate leagueId parameter
    if (!leagueId || typeof leagueId !== 'string' || leagueId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid League ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the league by ID
    const league = await getLeagueById(leagueId);
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }

    // Check if user is already a participant in the league
    const userAlreadyInLeague = await userHasTeamInLeague(user.userId, leagueId);
    if (userAlreadyInLeague) {
      return NextResponse.json(
        { error: 'You are already a member of this league' },
        { status: 409 }
      );
    }

    // Check if league is full
    const currentTeamCount = league.participatingTeamIds?.length || 0;
    if (currentTeamCount >= league.numberOfTeams) {
      return NextResponse.json(
        { error: 'League is full. No more teams can join.' },
        { status: 403 }
      );
    }

    // Check if draft status allows joining (only "Scheduled" allowed)
    if (league.draftStatus !== 'Scheduled') {
      return NextResponse.json(
        { error: 'Cannot join league. Draft has already started or completed.' },
        { status: 403 }
      );
    }

    // All validations passed - create the fantasy team
    const defaultTeamName = `${user.username}'s Team`;
    const newTeam = await createFantasyTeam(
      leagueId,
      user.userId,
      defaultTeamName
    );

    // Update league's participating team IDs
    const updatedParticipatingTeamIds = [...(league.participatingTeamIds || []), newTeam.teamId];
    await updateLeagueParticipatingTeams(leagueId, updatedParticipatingTeamIds);

    // Prepare success response
    const response = {
      message: 'Successfully joined league',
      league: {
        leagueId: league.leagueId,
        leagueName: league.leagueName,
        numberOfTeams: league.numberOfTeams,
        currentTeamCount: updatedParticipatingTeamIds.length
      },
      team: {
        teamId: newTeam.teamId,
        teamName: newTeam.teamName,
        userId: newTeam.userId
      }
    };

    console.log(`[API] User ${user.userId} successfully joined league ${leagueId} with team ${newTeam.teamId}`);

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('[API Error] Failed to join league:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
