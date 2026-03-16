import { createServerFn } from '@tanstack/react-start'
import { getRequestIP } from '@tanstack/react-start/server'
import { eq, desc, count, lt } from 'drizzle-orm'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { db } from '@/db'
import { subscribers } from '@/db/schema/subscribers'
import { rateLimits } from '@/db/schema/rate-limits'
import { getCurrentUser } from '@/server/functions/auth.functions'

// ── Constants ──────────────────────────────────────────
const TOKEN_EXPIRY_MS = 48 * 60 * 60 * 1000 // 48 hours
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

// ── Zod schemas ────────────────────────────────────────
const subscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.')
    .max(254),
  name: z.string().trim().max(100).optional(),
  honeypot: z.string().optional(),
})

const tokenSchema = z.object({
  token: z
    .string()
    .regex(/^[a-f0-9]{64}$/, 'Invalid token format.'),
})

const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

const idSchema = z.object({
  id: z.number().int().positive(),
})

// ── Helpers ────────────────────────────────────────────
function generateToken() {
  return randomBytes(32).toString('hex')
}

function tokenExpiresAt() {
  return new Date(Date.now() + TOKEN_EXPIRY_MS)
}

async function checkRateLimit(key: string): Promise<boolean> {
  const now = new Date()

  // Clean up expired entries
  await db.delete(rateLimits).where(lt(rateLimits.resetAt, now))

  const existing = await db.query.rateLimits.findFirst({
    where: eq(rateLimits.key, key),
  })

  if (!existing) {
    await db.insert(rateLimits).values({
      key,
      count: 1,
      resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
    })
    return true
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return false
  }

  await db
    .update(rateLimits)
    .set({ count: existing.count + 1 })
    .where(eq(rateLimits.id, existing.id))

  return true
}

function sendConfirmationEmail(email: string, confirmToken: string) {
  const confirmUrl = `${process.env.SITE_URL ?? 'http://localhost:3000'}/newsletter/confirm?token=${confirmToken}`
  console.log(
    `[Newsletter] Confirmation email to ${email}: ${confirmUrl}`,
  )
  // TODO: Replace with actual email service (e.g. Resend, SES, Postmark)
}

// ── Public: Subscribe ────────────────────────────────
export const subscribe = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => subscribeSchema.parse(data))
  .handler(async ({ data }) => {
    // Honeypot check — silently succeed
    if (data.honeypot) {
      return { success: true }
    }

    // Rate limit by IP
    const ip = getRequestIP({ xForwardedFor: true }) ?? '127.0.0.1'
    const allowed = await checkRateLimit(`subscribe:${ip}`)
    if (!allowed) {
      return { error: 'Too many attempts. Please try again later.' }
    }

    const email = data.email

    // Check if already subscribed
    const existing = await db.query.subscribers.findFirst({
      where: eq(subscribers.email, email),
    })

    if (existing) {
      if (existing.status === 'confirmed') {
        // Uniform response — don't reveal subscription status
        return { success: true }
      }
      if (existing.status === 'unsubscribed') {
        // Re-subscribe: generate new tokens
        const confirmToken = generateToken()
        const unsubscribeToken = generateToken()
        await db
          .update(subscribers)
          .set({
            status: 'pending',
            confirmToken,
            unsubscribeToken,
            tokenExpiresAt: tokenExpiresAt(),
            name: data.name || existing.name,
            unsubscribedAt: null,
            confirmedAt: null,
          })
          .where(eq(subscribers.id, existing.id))
        sendConfirmationEmail(email, confirmToken)
        return { success: true }
      }
      // pending — resend confirmation email
      sendConfirmationEmail(email, existing.confirmToken)
      return { success: true }
    }

    // Create new subscriber
    const confirmToken = generateToken()
    const unsubscribeToken = generateToken()

    await db.insert(subscribers).values({
      email,
      name: data.name || null,
      confirmToken,
      unsubscribeToken,
      tokenExpiresAt: tokenExpiresAt(),
    })

    sendConfirmationEmail(email, confirmToken)
    return { success: true }
  })

// ── Public: Confirm subscription ─────────────────────
export const confirmSubscription = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const subscriber = await db.query.subscribers.findFirst({
      where: eq(subscribers.confirmToken, data.token),
    })

    if (!subscriber) {
      return { error: 'Invalid or expired confirmation link.' }
    }

    if (subscriber.status === 'confirmed') {
      return { success: true, alreadyConfirmed: true }
    }

    // Check token expiry
    if (new Date() > subscriber.tokenExpiresAt) {
      return { error: 'This confirmation link has expired. Please subscribe again.' }
    }

    await db
      .update(subscribers)
      .set({ status: 'confirmed', confirmedAt: new Date() })
      .where(eq(subscribers.id, subscriber.id))

    return { success: true }
  })

// ── Public: Unsubscribe ──────────────────────────────
export const unsubscribe = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const subscriber = await db.query.subscribers.findFirst({
      where: eq(subscribers.unsubscribeToken, data.token),
    })

    if (!subscriber) {
      return { error: 'Invalid unsubscribe link.' }
    }

    if (subscriber.status === 'unsubscribed') {
      return { success: true, alreadyUnsubscribed: true }
    }

    await db
      .update(subscribers)
      .set({ status: 'unsubscribed', unsubscribedAt: new Date() })
      .where(eq(subscribers.id, subscriber.id))

    return { success: true }
  })

// ── Admin: List subscribers (paginated) ──────────────
export const getSubscribers = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => paginationSchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const { page, limit } = data
    const offset = (page - 1) * limit

    const [items, [totalRow]] = await Promise.all([
      db.query.subscribers.findMany({
        orderBy: desc(subscribers.createdAt),
        limit,
        offset,
      }),
      db.select({ count: count() }).from(subscribers),
    ])

    return {
      items,
      total: totalRow?.count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((totalRow?.count ?? 0) / limit),
    }
  })

// ── Admin: Get subscriber stats ──────────────────────
export const getSubscriberStats = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const [total, confirmed, pending] = await Promise.all([
      db.select({ count: count() }).from(subscribers),
      db
        .select({ count: count() })
        .from(subscribers)
        .where(eq(subscribers.status, 'confirmed')),
      db
        .select({ count: count() })
        .from(subscribers)
        .where(eq(subscribers.status, 'pending')),
    ])

    return {
      total: total[0]?.count ?? 0,
      confirmed: confirmed[0]?.count ?? 0,
      pending: pending[0]?.count ?? 0,
    }
  },
)

// ── Admin: Delete subscriber ─────────────────────────
export const deleteSubscriber = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    await db.delete(subscribers).where(eq(subscribers.id, data.id))
    return { success: true }
  })
