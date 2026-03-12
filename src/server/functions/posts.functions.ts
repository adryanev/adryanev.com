import { createServerFn } from '@tanstack/react-start'
import { eq, isNull, and, desc, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { posts, tags, postsToTags } from '@/db/schema/posts'
import { getCurrentUser } from '@/server/functions/auth.functions'
import { slugify } from '@/lib/slugify'

export const getPosts = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  return db.query.posts.findMany({
    where: isNull(posts.deletedAt),
    orderBy: desc(posts.createdAt),
    with: { postsToTags: { with: { tag: true } } },
  })
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
        excerpt: data.excerpt || data.content.slice(0, 160),
        coverImage: data.coverImage,
        status: data.status,
        publishedAt,
      })
      .returning()

    // Handle tags
    if (data.tags.length > 0) {
      await upsertTags(post.id, data.tags)
    }

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

    // Check slug uniqueness (exclude current post)
    const existing = await db.query.posts.findFirst({
      where: and(eq(posts.slug, slug), isNull(posts.deletedAt)),
    })
    if (existing && existing.id !== data.id) {
      throw new Error('A post with this slug already exists')
    }

    // If changing to published and no publishedAt, set it now
    const currentPost = await db.query.posts.findFirst({
      where: eq(posts.id, data.id),
    })
    const publishedAt =
      data.status === 'published' && !currentPost?.publishedAt
        ? new Date()
        : currentPost?.publishedAt

    await db
      .update(posts)
      .set({
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || data.content.slice(0, 160),
        coverImage: data.coverImage,
        status: data.status,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, data.id))

    // Replace tags
    await db.delete(postsToTags).where(eq(postsToTags.postId, data.id))
    if (data.tags.length > 0) {
      await upsertTags(data.id, data.tags)
    }

    return { success: true }
  })

export const deletePost = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    await db
      .update(posts)
      .set({ deletedAt: new Date() })
      .where(eq(posts.id, data.id))
    return { success: true }
  })

const MAX_PREVIEW_SIZE = 100 * 1024 // 100 KB

export const previewMarkdown = createServerFn({ method: 'POST' })
  .inputValidator((data: { content: string }) => data)
  .handler(async ({ data }) => {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    if (data.content.length > MAX_PREVIEW_SIZE) {
      throw new Error('Content exceeds maximum preview size of 100KB')
    }

    const { renderMarkdown } = await import('@/lib/markdown')
    return renderMarkdown(data.content)
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
