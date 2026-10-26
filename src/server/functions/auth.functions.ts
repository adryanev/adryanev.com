import { createServerFn } from '@tanstack/react-start'
import { useSession } from '@tanstack/react-start/server'
import { redirect } from '@tanstack/react-router'
import { eq, and, gt } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema/users'
import { sessions } from '@/db/schema/sessions'
import { verifyPassword } from '@/lib/password'
import { checkRateLimit, clearRateLimit, getClientIp } from '@/server/rate-limit'

// Session cookie configuration
type SessionData = {
  sessionId?: string
}

function useAppSession() {
  return useSession<SessionData>({
    password: process.env.SESSION_SECRET!,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  })
}

// Rate limiting: 5 attempts per 15 minutes per IP
const LOGIN_RATE_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 }

// Login server function
export const login = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    // Rate limiting by IP
    const rateLimitKey = `login:${getClientIp()}`
    const rateCheck = await checkRateLimit(rateLimitKey, LOGIN_RATE_LIMIT)
    if (!rateCheck.allowed) {
      throw new Error(`Too many login attempts. Try again in ${rateCheck.retryAfterSeconds} seconds.`)
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const valid = await verifyPassword(user.passwordHash, data.password)
    if (!valid) {
      throw new Error('Invalid email or password')
    }

    // Create DB session
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      expiresAt,
    })

    // Store session ID in encrypted cookie
    const session = await useAppSession()
    await session.update({ sessionId })

    // Reset rate limit on successful login
    await clearRateLimit(rateLimitKey)

    return { success: true }
  })

// Logout server function
export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession()
  const sessionId = session.data.sessionId

  if (sessionId) {
    // Delete DB session
    await db.delete(sessions).where(eq(sessions.id, sessionId))
  }

  // Clear cookie
  await session.clear()

  throw redirect({ to: '/admin/login' })
})

// Get current user (with sliding session renewal)
export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    const sessionId = session.data.sessionId

    if (!sessionId) {
      return null
    }

    // Look up session in DB, check not expired
    const dbSession = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.id, sessionId),
        gt(sessions.expiresAt, new Date()),
      ),
      with: { user: true },
    })

    if (!dbSession) {
      // Session expired or invalid — clear cookie
      await session.clear()
      return null
    }

    // Sliding renewal: only extend if within 1 day of expiry
    const ONE_DAY = 24 * 60 * 60 * 1000
    if (dbSession.expiresAt.getTime() - Date.now() < ONE_DAY) {
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      await db
        .update(sessions)
        .set({ expiresAt: newExpiresAt })
        .where(eq(sessions.id, sessionId))
    }

    return {
      id: dbSession.user.id,
      email: dbSession.user.email,
    }
  },
)
