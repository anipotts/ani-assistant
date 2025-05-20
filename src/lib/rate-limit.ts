/**
 * Rate Limiting Utility
 *
 * This file provides rate limiting functionality for API routes
 */

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
  identity?: string | null;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  retryAfter?: number; // Seconds
}

// In-memory store for development. In production, this would use Redis or similar.
const rateLimitStore: Record<string, { count: number; reset: number }> = {};

/**
 * Check if a request should be rate limited
 * @param config Rate limit configuration
 * @returns Rate limit result
 */
export async function rateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { limit, windowMs } = config;
  const identity = config.identity || "default";
  const key = `ratelimit:${identity}`;
  const now = Date.now();

  // Initialize or get current state
  if (!rateLimitStore[key] || rateLimitStore[key].reset < now) {
    rateLimitStore[key] = {
      count: 0,
      reset: now + windowMs,
    };
  }

  // Increment count
  rateLimitStore[key].count += 1;

  const current = rateLimitStore[key];
  const remaining = Math.max(0, limit - current.count);
  const success = current.count <= limit;
  const retryAfter = success ? undefined : Math.ceil((current.reset - now) / 1000);

  return {
    success,
    limit,
    remaining,
    reset: current.reset,
    retryAfter,
  };
}

/**
 * Rate limit middleware for Next.js API routes
 */
export const rateLimitMiddleware = {
  /**
   * Standard API rate limit: 60 requests per minute
   */
  standard: {
    limit: 60,
    windowMs: 60 * 1000, // 1 minute
  },

  /**
   * AI delegation rate limit: 10 requests per minute
   */
  aiDelegation: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
  },
};
