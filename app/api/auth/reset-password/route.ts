import { NextRequest, NextResponse } from 'next/server';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import bcrypt from 'bcrypt';

import { ResetPasswordDto } from '@/lib/dtos/auth.dto';
import {
  composeWrappers,
  withErrorHandling,
  withRequestLogging,
} from '@/lib/api/middleware/route-handlers';
import { withRateLimiting } from '@/lib/api/middleware/rate-limiter';
import { initializeDatabase } from '@/lib/dal/db';
import {
  findResetToken,
  markResetTokenAsUsed,
  updateUserPassword,
  findUserById,
} from '@/lib/dal/user.dal';
// import { notificationService } from '@/lib/services/NotificationService';

async function resetPasswordHandler(req: NextRequest): Promise<NextResponse> {
  await initializeDatabase(); // Ensure DB is initialized before handling request

  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  const body = await req.json();
  const resetPasswordDto = plainToInstance(ResetPasswordDto, body);
  const errors = await validate(resetPasswordDto);

  if (errors.length > 0) {
    const formattedErrors = errors.map((err) => ({
      property: err.property,
      constraints: err.constraints,
    }));
    return NextResponse.json({ errors: formattedErrors }, { status: 400 });
  }

  // Validate that passwords match
  if (resetPasswordDto.newPassword !== resetPasswordDto.confirmNewPassword) {
    return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
  }

  // Find and validate reset token
  let resetToken;
  try {
    resetToken = await findResetToken(resetPasswordDto.token);
  } catch (dbError) {
    console.error('[DB Error Finding Reset Token]', dbError);
    return NextResponse.json({ error: 'Error validating reset token. Please try again.' }, { status: 500 });
  }

  if (!resetToken) {
    return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
  }

  // Check if token is expired
  const now = new Date();
  const expiresAt = new Date(resetToken.expiresAt);
  if (now > expiresAt) {
    return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 });
  }

  // Check if token has already been used
  if (resetToken.used) {
    return NextResponse.json({ error: 'Reset link has already been used. Please request a new one.' }, { status: 400 });
  }

  // Get user details
  let user;
  try {
    user = await findUserById(resetToken.userId);
  } catch (dbError) {
    console.error('[DB Error Finding User for Password Reset]', dbError);
    return NextResponse.json({ error: 'Error processing password reset. Please try again.' }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: 'User not found. Please request a new reset link.' }, { status: 400 });
  }

  // Hash new password
  const saltRounds = 10; // Same as used in signup
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, saltRounds);
  } catch (hashError) {
    console.error('[Password Hashing Error]', hashError);
    return NextResponse.json({ error: 'Error processing password reset. Please try again.' }, { status: 500 });
  }

  // Update user's password
  try {
    await updateUserPassword(user.userId, hashedPassword);
  } catch (dbError) {
    console.error('[DB Error Updating Password]', dbError);
    return NextResponse.json({ error: 'Failed to update password. Please try again.' }, { status: 500 });
  }

  // Mark reset token as used
  try {
    await markResetTokenAsUsed(resetPasswordDto.token);
  } catch (dbError) {
    console.error('[DB Error Marking Token as Used]', dbError);
    // Password was updated successfully, so we'll continue despite this error
    console.warn('Password was updated but failed to mark token as used. Token may be reusable.');
  }

  // Optional: Send password changed notification email
  try {
    // For now, we'll skip this as it's marked as optional in the story
    // await notificationService.sendPasswordChangedEmail(user.email, user.username);
  } catch (emailError) {
    console.error('[Email Service Error for Password Changed Notification]', emailError);
    // Don't fail the request if notification email fails
  }

  return NextResponse.json({ 
    message: 'Password has been successfully reset. You can now log in with your new password.' 
  });
}

export const POST = composeWrappers(
  withRateLimiting, // Rate limiting to prevent abuse
  withRequestLogging,
  withErrorHandling,
)(resetPasswordHandler);
