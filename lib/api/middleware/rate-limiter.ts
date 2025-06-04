import { NextRequest, NextResponse } from 'next/server';
import { ApiRouteHandler } from './route-handlers';

// Simple in-memory store for rate limiting
interface RateLimitEntry {
  count: number;
  expiry: number;
}
const ipRequestCounts = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per IP per window for login

export function withRateLimiting(handler: ApiRouteHandler): ApiRouteHandler {
  return async (req, params) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

    // Clean up expired entries (simple approach, could be optimized for very high traffic)
    const now = Date.now();
    for (const [keyIp, entry] of ipRequestCounts.entries()) {
      if (entry.expiry < now) {
        ipRequestCounts.delete(keyIp);
      }
    }

    const currentEntry = ipRequestCounts.get(ip);

    if (currentEntry && currentEntry.count >= MAX_REQUESTS_PER_WINDOW && currentEntry.expiry > now) {
      const timeLeftMs = currentEntry.expiry - now;
      const timeLeftMinutes = Math.ceil(timeLeftMs / (60 * 1000));
      console.warn(`[Rate Limit] IP ${ip} exceeded ${MAX_REQUESTS_PER_WINDOW} requests. Try again in ${timeLeftMinutes} minutes.`);
      return NextResponse.json(
        { message: `Too many requests. Please try again in ${timeLeftMinutes} minutes.` },
        { status: 429 },
      );
    }

    // Update or create new entry
    if (currentEntry && currentEntry.expiry > now) {
      currentEntry.count++;
    } else {
      ipRequestCounts.set(ip, {
        count: 1,
        expiry: now + RATE_LIMIT_WINDOW_MS,
      });
    }

    return handler(req, params);
  };
}