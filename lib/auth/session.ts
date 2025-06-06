/**
 * Session utility functions for extracting user information from requests
 */

import { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';

export interface SessionUser {
  userId: string;
  email: string;
  username: string;
}

/**
 * Extracts user information from JWT token in Authorization header
 * Returns null if no valid token is found
 */
export async function getUserFromSession(request: NextRequest): Promise<SessionUser | null> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables.');
      return null;
    }

    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload & {
      userId: string;
      email: string;
      username: string;
    };

    return {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    };
  } catch (error) {
    console.error('[Session] JWT verification failed:', error);
    return null;
  }
}
