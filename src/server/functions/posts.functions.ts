import { createServerFn } from '@tanstack/react-start'
import { eq, isNull, and, desc } from 'drizzle-orm'
import { db } from '@/db'
import { posts, tags, postsToTags } from '@/db/schema/posts'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const getPosts = createServerFn({ method: 'GET' }).handler(async () => {
  return db.query.posts.findMany({
    where: isNull(posts.deletedAt),
    orderBy: desc(posts.createdAt),
    with: { postsToTags: { with: { tag: true } } },
  })
})

export const getPostById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
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
    const slug = data.slug || slugify(data.title)

    // Check slug uniqueness
    const existing = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    })
    if (existing) {
      return { error: 'A post with this slug already exists' }
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
    const slug = data.slug || slugify(data.title)

    // Check slug uniqueness (exclude current post)
    const existing = await db.query.posts.findFirst({
      where: and(eq(posts.slug, slug), isNull(posts.deletedAt)),
    })
    if (existing && existing.id !== data.id) {
      return { error: 'A post with this slug already exists' }
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
    await db
      .update(posts)
      .set({ deletedAt: new Date() })
      .where(eq(posts.id, data.id))
    return { success: true }
  })

// Helper: upsert tags and create associations
async function upsertTags(postId: number, tagNames: string[]) {
  for (const name of tagNames) {
    const tagSlug = slugify(name)
    let tag = await db.query.tags.findFirst({
      where: eq(tags.slug, tagSlug),
    })
    if (!tag) {
      ;[tag] = await db
        .insert(tags)
        .values({ name, slug: tagSlug })
        .returning()
    }
    await db
      .insert(postsToTags)
      .values({ postId, tagId: tag.id })
      .onConflictDoNothing()
  }
}
