import { NextRequest, NextResponse } from 'next/server';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import crypto from 'crypto';

import { ForgotPasswordDto } from '@/lib/dtos/auth.dto';
import {
  composeWrappers,
  withErrorHandling,
  withRequestLogging,
} from '@/lib/api/middleware/route-handlers';
import { withRateLimiting } from '@/lib/api/middleware/rate-limiter';
import { initializeDatabase } from '@/lib/dal/db';
import {
  findUserByEmail,
  createResetToken,
} from '@/lib/dal/user.dal';
import { notificationService } from '@/lib/services/NotificationService';

async function forgotPasswordHandler(req: NextRequest, context: {}): Promise<NextResponse> {
  await initializeDatabase(); // Ensure DB is initialized before handling request

  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  const body = await req.json();
  const forgotPasswordDto = plainToInstance(ForgotPasswordDto, body);
  const errors = await validate(forgotPasswordDto);

  if (errors.length > 0) {
    const formattedErrors = errors.map((err) => ({
      property: err.property,
      constraints: err.constraints,
    }));
    return NextResponse.json({ errors: formattedErrors }, { status: 400 });
  }

  // Check if email exists in UserProfile
  let user;
  try {
    user = await findUserByEmail(forgotPasswordDto.email);
  } catch (dbError) {
    console.error('[DB Error Finding User for Password Reset]', dbError);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }

  // Always return the same generic message to prevent email enumeration attacks
  const genericMessage = 'If an account exists for the entered email, a password reset link has been sent.';

  // If user doesn't exist, return generic message without sending email
  if (!user) {
    console.log(`[Password Reset] Email not found: ${forgotPasswordDto.email}`);
    return NextResponse.json({ message: genericMessage });
  }

  // Generate unique, cryptographically secure reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 1); // Token expires in 1 hour

  // Store reset token in database
  try {
    await createResetToken({
      userId: user.userId,
      token: resetToken,
      expiresAt: expiryDate.toISOString(),
    });
  } catch (dbError) {
    console.error('[DB Error Creating Reset Token]', dbError);
    return NextResponse.json({ error: 'Failed to generate reset token. Please try again.' }, { status: 500 });
  }

  // Send password reset email
  try {
    const emailSent = await notificationService.sendPasswordResetEmail(
      user.email,
      user.username,
      resetToken
    );
    
    if (!emailSent) {
      console.warn(`Password reset email failed to send to ${user.email} for token ${resetToken}.`);
      // For PoC, we'll still return success to prevent email enumeration
      // In production, you might want to implement retry logic or admin alerts
    }
  } catch (emailError) {
    console.error('[Email Service Error]', emailError);
    // Still return success to prevent email enumeration
  }

  return NextResponse.json({ message: genericMessage });
}

export async function POST(request: NextRequest) {
  return forgotPasswordHandler(request, {});
}
