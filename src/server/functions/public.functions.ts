import { createServerFn } from '@tanstack/react-start'
import { eq, and, isNull, desc, asc, count, sql, sum, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { posts, postsToTags, tags } from '@/db/schema/posts'
import {
  portfolioCategories,
  portfolioProjects,
  projectImages,
} from '@/db/schema/portfolio'
import { resumeEntries } from '@/db/schema/resume'
import { saasListings } from '@/db/schema/saas'
import { contacts } from '@/db/schema/contacts'
import { postViews } from '@/db/schema/post-views'
import { checkRateLimit, getClientIp } from '@/server/rate-limit'
import { renderEditorJs, renderProjectDescription, estimateReadingTime, type OutputData } from '@/lib/editorjs-renderer'

// ── Blog ──────────────────────────────────────────────

export const getPublishedPosts = createServerFn({ method: 'GET' })
  .inputValidator((data: { page?: number; tag?: string }) => data)
  .handler(async ({ data }) => {
    const page = data.page ?? 1
    const perPage = 12
    const offset = (page - 1) * perPage

    const conditions = [
      eq(posts.status, 'published'),
      isNull(posts.deletedAt),
    ]

    // If filtering by tag, find matching post IDs first
    let tagPostIds: number[] | undefined
    if (data.tag) {
      const tag = await db.query.tags.findFirst({
        where: eq(tags.slug, data.tag),
      })
      if (!tag) return { posts: [], total: 0, page, totalPages: 0 }

      const tagPosts = await db.query.postsToTags.findMany({
        where: eq(postsToTags.tagId, tag.id),
      })
      tagPostIds = tagPosts.map((tp) => tp.postId)
      if (tagPostIds.length === 0) return { posts: [], total: 0, page, totalPages: 0 }
    }

    // Build the full WHERE condition including tag filter
    const whereCondition = tagPostIds
      ? and(...conditions, inArray(posts.id, tagPostIds))
      : and(...conditions)

    // Both the page query and the view sum must select the same rows
    const pageOrder = [desc(posts.publishedAt), desc(posts.id)]
    const pagePostIds = db
      .select({ id: posts.id })
      .from(posts)
      .where(whereCondition)
      .orderBy(...pageOrder)
      .limit(perPage)
      .offset(offset)

    const [paginatedPosts, [{ total }], viewRows] = await Promise.all([
      db.query.posts.findMany({
        where: whereCondition,
        orderBy: pageOrder,
        limit: perPage,
        offset,
        with: { postsToTags: { with: { tag: true } } },
        columns: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          status: true,
          publishedAt: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.select({ total: count() }).from(posts).where(whereCondition),
      db
        .select({ postId: postViews.postId, views: sum(postViews.viewCount) })
        .from(postViews)
        .where(inArray(postViews.postId, pagePostIds))
        .groupBy(postViews.postId),
    ])

    const viewsByPostId = new Map(
      viewRows.map((row) => [row.postId, Number(row.views ?? 0)]),
    )

    // Compute reading time server-side and strip content from response
    const pagePosts = paginatedPosts.map((post) => {
      let readingTime = 1
      try {
        readingTime = estimateReadingTime(JSON.parse(post.content) as OutputData)
      } catch { /* corrupted content, use default */ }
      const { content: _content, ...rest } = post
      return { ...rest, readingTime, views: viewsByPostId.get(post.id) ?? 0 }
    })

    return {
      posts: pagePosts,
      total,
      page,
      totalPages: Math.ceil(total / perPage),
    }
  })

export const getPublishedPostBySlug = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const post = await db.query.posts.findFirst({
      where: and(
        eq(posts.slug, data.slug),
        eq(posts.status, 'published'),
        isNull(posts.deletedAt),
      ),
      with: { postsToTags: { with: { tag: true } } },
    })
    if (!post) return null

    const parsed = JSON.parse(post.content) as OutputData
    const html = await renderEditorJs(parsed)
    const readingTime = estimateReadingTime(parsed)

    // Get prev/next posts relative to the current post's publishedAt
    const [prev, next] = await Promise.all([
      post.publishedAt
        ? db.query.posts.findFirst({
            where: and(
              eq(posts.status, 'published'),
              isNull(posts.deletedAt),
              sql`(${posts.publishedAt}, ${posts.id}) < (SELECT published_at, id FROM posts WHERE id = ${post.id})`,
            ),
            orderBy: [desc(posts.publishedAt), desc(posts.id)],
            columns: { slug: true, title: true },
          })
        : Promise.resolve(undefined),
      post.publishedAt
        ? db.query.posts.findFirst({
            where: and(
              eq(posts.status, 'published'),
              isNull(posts.deletedAt),
              sql`(${posts.publishedAt}, ${posts.id}) > (SELECT published_at, id FROM posts WHERE id = ${post.id})`,
            ),
            orderBy: [asc(posts.publishedAt), asc(posts.id)],
            columns: { slug: true, title: true },
          })
        : Promise.resolve(undefined),
    ])

    // The page renders html; sending the source content too doubles the payload
    const { content: _content, ...rest } = post
    return { ...rest, html, readingTime, prev, next }
  })

export const getAllTags = createServerFn({ method: 'GET' }).handler(
  async () => {
    const rows = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        postCount: count(posts.id),
      })
      .from(tags)
      .leftJoin(postsToTags, eq(tags.id, postsToTags.tagId))
      .leftJoin(
        posts,
        and(
          eq(postsToTags.postId, posts.id),
          eq(posts.status, 'published'),
          isNull(posts.deletedAt),
        ),
      )
      .groupBy(tags.id, tags.name, tags.slug)
      .orderBy(asc(tags.name))
    return rows
  },
)

// ── Portfolio ──────────────────────────────────────────

