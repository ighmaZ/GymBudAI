import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiters for different tiers
// AI routes: 10 requests per minute (stricter for expensive AI calls)
const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:ai",
});

// CRUD routes: 60 requests per minute
const crudRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "ratelimit:crud",
});

// Rate limit configurations (for type safety)
export const RATE_LIMITS = {
  AI: { requests: 10, windowMs: 60 * 1000 },
  CRUD: { requests: 60, windowMs: 60 * 1000 },
} as const;

export type RateLimitTier = keyof typeof RATE_LIMITS;

/**
 * Get the identifier for rate limiting (IP address or user ID)
 */
function getIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";
  return ip;
}

/**
 * Rate limiting wrapper for API route handlers
 * Returns null if not limited, or a NextResponse if limited
 */
export async function rateLimit(
  request: NextRequest,
  tier: RateLimitTier = "CRUD"
): Promise<NextResponse | null> {
  // Skip rate limiting if Redis is not configured (development fallback)
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Upstash Redis not configured, skipping rate limiting");
    return null;
  }

  const identifier = getIdentifier(request);
  const limiter = tier === "AI" ? aiRateLimiter : crudRateLimiter;

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(reset / 1000)),
          },
        }
      );
    }

    return null;
  } catch (error) {
    // If Redis is unavailable, log and allow the request (fail open)
    console.error("Rate limiting error:", error);
    return null;
  }
}

/**
 * Add rate limit headers to a successful response
 */
export async function addRateLimitHeaders(
  response: NextResponse,
  request: NextRequest,
  tier: RateLimitTier = "CRUD"
): Promise<NextResponse> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return response;
  }

  const identifier = getIdentifier(request);
  const limiter = tier === "AI" ? aiRateLimiter : crudRateLimiter;

  try {
    const { limit, remaining, reset } = await limiter.limit(identifier);

    response.headers.set("X-RateLimit-Limit", String(limit));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(reset / 1000)));
  } catch {
    // Silently fail if Redis is unavailable
  }

  return response;
}
