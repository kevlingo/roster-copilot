/**
 * Draft Pick API Route
 * POST /api/leagues/[leagueId]/draft/pick - Make a draft pick
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { makeUserDraftPick } from '@/lib/services/draft.service';
import { getLeagueById } from '@/lib/dal/league.dal';
import { MakeDraftPickRequest } from '@/lib/models/draft.models';

/**
 * POST /api/leagues/[leagueId]/draft/pick
 * Makes a draft pick for the authenticated user
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

    // Parse and validate request body
    let body: MakeDraftPickRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { playerId } = body;
    
    if (!playerId || typeof playerId !== 'string' || playerId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Player ID is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Check if league exists
    const league = await getLeagueById(leagueId);
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }

    // Check if draft is in progress
    if (league.draftStatus !== 'InProgress') {
      return NextResponse.json(
        { error: `Cannot make pick. Draft status is: ${league.draftStatus}` },
        { status: 400 }
      );
    }

    // Make the draft pick
    try {
      const result = await makeUserDraftPick(leagueId, user.userId, { playerId: playerId.trim() });

      console.log(`[API] Draft pick made: User ${user.userId} picked player ${playerId} in league ${leagueId}`);

      return NextResponse.json({
        success: true,
        message: result.message,
        pick: {
          pickId: result.pick.pickId,
          pickNumber: result.pick.pickNumber,
          round: result.pick.round,
          teamId: result.pick.teamId,
          playerId: result.pick.playerId,
          pickTimestamp: result.pick.pickTimestamp
        },
        draftState: {
          currentPickNumber: result.updatedDraftState.currentPickNumber,
          currentRound: result.updatedDraftState.currentRound,
          currentTeamId: result.updatedDraftState.currentTeamId,
          isComplete: result.updatedDraftState.isComplete,
          draftCompletedAt: result.updatedDraftState.draftCompletedAt
        }
      }, { status: 200 });

    } catch (error) {
      console.error('[API Error] Failed to make draft pick:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('not your turn')) {
          return NextResponse.json(
            { error: 'It is not your turn to pick' },
            { status: 403 }
          );
        }
        if (error.message.includes('already been drafted')) {
          return NextResponse.json(
            { error: 'This player has already been drafted' },
            { status: 409 }
          );
        }
        if (error.message.includes('Player not found')) {
          return NextResponse.json(
            { error: 'Invalid player selection' },
            { status: 400 }
          );
        }
        if (error.message.includes('not part of this league')) {
          return NextResponse.json(
            { error: 'You are not part of this league' },
            { status: 403 }
          );
        }
        if (error.message.includes('already complete')) {
          return NextResponse.json(
            { error: 'Draft is already complete' },
            { status: 400 }
          );
        }
        
        // Return the specific error message for other validation errors
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to make draft pick. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[API Error] Failed to process draft pick request:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
