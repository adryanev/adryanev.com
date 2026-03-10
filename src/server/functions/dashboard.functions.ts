import { createServerFn } from '@tanstack/react-start'
import { count, eq, isNull, and } from 'drizzle-orm'
import { db } from '@/db'
import { posts } from '@/db/schema/posts'
import { portfolioProjects } from '@/db/schema/portfolio'
import { contacts } from '@/db/schema/contacts'

export const getDashboardStats = createServerFn({ method: 'GET' }).handler(
  async () => {
    const [totalPosts, draftPosts, totalProjects, unreadContacts] =
      await Promise.all([
        db
          .select({ count: count() })
          .from(posts)
          .where(isNull(posts.deletedAt)),
        db
          .select({ count: count() })
          .from(posts)
          .where(and(isNull(posts.deletedAt), eq(posts.status, 'draft'))),
        db
          .select({ count: count() })
          .from(portfolioProjects)
          .where(isNull(portfolioProjects.deletedAt)),
        db
          .select({ count: count() })
          .from(contacts)
          .where(eq(contacts.isRead, false)),
      ])

    return {
      totalPosts: totalPosts[0]?.count ?? 0,
      totalProjects: totalProjects[0]?.count ?? 0,
      unreadContacts: unreadContacts[0]?.count ?? 0,
      draftPosts: draftPosts[0]?.count ?? 0,
    }
  },
)
