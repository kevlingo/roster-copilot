import 'reflect-metadata'; // Required for class-transformer and class-validator
import { NextRequest, NextResponse } from 'next/server';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto'; // For token generation

import { SignUpDto } from '@/lib/dtos/auth.dto';
import {
  composeWrappers,
  withErrorHandling,
  withRequestLogging,
} from '@/lib/api/middleware/route-handlers';
import { initializeDatabase } from '@/lib/dal/db';
import {
  findUserByUsername,
  findUserByEmail,
  createUserProfile,
  createEmailVerificationToken,
} from '@/lib/dal/user.dal';
import { notificationService } from '@/lib/services/NotificationService';
import { UserProfile } from '@/lib/models/user.models'; // EmailVerificationToken_PoC is not directly used here

// Database initialization will be awaited in the handler

async function signupHandler(req: NextRequest, context: {}): Promise<NextResponse> {
  await initializeDatabase(); // Ensure DB is initialized before handling request

  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  const body = await req.json();
  const signUpDto = plainToInstance(SignUpDto, body);
  const errors = await validate(signUpDto);

  if (errors.length > 0) {
    const formattedErrors = errors.map((err) => ({
      property: err.property,
      constraints: err.constraints,
    }));
    return NextResponse.json({ errors: formattedErrors }, { status: 400 });
  }

  if (signUpDto.password !== signUpDto.passwordConfirmation) {
    return NextResponse.json(
      { errors: [{ property: 'passwordConfirmation', message: 'Passwords do not match' }] },
      { status: 400 },
    );
  }

  // --- Business Logic ---

  // 1. Check for username uniqueness
  const existingUserByUsername = findUserByUsername(signUpDto.username);
  if (existingUserByUsername) {
    return NextResponse.json(
      { errors: [{ property: 'username', message: 'Username already taken' }] },
      { status: 409 }, // 409 Conflict
    );
  }

  // 2. Check for email uniqueness
  const existingUserByEmail = findUserByEmail(signUpDto.email);
  if (existingUserByEmail) {
    return NextResponse.json(
      { errors: [{ property: 'email', message: 'Email already registered' }] },
      { status: 409 },
    );
  }

  // 3. Hash password
  const saltRounds = 10; // Standard practice
  const hashedPassword = await bcrypt.hash(signUpDto.password, saltRounds);

  // 4. Create UserProfile record
  let newUser: UserProfile;
  try {
    newUser = createUserProfile({
      username: signUpDto.username,
      email: signUpDto.email,
      passwordHash: hashedPassword,
    });
  } catch (dbError) {
    console.error('[DB Error Creating User]', dbError);
    return NextResponse.json({ error: 'Failed to create user account. Please try again.' }, { status: 500 });
  }

  // 5. Generate unique verification token and store
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24); // Token expires in 24 hours

  try {
    createEmailVerificationToken({
      userId: newUser.userId,
      token: verificationToken,
      email: newUser.email,
      expiresAt: expiryDate.toISOString(),
    });
  } catch (dbError) {
    console.error('[DB Error Creating Verification Token]', dbError);
    // Potentially delete the created user or mark for cleanup if token creation fails critically
    return NextResponse.json({ error: 'Failed to generate verification token. Please try again.' }, { status: 500 });
  }

  // 6. Send verification email
  try {
    const emailSent = await notificationService.sendVerificationEmail(newUser.email, newUser.username, verificationToken);
    if (!emailSent) {
      // Logged in NotificationService, but we might want to alert admin or retry.
      // For PoC, if email fails, user won't be able to verify.
      // Consider how critical this is: maybe allow signup but show a persistent "resend verification" option.
      console.warn(`Verification email failed to send to ${newUser.email} for token ${verificationToken}. User created but cannot verify immediately.`);
      // For now, we'll inform the user that registration was successful but email might be delayed.
      // Or, return a specific error:
      // return NextResponse.json({ error: 'User registered, but failed to send verification email. Please try "Resend Verification" or contact support.' }, { status: 500 });
    }
  } catch (emailError) {
    console.error('[Email Send Error in Handler]', emailError);
     // Similar to above, decide on error handling strategy.
    // return NextResponse.json({ error: 'User registered, but failed to send verification email. Please contact support.' }, { status: 500 });
  }
  
  return NextResponse.json(
    { message: 'User registered successfully. Please check your email to verify your account.' },
    { status: 201 },
  );
}

export async function POST(request: NextRequest) {
  return signupHandler(request, {});
}