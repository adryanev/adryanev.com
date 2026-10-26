import { createServerFn } from '@tanstack/react-start'
import { eq, sql, sum, desc, and, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { postViews } from '@/db/schema/post-views'
import { posts } from '@/db/schema/posts'
import { getCurrentUser } from '@/server/functions/auth.functions'

// ── Public: Record a view ──────────────────────────────

import { getArticleViewWindow } from '@/lib/view-window'
export const recordPostView = createServerFn({ method: 'POST' })
  .inputValidator((data: { postId: number }) => data)
  .handler(async ({ data }) => {
    const today = new Date().toISOString().split('T')[0]

    // One D1 round trip: increment today's (postId, viewDate) row, then read the total
    const [, [result]] = await db.batch([
      db
        .insert(postViews)
        .values({
          postId: data.postId,
          viewDate: today,
          viewCount: 1,
        })
        .onConflictDoUpdate({
          target: [postViews.postId, postViews.viewDate],
          set: { viewCount: sql`${postViews.viewCount} + 1` },
        }),
      db
        .select({ total: sum(postViews.viewCount) })
        .from(postViews)
        .where(eq(postViews.postId, data.postId)),
    ])

    return { views: Number(result?.total ?? 0) }
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
