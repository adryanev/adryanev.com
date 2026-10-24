import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server'
import { eq, lt } from 'drizzle-orm'
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

  await db.delete(rateLimits).where(lt(rateLimits.resetAt, now))

  const existing = await db.query.rateLimits.findFirst({
    where: eq(rateLimits.key, key),
  })

  if (!existing) {
    await db.insert(rateLimits).values({
      key,
      count: 1,
      resetAt: new Date(now.getTime() + windowMs),
    })
    return { allowed: true }
  }

  if (existing.count >= max) {
    const retryAfterSeconds = Math.ceil(
      (existing.resetAt.getTime() - now.getTime()) / 1000,
    )
    return { allowed: false, retryAfterSeconds }
  }

  await db
    .update(rateLimits)
    .set({ count: existing.count + 1 })
    .where(eq(rateLimits.id, existing.id))

  return { allowed: true }
}

export async function clearRateLimit(key: string): Promise<void> {
  await db.delete(rateLimits).where(eq(rateLimits.key, key))
}
