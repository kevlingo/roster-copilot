import { NextRequest, NextResponse } from 'next/server';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { LoginDto } from '@/lib/dtos/auth.dto';
import { findUserByEmail } from '@/lib/dal/user.dal';
import { initializeDatabase } from '@/lib/dal/db';
import {
  composeWrappers,
  withErrorHandling,
  withRequestLogging,
} from '@/lib/api/middleware/route-handlers';
import { withRateLimiting } from '@/lib/api/middleware/rate-limiter';


async function loginHandler(req: NextRequest): Promise<NextResponse> {
  await initializeDatabase();

  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const loginDto = plainToInstance(LoginDto, body);
  const errors = await validate(loginDto);

  if (errors.length > 0) {
    const formattedErrors = errors.map((err) => ({
      property: err.property,
      constraints: err.constraints,
    }));
    return NextResponse.json({ errors: formattedErrors }, { status: 400 });
  }

  const { email, password } = loginDto;

  const user = await findUserByEmail(email);

  if (!user) {
    return NextResponse.json(
      { message: 'Invalid credentials. Please check your email and password, or ensure your email is verified.' },
      { status: 401 },
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return NextResponse.json(
      { message: 'Invalid credentials. Please check your email and password, or ensure your email is verified.' },
      { status: 401 },
    );
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { message: 'Email not verified. Please check your inbox for a verification link.' },
      { status: 403 }, // 403 Forbidden as user is known but not permitted yet
    );
  }

  // User authenticated and email verified, generate JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables.');
    // This is a server configuration error, should not happen in a configured environment
    return NextResponse.json({ message: 'Internal Server Error: JWT configuration missing' }, { status: 500 });
  }

  const signOptions: jwt.SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN, 10) : 3600, // Use number (seconds)
  };

  const token = jwt.sign(
    { userId: user.userId, email: user.email, username: user.username },
    jwtSecret as string, // Ensure jwtSecret is treated as string
    signOptions,
  );

  // Return user info (without passwordHash) and token
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userWithoutPassword } = user;

  return NextResponse.json({
    message: 'Login successful',
    user: userWithoutPassword,
    token,
  });
}

export const POST = composeWrappers(
  withRateLimiting, // Added rate limiting
  withRequestLogging,
  withErrorHandling,
)(loginHandler);