import { createServerFn } from '@tanstack/react-start'
import { eq, and, isNull, ilike, desc, asc } from 'drizzle-orm'
import { db } from '@/db'
import { posts } from '@/db/schema/posts'
import { portfolioProjects } from '@/db/schema/portfolio'

function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&')
}

export const searchContent = createServerFn({ method: 'GET' })
  .inputValidator((data: { query: string }) => data)
  .handler(async ({ data }) => {
    const q = data.query.trim()
    if (q.length < 2) return { posts: [], projects: [] }

    const pattern = `%${escapeLike(q)}%`

    const [matchedPosts, matchedProjects] = await Promise.all([
      db.query.posts.findMany({
        where: and(
          eq(posts.status, 'published'),
          isNull(posts.deletedAt),
          ilike(posts.title, pattern),
        ),
        orderBy: desc(posts.publishedAt),
        limit: 5,
        columns: { id: true, title: true, slug: true },
      }),
      db.query.portfolioProjects.findMany({
        where: and(
          eq(portfolioProjects.status, 'published'),
          isNull(portfolioProjects.deletedAt),
          ilike(portfolioProjects.title, pattern),
        ),
        orderBy: asc(portfolioProjects.sortOrder),
        limit: 5,
        columns: { id: true, title: true, slug: true },
        with: { category: { columns: { slug: true } } },
      }),
    ])

    return { posts: matchedPosts, projects: matchedProjects }
  })
