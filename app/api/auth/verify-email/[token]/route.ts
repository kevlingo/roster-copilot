import { NextRequest, NextResponse } from 'next/server';
import {
  composeWrappers,
  withErrorHandling,
  withRequestLogging,
} from '@/lib/api/middleware/route-handlers';
import {
  findVerificationToken,
  markTokenAsUsed,
  updateUserEmailVerificationStatus,
  findUserByEmail, // Or findUserById if token stores userId directly
} from '@/lib/dal/user.dal';
import { initializeDatabase } from '@/lib/dal/db'; // Import initializeDatabase
import { EmailVerificationToken_PoC, UserProfile } from '@/lib/models/user.models';

// Placeholder for session creation/login logic (Story 1.2)
// import { createSession } from '@/lib/auth/session'; // Fictional session management

async function verifyEmailHandler(
  req: NextRequest,
  context?: { params?: { token?: string | string[] } }, // Corrected type for context/params
): Promise<NextResponse> {
  await initializeDatabase(); // Ensure DB is initialized

  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  // Ensure token is a single string
  const tokenValue = context?.params?.token;
  const token = Array.isArray(tokenValue) ? tokenValue[0] : tokenValue;


  if (!token) {
    return NextResponse.json({ error: 'Verification token is missing.' }, { status: 400 });
  }

  // 1. Validate token
  let verificationToken: EmailVerificationToken_PoC | undefined;
  try {
    verificationToken = await findVerificationToken(token);
  } catch (dbError) {
    console.error('[DB Error Finding Token]', dbError);
    return NextResponse.json({ error: 'Error validating token. Please try again.' }, { status: 500 });
  }

  if (!verificationToken) {
    return NextResponse.json({ error: 'Invalid or expired verification link.' }, { status: 400 });
  }

  // Check if token is expired
  const now = new Date();
  const expiresAt = new Date(verificationToken.expiresAt);
  if (now > expiresAt) {
    // Optionally, delete expired token from DB
    // await deleteToken(token); 
    return NextResponse.json({ error: 'Verification link has expired.' }, { status: 400 });
  }
  
  // Check if token has already been used (as per extended EmailVerificationTokens_PoC in db.ts)
  if (verificationToken.used) {
      return NextResponse.json({ error: 'Verification link has already been used.' }, { status: 400 });
  }

  // 2. Update UserProfile.emailVerified to true
  //    The token stores userId, so we can update directly.
  try {
    await updateUserEmailVerificationStatus(verificationToken.userId, true);
  } catch (dbError) {
    console.error('[DB Error Updating User Verification Status]', dbError);
    return NextResponse.json({ error: 'Failed to update email verification status.' }, { status: 500 });
  }

  // 3. Invalidate the token (mark as used)
  try {
    await markTokenAsUsed(token);
  } catch (dbError) {
    console.error('[DB Error Marking Token Used]', dbError);
    // This is less critical if user status is updated, but should be logged.
  }
  
  // 4. Handle session creation/login (AC14)
  //    For PoC, redirect to login page with a success message.
  //    Actual login/session creation will be part of Story 1.2.
  //    We need the user's details to potentially log them in or provide a better redirect.
  //    Let's fetch the user to whom the token belonged.
  let user: UserProfile | undefined;
  try {
    // Assuming verificationToken.email holds the user's email
    // or verificationToken.userId can be used with findUserById
    user = await findUserByEmail(verificationToken.email); // Or findUserById(verificationToken.userId)
  } catch (dbError) {
    console.error('[DB Error Finding User Post-Verification]', dbError);
    // User is verified, but we can't fetch them for login redirect details.
    // Fallback to generic success.
  }

  const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin);
  loginUrl.searchParams.append('verified', 'true');
  if (user?.email) {
    loginUrl.searchParams.append('email', user.email); // Pre-fill email on login form
  }
  
  // Redirect to login page with a query parameter indicating success
  return NextResponse.redirect(loginUrl.toString(), 302);

  // Alternative: return a success message directly if frontend handles redirect (Task 4)
  // return NextResponse.json({ message: 'Email verified successfully. Please log in.' }, { status: 200 });
}

export const GET = composeWrappers(
  withRequestLogging,
  withErrorHandling,
  // withAuth, // Auth not typically needed for a verification link click
)(verifyEmailHandler);