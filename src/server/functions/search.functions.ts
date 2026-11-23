import { createServerFn } from '@tanstack/react-start'
import { eq, and, isNull, asc, sql, type Column } from 'drizzle-orm'
import { db } from '@/db'
import { portfolioProjects } from '@/db/schema/portfolio'
import { toFtsMatchQuery } from '@/lib/fts-query'

function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&')
}

// SQLite LIKE is case-insensitive for ASCII but has no default escape character
function likeEscaped(column: Column, pattern: string) {
  return sql`${column} like ${pattern} escape '\\'`
}

const MAX_POST_RESULTS = 5

type PostMatch = { id: number; title: string; slug: string }

// bm25 weights follow the posts_fts columns: title, excerpt, body, tags
async function searchPosts(query: string): Promise<PostMatch[]> {
  const match = toFtsMatchQuery(query)
  if (!match) return []

  return db.all<PostMatch>(sql`
    select p.id, p.title, p.slug
    from posts_fts
    join posts p on p.id = posts_fts.rowid
    where posts_fts match ${match}
      and p.status = 'published'
      and p.deleted_at is null
    order by bm25(posts_fts, 10.0, 4.0, 1.0, 6.0)
    limit ${MAX_POST_RESULTS}
  `)
}

export const searchContent = createServerFn({ method: 'GET' })
  .inputValidator((data: { query: string }) => data)
  .handler(async ({ data }) => {
    const q = data.query.trim()
    if (q.length < 2) return { posts: [], projects: [] }

    const pattern = `%${escapeLike(q)}%`

    const [matchedPosts, matchedProjects] = await Promise.all([
      searchPosts(q),
      db.query.portfolioProjects.findMany({
        where: and(
          eq(portfolioProjects.status, 'published'),
          isNull(portfolioProjects.deletedAt),
          likeEscaped(portfolioProjects.title, pattern),
        ),
        orderBy: asc(portfolioProjects.sortOrder),
        limit: 5,
        columns: { id: true, title: true, slug: true },
        with: { category: { columns: { slug: true } } },
      }),
    ])

    return { posts: matchedPosts, projects: matchedProjects }
  })
