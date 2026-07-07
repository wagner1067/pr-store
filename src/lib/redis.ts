import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// ─── Singleton Redis Client ───────────────────────────────────────────────────
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

// ─── TTL Constants (seconds) ─────────────────────────────────────────────────
export const TTL = {
  PRODUCTS_LIST: 120,      // 2 min — catálogo público
  PRODUCT_DETAIL: 300,     // 5 min — página de produto
  DASHBOARD_KPI: 30,       // 30s  — KPIs admin (dados recentes)
  DASHBOARD_SALES: 60,     // 1 min — histórico vendas
  DASHBOARD_ORDERS: 45,    // 45s  — pedidos e-commerce
  DASHBOARD_DEBTORS: 60,   // 1 min — promissórias
  DASHBOARD_CLIENTS: 120,  // 2 min — clientes
  DASHBOARD_EXPENSES: 60,  // 1 min — despesas
  ABC_REPORT: 300,         // 5 min — relatório ABC (pesado)
  STOCK_LOCK: 30,          // 30s  — lock pessimista de estoque
} as const;

// ─── Cache Keys ───────────────────────────────────────────────────────────────
export const CACHE_KEYS = {
  productsList: (category: string, page: number) => `products:list:${category}:${page}`,
  productDetail: (slug: string) => `products:detail:${slug}`,
  dashboardAll: (userId: string) => `dashboard:all:${userId}`,
  dashboardKpi: (userId: string) => `dashboard:kpi:${userId}`,
  dashboardSales: (userId: string) => `dashboard:sales:${userId}`,
  dashboardOrders: () => `dashboard:orders`,
  dashboardDebtors: () => `dashboard:debtors`,
  dashboardClients: () => `dashboard:clients`,
  dashboardExpenses: () => `dashboard:expenses`,
  abcReport: () => `dashboard:abc`,
  stockLock: (productId: string, size: string) => `stock:lock:${productId}:${size}`,
};

// ─── Rate Limiters ────────────────────────────────────────────────────────────
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'rl:auth',
    })
  : null;

export const checkoutRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: 'rl:checkout',
    })
  : null;

export const chatRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(15, '1 m'),
      analytics: true,
      prefix: 'rl:chat',
    })
  : null;

export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: true,
      prefix: 'rl:api',
    })
  : null;

// ─── Generic Cache Helpers ────────────────────────────────────────────────────
export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    return await redis.get<T>(key);
  } catch {
    console.warn(`[Redis] Cache miss for key: ${key}`);
    return null;
  }
}

export async function setCache<T>(key: string, data: T, ttl = 60): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, data, { ex: ttl });
  } catch (err) {
    console.warn(`[Redis] Failed to set cache for key: ${key}`, err);
  }
}

export async function invalidateCache(...patterns: string[]): Promise<void> {
  if (!redis) return;
  try {
    const allKeys = await Promise.all(patterns.map((p) => redis!.keys(p)));
    const flat = allKeys.flat();
    if (flat.length > 0) {
      await Promise.all(flat.map((k) => redis!.del(k)));
    }
  } catch (err) {
    console.warn(`[Redis] Failed to invalidate cache`, err);
  }
}

// ─── Cache-Aside Helper (read-through pattern) ───────────────────────────────
/**
 * Returns cached data if fresh, otherwise calls `fetcher()`, stores result, and returns it.
 * Falls through to fetcher on any Redis error (never blocks the user).
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  if (redis) {
    try {
      const cached = await redis.get<T>(key);
      if (cached !== null) return cached;
    } catch {
      // Redis unavailable — fall through to DB
    }
  }

  const data = await fetcher();

  if (redis) {
    try {
      await redis.set(key, data, { ex: ttl });
    } catch {
      // Ignore write errors
    }
  }

  return data;
}

// ─── Optimistic Multi-Get (pipeline) ─────────────────────────────────────────
/**
 * Fetch multiple cache keys in a single round-trip.
 * Returns an array aligned with `keys` — null for each miss.
 */
export async function mgetCached<T>(keys: string[]): Promise<(T | null)[]> {
  if (!redis || keys.length === 0) return keys.map(() => null);
  try {
    return await redis.mget<T[]>(...keys);
  } catch {
    return keys.map(() => null);
  }
}

// ─── Stock Lock (pessimistic locking for concurrency) ────────────────────────
/**
 * Tries to acquire a Redis lock for a product/size combo.
 * Returns true if lock acquired, false if already locked.
 */
export async function acquireStockLock(
  productId: string,
  size: string,
  buyerSessionId: string,
  ttl = TTL.STOCK_LOCK
): Promise<boolean> {
  if (!redis) return true; // No Redis → allow (fail-open)
  try {
    const key = CACHE_KEYS.stockLock(productId, size);
    // NX = only set if not exists (atomic lock)
    const result = await redis.set(key, buyerSessionId, { ex: ttl, nx: true });
    return result === 'OK';
  } catch {
    return true; // Fail-open
  }
}

/**
 * Releases a stock lock if the same session owns it.
 */
export async function releaseStockLock(
  productId: string,
  size: string,
  buyerSessionId: string
): Promise<void> {
  if (!redis) return;
  try {
    const key = CACHE_KEYS.stockLock(productId, size);
    const owner = await redis.get<string>(key);
    if (owner === buyerSessionId) await redis.del(key);
  } catch {
    // Ignore
  }
}

// ─── Rate Limit Check ─────────────────────────────────────────────────────────
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
    return { success: true, remaining: 999, reset: 0 };
  }
}
