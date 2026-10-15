import { createServerFn } from '@tanstack/react-start'
import { count, eq, isNull, and, desc } from 'drizzle-orm'
import { db } from '@/db'
import { posts } from '@/db/schema/posts'
import { portfolioProjects } from '@/db/schema/portfolio'
import { contacts } from '@/db/schema/contacts'
import { getCurrentUser } from '@/server/functions/auth.functions'

import { saasListings } from '@/db/schema/saas'
export const getDashboardStats = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const [totalPosts, draftPosts, totalProjects, totalProducts, unreadContacts, drafts] = await Promise.all([
      db.select({ count: count() }).from(posts).where(isNull(posts.deletedAt)),
      db.select({ count: count() }).from(posts).where(and(isNull(posts.deletedAt), eq(posts.status, 'draft'))),
      db.select({ count: count() }).from(portfolioProjects).where(isNull(portfolioProjects.deletedAt)),
      db.select({ count: count() }).from(saasListings).where(isNull(saasListings.deletedAt)),
      db.select({ count: count() }).from(contacts).where(eq(contacts.isRead, false)),
      db.select({ id: posts.id, title: posts.title }).from(posts)
        .where(and(isNull(posts.deletedAt), eq(posts.status, 'draft')))
        .orderBy(desc(posts.updatedAt), desc(posts.id)).limit(1),
    ])

    return {
      totalPosts: totalPosts[0]?.count ?? 0,
      totalProjects: totalProjects[0]?.count ?? 0,
      totalProducts: totalProducts[0]?.count ?? 0,
      unreadContacts: unreadContacts[0]?.count ?? 0,
      draftPosts: draftPosts[0]?.count ?? 0,
      latestDraft: drafts[0] ?? null,
    }
  },
)
