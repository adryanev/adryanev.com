import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server'
import { eq, lt, sql } from 'drizzle-orm'
import { db } from '@/db'
import { rateLimits } from '@/db/schema/rate-limits'

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number }

// Cloudflare sets CF-Connecting-IP itself; X-Forwarded-For is client-controlled
export function getClientIp(): string {
  return (
    getRequestHeader('cf-connecting-ip') ??
    getRequestIP() ??
    '127.0.0.1'
  )
}

// Stored in D1 because Worker isolates share no memory between requests
export async function checkRateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
): Promise<RateLimitResult> {
  const now = new Date()

  // One atomic upsert per request, so concurrent requests cannot both see "no row"
  // or both read the same count; expired windows are cleared in the same batch
  const [, [window]] = await db.batch([
    db.delete(rateLimits).where(lt(rateLimits.resetAt, now)),
    db
      .insert(rateLimits)
      .values({ key, count: 1, resetAt: new Date(now.getTime() + windowMs) })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: { count: sql`${rateLimits.count} + 1` },
      })
      .returning({ count: rateLimits.count, resetAt: rateLimits.resetAt }),
  ])

  if (window.count <= max) return { allowed: true }

  const retryAfterSeconds = Math.ceil(
    (window.resetAt.getTime() - now.getTime()) / 1000,
  )
  return { allowed: false, retryAfterSeconds }
}

export async function clearRateLimit(key: string): Promise<void> {
  await db.delete(rateLimits).where(eq(rateLimits.key, key))
}
