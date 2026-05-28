import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

// Gracefully degrade when Redis isn't configured yet (local dev)
const hasRedis =
  !!process.env.UPSTASH_REDIS_URL &&
  !process.env.UPSTASH_REDIS_URL.includes("your-redis") &&
  !!process.env.UPSTASH_REDIS_TOKEN &&
  !process.env.UPSTASH_REDIS_TOKEN.includes("your-upstash")

export const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    })
  : null

// 30 requests per minute per IP for API routes
export const apiRateLimit = hasRedis
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "cc_api",
    })
  : null

// 5 login attempts per 15 minutes per IP
export const loginRateLimit = hasRedis
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "cc_login",
    })
  : null

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  if (!redis) return fetcher()
  const cached = await redis.get<T>(key)
  if (cached !== null) return cached
  const fresh = await fetcher()
  await redis.setex(key, ttlSeconds, JSON.stringify(fresh))
  return fresh
}

export async function invalidateCache(pattern: string) {
  if (!redis) return
  await redis.del(pattern)
}
