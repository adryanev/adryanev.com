import { createServerFn } from '@tanstack/react-start'
import { eq, isNull, and, desc, inArray, sum } from 'drizzle-orm'
import { db } from '@/db'
import { posts, tags, postsToTags } from '@/db/schema/posts'
import { postViews } from '@/db/schema/post-views'
import { getCurrentUser } from '@/server/functions/auth.functions'
import { slugify } from '@/lib/slugify'
import { fireWebhooks } from '@/lib/webhooks'
import { extractText, type OutputData } from '@/lib/editorjs-renderer'
import { isContentEdit } from '@/lib/post-dates'

function contentToText(content: string): string {
  try {
    const data = JSON.parse(content) as OutputData
    if (!data.blocks || !Array.isArray(data.blocks)) return ''
    return extractText(data)
  } catch {
    return ''
  }
}

function autoExcerpt(content: string): string {
  return contentToText(content).slice(0, 160)
}

export const getPosts = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const [rows, viewTotals] = await Promise.all([
    db.query.posts.findMany({
      where: isNull(posts.deletedAt),
      orderBy: desc(posts.createdAt),
      with: { postsToTags: { with: { tag: true } } },
    }),
    db
      .select({ postId: postViews.postId, views: sum(postViews.viewCount) })
      .from(postViews)
      .groupBy(postViews.postId),
  ])
  const viewsByPost = new Map(
    viewTotals.map((row) => [row.postId, Number(row.views ?? 0)]),
  )
  return rows.map((post) => ({ ...post, views: viewsByPost.get(post.id) ?? 0 }))
})

export const getPostById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const post = await db.query.posts.findFirst({
      where: and(eq(posts.id, data.id), isNull(posts.deletedAt)),
      with: { postsToTags: { with: { tag: true } } },
    })
    return post ?? null
  })

export const createPost = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      title: string
      slug?: string
      content: string
      excerpt?: string
      coverImage?: string
      status: 'draft' | 'published'
      tags: string[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const slug = data.slug || slugify(data.title)

    // Check slug uniqueness
    const existing = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    })
    if (existing) {
      throw new Error('A post with this slug already exists')
    }

    const publishedAt =
      data.status === 'published' ? new Date() : undefined

    const [post] = await db
      .insert(posts)
      .values({
        title: data.title,
        slug,
        content: data.content,
        contentText: contentToText(data.content),
        excerpt: data.excerpt || autoExcerpt(data.content),
        coverImage: data.coverImage,
        status: data.status,
        publishedAt,
      })
      .returning()

    // Handle tags
    if (data.tags.length > 0) {
      await upsertTags(post.id, data.tags)
    }

    fireWebhooks('post.created', { id: post.id, title: post.title, slug: post.slug, status: post.status })

    return { success: true, id: post.id }
  })

export const updatePost = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: number
      title: string
      slug?: string
      content: string
      excerpt?: string
      coverImage?: string
      status: 'draft' | 'published'
      tags: string[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const slug = data.slug || slugify(data.title)

    // Check slug uniqueness and fetch current post in parallel
    const [existing, currentPost] = await Promise.all([
      db.query.posts.findFirst({
        where: and(eq(posts.slug, slug), isNull(posts.deletedAt)),
      }),
      db.query.posts.findFirst({
        where: eq(posts.id, data.id),
      }),
    ])

    if (existing && existing.id !== data.id) {
      throw new Error('A post with this slug already exists')
    }
    if (!currentPost) {
      throw new Error('Post not found')
    }
    const publishedAt =
      data.status === 'published' && !currentPost.publishedAt
        ? new Date()
        : currentPost.publishedAt
    const next = {
      title: data.title,
      excerpt: data.excerpt || autoExcerpt(data.content),
      content: data.content,
    }

    await db
      .update(posts)
      .set({
        ...next,
        slug,
        contentText: contentToText(data.content),
        coverImage: data.coverImage,
        status: data.status,
        publishedAt,
        ...(isContentEdit(currentPost, next) && { updatedAt: new Date() }),
      })
      .where(eq(posts.id, data.id))

    // Replace tags
    await db.delete(postsToTags).where(eq(postsToTags.postId, data.id))
    if (data.tags.length > 0) {
      await upsertTags(data.id, data.tags)
    }

    fireWebhooks('post.updated', { id: data.id, title: data.title, slug, status: data.status })

    return { success: true }
  })

export const deletePost = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, data.id),
    })

    await db
      .update(posts)
      .set({ deletedAt: new Date() })
      .where(eq(posts.id, data.id))

    if (post) {
      fireWebhooks('post.deleted', { id: post.id, title: post.title, slug: post.slug })
    }

    return { success: true }
  })

// Helper: upsert tags and create associations (batch)
async function upsertTags(postId: number, tagNames: string[]) {
  const tagValues = tagNames.map((name) => ({
    name,
    slug: slugify(name),
  }))

  // Batch insert all tags, ignoring conflicts for existing ones
  await db.insert(tags).values(tagValues).onConflictDoNothing()

  // Fetch all matching tags in a single query
  const slugs = tagValues.map((t) => t.slug)
  const matchingTags = await db
    .select({ id: tags.id })
    .from(tags)
    .where(inArray(tags.slug, slugs))

  // Batch insert post-tag relations
  if (matchingTags.length > 0) {
    await db
      .insert(postsToTags)
      .values(matchingTags.map((t) => ({ postId, tagId: t.id })))
      .onConflictDoNothing()
  }
}
