import { createServerFn } from '@tanstack/react-start'
import { eq, sql, sum, desc, and, isNull, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { postViews } from '@/db/schema/post-views'
import { posts } from '@/db/schema/posts'
import { getCurrentUser } from '@/server/functions/auth.functions'

// ── Public: Record a view ──────────────────────────────

export const recordPostView = createServerFn({ method: 'POST' })
  .inputValidator((data: { postId: number }) => data)
  .handler(async ({ data }) => {
    const today = new Date().toISOString().split('T')[0]

    // Upsert: increment view_count for (postId, viewDate) pair
    await db
      .insert(postViews)
      .values({
        postId: data.postId,
        viewDate: today,
        viewCount: 1,
      })
      .onConflictDoUpdate({
        target: [postViews.postId, postViews.viewDate],
        set: { viewCount: sql`${postViews.viewCount} + 1` },
      })

    return { ok: true }
  })

// ── Public: Get view count for a single post ───────────

export const getPostViewCount = createServerFn({ method: 'GET' })
  .inputValidator((data: { postId: number }) => data)
  .handler(async ({ data }) => {
    const result = await db
      .select({ total: sum(postViews.viewCount) })
      .from(postViews)
      .where(eq(postViews.postId, data.postId))

    return { views: Number(result[0]?.total ?? 0) }
  })

// ── Public: Get view counts for multiple posts ─────────

export const getPostViewCounts = createServerFn({ method: 'GET' })
  .inputValidator((data: { postIds: number[] }) => data)
  .handler(async ({ data }) => {
    if (data.postIds.length === 0) return { views: {} }

    const rows = await db
      .select({
        postId: postViews.postId,
        total: sum(postViews.viewCount),
      })
      .from(postViews)
      .where(inArray(postViews.postId, data.postIds))
      .groupBy(postViews.postId)

    const views: Record<number, number> = {}
    for (const row of rows) {
      views[row.postId] = Number(row.total ?? 0)
    }
    return { views }
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
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentDate = sevenDaysAgo.toISOString().split('T')[0]

    const [recentResult] = await db
      .select({ total: sum(postViews.viewCount) })
      .from(postViews)
      .where(sql`${postViews.viewDate} >= ${recentDate}`)

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
