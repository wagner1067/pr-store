import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// --- Singleton Redis Client ---
function createRedisClient() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const globalForRedis = globalThis as unknown as { redis: Redis | null };
export const redis = globalForRedis.redis ?? createRedisClient();
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// --- Rate Limiters ---
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 min
      analytics: true,
      prefix: 'rl:auth',
    })
  : null;

export const checkoutRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 attempts per minute
      analytics: true,
      prefix: 'rl:checkout',
    })
  : null;

export const chatRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(15, '1 m'), // 15 messages per minute
      analytics: true,
      prefix: 'rl:chat',
    })
  : null;

export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
      analytics: true,
      prefix: 'rl:api',
    })
  : null;

// --- Cache Utilities ---
const DEFAULT_TTL = 60; // seconds

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const cached = await redis.get<T>(key);
    return cached;
  } catch {
    console.warn(`[Redis] Cache miss for key: ${key}`);
    return null;
  }
}

export async function setCache<T>(key: string, data: T, ttl = DEFAULT_TTL): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, data, { ex: ttl });
  } catch (err) {
    console.warn(`[Redis] Failed to set cache for key: ${key}`, err);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map((k) => redis!.del(k)));
    }
  } catch (err) {
    console.warn(`[Redis] Failed to invalidate cache pattern: ${pattern}`, err);
  }
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!limiter) return { success: true, remaining: 999, reset: 0 };
  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    // Fail open if Redis is down — don't block requests
    return { success: true, remaining: 999, reset: 0 };
  }
}
