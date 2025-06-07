/**
 * Draft API Routes
 * GET /api/leagues/[leagueId]/draft - Get current draft status and details
 * POST /api/leagues/[leagueId]/draft - Start a draft (future enhancement)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth/session';
import { initializeDatabase } from '@/lib/dal/db';
import { getDraftStateForResponse, startDraft, validateDraftStart } from '@/lib/services/draft.service';
import { getLeagueById } from '@/lib/dal/league.dal';

/**
 * GET /api/leagues/[leagueId]/draft
 * Gets the current draft status and details for a league
 */
export async function GET(
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

    // Check if league exists
    const league = await getLeagueById(leagueId);
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }

    // Check if draft has been initialized
    if (league.draftStatus === 'Scheduled') {
      // Draft hasn't started yet
      const validation = await validateDraftStart(leagueId);
      return NextResponse.json({
        draftStatus: 'Scheduled',
        canStart: validation.canStart,
        reason: validation.reason,
        message: validation.canStart 
          ? 'Draft is ready to start' 
          : `Cannot start draft: ${validation.reason}`
      });
    }

    // Get draft state for leagues with InProgress or Completed status
    try {
      const draftStateResponse = await getDraftStateForResponse(leagueId, user.userId);
      
      return NextResponse.json({
        draftStatus: league.draftStatus,
        ...draftStateResponse
      });

    } catch (error) {
      console.error('[API Error] Failed to get draft state:', error);

      // If draft state doesn't exist but league says it should, there's a data inconsistency
      if (league.draftStatus === 'InProgress' || league.draftStatus === 'Completed') {
        return NextResponse.json(
          { error: 'Draft data inconsistency. Please contact support.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to retrieve draft information' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[API Error] Failed to get draft information:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leagues/[leagueId]/draft
 * Starts a draft for a league (commissioner only)
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

    // Check if league exists and user is commissioner
    const league = await getLeagueById(leagueId);
    if (!league) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }

    if (league.commissionerUserId !== user.userId) {
      return NextResponse.json(
        { error: 'Only the league commissioner can start the draft' },
        { status: 403 }
      );
    }

    // Validate draft can be started
    const validation = await validateDraftStart(leagueId);
    if (!validation.canStart) {
      return NextResponse.json(
        { error: `Cannot start draft: ${validation.reason}` },
        { status: 400 }
      );
    }

    // Start the draft
    const draftStateResponse = await startDraft(leagueId);

    console.log(`[API] Draft started for league ${leagueId} by commissioner ${user.userId}`);

    return NextResponse.json({
      message: 'Draft started successfully',
      draftStatus: 'InProgress',
      ...draftStateResponse
    }, { status: 200 });

  } catch (error) {
    console.error('[API Error] Failed to start draft:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('Cannot start draft')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
