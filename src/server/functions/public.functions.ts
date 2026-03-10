import { createServerFn } from '@tanstack/react-start'
import { eq, and, isNull, desc, asc } from 'drizzle-orm'
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
import { renderMarkdown, estimateReadingTime } from '@/lib/markdown'

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

    const allPosts = await db.query.posts.findMany({
      where: and(...conditions),
      orderBy: desc(posts.publishedAt),
      with: { postsToTags: { with: { tag: true } } },
    })

    let filtered = allPosts
    if (tagPostIds) {
      filtered = allPosts.filter((p) => tagPostIds!.includes(p.id))
    }

    const total = filtered.length
    const paginated = filtered.slice(offset, offset + perPage)

    return {
      posts: paginated,
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

    const html = await renderMarkdown(post.content)
    const readingTime = estimateReadingTime(post.content)

    // Get prev/next posts
    const [prev, next] = await Promise.all([
      db.query.posts.findFirst({
        where: and(
          eq(posts.status, 'published'),
          isNull(posts.deletedAt),
        ),
        orderBy: desc(posts.publishedAt),
        columns: { slug: true, title: true },
      }),
      db.query.posts.findFirst({
        where: and(
          eq(posts.status, 'published'),
          isNull(posts.deletedAt),
        ),
        orderBy: asc(posts.publishedAt),
        columns: { slug: true, title: true },
      }),
    ])

    return { ...post, html, readingTime, prev, next }
  })

export const getAllTags = createServerFn({ method: 'GET' }).handler(
  async () => {
    return db.query.tags.findMany({
      orderBy: asc(tags.name),
    })
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
        images: { orderBy: asc(projectImages.sortOrder) },
      },
    })
    if (!project) return null

    const descriptionHtml = await renderMarkdown(project.description)
    return { ...project, descriptionHtml }
  })

// ── Resume ──────────────────────────────────────────

export const getPublicResume = createServerFn({ method: 'GET' }).handler(
  async () => {
    const entries = await db.query.resumeEntries.findMany({
      orderBy: asc(resumeEntries.sortOrder),
    })
    return {
      experience: entries.filter((e) => e.type === 'experience'),
      education: entries.filter((e) => e.type === 'education'),
      certification: entries.filter((e) => e.type === 'certification'),
      skill: entries.filter((e) => e.type === 'skill'),
    }
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

const contactRateLimit = new Map<string, { count: number; resetAt: number }>()

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

    // Rate limit: 3 per hour per "session" (simplified, no IP in server fn context)
    const key = data.email.toLowerCase()
    const now = Date.now()
    const limit = contactRateLimit.get(key)
    if (limit && limit.resetAt > now && limit.count >= 3) {
      return { error: 'Too many submissions. Please try again later.' }
    }
    if (!limit || limit.resetAt <= now) {
      contactRateLimit.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 })
    } else {
      limit.count++
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
    const [latestPosts, featuredProjects, activeSaas] = await Promise.all([
      db.query.posts.findMany({
        where: and(eq(posts.status, 'published'), isNull(posts.deletedAt)),
        orderBy: desc(posts.publishedAt),
        limit: 3,
        with: { postsToTags: { with: { tag: true } } },
      }),
      db.query.portfolioProjects.findMany({
        where: and(
          eq(portfolioProjects.status, 'published'),
          isNull(portfolioProjects.deletedAt),
        ),
        orderBy: asc(portfolioProjects.sortOrder),
        limit: 4,
        with: {
          category: true,
          images: { orderBy: asc(projectImages.sortOrder), limit: 1 },
        },
      }),
      db.query.saasListings.findMany({
        where: and(
          isNull(saasListings.deletedAt),
        ),
        orderBy: asc(saasListings.sortOrder),
        limit: 3,
      }),
    ])

    return { latestPosts, featuredProjects, activeSaas }
  },
)
