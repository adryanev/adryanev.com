import { createServerFn } from '@tanstack/react-start'
import { eq, sql, sum, desc, and, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { postViews } from '@/db/schema/post-views'
import { posts } from '@/db/schema/posts'
import { getRequestHeader } from '@tanstack/react-start/server'
import { getCurrentUser } from '@/server/functions/auth.functions'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'
import { getArticleViewWindow } from '@/lib/view-window'
import {
  buildViewKey,
  isCountableUserAgent,
  msUntilEndOfUtcDay,
} from '@/lib/view-visitor'

// ── Public: Record a view ──────────────────────────────

const MAX_VIEWS_PER_VISITOR_PER_DAY = 1

function parsePostId(data: { postId: number }): { postId: number } {
  if (!Number.isSafeInteger(data?.postId) || data.postId <= 0) {
    throw new Error('Invalid post id')
  }
  return { postId: data.postId }
}

// D1 round trips: bot 1, repeat visitor 2, counted view 3
export const recordPostView = createServerFn({ method: 'POST' })
  .inputValidator(parsePostId)
  .handler(async ({ data }) => {
    const { postId } = data

    const [publishedPost, [current]] = await db.batch([
      db
        .select({ id: posts.id })
        .from(posts)
        .where(
          and(
            eq(posts.id, postId),
            eq(posts.status, 'published'),
            isNull(posts.deletedAt),
          ),
        ),
      db
        .select({ total: sum(postViews.viewCount) })
        .from(postViews)
        .where(eq(postViews.postId, postId)),
    ])
    if (publishedPost.length === 0) throw new Error('Post not found')

    const userAgent = getRequestHeader('user-agent')
    if (!userAgent || !isCountableUserAgent(userAgent)) {
      return { views: Number(current?.total ?? 0) }
    }

    // The window ends at UTC midnight, matching the UTC day of the post_views row
    const visit = await checkRateLimit(
      await buildViewKey(postId, getClientIp(), userAgent),
      { max: MAX_VIEWS_PER_VISITOR_PER_DAY, windowMs: msUntilEndOfUtcDay() },
    )
    if (!visit.allowed) return { views: Number(current?.total ?? 0) }

    const today = new Date().toISOString().split('T')[0]
    const [, [counted]] = await db.batch([
      db
        .insert(postViews)
        .values({ postId, viewDate: today, viewCount: 1 })
        .onConflictDoUpdate({
          target: [postViews.postId, postViews.viewDate],
          set: { viewCount: sql`${postViews.viewCount} + 1` },
        }),
      db
        .select({ total: sum(postViews.viewCount) })
        .from(postViews)
        .where(eq(postViews.postId, postId)),
    ])

    return { views: Number(counted?.total ?? 0) }
  })

// ── Admin: Get analytics for dashboard ─────────────────

export const getViewAnalytics = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    // Total views across all posts
    const [totalResult] = await db
      .select({ total: sum(postViews.viewCount) })
      .from(postViews)

    // Top 5 most-viewed posts
    const popularPosts = await db
      .select({
        postId: postViews.postId,
        title: posts.title,
        slug: posts.slug,
        totalViews: sum(postViews.viewCount),
      })
      .from(postViews)
      .innerJoin(posts, eq(postViews.postId, posts.id))
      .where(and(isNull(posts.deletedAt), eq(posts.status, 'published')))
      .groupBy(postViews.postId, posts.title, posts.slug)
      .orderBy(desc(sum(postViews.viewCount)))
      .limit(5)

    // Views in the last 7 days
    const { startDate, endDate } = getArticleViewWindow()

    const [recentResult] = await db
      .select({ total: sum(postViews.viewCount) })
      .from(postViews)
      .where(sql`${postViews.viewDate} >= ${startDate} and ${postViews.viewDate} <= ${endDate}`)

    return {
      totalViews: Number(totalResult?.total ?? 0),
      recentViews: Number(recentResult?.total ?? 0),
      popularPosts: popularPosts.map((p) => ({
        postId: p.postId,
        title: p.title,
        slug: p.slug,
        views: Number(p.totalViews ?? 0),
      })),
    }
  },
)
