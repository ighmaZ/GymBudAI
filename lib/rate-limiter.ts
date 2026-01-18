import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configurations
export const RATE_LIMITS = {
  AI: { requests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
  CRUD: { requests: 60, windowMs: 60 * 1000 }, // 60 requests per minute
} as const;

type RateLimitTier = keyof typeof RATE_LIMITS;

/**
 * Get the identifier for rate limiting (IP address or user ID)
 */
function getIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for proxied requests)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";

  return ip;
}

/**
 * Check if a request should be rate limited
 */
function checkRateLimit(
  identifier: string,
  tier: RateLimitTier
): { limited: boolean; remaining: number; resetTime: number } {
  const config = RATE_LIMITS[tier];
  const now = Date.now();
  const key = `${tier}:${identifier}`;

  const entry = rateLimitStore.get(key);

  // If no entry or window has expired, create new entry
  if (!entry || now >= entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { limited: false, remaining: config.requests - 1, resetTime };
  }

  // Check if limit exceeded
  if (entry.count >= config.requests) {
    return { limited: true, remaining: 0, resetTime: entry.resetTime };
  }

  // Increment count
  entry.count++;
  return {
    limited: false,
    remaining: config.requests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Create a rate limit error response
 */
function createRateLimitResponse(resetTime: number): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: "Too many requests. Please try again later.",
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(Math.ceil(resetTime / 1000)),
      },
    }
  );
}

/**
 * Rate limiting wrapper for API route handlers
 * Returns null if not limited, or a NextResponse if limited
 */
export function rateLimit(
  request: NextRequest,
  tier: RateLimitTier = "CRUD"
): NextResponse | null {
  const identifier = getIdentifier(request);
  const { limited, remaining, resetTime } = checkRateLimit(identifier, tier);

  if (limited) {
    return createRateLimitResponse(resetTime);
  }

  // Not limited - caller should proceed with the request
  // We could add headers to successful responses, but keeping it simple
  return null;
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  request: NextRequest,
  tier: RateLimitTier = "CRUD"
): NextResponse {
  const identifier = getIdentifier(request);
  const key = `${tier}:${identifier}`;
  const entry = rateLimitStore.get(key);
  const config = RATE_LIMITS[tier];

  if (entry) {
    response.headers.set("X-RateLimit-Limit", String(config.requests));
    response.headers.set(
      "X-RateLimit-Remaining",
      String(Math.max(0, config.requests - entry.count))
    );
    response.headers.set(
      "X-RateLimit-Reset",
      String(Math.ceil(entry.resetTime / 1000))
    );
  }

  return response;
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now >= entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
