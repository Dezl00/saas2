import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { headers } from 'next/headers';

// Only initialize Redis if credentials are provided
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = (redisUrl && redisToken)
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

// Helper to extract IP securely in Vercel environment
export async function getClientIP(): Promise<string> {
  const headersList = await headers();
  // Vercel populates x-forwarded-for securely and strips spoofed ones from outside
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return headersList.get('x-real-ip') || 'unknown-ip';
}

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  key: string;
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetIn: number;
  isFallback: boolean;
};

/**
 * Main Rate Limiter function using Upstash Redis.
 * Supports Fail-Open/Fail-Closed fallback mechanism.
 */
export async function checkRateLimit({
  limit,
  windowMs,
  key,
}: RateLimitConfig): Promise<RateLimitResult> {
  if (!redis) {
    // Fail-open if Redis is not configured, but warn in console
    console.warn(`UPSTASH_REDIS_REST_URL is missing. Rate Limiter running in fallback (Fail-Open) for key: ${key}`);
    return { success: true, remaining: limit, resetIn: 0, isFallback: true };
  }

  try {
    // Window in seconds for Upstash (slidingWindow takes string like "10 s")
    const windowSecs = Math.max(1, Math.floor(windowMs / 1000));
    
    // Create a new limiter per call to allow dynamic configuration
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSecs} s`),
      analytics: false,
    });

    const { success, remaining, reset } = await ratelimit.limit(key);
    
    return {
      success,
      remaining,
      resetIn: reset - Date.now(),
      isFallback: false,
    };
  } catch (error) {
    // Redis connection failure / timeout
    console.error(`RateLimit Error for key ${key}:`, error);
    // FAIL-OPEN for critical endpoints: If Redis is down, we don't want to lock out legitimate users entirely
    return { success: true, remaining: limit, resetIn: 0, isFallback: true };
  }
}

