import { NextResponse } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const tracker = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  limit?: number; // max requests per window
  windowMs?: number; // window size in milliseconds
}

export function checkRateLimit(ip: string, options: RateLimitOptions = {}) {
  const limit = options.limit || 20;
  const windowMs = options.windowMs || 60 * 1000; // 1 minute window
  const now = Date.now();

  const current = tracker.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + windowMs;
  }

  current.count += 1;
  tracker.set(ip, current);

  const remaining = Math.max(0, limit - current.count);
  const resetSeconds = Math.ceil((current.resetTime - now) / 1000);

  const isRateLimited = current.count > limit;

  return {
    isRateLimited,
    limit,
    remaining,
    resetSeconds,
  };
}

export function rateLimitResponse(limit: number, resetSeconds: number) {
  return new NextResponse(
    JSON.stringify({
      error: "Too Many Requests",
      message: "API rate limit exceeded. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": "0",
        "Retry-After": resetSeconds.toString(),
      },
    }
  );
}
