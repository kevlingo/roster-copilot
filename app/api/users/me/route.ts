import { NextResponse } from 'next/server';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { UpdateProfileDto, ChangePasswordDto } from '@/lib/dtos/auth.dto';
import {
  withErrorHandling,
  withRequestLogging,
  withAuth,
  AuthenticatedRequest,
  AuthenticatedApiRouteHandler,
} from '@/lib/api/middleware/route-handlers';
import { initializeDatabase } from '@/lib/dal/db';
import {
  findUserById,
  findUserByUsername,
  findUserByEmail,
  updateUserUsername,
  updateUserEmail,
  updateUserPassword,
  createEmailVerificationToken,
} from '@/lib/dal/user.dal';
import { notificationService } from '@/lib/services/NotificationService';

/**
 * GET /api/users/me - Get current user profile
 */
const getUserProfileHandler: AuthenticatedApiRouteHandler = async (req: AuthenticatedRequest): Promise<NextResponse> => {
  await initializeDatabase();

  const user = await findUserById(req.user.userId);
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Remove sensitive information before sending to client
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userProfile } = user;
  
  return NextResponse.json({ user: userProfile });
};

/**
 * PUT /api/users/me - Update user profile (username, email, or password)
 */
const updateUserProfileHandler: AuthenticatedApiRouteHandler = async (req: AuthenticatedRequest): Promise<NextResponse> => {
  await initializeDatabase();

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Determine what type of update this is based on the fields present
  const hasPasswordFields = body.currentPassword || body.newPassword || body.confirmPassword;
  
  if (hasPasswordFields) {
    // Handle password change
    return handlePasswordChange(req, body);
  } else {
    // Handle profile update (username/email)
    return handleProfileUpdate(req, body);
  }
};

/**
 * Handle profile update (username and/or email)
 */
async function handleProfileUpdate(req: AuthenticatedRequest, body: { username: string; email: string }): Promise<NextResponse> {
  const updateDto = plainToInstance(UpdateProfileDto, body);
  const errors = await validate(updateDto);

  if (errors.length > 0) {
    const formattedErrors = errors.map((err) => ({
      property: err.property,
      constraints: err.constraints,
    }));
    return NextResponse.json({ errors: formattedErrors }, { status: 400 });
  }

  const { username, email } = updateDto;
  const currentUser = await findUserById(req.user.userId);
  
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updatedFields: string[] = [];

  // Check if username is being changed
  if (username !== currentUser.username) {
    // Check if new username is already taken
    const existingUser = await findUserByUsername(username);
    if (existingUser && existingUser.userId !== req.user.userId) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }
    
    await updateUserUsername(req.user.userId, username);
    updatedFields.push('username');
  }

  // Check if email is being changed
  if (email !== currentUser.email) {
    // Check if new email is already taken
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.userId !== req.user.userId) {
      return NextResponse.json({ error: 'Email is already taken' }, { status: 409 });
    }
    
    // Update email and set emailVerified to false
    await updateUserEmail(req.user.userId, email);
    updatedFields.push('email');

    // Generate and send email verification token for the new email
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
      
      await createEmailVerificationToken({
        userId: req.user.userId,
        token,
        email,
        expiresAt,
      });

      await notificationService.sendVerificationEmail(email, username, token);
      
      console.log(`[Profile Update] Email verification sent to ${email} for user ${req.user.userId}`);
    } catch (emailError) {
      console.error('[Profile Update] Failed to send verification email:', emailError);
      // Continue with the update but inform user about email verification issue
    }
  }

  if (updatedFields.length === 0) {
    return NextResponse.json({ message: 'No changes detected' });
  }

  let message = `Profile updated successfully. Updated: ${updatedFields.join(', ')}.`;
  if (updatedFields.includes('email')) {
    message += ' Please check your new email address to verify it.';
  }

  return NextResponse.json({ message });
}

/**
 * Handle password change
 */
async function handlePasswordChange(req: AuthenticatedRequest, body: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<NextResponse> {
  const changePasswordDto = plainToInstance(ChangePasswordDto, body);
  const errors = await validate(changePasswordDto);

  if (errors.length > 0) {
    const formattedErrors = errors.map((err) => ({
      property: err.property,
      constraints: err.constraints,
    }));
    return NextResponse.json({ errors: formattedErrors }, { status: 400 });
  }

  const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

  // Verify new password and confirmation match
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 });
  }

  const currentUser = await findUserById(req.user.userId);
  
  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.passwordHash);
  
  if (!isCurrentPasswordValid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  }

  // Hash new password and update
  const saltRounds = 12;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
  
  await updateUserPassword(req.user.userId, newPasswordHash);

  return NextResponse.json({ message: 'Password changed successfully' });
}

// Export the handlers with middleware applied
export const GET = withRequestLogging(
  withErrorHandling(
    withAuth(getUserProfileHandler)
  )
);

export const PUT = withRequestLogging(
  withErrorHandling(
    withAuth(updateUserProfileHandler)
  )
);