export const getPublicCategories = createServerFn({ method: 'GET' }).handler(
  async () => {
    const cats = await db.query.portfolioCategories.findMany({
      orderBy: asc(portfolioCategories.sortOrder),
      with: {
        projects: {
          where: and(
            eq(portfolioProjects.status, 'published'),
            isNull(portfolioProjects.deletedAt),
          ),
          columns: { id: true },
        },
      },
    })
    return cats.map((c) => ({
      ...c,
      projectCount: c.projects.length,
      projects: undefined,
    }))
  },
)

export const getPublicWork = createServerFn({ method: 'GET' }).handler(async () => {
  return db.query.portfolioCategories.findMany({
    columns: { id: true, name: true, slug: true, description: true },
    orderBy: [asc(portfolioCategories.sortOrder), asc(portfolioCategories.id)],
    with: {
      projects: {
        where: and(
          eq(portfolioProjects.status, 'published'),
          isNull(portfolioProjects.deletedAt),
        ),
        columns: {
          id: true, title: true, slug: true, year: true,
          role: true, workplace: true, technology: true,
        },
        orderBy: [asc(portfolioProjects.sortOrder), asc(portfolioProjects.id)],
      },
    },
  })
})
export const getCategoryWithProjects = createServerFn({ method: 'GET' })
  .inputValidator((data: { categorySlug: string }) => data)
  .handler(async ({ data }) => {
    const category = await db.query.portfolioCategories.findFirst({
      where: eq(portfolioCategories.slug, data.categorySlug),
    })
    if (!category) return null

    const projects = await db.query.portfolioProjects.findMany({
      where: and(
        eq(portfolioProjects.categoryId, category.id),
        eq(portfolioProjects.status, 'published'),
        isNull(portfolioProjects.deletedAt),
      ),
      orderBy: asc(portfolioProjects.sortOrder),
      with: { images: { orderBy: asc(projectImages.sortOrder) } },
    })

    return { category, projects }
  })

export const getPublicProject = createServerFn({ method: 'GET' })
  .inputValidator((data: { categorySlug: string; projectSlug: string }) => data)
  .handler(async ({ data }) => {
    const category = await db.query.portfolioCategories.findFirst({
      where: eq(portfolioCategories.slug, data.categorySlug),
    })
    if (!category) return null

    const project = await db.query.portfolioProjects.findFirst({
      where: and(
        eq(portfolioProjects.slug, data.projectSlug),
        eq(portfolioProjects.categoryId, category.id),
        eq(portfolioProjects.status, 'published'),
        isNull(portfolioProjects.deletedAt),
      ),
      with: {
        category: true,
        images: { orderBy: [asc(projectImages.sortOrder), asc(projectImages.id)] },
      },
    })
    if (!project) return null

    const descriptionHtml = await renderProjectDescription(project.description)
    return { ...project, descriptionHtml }
  })

// ── Resume ──────────────────────────────────────────

export const getPublicResume = createServerFn({ method: 'GET' }).handler(
  async () => {
    const entries = await db.query.resumeEntries.findMany({
      orderBy: asc(resumeEntries.sortOrder),
    })

    const grouped = {
      experience: [] as typeof entries,
      education: [] as typeof entries,
      certification: [] as typeof entries,
      skill: [] as typeof entries,
    }
    for (const entry of entries) {
      grouped[entry.type]?.push(entry)
    }
    return grouped
  },
)

// ── SaaS ──────────────────────────────────────────

export const getPublicSaas = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db.query.saasListings.findMany({
      where: isNull(saasListings.deletedAt),
      orderBy: asc(saasListings.sortOrder),
    })
  },
)

// ── Contact ──────────────────────────────────────────

const CONTACT_RATE_LIMIT = { max: 3, windowMs: 60 * 60 * 1000 }

export const submitContact = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      name: string
      email: string
      subject?: string
      message: string
      honeypot?: string
    }) => data,
  )
  .handler(async ({ data }) => {
    // Honeypot check
    if (data.honeypot) {
      // Pretend success to not reveal spam detection
      return { success: true }
    }

    // Validate
    const errors: Record<string, string> = {}
    if (!data.name.trim()) errors.name = 'Name is required'
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = 'Valid email is required'
    if (!data.message.trim()) errors.message = 'Message is required'
    if (data.message.length < 10) errors.message = 'Message must be at least 10 characters'
    if (data.message.length > 5000) errors.message = 'Message must be under 5000 characters'

    if (Object.keys(errors).length > 0) return { errors }

    const rateCheck = await checkRateLimit(
      `contact:${getClientIp()}`,
      CONTACT_RATE_LIMIT,
    )
    if (!rateCheck.allowed) {
      throw new Error('Too many submissions. Please try again later.')
    }

    await db.insert(contacts).values({
      name: data.name.trim(),
      email: data.email.trim(),
      subject: data.subject?.trim() || null,
      message: data.message.trim(),
    })

    return { success: true }
  })

// ── Home page data ──────────────────────────────────

export const getHomePageData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const [latestPosts, featuredProjects] = await Promise.all([
      db.query.posts.findMany({
        where: and(eq(posts.status, 'published'), isNull(posts.deletedAt)),
        orderBy: desc(posts.publishedAt),
        limit: 2,
        columns: { id: true, slug: true, title: true, publishedAt: true },
      }),
      db.query.portfolioProjects.findMany({
        where: and(
          eq(portfolioProjects.status, 'published'),
          isNull(portfolioProjects.deletedAt),
        ),
        orderBy: asc(portfolioProjects.sortOrder),
        limit: 3,
        columns: {
          id: true, title: true, slug: true, role: true,
          workplace: true, year: true, technology: true,
        },
        with: { category: { columns: { slug: true, name: true } } },
      }),
    ])

    return { latestPosts, featuredProjects }
  },
)
