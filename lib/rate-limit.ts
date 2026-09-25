import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// ─── Upstash Redis-backed rate limiting ────────────────────────────────────
// Uses a sliding window so limits are enforced consistently across serverless
// instances (an in-memory Map resets per instance and doesn't scale).

const redis = Redis.fromEnv()

const limiters = {
  analyze: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    prefix: "lumo:ratelimit:analyze",
  }),
  decide: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    prefix: "lumo:ratelimit:decide",
  }),
  rewrite: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    prefix: "lumo:ratelimit:rewrite",
  }),
} as const

export type RateLimitedRoute = keyof typeof limiters

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

export async function checkRateLimit(
  route: RateLimitedRoute,
  ip: string,
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const { success, reset } = await limiters[route].limit(ip)
  if (success) return { allowed: true }
  return { allowed: false, retryAfter: Math.max(0, Math.ceil((reset - Date.now()) / 1000)) }
}
